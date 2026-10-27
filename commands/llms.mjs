import { readFile } from "node:fs/promises";
import { fetchUrl, normalizeUrl } from "../lib/http.mjs";
import { validateLlms, llmsMarkdownSummary } from "../lib/llms.mjs";
import { printJson } from "../lib/report.mjs";
import { boolFlag } from "../lib/args.mjs";

async function loadTarget(target) {
  if (/^https?:\/\//i.test(target)) {
    const url = normalizeUrl(target);
    const res = await fetchUrl(url.href, { accept: "text/plain,text/markdown", timeout: 20_000 });
    return {
      source: url.href,
      baseUrl: url.href,
      text: res.body,
      status: res.status,
      error: res.error,
    };
  }
  const text = await readFile(target, "utf8");
  return { source: target, baseUrl: null, text, status: 200, error: null };
}

async function checkLinks(links, concurrency = 4) {
  const unique = [...new Map(links.map((link) => [link.url, link])).values()];
  const results = [];
  let index = 0;

  async function worker() {
    while (index < unique.length) {
      const link = unique[index++];
      if (!/^https?:\/\//i.test(link.url)) {
        results.push({ url: link.url, status: 0, error: "not an absolute URL" });
        continue;
      }
      let result = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetchUrl(link.url, { method: "GET", readBody: false, timeout: 20_000 });
        result = { url: link.url, status: res.status, error: res.error };
        if (res.status && res.status < 500) break;
      }
      results.push(result);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length || 1) }, () => worker()));
  return results;
}

export async function llms(positional, flags = {}) {
  const target = positional[0] ?? flags.url;
  if (!target) throw new Error("Usage: seo llms <url|file> [--check-links] [--json]");

  const loaded = await loadTarget(target);
  if (loaded.status === 0) {
    console.error(`Could not fetch ${loaded.source}: ${loaded.error}`);
    process.exitCode = 1;
    return null;
  }
  if (loaded.status >= 400) {
    console.error(`${loaded.source} returned HTTP ${loaded.status}`);
    process.exitCode = 1;
    return null;
  }

  const result = validateLlms(loaded.text, { baseUrl: loaded.baseUrl });
  const linkResults = boolFlag(flags["check-links"]) ? await checkLinks(result.links) : [];
  const broken = linkResults.filter((link) => link.status < 200 || link.status >= 400);

  const payload = {
    source: loaded.source,
    checkedAt: new Date().toISOString(),
    ...result,
    linkResults,
    broken,
  };

  if (boolFlag(flags.json)) {
    printJson(payload);
  } else {
    console.log(`\nllms.txt — ${loaded.source}`);
    console.log(llmsMarkdownSummary(result));
    if (linkResults.length) {
      console.log(`\nLinks: ${linkResults.length - broken.length}/${linkResults.length} OK`);
      for (const link of broken.slice(0, 40)) {
        console.log(`  ✗ ${link.status || "ERR"} ${link.url}${link.error ? ` — ${link.error}` : ""}`);
      }
      if (broken.length > 40) console.log(`  … ${broken.length - 40} more`);
    }
  }

  if (!result.ok || broken.length) process.exitCode = 1;
  return payload;
}
