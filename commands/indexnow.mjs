import { readFile } from "node:fs/promises";
import { fetchUrl, normalizeUrl, originOf } from "../lib/http.mjs";
import { boolFlag, numberFlag } from "../lib/args.mjs";

const ENDPOINT = "https://api.indexnow.org/indexnow";

async function loadSitemap(target) {
  if (/^https?:\/\//i.test(target)) {
    const url = normalizeUrl(target);
    const res = await fetchUrl(url.href, { accept: "application/xml,text/xml", timeout: 30_000 });
    if (res.status !== 200) {
      throw new Error(`Sitemap returned HTTP ${res.status}${res.error ? ` (${res.error})` : ""}`);
    }
    return { source: url.href, xml: res.body, origin: originOf(url) };
  }
  const xml = await readFile(target, "utf8");
  return { source: target, xml, origin: null };
}

function extractUrls(xml) {
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((match) => match[1]);
  return [...new Set(urls)];
}

export async function indexnow(positional, flags = {}) {
  const target = positional[0] ?? flags.sitemap;
  if (!target) {
    throw new Error("Usage: seo indexnow <sitemap-url|file> --key=KEY [--host=example.com] [--dry]");
  }

  const sitemap = await loadSitemap(target);
  const urls = extractUrls(sitemap.xml);
  if (!urls.length) throw new Error("No <loc> URLs found in the sitemap.");

  let key = typeof flags.key === "string" ? flags.key : process.env.INDEXNOW_KEY;
  if (!key && typeof flags["key-file"] === "string") {
    key = (await readFile(flags["key-file"], "utf8")).trim();
  }
  if (!key) {
    throw new Error("Missing key. Pass --key=32hex, --key-file=path, or set INDEXNOW_KEY.");
  }

  const host = typeof flags.host === "string"
    ? flags.host
    : sitemap.origin
      ? new URL(sitemap.origin).host
      : null;
  if (!host) throw new Error("Could not infer host; pass --host=example.com.");

  const limit = Math.min(numberFlag(flags.limit, 10_000), 10_000);
  const urlList = urls.slice(0, limit);

  console.log(`IndexNow: ${urlList.length} URL(s) for ${host} (from ${sitemap.source})`);
  if (boolFlag(flags.dry)) {
    for (const url of urlList) console.log(`  ${url}`);
    return { host, urlList, dry: true };
  }

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList,
  };

  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status === 200 || res.status === 202) {
        console.log(`Submitted: HTTP ${res.status}. Bing/Yandex/Seznam will fetch the key file and crawl.`);
        return { host, urlList, status: res.status };
      }
      const body = await res.text().catch(() => "");
      lastError = new Error(`HTTP ${res.status} ${body.slice(0, 300)}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * attempt * attempt));
  }

  throw lastError ?? new Error("IndexNow submission failed");
}
