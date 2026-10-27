import {
  normalizeUrl,
  originOf,
  fetchUrl,
  contentType,
  header,
  normalizeForCompare,
} from "../lib/http.mjs";
import {
  getTitle,
  getMeta,
  getCanonical,
  getH1s,
  countWords,
  getLinks,
  getImages,
  getJsonLd,
  getHtmlLang,
  getOpenGraph,
  getHreflang,
} from "../lib/html.mjs";
import { parseRobots, parseContentSignals, aiCoverage } from "../lib/robots.mjs";
import { validateLlms } from "../lib/llms.mjs";
import { renderChecks, renderSummary, summarize, formatMs, formatBytes, printJson } from "../lib/report.mjs";
import { boolFlag } from "../lib/args.mjs";

const LINK_RELATIONS = new Set(["describedby", "service-desc", "service-doc", "api-catalog"]);

function parseSitemap(xml) {
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
  const lastmods = [...xml.matchAll(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/gi)].map((m) => m[1]);
  return { locs, lastmods };
}

function length(value) {
  return [...(value ?? "")].length;
}

export async function audit(positional, flags = {}) {
  const target = positional[0] ?? flags.url;
  if (!target) throw new Error("Usage: seo audit <url> [--json] [--no-fail]");

  const start = normalizeUrl(target);
  const page = await fetchUrl(start.href, {
    headers: { "cache-control": "no-cache" },
    timeout: 25_000,
  });

  if (page.status === 0) {
    const payload = {
      url: start.href,
      fetchedAt: new Date().toISOString(),
      error: page.error,
      checks: [],
    };
    if (boolFlag(flags.json)) printJson(payload);
    else console.error(`Could not fetch ${start.href}: ${page.error}`);
    process.exitCode = 1;
    return;
  }

  const html = page.body;
  const finalUrl = page.url || start.href;
  const origin = originOf(finalUrl);
  const checks = [];
  const add = (id, category, label, status, detail, fix) =>
    checks.push({ id, category, label, status, detail, fix });

  const robotsMeta = (getMeta(html, "robots") ?? "").toLowerCase();
  const xRobots = (header(page, "x-robots-tag") ?? "").toLowerCase();
  const title = getTitle(html);
  const description = getMeta(html, "description");
  const canonicalRaw = getCanonical(html);
  let canonical = null;
  if (canonicalRaw) {
    try {
      canonical = new URL(canonicalRaw, finalUrl).href;
    } catch {
      canonical = null;
    }
  }
  const h1s = getH1s(html);
  const words = countWords(html);
  const links = getLinks(html, finalUrl);
  const images = getImages(html);
  const jsonLd = getJsonLd(html);
  const og = getOpenGraph(html);
  const hreflang = getHreflang(html);
  const lang = getHtmlLang(html);

  // --- Page fundamentals -------------------------------------------------
  add("status", "Crawl & index", "HTTP status", page.status === 200 ? "pass" : "fail", `${page.status} ${page.statusText}`);
  add(
    "https",
    "Crawl & index",
    "HTTPS",
    start.protocol === "https:" ? "pass" : "warn",
    start.protocol.replace(":", ""),
    "Serve the canonical site over HTTPS and redirect HTTP to HTTPS.",
  );

  const noindex = robotsMeta.includes("noindex") || xRobots.includes("noindex");
  add(
    "indexable",
    "Crawl & index",
    "Indexable",
    noindex ? "fail" : "pass",
    noindex ? "noindex found in meta robots or X-Robots-Tag" : "no noindex directive",
    "Remove noindex from pages that should rank, and check the header on the final response.",
  );

  if (!canonical) {
    add("canonical", "Crawl & index", "Canonical", "warn", "missing", "Add a self-referencing <link rel=\"canonical\">.");
  } else if (normalizeForCompare(canonical) === normalizeForCompare(finalUrl)) {
    add("canonical", "Crawl & index", "Canonical", "pass", canonical);
  } else {
    add(
      "canonical",
      "Crawl & index",
      "Canonical",
      "fail",
      `${canonical} ≠ ${finalUrl}`,
      "Point the canonical at the URL you want indexed, usually the final URL.",
    );
  }

  add(
    "lang",
    "Crawl & index",
    "Language",
    lang ? "pass" : "warn",
    lang ?? "missing <html lang>",
    "Set <html lang=\"nb\"> (or the correct BCP 47 language) so search and AI know the language.",
  );
  add(
    "viewport",
    "Crawl & index",
    "Mobile viewport",
    getMeta(html, "viewport") ? "pass" : "warn",
    getMeta(html, "viewport") ? "present" : "missing",
    "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
  );

  // --- Metadata ----------------------------------------------------------
  if (!title) {
    add("title", "Metadata", "Title", "fail", "missing", "Every indexable page needs a unique <title>.");
  } else {
    const n = length(title);
    add(
      "title",
      "Metadata",
      "Title",
      n >= 15 && n <= 65 ? "pass" : "warn",
      `${n} chars — ${title}`,
      "Aim for 15–65 characters and put the primary phrase near the front.",
    );
  }

  if (!description) {
    add("description", "Metadata", "Meta description", "fail", "missing", "Write a 50–170 character description that earns the click.");
  } else {
    const n = length(description);
    add(
      "description",
      "Metadata",
      "Meta description",
      n >= 50 && n <= 170 ? "pass" : "warn",
      `${n} chars`,
      "Aim for 50–170 characters; describe the outcome, not the keyword list.",
    );
  }

  add(
    "h1",
    "Metadata",
    "H1",
    h1s.length === 1 ? "pass" : h1s.length === 0 ? "fail" : "warn",
    h1s.length === 0 ? "none" : `${h1s.length} — ${h1s.join(" | ").slice(0, 120)}`,
    "Use exactly one H1 that states what the page is.",
  );

  const missingOg = [
    ["title", og.title],
    ["description", og.description],
    ["image", og.image],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);
  add(
    "open-graph",
    "Metadata",
    "Open Graph",
    missingOg.length === 0 ? "pass" : "warn",
    missingOg.length ? `missing ${missingOg.join(", ")}` : "title, description, image",
    "Add og:title, og:description and og:image so shares and some AI previews look right.",
  );

  // --- Content -----------------------------------------------------------
  add(
    "words",
    "Content",
    "Word count",
    words >= 300 ? "pass" : words >= 100 ? "warn" : "fail",
    `${words} words`,
    "Thin pages compete badly. Add original explanation, data, examples or a tool.",
  );
  const missingAlt = images.filter((image) => image.missingAlt).length;
  add(
    "image-alt",
    "Content",
    "Image alt text",
    !images.length ? "info" : missingAlt ? "warn" : "pass",
    !images.length ? "no images" : `${missingAlt}/${images.length} missing alt`,
    "Describe the image's content, not its filename.",
  );
  const internal = links.filter((link) => !link.external).length;
  add(
    "internal-links",
    "Content",
    "Internal links",
    internal >= 3 ? "pass" : internal === 0 ? "fail" : "warn",
    `${internal} internal, ${links.length - internal} external`,
    "Link to the hub and 2–3 related pages with descriptive anchor text.",
  );
  if (hreflang.length) {
    add("hreflang", "Content", "hreflang", "info", `${hreflang.length} alternates`);
  }

  // --- Structured data ---------------------------------------------------
  add(
    "jsonld",
    "Structured data",
    "JSON-LD",
    jsonLd.errors.length ? "fail" : jsonLd.blocks.length ? "pass" : "warn",
    jsonLd.errors.length
      ? `${jsonLd.errors.length} parse error(s): ${jsonLd.errors[0]}`
      : `${jsonLd.blocks.length} block(s)`,
    "Every JSON-LD block must be valid JSON; invalid blocks are ignored.",
  );
  add(
    "schema-types",
    "Structured data",
    "Schema types",
    jsonLd.types.length ? "pass" : "warn",
    jsonLd.types.length ? jsonLd.types.join(", ") : "none",
    "Use the type that matches the entity: Organization, WebSite, Course, Article, FAQPage…",
  );

  // --- robots.txt --------------------------------------------------------
  const robotsRes = await fetchUrl(`${origin}/robots.txt`, { accept: "text/plain", timeout: 15_000 });
  const robots = robotsRes.status === 200 ? parseRobots(robotsRes.body) : null;
  add(
    "robots",
    "Robots",
    "robots.txt",
    robots ? "pass" : "warn",
    robots ? `${robots.groups.length} group(s), ${robots.sitemaps.length} sitemap(s)` : `${robotsRes.status} — no robots.txt`,
    "A missing robots.txt is not fatal (crawl is allowed), but you lose sitemap discovery and AI rules.",
  );
  add(
    "robots-sitemap",
    "Robots",
    "Sitemap directive",
    robots?.sitemaps.length ? "pass" : "warn",
    robots?.sitemaps[0] ?? "missing",
    "Add `Sitemap: https://example.com/sitemap.xml` to robots.txt.",
  );

  const coverage = robots ? aiCoverage(robots) : null;
  if (coverage) {
    add(
      "ai-agents",
      "Robots",
      "AI crawler rules",
      coverage.blocked.length ? "fail" : coverage.explicit >= 4 ? "pass" : "warn",
      coverage.blocked.length
        ? `blocked: ${coverage.blocked.join(", ")}`
        : `${coverage.explicit}/${coverage.total} explicitly listed`,
      "List the AI agents you want to allow (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Bravebot, Google-Extended, Bingbot).",
    );
  }

  const signals = robots ? parseContentSignals(robots.contentSignals) : null;
  const signalValues = signals ? [signals.aiTrain, signals.search, signals.aiInput] : [];
  add(
    "content-signals",
    "Robots",
    "Content Signals",
    signals && signalValues.every(Boolean)
      ? "pass"
      : signals && signalValues.some(Boolean)
        ? "warn"
        : "warn",
    signals && signalValues.some(Boolean)
      ? `ai-train=${signals.aiTrain ?? "?"}, search=${signals.search ?? "?"}, ai-input=${signals.aiInput ?? "?"}`
      : "none",
    "Declare your preference: `Content-Signal: ai-train=yes, search=yes, ai-input=yes` (or no).",
  );

  // --- sitemap.xml -------------------------------------------------------
  let sitemapUrl = `${origin}/sitemap.xml`;
  if (robots?.sitemaps[0]) {
    try {
      sitemapUrl = new URL(robots.sitemaps[0], `${origin}/`).href;
    } catch {
      sitemapUrl = robots.sitemaps[0];
    }
  }
  const sitemapRes = await fetchUrl(sitemapUrl, { accept: "application/xml,text/xml", timeout: 20_000 });
  const sitemap = sitemapRes.status === 200 ? parseSitemap(sitemapRes.body) : null;
  add(
    "sitemap",
    "Sitemap",
    "sitemap.xml",
    sitemap && sitemap.locs.length ? "pass" : "fail",
    sitemap ? `${sitemap.locs.length} URL(s)` : `${sitemapRes.status} at ${sitemapUrl}`,
    "Generate a sitemap for every public, indexable URL and reference it from robots.txt.",
  );
  if (sitemap?.locs.length) {
    const included = sitemap.locs.some((loc) => normalizeForCompare(loc) === normalizeForCompare(finalUrl));
    add(
      "sitemap-page",
      "Sitemap",
      "Page in sitemap",
      included ? "pass" : "warn",
      included ? "yes" : "not found",
      "If the page should rank, include it in the sitemap.",
    );
    if (sitemap.lastmods.length) {
      const unique = new Set(sitemap.lastmods);
      add(
        "sitemap-lastmod",
        "Sitemap",
        "lastmod values",
        unique.size === 1 && sitemap.lastmods.length > 1 ? "warn" : "pass",
        unique.size === 1 && sitemap.lastmods.length > 1 ? "all identical (likely build time)" : `${unique.size} unique`,
        "Use the real content change date, not `new Date()` at build time.",
      );
    } else {
      add("sitemap-lastmod", "Sitemap", "lastmod values", "warn", "none", "Add a real lastmod per URL.");
    }
  }

  // --- llms.txt, markdown, auth.md, Link headers -------------------------
  const [llmsRes, authRes, markdownRes, notFoundRes] = await Promise.all([
    fetchUrl(`${origin}/llms.txt`, { accept: "text/plain", timeout: 15_000 }),
    fetchUrl(`${origin}/auth.md`, { accept: "text/markdown,text/plain", timeout: 15_000 }),
    fetchUrl(finalUrl, { accept: "text/markdown", timeout: 20_000 }),
    fetchUrl(`${origin}/__agent_seo_missing_${Date.now()}`, { timeout: 15_000 }),
  ]);

  const llms = llmsRes.status === 200 ? validateLlms(llmsRes.body, { baseUrl: finalUrl }) : null;
  add(
    "llms",
    "AI & agents",
    "llms.txt",
    llms ? (llms.ok ? "pass" : "fail") : "warn",
    llms
      ? `${llms.sections.length} sections, ${llms.links.length} links${llms.errors.length ? `, ${llms.errors.length} format error(s)` : ""}`
      : `${llmsRes.status} — no llms.txt`,
    "Publish a v2 llms.txt: H1, blockquote, details, then H2 file lists of markdown links.",
  );

  add(
    "markdown",
    "AI & agents",
    "Markdown negotiation",
    contentType(markdownRes) === "text/markdown" ? "pass" : "warn",
    contentType(markdownRes) || markdownRes.status,
    "When `Accept: text/markdown`, return a markdown representation of the same URL.",
  );

  const linkHeader = header(page, "link") ?? "";
  const relations = [...linkHeader.matchAll(/rel="([^"]+)"/g)].map((m) => m[1].toLowerCase());
  const agentRelations = relations.filter((rel) => LINK_RELATIONS.has(rel));
  add(
    "link-headers",
    "AI & agents",
    "Link headers",
    agentRelations.length ? "pass" : "warn",
    agentRelations.length ? [...new Set(agentRelations)].join(", ") : "none",
    "Add `Link: </llms.txt>; rel=\"describedby\"` (and optionally service-desc) on page responses.",
  );

  const authOk = authRes.status === 200 && /auth\.md/i.test(authRes.body.slice(0, 200));
  add(
    "auth-md",
    "AI & agents",
    "auth.md",
    authRes.status === 200 ? (authOk ? "pass" : "warn") : "info",
    authRes.status === 200 ? (authOk ? "present" : "present, H1 missing auth.md") : `${authRes.status} — not present`,
    "If agents can register or authenticate, publish /auth.md. If not, a self-contained file is still useful.",
  );

  add(
    "404",
    "Crawl & index",
    "404 handling",
    notFoundRes.status === 404 || notFoundRes.status === 410
      ? "pass"
      : notFoundRes.status === 200
        ? "fail"
        : "warn",
    `${notFoundRes.status}`,
    "Unknown URLs must return 404/410, not a 200 soft-404 page.",
  );

  // --- Security & caching ------------------------------------------------
  add(
    "hsts",
    "Security & caching",
    "HSTS",
    header(page, "strict-transport-security") ? "pass" : "warn",
    header(page, "strict-transport-security") ?? "missing",
    "Add `Strict-Transport-Security: max-age=31536000; includeSubDomains`.",
  );
  add(
    "nosniff",
    "Security & caching",
    "X-Content-Type-Options",
    header(page, "x-content-type-options") === "nosniff" ? "pass" : "warn",
    header(page, "x-content-type-options") ?? "missing",
    "Set `X-Content-Type-Options: nosniff`.",
  );
  add(
    "csp",
    "Security & caching",
    "Content-Security-Policy",
    header(page, "content-security-policy") ? "info" : "info",
    header(page, "content-security-policy") ? "present" : "missing",
  );

  const cache = header(page, "cache-control") ?? "";
  const longCache = /s-maxage=(\d+)/i.exec(cache);
  const longSeconds = longCache ? Number(longCache[1]) : 0;
  add(
    "cache",
    "Security & caching",
    "HTML cache policy",
    /no-store|no-cache/i.test(cache) || longSeconds <= 86_400 ? "pass" : "warn",
    cache || "missing",
    "HTML should revalidate; a year-long s-maxage on HTML serves stale pages after deploy.",
  );

  add(
    "response-time",
    "Security & caching",
    "Response time",
    page.timeMs < 1500 ? "pass" : page.timeMs < 2500 ? "warn" : "warn",
    formatMs(page.timeMs),
    "Aim for < 1.5 s server response on a cold request; measure real users with CrUX.",
  );

  add(
    "content-type",
    "Crawl & index",
    "Content type",
    contentType(page).includes("html") ? "pass" : "warn",
    contentType(page) || "missing",
    "Public pages should be text/html; JSON/XML endpoints are not pages.",
  );

  const summary = summarize(checks);
  const payload = {
    url: start.href,
    finalUrl,
    fetchedAt: new Date().toISOString(),
    page: {
      status: page.status,
      contentType: contentType(page),
      bytes: page.bytes,
      timeMs: page.timeMs,
      title,
      description,
      canonical,
      h1: h1s,
      words,
      jsonLdTypes: jsonLd.types,
      internalLinks: internal,
      externalLinks: links.length - internal,
    },
    summary,
    checks,
  };

  if (boolFlag(flags.json)) {
    printJson(payload);
  } else {
    console.log(`\nSEO audit — ${finalUrl}`);
    console.log(
      `${page.status} ${contentType(page) || "unknown"} · ${formatBytes(page.bytes)} · ${formatMs(page.timeMs)}`,
    );
    console.log(renderSummary(summary));
    console.log("");
    console.log(renderChecks(checks, { heading: "Findings" }));
    console.log("\nLegend: ✓ pass · ! warn · ✗ fail · · info");
  }

  if (summary.fail > 0 && !boolFlag(flags["no-fail"])) process.exitCode = 1;
  return payload;
}
