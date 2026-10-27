# 05 — Agent Readiness

"Agent readiness" is the layer above SEO that makes a site legible to AI agents and scanners: crawler access, Content Signals, `llms.txt`, markdown versions, Link headers, `auth.md`, and an accessibility tree that does not lie.

It is not a ranking factor. It is a set of cheap, standard interfaces that make you easier to retrieve, parse and cite. Do it after the technical floor, not instead of it.

## The checks that matter

| Check | What good looks like | Why |
|---|---|---|
| AI crawler access | GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Bravebot return 200 | No crawl, no citation |
| robots.txt AI rules | Explicit `User-agent` blocks for the agents you want | Unambiguous permission |
| Content Signals | `Content-Signal: ai-train=yes, search=yes, ai-input=yes` | States your preference; not all systems honour it |
| `llms.txt` | v2 format, links to markdown versions | A curated map for LLMs |
| Markdown for Agents | `Accept: text/markdown` returns markdown | Cleaner than scraping HTML |
| Link headers | `describedby` / `service-desc` to `llms.txt` | Discovery without HTML |
| `/auth.md` | Self-contained registration/auth facts | Tells agents whether they can authenticate |
| Accessibility tree | No focusable elements inside `aria-hidden`; one H1; landmarks | Agents and screen readers both navigate the tree |
| Structured data | Valid JSON-LD matching visible content | Machines understand the entity |
| Sitemap | Every public URL, real `lastmod` | Index discovery |

## 1. Crawler access and robots.txt

Allow the agents you want, disallow app/admin/API paths.

```
User-Agent: *
Content-Signal: ai-train=yes, search=yes, ai-input=yes
Allow: /
Disallow: /admin
Disallow: /api
```

A robots.txt allow does **not** override a Cloudflare block. Check the actual status codes:

```bash
for ua in "GPTBot/1.2" "OAI-SearchBot/1.0" "ClaudeBot/1.0" "PerplexityBot/1.0" "Bravebot/1.0"; do
  curl -s -o /dev/null -w "%{http_code} $ua\n" \
    -A "Mozilla/5.0 (compatible; $ua)" https://example.com/
done
```

If Cloudflare is blocking them, fix Cloudflare first.

## 2. Content Signals

