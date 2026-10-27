import {
  normalizeUrl,
  originOf,
  fetchUrl,
  contentType,
  isHtml,
  normalizeForCompare,
} from "../lib/http.mjs";
import {
  getTitle,
  getMeta,
  getCanonical,
  getH1s,
  countWords,
  getLinks,
  getJsonLd,
} from "../lib/html.mjs";
import { parseRobots, isPathAllowed } from "../lib/robots.mjs";
import { table, printJson, formatMs } from "../lib/report.mjs";
import { numberFlag, boolFlag } from "../lib/args.mjs";

const ASSET =
  /\.(?:png|jpe?g|gif|svg|webp|avif|ico|pdf|zip|gz|css|js|mjs|json|xml|txt|mp4|mp3|wav|woff2?|ttf|otf)$/i;

function uniquePush(queue, seen, value, limit) {
  const key = normalizeForCompare(value);
  if (seen.has(key)) return false;
  if (queue.length >= limit) return false;
  seen.add(key);
  queue.push(value);
  return true;
}

export async function crawl(positional, flags = {}) {
  const target = positional[0] ?? flags.url;
  if (!target) throw new Error("Usage: seo crawl <url> [--max=25] [--concurrency=4] [--json] [--csv]");

  const start = normalizeUrl(target);
  const origin = originOf(start.href);
  const max = Math.min(numberFlag(flags.max, 25), 200);
  const concurrency = Math.min(numberFlag(flags.concurrency, 4), 10);
  const queueLimit = Math.max(max * 4, 50);

  const robotsRes = await fetchUrl(`${origin}/robots.txt`, { accept: "text/plain", timeout: 15_000 });
  const robots = robotsRes.status === 200 ? parseRobots(robotsRes.body) : null;

  const queue = [start.href];
  const seen = new Set([normalizeForCompare(start.href)]);
  const pages = [];
  const started = Date.now();

  async function worker() {
    while (queue.length && pages.length < max) {
      const url = queue.shift();
      if (!url) break;
      if (robots && !isPathAllowed(robots, new URL(url).pathname, "*")) continue;

      const res = await fetchUrl(url, { timeout: 25_000 });
      if (res.status === 0) {
        pages.push({ url, status: 0, error: res.error, title: null, description: null, h1: [], canonical: null, noindex: false, words: 0, schema: [], links: 0 });
        continue;
      }
      if (!isHtml(res) || !res.body) {
        pages.push({ url: res.url, status: res.status, title: null, description: null, h1: [], canonical: null, noindex: false, words: 0, schema: [], links: 0, nonHtml: true });
        continue;
      }

      const html = res.body;
      const finalUrl = res.url;
      const title = getTitle(html);
      const description = getMeta(html, "description");
      const canonicalRaw = getCanonical(html);
      let canonical = null;
      try {
        canonical = canonicalRaw ? new URL(canonicalRaw, finalUrl).href : null;
      } catch {
        canonical = null;
      }
      const h1 = getH1s(html);
      const noindex = (getMeta(html, "robots") ?? "").toLowerCase().includes("noindex");
      const words = countWords(html);
      const jsonLd = getJsonLd(html);
      const links = getLinks(html, finalUrl);

      pages.push({
        url: finalUrl,
        status: res.status,
        title,
        description,
        h1,
        canonical,
        noindex,
        words,
        schema: jsonLd.types,
        links: links.length,
        timeMs: res.timeMs,
      });

      for (const link of links) {
        if (link.external) continue;
        const parsed = new URL(link.href);
        if (ASSET.test(parsed.pathname)) continue;
        if (!isPathAllowed(robots ?? { groups: [] }, parsed.pathname, "*")) continue;
        uniquePush(queue, seen, link.href, queueLimit);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const titleCounts = new Map();
  const descriptionCounts = new Map();
  for (const page of pages) {
    if (page.title) titleCounts.set(page.title, (titleCounts.get(page.title) ?? 0) + 1);
    if (page.description) descriptionCounts.set(page.description, (descriptionCounts.get(page.description) ?? 0) + 1);
  }
  const duplicateTitles = [...titleCounts.entries()].filter(([, count]) => count > 1);
  const duplicateDescriptions = [...descriptionCounts.entries()].filter(([, count]) => count > 1);

  const fails = [];
  const warns = [];
  for (const page of pages) {
    if (page.status !== 200) fails.push(`${page.status} ${page.url}`);
    if (page.noindex) fails.push(`noindex ${page.url}`);
    if (!page.title) fails.push(`missing title ${page.url}`);
    if (!page.description) warns.push(`missing meta description ${page.url}`);
    if (page.h1.length !== 1) fails.push(`${page.h1.length} H1 ${page.url}`);
    if (page.canonical && normalizeForCompare(page.canonical) !== normalizeForCompare(page.url)) {
      fails.push(`canonical mismatch ${page.url}`);
    }
    if (page.words > 0 && page.words < 300) warns.push(`thin (${page.words} words) ${page.url}`);
  }
  for (const [title, count] of duplicateTitles) fails.push(`duplicate title (${count}×): ${title.slice(0, 80)}`);
  for (const [description, count] of duplicateDescriptions) warns.push(`duplicate description (${count}×): ${description.slice(0, 80)}`);

  const duration = Date.now() - started;
  const payload = {
    start: start.href,
    crawledAt: new Date().toISOString(),
    durationMs: duration,
    max,
    pages,
    duplicates: { titles: duplicateTitles, descriptions: duplicateDescriptions },
    fails,
    warns,
  };

  if (boolFlag(flags.json)) {
    printJson(payload);
  } else if (boolFlag(flags.csv)) {
    console.log("url,status,words,title,h1,canonical,noindex,schema");
    for (const page of pages) {
      const row = [
        page.url,
        page.status,
        page.words,
        JSON.stringify(page.title ?? ""),
        page.h1.length,
        JSON.stringify(page.canonical ?? ""),
        page.noindex,
        JSON.stringify(page.schema.join("|")),
      ];
      console.log(row.join(","));
    }
  } else {
    console.log(`\nCrawl — ${start.href}`);
    console.log(`${pages.length} pages in ${formatMs(duration)} (max ${max}, concurrency ${concurrency})\n`);
    console.log(
      table(pages, [
        { label: "Status", value: (page) => page.status || "ERR" },
        { label: "Words", value: (page) => page.words },
        { label: "H1", value: (page) => page.h1.length },
        { label: "Title", value: (page) => (page.title ?? "—").slice(0, 70) },
        { label: "URL", value: (page) => page.url.replace(origin, "") || "/" },
      ]),
    );
    console.log(`\n${fails.length} fail · ${warns.length} warn`);
    if (fails.length) {
      console.log("\nFails:");
      for (const fail of fails.slice(0, 40)) console.log(`  ✗ ${fail}`);
      if (fails.length > 40) console.log(`  … ${fails.length - 40} more`);
    }
    if (warns.length) {
      console.log("\nWarnings:");
      for (const warn of warns.slice(0, 40)) console.log(`  ! ${warn}`);
      if (warns.length > 40) console.log(`  … ${warns.length - 40} more`);
    }
  }

  if (fails.length && !boolFlag(flags["no-fail"])) process.exitCode = 1;
  return payload;
}
