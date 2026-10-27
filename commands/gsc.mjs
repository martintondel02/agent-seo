import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { numberFlag } from "../lib/args.mjs";
import { table } from "../lib/report.mjs";

const WEBMASTERS = "https://searchconsole.googleapis.com/webmasters/v3";
const INSPECT_URL = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const SCOPE = "https://www.googleapis.com/auth/webmasters";
const DEFAULT_CREDENTIALS = join(homedir(), ".config", "agent-seo", "gsc.json");

function fail(message) {
  throw new Error(message);
}

async function loadCredentials() {
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_CREDENTIALS;
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch {
    fail(
      `No service-account key at ${path}.\n` +
        "Create a Google Cloud service account, enable the Search Console API, download the JSON key,\n" +
        "then either set GOOGLE_APPLICATION_CREDENTIALS or save it at\n" +
        `${DEFAULT_CREDENTIALS} (chmod 600).\n` +
        "Finally add the service-account email as a Full user in Search Console.",
    );
  }
  const credentials = JSON.parse(raw);
  if (!credentials.client_email || !credentials.private_key) {
    fail(`${path} is not a service-account JSON key.`);
  }
  return credentials;
}

function b64url(value) {
  return Buffer.from(value).toString("base64url");
}

function signJwt(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned =
    `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.` +
    `${b64url(
      JSON.stringify({
        iss: credentials.client_email,
        scope: SCOPE,
        aud: credentials.token_uri || "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      }),
    )}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${signer.sign(credentials.private_key, "base64url")}`;
}

async function getAccessToken(credentials) {
  const tokenUri = credentials.token_uri || "https://oauth2.googleapis.com/token";
  let lastError = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(tokenUri, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: signJwt(credentials),
        }),
        signal: AbortSignal.timeout(20_000),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return data.access_token;
      lastError = new Error(`Google rejected the key (HTTP ${res.status}): ${data.error_description || data.error || res.statusText}`);
      if (res.status >= 400 && res.status < 500) break;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt * attempt));
  }
  throw lastError ?? new Error("Could not get a Google access token.");
}

async function callApi(token, url, { method = "GET", body } = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          ...(body ? { "content-type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30_000),
      });
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }
      if (res.ok) return data;
      const message = data?.error?.message || data?.error_description || res.statusText;
      lastError = new Error(`Search Console API HTTP ${res.status}: ${message}`);
      if (res.status >= 400 && res.status < 500) break;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt * attempt));
  }
  throw lastError ?? new Error("Search Console API request failed.");
}

