# 06 — Measurement

If you cannot say "on 27 October, 14 of 262 URLs were indexed and the site got 0 impressions", you do not have a baseline. You have a feeling.

## The minimum stack

| Source | What it gives you | Cost |
|---|---|---|
| **Google Search Console** | Index status, queries, impressions, clicks, CTR, position, sitemaps | Free |
| **Bing Webmaster Tools** | Bing index, queries, IndexNow, ChatGPT's index | Free |
| **Brave Search** | Brave index (Claude's search), site presence | Free |
| **Analytics** | On-site behaviour, conversions | Free/paid |
| **GSC API** | Automatable reports | Free |

You do not need a rank tracker on day one. GSC gives you the queries that actually produced impressions.

## Google Search Console setup

Use a **Domain property**, not URL prefix:

1. Search Console → Add property → Domain → `example.com`.
2. Add the DNS TXT record at your DNS provider.
3. Verify.
4. Submit `https://example.com/sitemap.xml`.
5. URL Inspection → request indexing for the 5–10 pages that matter most.

For API access (recommended):

1. Google Cloud → create/select a project.
2. Enable **Google Search Console API**.
3. Create a service account.
4. Create a JSON key.
5. In Search Console → Settings → Users and permissions → add the service-account email as **Full**.
6. Save the key outside the repo and set `GOOGLE_APPLICATION_CREDENTIALS`.

Then:

```bash
seo gsc sites
seo gsc report sc-domain:example.com --days=28
seo gsc queries sc-domain:example.com --days=28
seo gsc pages sc-domain:example.com --days=28
seo gsc inspect sc-domain:example.com https://example.com/page
seo gsc sitemaps sc-domain:example.com
```

Notes:

- Data lags 2–3 days.
- URL Inspection is read-only; the API cannot "request indexing". That click is manual.
- A fresh property has no history; the first useful signal is coverage, not performance.

## Bing Webmaster Tools

ChatGPT search runs on Bing's index. Do this:

1. [bing.com/webmasters](https://www.bing.com/webmasters) → Add site → **Import from Google Search Console**.
2. Submit the sitemap.
3. Use **URL Submission** for key pages, or IndexNow.
4. Check `site:example.com` after a few days.

IndexNow is the fastest path:

```bash
seo indexnow https://example.com/sitemap.xml --key=YOUR_KEY
```

The key file must be live at `https://example.com/YOUR_KEY.txt` and contain the key.

## Brave Search

Claude's web search leans on Brave. There is no public API for site owners in the same way, but:

- submit key URLs at `https://search.brave.com/submit-url`,
- make sure `Bravebot` is allowed,
- earn links — Brave's index is smaller and link-driven.

Check `site:example.com` on Brave monthly. It can take weeks.

## Metrics that matter

### Leading indicators

- pages indexed / pages published,
- coverage errors,
- crawl requests (server logs),
- internal links to new pages,
- sitemap errors,
- Core Web Vitals pass rate.

### Lagging indicators

- impressions,
- clicks,
- CTR,
- average position,
- queries in top 10 / top 3,
- non-brand clicks,
- conversions / signups / tool uses.

### AI indicators

- brand mentioned in the 4 engines (yes/no),
- URL cited (yes/no),
- prompt coverage (how many of 12 prompts mention you),
- citation source (your site vs third party).

Report leading and lagging separately. "We published 20 pages" is not a result; "14 of 20 are indexed and 6 have impressions" is.

## Brand vs non-brand

Split every query report:

- **Brand**: contains your name or domain. High CTR, low volume, easy.
- **Non-brand**: everything else. This is where growth lives.

If 90% of clicks are brand, you have not acquired demand; you have captured people who already know you.

A simple regex:

```bash
seo gsc report sc-domain:example.com --brand="example|example\\.com"
```

## The monthly AI audit

Ask the same 10–15 prompts across ChatGPT, Claude, Gemini and Perplexity. Log:

| Date | Prompt | Engine | Mentioned? | URL cited | Notes |
|---|---|---|---|---|---|
| 2026-10-27 | Best study tool for BI students | ChatGPT | no | — | cited Notion, Quizlet |
| 2026-10-27 | Best study tool for BI students | Claude | no | — | Brave had no result |

Do not change the prompts every month. The point is comparison.

## Reporting template

```text
Goal: rank for "BI timeplan" and 20 course-code queries
Baseline: 2026-10-27, GSC 28 days, 0 impressions, 14/262 indexed
Shipped: 230 course pages, 3 tools, 6 guides, sitemap + IndexNow
Evidence:
  - sitemap: 262 URLs, 0 errors
  - GSC coverage: 14 indexed (before), 41 (after 3 weeks)
  - queries: 6 queries with impressions, best position 18
  - Bing: site: returns 3 URLs
  - Brave: not indexed
Unknown: whether Google will index the long tail; no link campaign yet
Next: request indexing for 10 hubs; 3 links; re-check in 14 days
```

No adjectives without numbers. No "improved SEO".

## Cadence

| Frequency | What |
|---|---|
| Daily (first week) | deploy check, status codes, 404s, robots/sitemap |
| Weekly | GSC coverage + queries, Bing/Brave `site:`, new pages indexed |
| Bi-weekly | content shipped, internal links, links earned |
| Monthly | AI prompt audit, full GSC report, prune/merge thin pages |
| Quarterly | technical audit, Core Web Vitals, redirect map, content refresh |

## Pitfalls

- **Optimising the average position** across all queries. It hides the long tail.
- **Reporting impressions without clicks.** Impressions with 0.2% CTR is a title problem, not a win.
- **Comparing a 7-day window to a 28-day window.**
- **Ignoring branded queries.** They flatter the dashboard.
- **Measuring rankings in a different country/language** than the audience.
- **No annotation of deploys.** A traffic drop after a deploy is a clue; without dates, it is a mystery.
- **Judging AI visibility from one prompt, one time.**
