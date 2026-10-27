# 09 — Case Study: Studiehacks

This is the project the toolkit came from. It is a Norwegian student platform for BI (Handelshøyskolen BI), built by one student. The numbers below are from the public site and public tooling; nothing private is included.

The honest headline: **we shipped the surface, but we could not verify rankings before this repo was written.** Treat it as a build log, not a victory lap.

## Baseline — 21 October 2026

- 9 public URLs: home, features, alternatives, history, about, privacy, terms, signup, login.
- No Search Console, no Bing Webmaster Tools, no analytics.
- `sitemap.xml` had 9 URLs.
- `robots.txt` was valid but had no AI agent rules.
- `llms.txt`: 404.
- Structured data: Organization/Person on `/om`, WebApplication/FAQ on the homepage.
- Cloudflare returned **403** for `GPTBot`, `ClaudeBot` and `Claude-Web`.
- 0 external links that we knew of.
- 6 of 9 pages were "about" pages. There was almost nothing to rank.

The diagnosis was three blockers:

1. AI crawlers blocked at the edge.
2. No indexation path (no GSC/BWT, no external links).
3. No pages targeting the queries people actually type.

## What shipped

### Week 0 — visibility

- Cloudflare AI block turned off (verified GPTBot/ClaudeBot 200).
- Search Console Domain property verified via DNS TXT.
- `llms.txt` v1.
- `Organization` + `WebSite` + `SoftwareApplication` schema site-wide.
- Five pillar pages: `/bi`, `/bi/timeplan`, `/bi/pensum`, `/bi/eksamen`, `/hva-er-studiehacks`.
- Sitemap grew from 9 to 14 URLs.

### Weeks 1–2 — the course catalogue

- Pulled BI's public course catalogue (221 autumn + 165 spring, union 230 after details).
- Trimmed a snapshot: code, credits, level, department, language, exam form, weighting, duration, aids, workload, topic labels, a short attributed quote.
- Generated one static page per course at `/kurs/[slug]`, with:
  - facts box,
  - short quote + link to BI,
  - exam table,
  - workload and reading plan,
  - FAQ,
  - related courses,
  - `Course` + `FAQPage` + `BreadcrumbList` schema.
- Built `/kurs` hub, grouped by subject.
- Added all pages to the sitemap with the snapshot date as `lastmod`.

### Weeks 1–3 — tools and content

- `/verktoy/karakterkalkulator`: 5-scale + ECTS, credit-weighted, no login.
- `/verktoy/leseplan`: pages/day + week-by-week plan.
- `/verktoy/nedtelling`: days/hours to exam, milestones.
- Six answer-first guides: grades, reading, exam planning, kollokvie, spaced repetition, Notion/Quizlet/Anki.
- Six comparison pages: Notion, Quizlet, Anki, OneNote, Excel, Google Calendar.
- `/fakta`: quotable definition, price, founder, launch, what it is not.

### Agent readiness

- `robots.txt` lists GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, Claude-User, PerplexityBot, Google-Extended, Applebot, Applebot-Extended, Bravebot, CCBot, Bingbot.
- Content Signals: `ai-train=yes, search=yes, ai-input=yes`.
- `llms.txt` rewritten to strict v2: H1, blockquote, details, H2 file lists, `## Optional`.
- Markdown twins for every public page at `<url>.md` (and `/index.md`).
- Content negotiation: `Accept: text/markdown` returns markdown; HTML stays default; `Vary: Accept`.
- Link headers: `</llms.txt>; rel="describedby", </llms.txt>; rel="service-desc"`.
- `/auth.md`: self-contained, no fake OAuth.
- Accessibility: closed mobile menus are `inert`; footer contrast fixed; cookie banner is a named region.
- Axe: **0 violations** on the homepage build.

### Off-site signals

- IndexNow: 262 URLs submitted; HTTP 200.
- Yandex IndexNow: 202.
- Brave Search submit: 10 URLs accepted.
- `llmstxt.site` directory: submitted.
- GitHub profile already links to `studiehacks.no`.

## Evidence

What we could verify from outside:

