# agent-seo

An agent-first SEO toolkit: a practical playbook, reusable **skills**, a zero-dependency **audit CLI**, and copy-paste **templates** for technical SEO, content, programmatic pages, and AI search visibility.

Built from the work on [studiehacks.no](https://studiehacks.no) — a Norwegian student platform that went from 9 indexable URLs to 262, including 230 programmatic course pages, without buying a single link.

## Why this exists

Most SEO advice is either:

- a 4,000-word listicle with no verifiable claims, or
- a SaaS dashboard that tells you a score but not what to change.

This repo is the middle: a set of **decisions, checks and templates** an agent (or a human) can execute. Every recommendation is something we actually shipped and verified, or a mistake we made and documented.

It is not a guarantee of rankings. Nothing is.

## Quick start

No install required — the CLI is plain Node.js 20+:

```bash
git clone https://github.com/martintondel02/agent-seo.git
cd agent-seo

node bin/seo.mjs audit https://example.com
node bin/seo.mjs crawl https://example.com --max=25
node bin/seo.mjs llms https://example.com
node bin/seo.mjs indexnow https://example.com/sitemap.xml --key=YOUR_KEY --dry
```

Or link it:

```bash
npm link
seo audit https://example.com
```

## Commands

| Command | What it does |
|---|---|
| `seo audit <url>` | One-page audit: indexability, metadata, content, schema, robots, sitemap, `llms.txt`, markdown negotiation, Link headers, `auth.md`, security headers, 404 behaviour. |
| `seo crawl <url> --max=25` | Same-origin crawl. Finds missing/duplicate titles, missing descriptions, bad canonicals, `noindex`, thin pages and broken internal links. |
| `seo llms <url\|file>` | Validates `llms.txt` against the v2 format. Checks H1, blockquote, H2 file lists, link syntax, and optionally every link. |
| `seo indexnow <sitemap>` | Submits every sitemap URL to IndexNow (Bing/Yandex/Seznam). |
| `seo gsc <site> ...` | Search Console reports via a service account: sites, queries, pages, sitemaps, URL inspection. |

All commands accept `--json`. Audit and crawl exit non-zero when there are failures, so they work in CI.

## The playbook

Read in this order:

1. [Principles](docs/00-principles.md) — the six decisions everything else follows from.
2. [Technical SEO](docs/01-technical.md) — crawlability, indexation, canonicals, sitemaps, rendering, speed.
3. [Content SEO](docs/02-content.md) — intent, answer-first writing, information gain, internal links.
4. [Programmatic SEO](docs/03-programmatic.md) — when 200 pages is an asset and when it is spam.
5. [AI search / GEO](docs/04-ai-search.md) — how ChatGPT, Claude and Gemini actually retrieve and cite.
6. [Agent readiness](docs/05-agent-readiness.md) — `llms.txt` v2, markdown twins, Content Signals, Link headers, `auth.md`, accessibility.
7. [Measurement](docs/06-measurement.md) — GSC, Bing, Brave, AI prompt audits, leading vs lagging indicators.
8. [Launch checklist](docs/07-launch-checklist.md) — the list to run before and after deploy.
9. [90-day plan](docs/08-90-day-plan.md) — a realistic sequence with targets.
10. [Case study: Studiehacks](docs/09-case-study-studiehacks.md) — what we shipped, what worked, what did not.
11. [Anti-patterns](docs/10-anti-patterns.md) — the things that waste months or get you penalised.

## Skills for agents

The [`skills/`](skills/) directory contains `SKILL.md` files you can drop into an agent's skill catalog (Claude Code, Codex, Cursor, custom agents):

| Skill | Use when |
|---|---|
| [`seo-audit`](skills/seo-audit/SKILL.md) | You need a baseline and a prioritised fix list. |
| [`technical-seo`](skills/technical-seo/SKILL.md) | Pages are not indexed, canonicalised, or crawlable. |
| [`content-seo`](skills/content-seo/SKILL.md) | You are planning or rewriting pages for search intent. |
| [`programmatic-seo`](skills/programmatic-seo/SKILL.md) | You want to generate many pages from real data — safely. |
| [`geo-ai-search`](skills/geo-ai-search/SKILL.md) | You want ChatGPT/Claude/Gemini to be able to find and cite the site. |
| [`agent-readiness`](skills/agent-readiness/SKILL.md) | You want `isitagentready`-style discovery: `llms.txt`, markdown, Link headers, `auth.md`. |

If you only read one file before delegating work, read [`AGENTS.md`](AGENTS.md).

## Templates

- [`templates/llms.txt`](templates/llms.txt) — a v2-compliant starting point.
- [`templates/robots.txt`](templates/robots.txt) — AI agents + Content Signals.
- [`templates/sitemap.next.ts`](templates/sitemap.next.ts) — real `lastModified`, dynamic routes.
- [`templates/keyword-map.csv`](templates/keyword-map.csv) — one row per query, one page per intent.
- [`templates/content-brief.md`](templates/content-brief.md) — the brief we give a writer or an agent.
- [`templates/comparison-page.md`](templates/comparison-page.md), [`guide-page.md`](templates/guide-page.md), [`course-page.md`](templates/course-page.md) — page shapes that rank and convert.
- [`templates/schema/`](templates/schema/) — Organization, WebSite, SoftwareApplication, Course, FAQPage, BreadcrumbList, Article.
- [`templates/90-day-plan.md`](templates/90-day-plan.md) — fill-in plan.

## One-page version

In a hurry? Read [`CHEATSHEET.md`](CHEATSHEET.md).

## Three rules that matter more than tactics

1. **One page per search intent.** Not one page per keyword. If two pages answer the same query, merge them.
2. **Earn the link, don't buy it.** Twenty real links beat two hundred bought ones, and bought links are the fastest route to a manual penalty.
3. **Measure before you scale.** A sitemap with 2,000 URLs and no Search Console data is guesswork. Get the baseline first.

## Scope and anti-goals

This toolkit deliberately does **not**:

- promise rankings or traffic,
- recommend buying links, PBNs, or expired domains,
- chase navigational brand queries (trying to outrank `bi.no` for "BI" is a waste of time — see [the case study](docs/09-case-study-studiehacks.md)),
- fake structured data, OAuth metadata, or MCP servers to satisfy a scanner,
- treat AI visibility as a trick. It is retrieval + citations + time.

## Requirements

- Node.js 20+ (uses built-in `fetch`, `crypto`, `node:test`).
- No npm dependencies.
- Network access for remote audits. Local `llms.txt` validation works offline.

## License

MIT. See [LICENSE](LICENSE).

Built by [Martin Tøndel](https://github.com/martintondel02) while building [Studiehacks](https://studiehacks.no).