[Content Signals](https://contentsignals.org/) is a robots.txt directive for AI preferences:

```
User-Agent: *
Content-Signal: ai-train=yes, search=yes, ai-input=yes
```

- `ai-train`: may the content be used for training?
- `search`: may it be indexed for search?
- `ai-input`: may it be used as input to an AI system?

A student tool that wants to be recommended should generally allow all three. A publisher with licensing concerns may choose `ai-train=no, search=yes, ai-input=no`. The important part is that the choice is explicit, not accidental.

This is a preference signal, not an enforcement mechanism. Robots.txt and Cloudflare are enforcement.

## 3. llms.txt v2

The v2 spec is stricter than most blog posts suggest. See [llmstxt.org](https://llmstxt.org):

```markdown
# Example

> One-paragraph summary of the project, written for humans and models.

Details: paragraphs and lists, no headings.

- Name: Example
- Price: free
- Contact: hello@example.com

## Pages

- [Home](https://example.com/index.md): what the product is
- [Pricing](https://example.com/pricing.md): what it costs

## Optional

- [Full text](https://example.com/llms-full.txt): every page in one file
```

Rules:

- H1 is required; it is the only required section.
- Blockquote summary after the H1.
- Details before the first H2, with no headings.
- Every H2 is a **file list**: `- [name](url): note`.
- Links should point to markdown versions, not just HTML.
- `## Optional` is for secondary links.

Common mistakes:

- H2 sections called "Facts", "About" or "Privacy" with plain bullets — invalid.
- Bare URLs instead of `[name](url)` — invalid.
- No markdown versions — allowed, but misses the point.
- 200 URLs in one file — too big; link to a hub and a full-text file.

Validate:

```bash
seo llms https://example.com/llms.txt --check-links
```

## 4. Markdown versions and negotiation

Serve a clean markdown twin:

- `/page.md` for `/page`,
- `/index.md` for `/`,
- `/section/index.md` for `/section`.

And support:

```http
GET /page HTTP/1.1
Accept: text/markdown
```

→ `Content-Type: text/markdown`, markdown body, `Vary: Accept`.

Implementation notes:

- Render from the same data as the HTML, not by scraping the HTML.
- Set `Vary: Accept` so caches do not serve markdown to browsers.
- Consider `Cache-Control: no-store` on the negotiated response to avoid variant pollution at the CDN, or make sure your CDN respects `Vary`.
- Keep the HTML canonical and indexable; markdown is an alternate representation.

Add link relations:

```html
<link rel="alternate" type="text/markdown" href="/page.md">
<link rel="describedby" href="/llms.txt">
```

## 5. Link headers

Agents and scanners look for `Link` response headers (RFC 8288 / RFC 9727):

```http
Link: </llms.txt>; rel="describedby", </llms.txt>; rel="service-desc"
```

Send it on HTML responses, not only when `Accept: text/html`. The scanner's default request may not include that header, and then it sees nothing.

## 6. auth.md

If agents can register or authenticate, document it at `/auth.md`:

- H1 containing `auth.md`,
- audience,
- registration/provisioning endpoints,
- supported methods and credential use,
- contact.

If there is no agent API, say so plainly and keep the file self-contained:

```markdown
# auth.md — Example

> Agent registration and authentication information.

## Audience
AI agents reading public content.

## Registration
Example does not issue agent credentials. Public pages are readable anonymously.
Humans sign up at https://example.com/signup.

## Authentication
No OAuth, no API keys, no bearer tokens. Authenticated app routes require a
human session cookie and are not available to agents.

## How to read this site
- llms.txt
- markdown versions via `Accept: text/markdown`
- sitemap.xml
```

Do **not** publish OAuth Protected Resource Metadata or an authorization-server document for an API that does not exist. A scanner may award a point; agents will waste time and trust you less. The Auth.md skill explicitly allows a self-contained file when OAuth is not available.

## 7. Accessibility tree

Scanners increasingly inspect the accessibility tree as a proxy for "can an agent navigate this page".

The common failure is a hidden menu:

```html
<aside aria-hidden="true">
  <a href="/">Home</a>
  <button>Close</button>
</aside>
```

`aria-hidden` hides the subtree from assistive tech, but the links are still focusable. That is an `aria-hidden-focus` violation and a malformed tree.

Fix:

```html
<aside inert={!open} aria-hidden={open ? undefined : true}>
```

`inert` removes the subtree from the tab order and the accessibility tree. When the menu opens, remove `inert` and `aria-hidden`.

Also check:

- exactly one H1,
- every page has a `<title>` and `lang`,
- content inside landmarks (`main`, `nav`, `footer`, named `region`),
- text contrast at least 4.5:1 for body text,
- images with `alt` (or empty `alt` if decorative),
- no focusable elements inside `aria-hidden`.

Axe is a good local check:

```js
// with axe-core injected into Playwright
const results = await page.evaluate(() => axe.run(document));
```

Aim for zero violations on the pages agents are likely to read.

## 8. What scanners check

`isitagentready.com` groups checks into levels. A typical site can reach **Level 3 (Agent-Readable)** without building an API:

- robots.txt, sitemap,
- Link headers,
- markdown negotiation,
- AI bot rules,
- Content Signals,
- `auth.md` (may still require OAuth metadata for a pass).

Level 4–5 asks for an API catalog, OAuth discovery, MCP server card, A2A agent card, agent skills index, WebMCP and DNS-AID. Those are product/platform decisions. Do not stub them.

## Checklist

- [ ] AI crawlers return 200.
- [ ] robots.txt allows public pages, disallows app/API, lists AI agents.
- [ ] Content-Signal line present and intentional.
- [ ] `llms.txt` passes v2 validation.
- [ ] `.md` twin exists for public pages.
- [ ] `Accept: text/markdown` returns markdown.
- [ ] `Link: </llms.txt>; rel="describedby"` on HTML.
- [ ] `/auth.md` exists and tells the truth.
- [ ] Accessibility: no focusable content in `aria-hidden`; one H1; landmarks; contrast.
- [ ] Sitemap includes every public URL with a real `lastmod`.

Run `seo audit https://example.com` to check most of this in one pass.