function siteArg(value) {
  if (!value) fail("A Search Console property is required, e.g. sc-domain:example.com or https://example.com/");
  if (value.startsWith("sc-domain:") || /^https?:\/\//i.test(value)) return value;
  return `sc-domain:${value}`;
}

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

function windowFor(days) {
  return { startDate: isoDaysAgo(days + 1), endDate: isoDaysAgo(2) };
}

function nf(value, digits = 0) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

async function analytics(token, site, days, dimensions, limit = 50) {
  return callApi(token, `${WEBMASTERS}/sites/${encodeURIComponent(site)}/searchanalytics/query`, {
    method: "POST",
    body: {
      ...windowFor(days),
      dimensions,
      rowLimit: limit,
      dataState: "all",
    },
  });
}

function printRows(rows, columns) {
  if (!rows.length) {
    console.log("  (no rows — the property has no data for this window yet)");
    return;
  }
  console.log(table(rows, columns));
}

async function cmdSites(token) {
  const data = await callApi(token, `${WEBMASTERS}/sites`);
  const rows = data.siteEntry ?? [];
  if (!rows.length) return console.log("The service account has access to no properties yet.");
  printRows(rows, [
    { label: "Property", value: (row) => row.siteUrl },
    { label: "Permission", value: (row) => row.permissionLevel },
  ]);
}

async function cmdSitemaps(token, site) {
  const data = await callApi(token, `${WEBMASTERS}/sites/${encodeURIComponent(site)}/sitemaps`);
  const rows = data.sitemap ?? [];
  if (!rows.length) return console.log("No sitemaps registered.");
  for (const sitemap of rows) {
    console.log(sitemap.path);
    console.log(`  last downloaded: ${sitemap.lastDownloaded ?? "–"}`);
    console.log(`  submitted: ${(sitemap.contents ?? []).map((c) => `${c.submitted} ${c.type}`).join(", ") || "–"}`);
    for (const warning of sitemap.warnings ?? []) console.log(`  warning: ${warning}`);
    for (const error of sitemap.errors ?? []) console.log(`  error: ${error}`);
  }
}

async function cmdQueries(token, site, days) {
  const data = await analytics(token, site, days, ["query"], 100);
  printRows(data.rows ?? [], [
    { label: "Clicks", value: (row) => nf(row.clicks) },
    { label: "Impr.", value: (row) => nf(row.impressions) },
    { label: "CTR", value: (row) => `${nf(row.ctr * 100, 1)}%` },
    { label: "Pos.", value: (row) => nf(row.position, 1) },
    { label: "Query", value: (row) => row.keys[0] },
  ]);
}

async function cmdPages(token, site, days) {
  const data = await analytics(token, site, days, ["page"], 100);
  printRows(data.rows ?? [], [
    { label: "Clicks", value: (row) => nf(row.clicks) },
    { label: "Impr.", value: (row) => nf(row.impressions) },
    { label: "CTR", value: (row) => `${nf(row.ctr * 100, 1)}%` },
    { label: "Pos.", value: (row) => nf(row.position, 1) },
    { label: "Page", value: (row) => row.keys[0].replace(/^https?:\/\/[^/]+/, "") || "/" },
  ]);
}

async function cmdReport(token, site, days, brandPattern = null) {
  const { startDate, endDate } = windowFor(days);
  const all = await analytics(token, site, days, ["query", "page"], 25_000);
  const rows = all.rows ?? [];
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const brand = brandPattern ? rows.filter((row) => brandPattern.test(row.keys[0] ?? "")) : [];
  const sum = (list, key) => list.reduce((total, row) => total + (row[key] ?? 0), 0);

  console.log(`\nSearch Console — ${site}`);
  console.log(`Window: ${startDate} → ${endDate} (data lags 2–3 days)\n`);
  console.log(`  Clicks:       ${nf(clicks)}`);
  console.log(`  Impressions:  ${nf(impressions)}`);
  console.log(`  CTR:          ${nf(impressions ? (clicks / impressions) * 100 : 0, 2)}%`);
  console.log(`  Avg position: ${nf(rows.length ? sum(rows, "position") / rows.length : 0, 1)}`);
  if (brandPattern) {
    console.log(`  Brand:        ${nf(sum(brand, "clicks"))} clicks / ${nf(sum(brand, "impressions"))} impressions`);
    console.log(`  Non-brand:    ${nf(clicks - sum(brand, "clicks"))} clicks / ${nf(impressions - sum(brand, "impressions"))} impressions`);
  }
  console.log("");

  const queries = (await analytics(token, site, days, ["query"], 10)).rows ?? [];
  console.log("Top queries:");
  printRows(queries, [
    { label: "Clicks", value: (row) => nf(row.clicks) },
    { label: "Impr.", value: (row) => nf(row.impressions) },
    { label: "Pos.", value: (row) => nf(row.position, 1) },
    { label: "Query", value: (row) => row.keys[0] },
  ]);
}

async function cmdInspect(token, site, url) {
  if (!url) fail("Usage: seo gsc inspect <property> <url>");
  const data = await callApi(token, INSPECT_URL, {
    method: "POST",
    body: { inspectionUrl: url, siteUrl: site, languageCode: "en" },
  });
  const result = data.inspectionResult?.indexStatusResult ?? {};
  console.log(`\n${url}`);
  console.log(`  verdict:        ${result.verdict ?? "?"}`);
  console.log(`  coverage:       ${result.coverageState ?? "?"}`);
  console.log(`  indexing:       ${result.indexingState ?? "?"}`);
  console.log(`  robots.txt:     ${result.robotsTxtState ?? "?"}`);
  console.log(`  last crawl:     ${result.lastCrawlTime ?? "never"}`);
  console.log(`  google canonical: ${result.googleCanonical ?? "?"}`);
  console.log(`  user canonical:   ${result.userCanonical ?? "?"}`);
  console.log(`  sitemaps:       ${(result.sitemaps ?? []).join(", ") || "–"}\n`);
}

async function cmdSubmitSitemap(token, site, sitemapUrl) {
  if (!sitemapUrl) fail("Usage: seo gsc submit-sitemap <property> <sitemap-url>");
  await callApi(
    token,
    `${WEBMASTERS}/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
    { method: "PUT" },
  );
  console.log(`Submitted: ${sitemapUrl}`);
}

export async function gsc(positional, flags = {}) {
  const [subcommand = "sites", ...rest] = positional;
  const credentials = await loadCredentials();
  const token = await getAccessToken(credentials);
  const days = numberFlag(flags.days ?? rest[1], 28);

  if (subcommand === "sites") return cmdSites(token);
  if (subcommand === "report") {
    const brandPattern = typeof flags.brand === "string" ? new RegExp(flags.brand, "i") : null;
    return cmdReport(token, siteArg(rest[0] ?? flags.site), days, brandPattern);
  }
  if (subcommand === "queries") return cmdQueries(token, siteArg(rest[0] ?? flags.site), days);
  if (subcommand === "pages") return cmdPages(token, siteArg(rest[0] ?? flags.site), days);
  if (subcommand === "sitemaps") return cmdSitemaps(token, siteArg(rest[0] ?? flags.site));
  if (subcommand === "inspect") return cmdInspect(token, siteArg(rest[0] ?? flags.site), rest[1] ?? flags.url);
  if (subcommand === "submit-sitemap") {
    return cmdSubmitSitemap(token, siteArg(rest[0] ?? flags.site), rest[1] ?? flags.sitemap);
  }

  fail(`Unknown gsc subcommand “${subcommand}”. Use sites, report, queries, pages, sitemaps, inspect or submit-sitemap.`);
}
