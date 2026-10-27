# 01 — Technical SEO

The technical job is simple to state and easy to get wrong: **make every page that should rank fetchable, indexable, canonical, and fast enough.**

Run `node bin/seo.mjs audit <url>` for a baseline. This chapter explains what it checks and why.

## Crawlability

### Status codes

| Code | Meaning | Action |
|---|---|---|
| 200 | OK | Indexable page. |
| 301/308 | Permanent redirect | Keep one hop; update internal links to the target. |
| 302/307 | Temporary | Do not use for permanent moves. |
| 404 | Not found | Correct for missing pages. |
| 410 | Gone | Also correct; stronger signal than 404. |
| 5xx | Server error | Crawlers back off; fix before asking for indexing. |

A "soft 404" (a 200 page saying "not found") wastes crawl budget and confuses indexing. Unknown slugs must return 404.

### robots.txt

- Allow public pages, disallow private/app/API paths.
- Reference the sitemap: `Sitemap: https://example.com/sitemap.xml`.
- List AI agents explicitly if you want them (see [agent readiness](05-agent-readiness.md)).
- Never use `Disallow: /` on a site you want indexed.
- `robots.txt` is a crawl directive, not a security control. Do not put secrets in URLs and rely on robots.

Test:

```bash
curl -s https://example.com/robots.txt
```

### JavaScript

If the main content only appears after client-side rendering, verify what a crawler actually receives:

```bash
curl -s https://example.com/page | grep -i "<h1"
```

Google can render JS, but rendering is a second wave and not guaranteed for every page or every AI crawler. Prefer server-rendered or statically generated HTML for anything that must rank. Hydrate interactivity on top.

### Cloudflare and other bot layers

A 403 for `GPTBot`, `ClaudeBot`, or `Googlebot` is a configuration issue, not an SEO one. Check:

```bash
for ua in "GPTBot/1.2" "ClaudeBot/1.0" "Googlebot/2.1"; do
  curl -s -o /dev/null -w "%{http_code} $ua\n" -A "Mozilla/5.0 (compatible; $ua)" https://example.com/
done
```

If you use Cloudflare, disable "Block AI bots" for the domain, or add a skip rule for the agents you want. Cloudflare can cache the 403; purge after the change.

## Indexability

### Canonicals

Every indexable page needs one `<link rel="canonical" href="...">` pointing at itself (absolute URL). Canonicalise:

- `http` → `https`,
- `www` → apex (or the reverse, consistently),
- tracking parameters → clean URL,
- duplicate paths (`/page` vs `/page/`) → one.

A canonical pointing at a different page is a "please do not index this" signal. Use it deliberately for syndicated content, not accidentally on your money pages.

### noindex

Check both:

- `<meta name="robots" content="noindex">`,
- `X-Robots-Tag: noindex` response header.

A staging `X-Robots-Tag` that survives deploy is a classic silent failure. Add it to the launch checklist.

### Sitemaps

- One URL per public, canonical, indexable page.
- Real `lastmod` (the date content actually changed), not `new Date()` at build time.
- Include dynamic routes (courses, guides, comparisons) explicitly.
- Do not include `noindex`, redirects, 404s, or auth-gated URLs.
- Keep it under 50,000 URLs / 50 MB; split with a sitemap index if needed.

Next.js example: [`templates/sitemap.next.ts`](../templates/sitemap.next.ts).

### Duplicate content

Common causes:

- same content on `/` and `/?ref=...`,
- product/category pages with identical descriptions,
- paginated archives that repeat the same intro,
- `www` and non-`www` both resolving.

Fix with canonicals, redirects, and unique copy. Do not "fix" it by noindexing pages you want to rank.

## Metadata

- **Title**: 15–65 characters; primary phrase near the front; unique per page.
- **Meta description**: 50–170 characters; describe the outcome; not a keyword list. Google may rewrite it, but it still influences clicks.
- **H1**: exactly one; state what the page is.
- **Open Graph**: `og:title`, `og:description`, `og:image` for shares and some AI previews.
- **Language**: `<html lang="nb">` (or the correct BCP 47 tag).

Titles are not a place to stuff three locations and a phone number. Write for the searcher.

## URLs and internal links

- Short, lowercase, hyphenated, stable. Avoid changing URLs after launch.
- One topic per path: `/kurs/bok-3430`, not `/kurs?code=BØK%203430`.
- Link from a hub to every important page; link from every page back to the hub and 2–3 related pages.
- Anchor text should describe the destination. "Read more" is a wasted vote.
- Orphan pages (only in the sitemap) are crawled weakly. Add them to navigation or a hub.

## Redirects

- One hop. Chains leak authority and slow crawlers.
- Update internal links to the final URL so you are not relying on redirects forever.
- Keep a redirect map for every URL you move.
- Never redirect everything to the homepage; that is a soft-404 pattern.

## Performance and Core Web Vitals

Measure real users (CrUX / PageSpeed Insights), not only lab scores.

- **LCP** < 2.5 s: optimise the largest image/heading; avoid client-side rendering for above-the-fold content.
- **INP** < 200 ms: reduce long JS tasks; hydrate only interactive islands.
- **CLS** < 0.1: reserve space for images/ads/fonts.

Do not spend weeks on a 99 Lighthouse score while the page has no content. Performance is a tie-breaker and a conversion factor, not a substitute for relevance.

## Caching and deploys

A common production bug: HTML served with `Cache-Control: s-maxage=31536000` from a framework default. Behind a CDN, that can serve last month's page for a year.

- HTML: `no-cache` / `must-revalidate` (or a short TTL with purge-on-deploy).
- Hashed assets: `public, max-age=31536000, immutable`.
- After a deploy, verify the live page, not just the build log.

## International and multilingual

- One URL per language (`/no/`, `/en/`) or a subdomain; do not mix languages on one URL.
- `hreflang` pairs must be reciprocal and include an `x-default`.
- Translate the content, not just the template. Machine translation without review is thin content.

## Security headers (SEO-adjacent)

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`
- `Referrer-Policy`

They do not rank you, but they affect trust, browser warnings, and whether some tools will link to you.

## The 20-minute technical pass

```bash
seo audit https://example.com
seo crawl https://example.com --max=50
curl -s https://example.com/robots.txt
curl -s https://example.com/sitemap.xml | head
curl -sI https://example.com/ | grep -iE "cache-control|x-robots|link"
```

Fix every `fail` before touching copy. Warnings are a queue, not a crisis.
