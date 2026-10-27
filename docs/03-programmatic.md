# 03 — Programmatic SEO

Programmatic SEO means generating pages from data instead of writing each one by hand. It is the highest-leverage and highest-risk SEO technique in this repo.

The difference between an asset and spam is **whether each page has a reason to exist beyond the template**.

## When to use it

Good fits:

- a catalogue of real entities: courses, products, cities, integrations, airports, public records,
- a directory where each entity has structured facts people search for,
- a calculator or comparison generated per entity,
- a dataset you own or license.

Bad fits:

- "best X in Y" pages with no data,
- city pages that only swap the city name,
- translated pages with no local content,
- pages generated from thin or scraped descriptions,
- anything where the answer is the same on every page.

## The data test

Before generating 200 pages, answer:

1. Does each row have at least one **verifiable fact** that differs from the others?
2. Does each row have a **unique action** the reader can take (add to app, calculate, compare, contact)?
3. Can you write a **unique sentence** about each row without lying?
4. Would you link to this page from a hub if you were a human?
5. Is the data allowed to be republished? (Licence, copyright, terms.)

If the answer to 1–3 is no, do not generate the pages.

## The page template

A good programmatic page has four layers:

### 1. Facts

Structured data rendered visibly:

- name, code, price, date, location, credits, level, language,
- status (`active`, `discontinued`, `not offered this term`),
- source and last-updated date.

### 2. Unique explanation

One to three paragraphs written from the facts, not from another site's copy. If you quote the source, quote a short passage, attribute it, and link to it.

### 3. Unique computation or comparison

The page should do something the source does not:

- a reading plan based on pages and exam date,
- a total cost calculation,
- a comparison with the sibling entities,
- a "who this is for" decision rule,
- a checklist derived from the facts.

### 4. Schema

Use the type that matches the entity: `Course`, `Product`, `Offer`, `Event`, `Place`, `FAQPage`. Mark up only what is visible.

## Quality gates

Do not scale until the first batch passes:

| Gate | Target |
|---|---|
| Pages indexed | > 80% within 4–6 weeks |
| Impressions | at least some pages get impressions |
| Duplicate titles | 0 |
| Thin pages | < 10% under 300 words |
| Canonical errors | 0 |
| Soft-404s | 0 |
| Crawl errors | 0 4xx/5xx from internal links |

If 40 pages do not index, 400 will not either. Fix the template, the internal links, and the crawl path first.

## Rollout

1. **10–20 pages** in one cluster. Hand-check every one.
2. **Index them** via sitemap and URL Inspection.
3. **Wait 2–4 weeks.** Check coverage and impressions.
4. **40–60 pages** if the first batch indexes.
5. **Scale** only after the second batch shows impressions.

A useful rule: add pages in batches you can review. A batch of 20 is reviewable; 500 is not.

## Hub and internal links

Programmatic pages need a crawl path:

- a hub (`/kurs`, `/integrations`, `/cities`) listing every page,
- grouped by category, with counts,
- links from related pages,
- links from the homepage or a high-authority page to the hub,
- sitemap inclusion with real `lastmod`.

Without a hub, 200 pages are orphaned and crawl slowly.

## Index management

- Index pages with enough data. `noindex` the thin ones rather than publishing them.
- Do not noindex a page and submit it to IndexNow.
- Remove pages that are permanently gone with 410 or redirect them with 301.
- Keep the sitemap to canonical, indexable URLs only.
- If the dataset changes, update `lastmod` only on pages that changed.

## Schema for programmatic pages

- `Course` for courses: `courseCode`, `provider`, `educationalCredentialAwarded`.
- `Product`/`Offer` for products: price, currency, availability.
- `Event` for dated events.
- `Place` for locations.
- `FAQPage` only when the questions and answers are visible.
- `BreadcrumbList` on every page.

Do not add `AggregateRating` unless real users actually rated the item. Fake ratings are a manual-action risk.

## Case study: 230 BI course pages

What we did on [studiehacks.no](https://studiehacks.no):

- pulled the public BI course catalogue (221 autumn + 165 spring courses, union 230 after details),
- stored a trimmed snapshot with code, credits, level, department, exam form, weighting, duration, aids, workload, topics and a short attributed quote,
- generated one static page per course at `/kurs/[slug]`,
- wrote original sections around the facts: exam interpretation, workload plan, FAQ, related courses,
- added `Course` + `FAQPage` + `BreadcrumbList` schema,
- built a hub at `/kurs` with every course grouped by subject,
- included all pages in the sitemap with the snapshot date as `lastmod`,
- added the pages to navigation and the homepage.

What we deliberately did **not** do:

- copy BI's full course description,
- invent learning outcomes,
- publish pages for courses that had no public data,
- create 230 pages before the template was reviewed.

The result is 230 pages with unique facts and a unique reading plan, not 230 copies of a template.

## Anti-patterns

- **Doorway pages**: many pages that funnel to the same offer.
- **City/state swaps**: same content with a different place name.
- **Scraped descriptions**: duplicate content and copyright risk.
- **Thin pages with an LLM intro**: 200 words of generic prose is still thin.
- **Index bloat**: publishing everything and hoping Google sorts it out.
- **Fake freshness**: changing `lastmod` without changing content.
- **Schema for content that is not on the page**.

## The one-sentence test

For every generated page, complete:

> "This page exists because someone searching **\[query\]** needs **\[unique fact or action\]**, which is not available on the source page."

If you cannot complete it, delete the page.
