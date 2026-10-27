# 04 — AI Search / GEO

"AI SEO" or GEO (generative engine optimization) is not a separate ranking system. It is **retrieval plus citation** on top of the normal web.

An assistant answers from one of three sources:

1. an index it can search (Google, Bing, Brave, its own crawler),
2. pages it fetched directly from a link,
3. its training data (months or years old).

Your job is to be in the index, be fetchable, and be worth citing. Everything else is secondary.

## Which engine uses which index

| Assistant | Retrieval source (typical) | What you need |
|---|---|---|
| **ChatGPT search** | Bing index, `OAI-SearchBot`, `ChatGPT-User` | Bing index, crawl access, `llms.txt`, clear facts |
| **Claude** (web search) | Brave-based search + `ClaudeBot` / `Claude-User` | Brave index, crawl access, third-party mentions |
| **Gemini / AI Overviews** | Google index | Google index, ranking pages, schema, freshness |
| **Perplexity** | Own index + web search | Crawl access, citations, clear sourcing |
| **Copilot** | Bing index | Bing index, structured data |

This is a simplification — the products change — but the dependency is real. If Bing has not indexed you, ChatGPT cannot cite you. If Brave has not indexed you, Claude is unlikely to.

## The order of operations

### 1. Can AI crawlers fetch you?

Check the exact user agents:

```bash
for ua in "GPTBot/1.2" "OAI-SearchBot/1.0" "ClaudeBot/1.0" "Claude-Web/1.0" "PerplexityBot/1.0" "Bravebot/1.0"; do
  curl -s -o /dev/null -w "%{http_code} $ua\n" \
    -A "Mozilla/5.0 (compatible; $ua)" https://example.com/
done
```

If you see `403`, the block is usually Cloudflare (Security → Bots → "Block AI bots"), a WAF rule, or a bot-fight setting. Fix it before writing another word. Cloudflare can cache the 403; purge after the change.

Robots.txt should allow the agents explicitly. See [agent readiness](05-agent-readiness.md).

### 2. Are you in the index they use?

- **Bing**: add the site to Bing Webmaster Tools, submit the sitemap, use IndexNow.
- **Google**: Search Console, sitemap, URL Inspection.
- **Brave**: submit the URL; Bravebot crawls links. Third-party links matter more here.

No index, no citation. This is the step most "AI SEO" advice skips.

### 3. Is anyone else saying you are relevant?

Assistants cite what the web says about you, not only what you say about yourself. The realistic sources for a small product:

- GitHub profile/README (public, high authority),
- a genuinely helpful Reddit/forum answer,
- a student organisation or club page,
- YouTube/TikTok titles and descriptions,
- a niche newsletter or local press,
- documentation and open-source projects.

One honest mention beats fifty directory listings. Do not astroturf; it is detectable and it poisons the brand.

### 4. Is the page machine-readable?

- One clear definition sentence near the top that can be quoted verbatim.
- A FAQ with real questions and direct answers.
- Facts page: price, founder, launch date, what it is not.
- Schema: `Organization`, `WebSite`, `SoftwareApplication`/`Product`, `FAQPage`, `Article`.
- `llms.txt` + markdown versions (see below).
- Stable URLs and a real `last updated` date.

## llms.txt: what it is and is not

`llms.txt` is a proposed convention (v2 at [llmstxt.org](https://llmstxt.org)): a small markdown file at `/llms.txt` that gives an agent a map of the site.

It does **not** make you rank, and there is no evidence that every assistant reads it. It is a cheap, standard way to make the site easier to ingest when an agent does look.

The v2 format is strict:

```markdown
# Site name

> One-paragraph summary.

Details as paragraphs and lists (no headings).

## Pages

- [Page name](https://example.com/page.md): what it covers

## Optional

- [Full text](https://example.com/llms-full.txt)
```

Rules that are easy to get wrong:

- H2 sections may only contain **file lists** of markdown links (`- [name](url): note`). A section called "Facts" with plain bullets is invalid.
- Put facts, pricing and definitions **before** the first H2.
- Link to **markdown versions** of pages, not only HTML.
- Keep it small; the detail lives behind the links.
- `## Optional` is for secondary links an agent can skip.

Validate with:

```bash
seo llms https://example.com/llms.txt --check-links
```

## Markdown versions

Agents parse markdown more reliably than a nav-heavy HTML page. Serve a clean version at the same URL plus `.md` (or `/index.md`), and support content negotiation:

```bash
curl -H "Accept: text/markdown" https://example.com/page
```

For Next.js, a proxy can rewrite `Accept: text/markdown` to a markdown renderer, and `.md` URLs can be rewrites too. See [agent readiness](05-agent-readiness.md).

## Content that gets cited

- **Answer in the first sentence.** The opening sentence is what gets lifted.
- **Name the entity and the category.** "Studiehacks is a free study platform for BI students", not "we are revolutionising learning".
- **Use tables and numbered steps.** They survive extraction.
- **Attribute claims.** Link to the source; assistants prefer verifiable text.
- **Keep facts current.** A stale price is a reason not to cite you.
- **Give the counter-argument.** "X is better for Y" makes the rest credible.

## The monthly AI audit

Once a month, ask the same 10–15 prompts in ChatGPT, Claude, Gemini and Perplexity. Log:

| Prompt | Engine | Brand mentioned? | URL cited | Position/context | Date |
|---|---|---|---|---|---|

Example prompts:

- "What is the best study tool for a BI student?"
- "How do I get my timetable from TimeEdit?"
- "What is the syllabus for BØK 3430?"
- "Is there a free grade calculator for Norwegian students?"
- "How should I plan exam revision at BI?"

You need a baseline before you can claim progress. The first run is usually all zeros; that is data, not failure.

## What not to do

- **Do not buy "AI visibility" services that promise mentions.** They cannot control the model.
- **Do not spam Reddit/forums with links.** It gets removed and can hurt the brand.
- **Do not publish fake facts or fake reviews.**
- **Do not create `llms.txt` with 200 bare URLs.** It violates the format and helps nobody.
- **Do not treat a green agent-readiness scanner as ranking.** It is a hygiene check.

## The honest summary

AI assistants will recommend you when:

1. they can fetch you,
2. you are in the index they use,
3. the page says something specific and verifiable,
4. someone else they trust has mentioned you.

You can control 1, 2 and 3. You can only earn 4. That is the whole game.
