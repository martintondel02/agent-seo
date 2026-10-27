# 07 — Launch Checklist

Run this before a new site, a major release, or a migration. It is deliberately boring.

## Before launch

### Crawl and index

- [ ] `robots.txt` allows public pages.
- [ ] `robots.txt` disallows `/admin`, `/api`, and app/auth paths.
- [ ] `robots.txt` contains `Sitemap:`.
- [ ] `sitemap.xml` lists every public, canonical URL.
- [ ] No `noindex` on pages that must rank (meta **and** `X-Robots-Tag`).
- [ ] Staging password protection / noindex is removed in production.
- [ ] `http` redirects to `https` in one hop.
- [ ] `www` and apex resolve to one canonical host.
- [ ] Unknown URLs return `404`/`410`, not `200`.
- [ ] No redirect chains or loops.
- [ ] No `Disallow: /` left from staging.

### Metadata

- [ ] Unique `<title>` on every page (15–65 chars).
- [ ] Unique meta description (50–170 chars).
- [ ] Exactly one H1 per page.
- [ ] `<html lang="…">` set.
- [ ] Canonical is absolute, self-referencing.
- [ ] Open Graph title/description/image.
- [ ] Favicon and web manifest.

### Content

- [ ] Every indexable page has a primary query and intent.
- [ ] The answer is in the first 1–2 sentences.
- [ ] Each page has one unique fact, tool, example or point of view.
- [ ] No page is a paraphrase of the current top 5.
- [ ] Internal links from a hub to every page.
- [ ] No orphan pages.
- [ ] Images have alt text (or empty alt if decorative).

### Structured data

- [ ] JSON-LD parses.
- [ ] `Organization` and `WebSite` site-wide with stable `@id`.
- [ ] `sameAs` links to real profiles.
- [ ] Page type matches content (`Course`, `Article`, `Product`, `FAQPage`…).
- [ ] No `AggregateRating` without real ratings.
- [ ] Schema matches visible text.

### Performance

- [ ] LCP < 2.5 s on mobile (field data if available).
- [ ] No layout shift from images/fonts.
- [ ] Images sized and compressed.
- [ ] JS not required for main content.
- [ ] HTML is cached with revalidation, not a one-year `s-maxage`.

### Security and operations

- [ ] HTTPS with HSTS.
- [ ] `X-Content-Type-Options: nosniff`.
- [ ] CSP and referrer policy.
- [ ] Backups before migration.
- [ ] Error monitoring.
- [ ] A rollback path.

### Measurement

- [ ] Search Console Domain property verified.
- [ ] Sitemap submitted.
- [ ] Bing Webmaster Tools imported/submitted.
- [ ] Analytics installed (privacy-respecting).
- [ ] Baseline screenshot/JSON saved (`seo audit --json`).

### AI and agents

- [ ] AI crawlers return 200.
- [ ] `llms.txt` validates (v2).
- [ ] Markdown version exists for key pages.
- [ ] `Accept: text/markdown` returns markdown.
- [ ] `Link: </llms.txt>; rel="describedby"` on HTML.
- [ ] `auth.md` exists and is truthful.
- [ ] Accessibility tree: no focusable content in `aria-hidden`.
- [ ] Content Signals line present (if you have a preference).

## Launch day

- [ ] Deploy production build.
- [ ] `curl -I` the homepage: 200, canonical, cache, security headers.
- [ ] `curl` a missing URL: 404.
- [ ] `curl` robots and sitemap.
- [ ] Run `seo audit https://example.com`.
- [ ] Run `seo crawl https://example.com --max=25`.
- [ ] Submit sitemap in GSC and BWT.
- [ ] Request indexing for the 5–10 most important URLs (manual).
- [ ] Run `seo indexnow` for Bing/Yandex.
- [ ] Check `site:example.com` on Bing and Brave (expect zero; note it).

## First 48 hours

- [ ] Check server logs for 5xx and 404 spikes.
- [ ] Check GSC for "Discovered – currently not indexed" on the most important pages.
- [ ] Fix any page that returns 200 but shows a login wall.
- [ ] Verify analytics events.
- [ ] Save the first GSC screenshot/export.

## Week 1

- [ ] Are the top 10 pages indexed?
- [ ] Any `noindex` or canonical mismatch?
- [ ] Any mobile usability errors?
- [ ] Did the sitemap get read? (GSC → Sitemaps)
- [ ] Any AI crawler 403 in logs?

## Week 2–4

- [ ] First impressions/clicks in GSC.
- [ ] Which queries appear?
- [ ] Which pages get impressions but no clicks (title problem)?
- [ ] Which pages are indexed but get no impressions (intent/demand problem)?
- [ ] Bing and Brave presence.
- [ ] First link earned (not bought).

## Before scaling content

- [ ] At least 80% of the first batch indexed.
- [ ] At least some pages have impressions.
- [ ] No duplicate titles/descriptions.
- [ ] No thin pages (<300 words) without a reason.
- [ ] Hub links to every page.
- [ ] Sitemap has real `lastmod`.

If these are not true, fix the template before adding pages.
