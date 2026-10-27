# 00 — Principles

SEO is not a bag of tricks. It is demand capture: someone has a question, a task or a purchase in mind, and you make your page the best available answer. Everything below follows from that.

## 1. Intent beats keywords

A keyword is a string. An intent is what the person is trying to do.

- `bi` → navigational. They want the school's website.
- `bi timeplan` → task. They want their timetable.
- `BØK 3430 pensum` → information. They want the reading list for a specific course.
- `karakterkalkulator` → tool. They want to calculate something now.

The same words can carry different intents. If you write one page for several intents, you usually serve none of them well.

## 2. One page per intent

Not one page per keyword. If two pages target the same intent, merge them: one stronger URL beats two competing ones. If one page targets three intents, split it.

A useful test: can you describe the page in one sentence that starts with "This page helps me…"? If not, the intent is unclear.

## 3. Build an entity, not just a keyword

Google and AI assistants resolve **entities**: a company, a person, a product, a place. A brand called "Studiehacks" competes with the English phrase "study hacks" for the same string. The fix is not more keyword repetitions; it is a consistent entity:

- one name, one spelling, one canonical domain,
- `Organization` + `WebSite` + `Person` schema with stable `@id`s,
- `sameAs` links to real profiles,
- a `/fakta` or press page with facts, founder, price, launch date,
- the same one-sentence definition used on the homepage, in schema, and in `llms.txt`.

## 4. The technical floor is non-negotiable

You cannot rank a page that Google cannot fetch, cannot index, or is told not to index. Before content, check:

- 200 for public pages, 404 for missing, 301 for moved.
- `robots.txt` allows public pages and points to the sitemap.
- `sitemap.xml` lists every public URL with a real `lastmod`.
- one self-referencing canonical per page.
- content in the HTML, not only after client-side JavaScript.
- internal links from a hub, not orphan pages.

A perfect article behind a `noindex` is invisible.

## 5. Information gain is the ranking lever

Google has seen the top ten results for your query. To displace them, your page needs something they do not have:

- real data you collected or licensed,
- a working tool or calculator,
- a first-hand test, screenshot or teardown,
- a named author with relevant experience,
- a comparison that says where the competitor wins,
- a price, date, or fact that is verifiable.

If you cannot name the unique thing in one sentence, do not publish the page.

## 6. Links are still votes, but fewer and better

Twenty relevant links beat two hundred bought ones. The realistic sources for a small site:

- the founder's own public profiles (GitHub, LinkedIn) — a real link, not a directory,
- student organisations, clubs, or associations,
- one genuinely helpful Reddit/forum answer,
- a YouTube video with a description,
- open-source READMEs and documentation,
- local press or niche newsletters.

Do not buy links, use PBNs, or trade links at scale. It is the fastest route to a manual action.

## 7. AI search is retrieval plus citation

ChatGPT, Claude and Gemini do not "know" your site because you wrote good copy. They either retrieve it from an index (Bing, Brave, Google) or cite it because something on the web says it is relevant.

The order is fixed:

1. Can the crawler fetch the page?
2. Is it in the index that engine uses?
3. Does anyone else corroborate it?
4. Is it machine-readable (schema, `llms.txt`, markdown)?

If 1 or 2 is false, stop polishing 4.

## 8. Measure before you scale

A sitemap with 2,000 URLs and no Search Console baseline is guesswork. Get:

- indexed pages and coverage errors,
- impressions, clicks, CTR, position,
- queries split brand vs non-brand,
- Bing and Brave presence,
- an AI prompt baseline.

Then scale only what has been indexed and is getting impressions.

## 9. Patience is part of the method

New domains take weeks to index and months to rank. The compounding assets are:

- course/topic pages that answer a specific query,
- tools people link to,
- comparisons that AI can cite,
- a brand entity that is unambiguous.

Most "SEO is dead" conclusions are actually "I published 12 pages last month and nothing happened".

## 10. The three rules to repeat to any agent

1. One page per intent.
2. Earn the link, don't buy it.
3. Measure before you scale.

If an agent remembers nothing else, these three prevent most damage.
