# AGENTS.md — how to use this repo

You are an agent helping a human with SEO. This file is the contract. Read it before touching a site.

## 0. First, establish the mode

Ask (or infer) which one you are in:

| Mode | You have | You should |
|---|---|---|
| **New site** | Nothing indexed yet | Get 5–10 pages right, then index them. Do not build 200 pages first. |
| **Existing site** | Traffic but flat/declining | Audit, find the constraint, fix or consolidate. Do not rebuild from scratch. |
| **Pre-launch** | Staging URL | Run the launch checklist. Fix crawl/index blocks before launch. |
| **Content sprint** | A topic cluster | Keyword map → briefs → pages → internal links → request indexing. |
| **Programmatic** | A dataset | 40–60 pages, measure, then scale only if they index. |
| **AI visibility** | A site that already ranks | Agent readiness + citations. Ranking comes first. |

## 1. Read the right doc

In a hurry? [`CHEATSHEET.md`](CHEATSHEET.md) is the one-page version.

- Always: [`docs/00-principles.md`](docs/00-principles.md).
- Technical problems: [`docs/01-technical.md`](docs/01-technical.md).
- Writing/rewriting: [`docs/02-content.md`](docs/02-content.md).
- Many pages from data: [`docs/03-programmatic.md`](docs/03-programmatic.md).
- ChatGPT/Claude/Gemini: [`docs/04-ai-search.md`](docs/04-ai-search.md).
- Agents/bots/scanners: [`docs/05-agent-readiness.md`](docs/05-agent-readiness.md).
- Reporting: [`docs/06-measurement.md`](docs/06-measurement.md).

## 2. Run the audit before proposing changes

```bash
node bin/seo.mjs audit https://example.com --json > audit-before.json
```

Then:

1. Read the failures, not the score.
2. Separate **blockers** (not indexable, wrong canonical, `noindex`, broken sitemap, JS-only content) from **wins** (title length, missing alt text, schema niceties).
3. Fix blockers first. A perfect meta description on an unindexed page is decoration.

## 3. Build a keyword map before writing

Use [`templates/keyword-map.csv`](templates/keyword-map.csv). One row per query, one page per intent.

Rules:

- If two rows map to the same intent, merge the pages.
- If a page has no query, it is a page for users, not SEO. That is allowed; label it.
- Brand/navigational queries (`bi`, `handelshøyskolen bi`, `yourbrand`) are **monitoring rows**, not targets. Never build a page to outrank an official brand for its own name. See [case study](docs/09-case-study-studiehacks.md).

## 4. Write the page from a brief

Use [`templates/content-brief.md`](templates/content-brief.md). Every page must have:

- one primary query and the intent behind it,
- the answer in the first 1–2 sentences,
- at least one thing that is **not** on the top 10 results (original data, a calculator, a real example, a screenshot),
- internal links to the hub and to 2–3 related pages,
- structured data that matches the visible content.

If you cannot name the unique thing, do not write the page.

## 5. Technical checklist

Run [`docs/07-launch-checklist.md`](docs/07-launch-checklist.md). The non-negotiables:

- 200 for public pages, 404 for missing, 301 for moved.
- One canonical per page, self-referencing.
- `robots.txt` allows public pages and points to the sitemap.
- `sitemap.xml` has real `lastmod` and includes every public URL.
- No `noindex` on a page that should rank.
- Content is in the HTML, not only after client-side JS.
- Internal links use descriptive anchors and no orphan pages.

## 6. AI visibility is not a separate trick

Do these in order:

1. Can AI crawlers fetch the page? (200, no Cloudflare block, robots allows them.)
2. Is the page in the index they use? (Google for Gemini, Bing for ChatGPT, Brave for Claude.)
3. Is there independent corroboration? (GitHub, Reddit, student orgs, YouTube.)
4. Is the page machine-readable? (`llms.txt`, markdown twin, schema, FAQ.)

If 1–2 are false, do not spend time on 4. See [`docs/04-ai-search.md`](docs/04-ai-search.md).

## 7. Never do these

- Buy links, use PBNs, or trade links at scale.
- Publish fake `Review`/`AggregateRating` schema.
- Create `noindex` pages and submit them to IndexNow.
- Publish OAuth/MCP/API metadata for an API that does not exist.
- Build 500 programmatic pages before 40 have indexed.
- Target a brand's own navigational query.
- Report "we are ranking" without a GSC/BWT/Brave query, date and position.
- Hide text, cloak, or serve different content to crawlers.

## 8. Report like an engineer

A useful report has:

```text
Goal:
Baseline (date, source):
What changed:
Evidence (URL, status, query, position):
What is still unknown:
Next action, owner, date:
```

No adjectives without numbers. "Improved SEO" is not a result.

## 9. When to stop and ask the human

- A DNS, Cloudflare, or Search Console change is needed.
- A page would make a claim about a person or company.
- The fix requires deleting or redirecting many URLs.
- The site has legal, medical, financial, or safety content.
- The scanner asks for OAuth/MCP/API metadata that does not exist.

## 10. Output contract

When you finish, leave behind:

- `audit-before.json` and `audit-after.json`,
- the keyword map,
- the changed files,
- a short report with evidence and unknowns.

That is how the next agent can continue without re-learning the site.
