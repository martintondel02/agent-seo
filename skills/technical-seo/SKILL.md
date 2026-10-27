---
name: technical-seo
description: Diagnose and fix crawlability, indexation, canonical, sitemap, redirect, rendering and performance problems. Use when pages are not indexed, traffic dropped after a deploy, or a migration is planned.
---

# Technical SEO

Use this skill when the question is **"why can't Google or an AI crawler use this page?"**

## Workflow

1. Read `docs/01-technical.md`.
2. Check the raw response, not the rendered page:
   ```bash
   curl -sI https://example.com/page
   curl -s https://example.com/page | head -c 2000
   curl -s https://example.com/robots.txt
   curl -s https://example.com/sitemap.xml | head -40
   ```
3. Run `seo crawl https://example.com --max=50` for duplicate titles, canonicals, `noindex`, broken links and thin pages.
4. Check AI crawler access with the exact user agents (see `docs/05-agent-readiness.md`).
5. Fix in this order:
   - status codes (200/301/404/410),
   - `noindex` / `X-Robots-Tag`,
   - canonical,
   - robots + sitemap,
   - internal links / orphan pages,
   - rendering,
   - caching and performance.

## Common fixes

- **Soft 404**: return a real 404 for unknown slugs.
- **Canonical mismatch**: point it at the final URL; one canonical per page.
- **Sitemap lastmod**: use the real content date, not build time.
- **Redirect chains**: one hop; update internal links.
- **JS-only content**: server-render or statically generate the text.
- **Cloudflare 403 for AI bots**: disable "Block AI bots" or add a skip rule; purge cache.
- **HTML cached for a year**: `no-cache, must-revalidate`, or purge on deploy.

## Guardrails

- Do not change DNS, Cloudflare, or Search Console settings without the human.
- Do not noindex a page to "fix" duplicate content if it should rank; merge or canonicalise.
- Do not trust a Lighthouse score over `curl` output.
- Do not claim indexing without GSC/BWT evidence.
