# SEO cheat sheet

The one-page version. Details in [`docs/`](docs/).

## The 10 rules

1. **One page per intent.** Merge pages that answer the same query.
2. **Technical floor first.** 200/301/404, canonical, robots, sitemap, no `noindex`, content in HTML.
3. **Answer in the first sentence.** Then explain.
4. **Name the unique thing.** Data, tool, test, screenshot, named experience, local detail.
5. **Internal links.** Hub → children, children → hub + 2–3 siblings.
6. **Earn links.** Founder profiles, student orgs, one honest forum answer, open source, video. Never buy.
7. **Measure before scaling.** GSC + BWT + Brave. 40 indexed pages before 400.
8. **AI visibility = crawl access + index + citations + machine-readable.** In that order.
9. **Do not chase a brand's navigational query.** Own `brand + need`, not the brand.
10. **Tell the truth in schema, metadata and `llms.txt`.** No fake reviews, OAuth or MCP.

## 20-minute audit

```bash
seo audit https://example.com
seo crawl https://example.com --max=50
curl -sI https://example.com/ | grep -iE "cache-control|x-robots|link"
curl -s https://example.com/robots.txt
curl -s https://example.com/sitemap.xml | head -40
```

Fix every `fail` before touching copy.

## Page template

```text
H1: the query or the promise
> one-sentence answer (quotable)
context: who this is for, what they will do
## steps / facts / comparison
## common mistake
## FAQ (real questions)
## related links (hub + 2–3)
```

## Metadata

- Title 15–65 chars, unique.
- Description 50–170 chars, outcome not keywords.
- One H1.
- Self canonical.
- OG title/description/image.
- `<html lang="…">`.

## AI / agents

```text
1. AI crawlers 200? (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Bravebot)
2. In the index? (Google / Bing / Brave)
3. Third-party mentions? (GitHub, Reddit, orgs, YouTube)
4. Machine-readable? (llms.txt v2, .md twins, schema, FAQ, facts page)
```

`llms.txt` v2 is strict: H1, blockquote, details, **H2 file lists** of `[name](url)` links, `## Optional`. Put facts before the first H2.

```bash
seo llms https://example.com/llms.txt --check-links
curl -H "Accept: text/markdown" https://example.com/page
```

## Never

- Buy links or use PBNs.
- Stuff keywords.
- Build doorway/city-swap pages.
- Fake `AggregateRating` or `FAQPage`.
- Target `bi.no` for "BI".
- Noindex pages you want to rank.
- Publish OAuth/MCP/API metadata that does not exist.
- Report rankings without GSC/BWT evidence.

## Evidence format

```text
Baseline (date, source):
What changed:
Evidence (URL, status, query, position):
Still unknown:
Next action, owner, date:
```
