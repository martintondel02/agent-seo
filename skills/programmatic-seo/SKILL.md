---
name: programmatic-seo
description: Generate many pages from real data without creating thin or spammy content. Use for catalogues, directories, course pages, city pages and comparison sets.
---

# Programmatic SEO

Use this skill when you have a dataset and want **one useful page per entity**, not 500 templates.

## Workflow

1. Read `docs/03-programmatic.md`.
2. Run the data test:
   - unique verifiable fact per row?
   - unique action per row?
   - can you write a unique sentence without lying?
   - would you link to it from a hub?
   - is republication allowed?
   If any answer is no, stop.
3. Build the template with four layers:
   - facts (visible, sourced, dated),
   - original explanation (not copied),
   - a unique computation/comparison (reading plan, cost, compatibility),
   - schema (`Course`, `Product`, `Event`, `Place`, `FAQPage`).
4. Build a hub that links to every page, grouped by category.
5. Start with **10–20 pages**, hand-check, index, wait 2–4 weeks.
6. Scale to 40–60 only if the first batch indexes; then scale further.
7. Add real `lastmod` per page and include only canonical, indexable URLs in the sitemap.

## Quality gates

- >80% of the first batch indexed within 4–6 weeks.
- 0 duplicate titles.
- <10% thin pages.
- 0 canonical/soft-404 errors.
- Some pages get impressions.

If 40 do not index, 400 will not either.

## Guardrails

- No city/state swaps with identical content.
- No scraped descriptions.
- No pages for entities with no public data.
- No fake ratings or reviews.
- Do not scale before the index signal.