| Check | Result |
|---|---|
| Public URLs in sitemap | 262 |
| Course pages | 230 |
| AI crawler status | GPTBot, ClaudeBot, Claude-Web, OAI-SearchBot, PerplexityBot, Bravebot, Googlebot, Bingbot → 200 |
| JSON-LD | Organization, WebSite, SoftwareApplication, Course, FAQPage, Breadcrumb, Article, AboutPage, ItemList — all parse |
| 404 | Unknown course slug returns 404 |
| HTML cache | `no-cache, must-revalidate` (Caddy), Cloudflare not caching HTML |
| Markdown negotiation | `text/markdown` on `Accept: text/markdown` |
| `llms.txt` | 40 internal links, all 200 |
| `llms-full.txt` | 230 course links |
| `isitagentready` | Level 3; robots, sitemap, Link headers, markdown, AI rules, Content Signals pass; `authMd` fails on missing OAuth PRM |
| Axe | 0 violations |

What we could **not** verify:

- Google indexation (no GSC API key; `site:` blocked by CAPTCHA from this network).
- Bing indexation (`site:` returned unrelated results / no results at the time).
- Brave indexation (Brave said "too few results" before submission; crawl delayed).
- Impressions, clicks, rankings, AI citations.
- Signups or conversions from organic.

## What worked

1. **Fixing Cloudflare first.** Everything else is moot if GPTBot/ClaudeBot get 403.
2. **The course catalogue.** 230 pages with real exam/workload facts and a unique reading plan. Low competition, high intent, exact-match codes.
3. **Answer-first guides and comparisons.** They give AI something specific to quote.
4. **A strict `llms.txt`.** The first version looked fine but violated v2 (H2 sections were not file lists, links were bare URLs). Rewriting it and adding markdown twins made it actually usable.
5. **Markdown negotiation + Link headers.** Cheap, standard, measurable by scanners.
6. **Accessibility as part of agent readiness.** The `aria-hidden` menu was a real bug that also broke the tree.
7. **Not chasing "BI".** The plan said 0% and it was right; the effort went into "BI + need" and course codes.

## What we got wrong

1. **No GSC API access from day one.** We shipped 262 URLs and could not read the coverage report. The single biggest process mistake.
2. **Scale before the index signal.** 230 pages at once. The safer path is 40–60, measure, then scale.
3. **Bing and Brave were afterthoughts.** For ChatGPT and Claude, they are the index. IndexNow and Brave submission should have been in week 0.
4. **`sitemap.xml` used `new Date()` for every URL.** That taught crawlers the `lastmod` was noise.
5. **The first `llms.txt` was not v2-compliant.** It was a good document, but not a valid file-list document.
6. **No external links for weeks.** The GitHub profile link existed, but no student org, no Reddit answer, no video.
7. **The `/login` page was in the sitemap.** Low value; removed.

## Lessons that generalise

- **Navigational queries are owned by the entity.** Do not fight `bi.no` for "BI". Own "BI timeplan", "BI eksamen", course codes, and campus modifiers.
- **Programmatic pages need a unique fact and a unique action.** 230 pages with exam data and a reading plan are an asset; 230 pages with a swapped city name are a liability.
- **AI visibility is retrieval + citations.** Crawl access, index presence, third-party mentions. `llms.txt` is the cherry, not the cake.
- **A scanner pass is not a ranking.** Agent readiness is hygiene.
- **Do not fake OAuth/MCP/API metadata.** It costs trust and wastes agents' time.
- **Measure before scaling.** Without GSC/BWT, you are guessing.

## What we would do next

1. Read GSC coverage and queries with a service account (`seo gsc report`).
2. Request indexing for `/kurs`, `/verktoy`, `/guider`, `/fakta`, and the top 10 course pages.
3. Earn 3–5 links: a BI student organisation, one honest Reddit answer, one YouTube video, one GitHub README.
4. Add campus pages (`/bi/oslo`, `/bi/bergen`, …) and an exam-season page.
5. Re-run the AI prompt audit after 30 days and compare.

## Reproduce the audit

```bash
seo audit https://studiehacks.no
seo crawl https://studiehacks.no --max=50
seo llms https://studiehacks.no/llms.txt --check-links
```

If the audit shows failures, fix them before copying any of the content strategy. The strategy only works on a crawlable, indexable site.
