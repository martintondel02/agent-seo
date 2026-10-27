# 02 — Content SEO

Content SEO is not "write 2,000 words". It is choosing the right page for a real query, giving a better answer than the current results, and making that answer easy to find and cite.

## Start with a keyword map

Use [`templates/keyword-map.csv`](../templates/keyword-map.csv). One row per query.

| Column | Meaning |
|---|---|
| `query` | The phrase a human types. |
| `intent` | `navigational`, `informational`, `commercial`, `transactional`, `tool`. |
| `page` | The one URL that should answer it. |
| `type` | `hub`, `guide`, `comparison`, `tool`, `course`, `landing`. |
| `priority` | 1–3. |
| `volume` | Estimate; mark the source. |
| `difficulty` | `low`, `medium`, `high`. |
| `status` | `planned`, `draft`, `live`, `ranking`. |
| `notes` | Data source, unique angle, internal links. |

Rules:

- If two rows map to the same intent, merge them.
- If a row has no page, you have a content gap.
- If a page has no row, it is for users or brand — label it, do not pretend it is SEO.
- Brand/navigational queries are monitoring rows, not targets.

## Intent types and page shapes

### Definition / "what is"

Query: `hva er kollokvie`, `what is spaced repetition`.

Shape:

1. One-sentence answer that can be quoted.
2. 2–3 paragraphs of explanation.
3. Examples and a common mistake.
4. FAQ with real questions.
5. Links to related guides and a tool.

### How-to / guide

Query: `hvordan lese pensum effektivt`, `how to plan exam revision`.

Shape:

1. The outcome in one sentence.
2. A numbered method.
3. What to do when it goes wrong.
4. A checklist the reader can use today.
5. FAQ.

### Comparison / alternatives

Query: `X vs Y`, `best alternative to X`, `er X verdt det`.

Shape:

1. Short verdict: who should choose which.
2. Table with honest rows (including where the competitor wins).
3. "Choose X if…" / "Choose Y if…".
4. Price, lock-in, migration.
5. FAQ that answers the objection.

Honesty is the strategy. A comparison that says the competitor is better at something is more credible and more citable than a puff piece.

### Tool / calculator

Query: `karakterkalkulator`, `leseplan`, `nedtelling`.

Shape:

1. The working tool above the fold (or immediately after a one-line intro).
2. The formula/explanation below.
3. Worked example.
4. FAQ.
5. Links to related tools.

The tool must work without login. The page must have text for crawlers and for people who want to understand the result.

### Course / programmatic page

See [03 — Programmatic SEO](03-programmatic.md). One page per course/entity, with real facts and a unique reading plan.

### Hub

A hub is a real page, not a link dump:

- what the cluster covers,
- who it is for,
- links to every child with a one-line description,
- an FAQ,
- a reason to return.

## Answer-first writing

The first 1–2 sentences should answer the query. This is not "SEO formatting"; it is how people read search results, and how AI assistants lift a sentence.

Example:

> **Hva er en kollokvie?**
> En kollokvie er en liten studiegruppe der studenter forklarer fagstoff for hverandre, stiller spørsmål og løser oppgaver sammen — ikke bare sitter og leser i samme rom.

Then explain. Do not open with "In today's fast-paced world…".

## Information gain

Before writing, open the top 5 results and list what they all say. Your page must add at least one of:

- a number, date, price or dataset they do not have,
- a first-hand test or screenshot,
- a tool that computes the answer,
- a named practitioner's experience,
- a counter-argument or failure mode,
- a local/cultural detail they miss.

If your page is a paraphrase of the same five pages, it is not a ranking candidate.

## E-E-A-T without the acronym

Google's quality raters look for experience, expertise, authoritativeness and trust. In practice:

- **Who wrote this?** A named person, with a bio and a reason to trust them.
- **How do you know?** Cite primary sources, link to official data, show the method.
- **What is your angle?** A student who uses the product daily has experience a content farm does not.
- **What do you get wrong?** Corrections and "we don't know yet" build trust.
- **Is contact real?** A reachable email and a physical/company identity where relevant.

For YMYL topics (health, finance, legal, safety), this is not optional. For a student tool, it still matters: show the founder, the school, the independence disclaimer.

## Titles, descriptions, headings

- Title: the query, the outcome, and the brand. `Karakterkalkulator for BI — regn ut snittet ditt`.
- Description: what the page does and for whom. Include a number if true.
- H1: the page's promise. One per page.
- H2s: the questions a reader actually asks. Use the words they use.
- Do not use the same title template on 200 pages with only the city changed. That is a doorway pattern.

## Internal links

Internal links do three jobs: discovery, context, and authority.

- Every page links to its hub and 2–3 siblings.
- The hub links to every child.
- Use descriptive anchors (`BØK 3430 pensum`, not `click here`).
- Link from strong pages (homepage, popular guides) to new pages.
- Avoid link farms in footers; a few contextual links beat 100 boilerplate ones.

## Freshness

- Update pages when the underlying facts change (prices, exam forms, dates).
- Show a real "last updated" date only if you actually updated it.
- Do not change the date on every build; that teaches crawlers to ignore it.

## Language and localisation

- Write in the language of the query, not the language of the company.
- Use local terms (Norwegian: `pensum`, `kollokvie`, `studiepoeng`) rather than translated English.
- One URL per language; see [technical](01-technical.md#international-and-multilingual).
- Machine translation without a native review is thin content.

## The content brief

Use [`templates/content-brief.md`](../templates/content-brief.md). A brief must include:

- primary query and intent,
- the answer sentence,
- must-cover facts,
- the unique thing,
- internal links,
- schema type,
- success metric (impressions, clicks, tool uses, signups).

If the brief cannot name the unique thing, kill the page before writing it.
