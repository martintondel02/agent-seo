---
name: seo-audit
description: Run a technical, content and agent-readiness SEO audit on a URL, separate blockers from warnings, and produce a prioritised fix list. Use at the start of any SEO task or before a launch.
---

# SEO audit

Use this skill when you need a **baseline and a fix list**, not a score.

## Workflow

1. Read `docs/00-principles.md` and `docs/01-technical.md`.
2. Run:
   ```bash
   seo audit https://example.com --json > audit-before.json
   seo crawl https://example.com --max=50 --json > crawl-before.json
   ```
3. Read the **failures**, not the total. Separate:
   - **Blockers**: non-200, `noindex`, canonical mismatch, missing sitemap, soft-404s, AI crawlers blocked.
   - **Wins**: title length, missing alt text, schema niceties, security headers.
4. Fix blockers first. Do not rewrite copy on an unindexed page.
5. Re-run the audit and save `audit-after.json`.

## What the audit checks

Crawl/index status, canonical, `noindex`, title, description, H1, language, viewport, Open Graph, word count, image alt text, internal links, JSON-LD, robots.txt, AI agent rules, Content Signals, sitemap and `lastmod`, `llms.txt` v2, markdown negotiation, Link headers, `auth.md`, 404 handling, HSTS, `nosniff`, CSP, HTML cache policy, response time.

## How to report

```text
Baseline: <date>, <url>
Failures: <n>
Blockers: <list>
Warnings: <n>
What I will fix first: <3 items>
What I will not touch yet: <meta polish, CWV>
Unknown: <indexation, traffic>
```

Attach the JSON. No adjectives without evidence.

## Guardrails

- Do not chase the sum of warnings. A page with 12 warnings and a `noindex` has one problem.
- Do not change URLs, redirects or DNS without explicit human approval.
- Do not add fake schema to make a check green.
- If the site is behind Cloudflare and AI crawlers get 403, stop and report it; that is a human action.
