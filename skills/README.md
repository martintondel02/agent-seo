# Skills

Each folder contains a `SKILL.md` with YAML frontmatter (`name`, `description`) and an executable workflow. They are written for agent catalogs such as Claude Code skills, Codex, Cursor rules, or a custom agent runner.

| Skill | Use it when |
|---|---|
| [`seo-audit`](seo-audit/SKILL.md) | You need a baseline and a prioritised fix list. |
| [`technical-seo`](technical-seo/SKILL.md) | Pages are not indexed, canonicalised, crawlable or fast. |
| [`content-seo`](content-seo/SKILL.md) | You are planning or rewriting pages for search intent. |
| [`programmatic-seo`](programmatic-seo/SKILL.md) | You have a dataset and want many useful pages, safely. |
| [`geo-ai-search`](geo-ai-search/SKILL.md) | You want ChatGPT/Claude/Gemini to be able to find and cite the site. |
| [`agent-readiness`](agent-readiness/SKILL.md) | You need `llms.txt`, markdown twins, Link headers, `auth.md`, or an accessible tree. |

## How to use them

### Claude Code

Copy the folders into your project or user skills directory:

```bash
mkdir -p .claude/skills
cp -r skills/seo-audit .claude/skills/
cp -r skills/technical-seo .claude/skills/
# …
```

Then ask the agent to use the skill by name, or let it match the description.

### Other agents

Point the agent at [`AGENTS.md`](../AGENTS.md) first. It explains the modes, the order of operations and the guardrails. Then give it the relevant `SKILL.md` as context.

### With this repo checked out

The agent can run the CLI directly:

```bash
node bin/seo.mjs audit https://example.com
node bin/seo.mjs crawl https://example.com --max=50
node bin/seo.mjs llms https://example.com/llms.txt --check-links
```

## Writing your own skill

Keep it:

- **triggerable**: the `description` says when to use it,
- **ordered**: a workflow, not a list of tips,
- **verifiable**: commands and evidence, not adjectives,
- **bounded**: explicit "do not" rules for the dangerous parts (DNS, redirects, schema, links).

The six here are a good template.
