---
name: agent-readiness
description: Implement crawler permissions, Content Signals, llms.txt v2, markdown negotiation, Link headers, auth.md and an accessible tree so agents can read and cite the site.
---

# Agent readiness

Use this skill when a scanner (e.g. `isitagentready.com`) or an agent reports that the site is hard to read.

## Workflow

1. Read `docs/05-agent-readiness.md`.
2. Run `seo audit https://example.com`.
3. Fix in this order:
   - **Crawler access**: AI user agents return 200; Cloudflare/WAF not blocking.
   - **robots.txt**: explicit AI blocks + `Content-Signal`.
   - **llms.txt v2**: H1, blockquote, details, H2 file lists of markdown links, `## Optional`.
   - **Markdown twins**: `<url>.md` and `<url>/index.md`; `Accept: text/markdown` negotiated.
   - **Link headers**: `Link: </llms.txt>; rel="describedby", </llms.txt>; rel="service-desc"`.
   - **`/auth.md`**: truthful, self-contained if there is no OAuth API.
   - **Accessibility**: no focusable content inside `aria-hidden`; use `inert` for closed menus; one H1; landmarks; 4.5:1 contrast.
4. Validate:
   ```bash
   seo llms https://example.com/llms.txt --check-links
   curl -H "Accept: text/markdown" https://example.com/page
   curl -sI https://example.com/ | grep -i "^link"
   ```
5. Re-scan. Report which checks pass and which are out of scope.

## What not to fake

- OAuth Protected Resource Metadata without an OAuth API.
- MCP server cards without an MCP server.
- API catalog without an API.
- `auth.md` claiming registration that does not exist.

A scanner point is not worth misleading an agent.

## Output

List each check, its status, the evidence, and what still requires a product change (API/OAuth/MCP/DNS).
