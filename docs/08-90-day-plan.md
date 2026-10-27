# 08 — The 90-Day Plan

A realistic sequence for a small site with one or two people. Adjust the numbers to the niche; keep the order.

The plan assumes: a new or low-authority domain, a product or content site in a specific language, no bought links, and a founder who can ship.

## Week 0 — Baseline and blockers

**Goal:** know where you stand and remove anything that prevents indexing.

- [ ] Verify Search Console (Domain property) and Bing Webmaster Tools.
- [ ] Submit the sitemap; request indexing for the 5 most important pages.
- [ ] Run `seo audit` and `seo crawl`; save JSON.
- [ ] Fix `noindex`, canonical, redirect and 404 issues.
- [ ] Check AI crawler status codes (GPTBot, ClaudeBot, OAI-SearchBot, PerplexityBot, Bravebot).
- [ ] Fix Cloudflare/WAF blocks.
- [ ] Add `llms.txt` (v2) and markdown versions for the core pages.
- [ ] Add `Organization` + `WebSite` schema with `sameAs`.
- [ ] Baseline AI prompt audit (12 prompts × 4 engines).

**Exit criteria:** no `fail` in the audit, sitemap accepted, AI crawlers 200.

## Week 1–2 — Own the brand and the first cluster

**Goal:** be findable for your own name and for one narrow, high-intent cluster.

- [ ] Homepage title/description/definition sentence.
- [ ] `/about` or `/fakta` page with facts, founder, price, contact.
- [ ] One hub page for the first cluster (e.g. `BI` student tools, or one product category).
- [ ] 5–10 child pages answering real queries.
- [ ] Internal links: header, footer, hub, 2–3 related links per page.
- [ ] `sameAs` to GitHub/LinkedIn/Instagram.
- [ ] First external link: founder profile, open-source README, or a real community answer.

**Targets (directional):**

- all core pages indexed,
- #1 for your brand name,
- first impressions for one non-brand query.

## Week 3–6 — The first real content batch

**Goal:** 20–40 pages that answer queries nobody answers well.

- [ ] Keyword map with 30–60 queries.
- [ ] 20–40 pages: guides, comparisons, tools, or programmatic pages with real data.
- [ ] Each page has a unique fact/tool/example.
- [ ] Answer-first opening sentence.
- [ ] FAQ with real questions.
- [ ] Schema per page type.
- [ ] Hub updated with every page.
- [ ] Sitemap updated with real `lastmod`.
- [ ] Request indexing for the 5 most important new pages.

**Targets:**

- 80% of the batch indexed,
- 500+ impressions/month (directional; depends on niche),
- at least one query in the top 20.

**Gate:** if fewer than half the pages are indexed, do not add another 100. Fix crawl path, internal links, and template quality.

## Week 7–10 — Scale what works

**Goal:** double down on the clusters that show impressions; prune or merge the rest.

- [ ] GSC: list pages with impressions. Which cluster?
- [ ] Add 40–80 more pages in the winning cluster only.
- [ ] Merge or redirect pages with no impressions and no links.
- [ ] Add a comparison page for each real alternative.
- [ ] Add 2–4 tools/calculators if the niche has a task.
- [ ] Earn 3–5 links: student org, niche newsletter, Reddit answer, YouTube.
- [ ] Refresh the pages that are close to page 1 (positions 8–20).
- [ ] Check Bing/Brave presence again.

**Targets:**

- 2,000+ impressions/month,
- 20+ queries with impressions,
- first top-10 position,
- first AI citation (manual audit).

## Week 11–13 — Authority and head terms

**Goal:** strengthen the entity and compete for broader terms.

- [ ] Head-term hub page (the broad category) with strong internal links.
- [ ] Every child page links to the hub; the hub links to every child.
- [ ] 3–5 more links.
- [ ] Update the facts page and `llms.txt`.
- [ ] Refresh the top 10 pages with new data/examples.
- [ ] Run the second AI audit and compare.
- [ ] Prune 404s and redirect chains.
- [ ] Review Core Web Vitals on the top pages.

**Targets:**

- 5,000+ impressions/month (directional),
- one broad term in the top 10,
- brand mentioned in at least one AI engine for one prompt.

## What to measure each week

| Metric | Source |
|---|---|
| Indexed pages / published | GSC → Pages |
| Coverage errors | GSC → Pages |
| Impressions, clicks, CTR | GSC → Performance |
| Queries in top 10 / top 3 | GSC |
| Brand vs non-brand clicks | GSC + regex |
| Bing indexed URLs | BWT / `site:` |
| Brave presence | `site:` |
| AI mentions / citations | manual audit |
| Links earned | manual list |

## What not to do in 90 days

- Do not buy links.
- Do not publish 500 programmatic pages before 40 index.
- Do not chase a brand's navigational query.
- Do not rewrite the whole site in week 6 because traffic is slow.
- Do not measure rankings in a country you do not serve.
- Do not add fake schema or fake OAuth/MCP metadata to satisfy a scanner.
- Do not stop at "published". The loop is publish → index → measure → improve.

## A note on timelines

- Brand queries: days to weeks after indexing.
- Long-tail informational queries: 2–8 weeks per page.
- Competitive head terms: months, and only with links and authority.
- AI citations: weeks to months, and mostly a function of index presence + third-party mentions.

If someone promises page 1 in 30 days for a competitive term on a new domain, they are selling something other than SEO.
