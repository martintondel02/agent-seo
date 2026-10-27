# 10 — Anti-patterns

Things that waste months, get sites penalised, or make agents distrust you. Each entry has the failure mode and the replacement.

## 1. Buying links / PBNs / link exchanges at scale

**Why it fails:** paid links violate Google's spam policies; PBNs are detectable by footprint; reciprocal link schemes are a classic manual action.

**Instead:** earn 10–20 relevant links. Founder profiles, student orgs, one genuinely helpful forum answer, open-source READMEs, a video. Fewer, better, slower.

## 2. Keyword stuffing

**Why it fails:** it makes text unreadable, and Google's systems are good at ignoring repetition. It also makes AI answers worse.

**Instead:** write the query once in the title/H1, then use natural language and synonyms. If a sentence exists only for the keyword, delete it.

## 3. Doorway pages

**Why it fails:** many near-identical pages that funnel to the same offer are a spam pattern. Google's "scaled content abuse" policy targets exactly this.

**Instead:** one page per real intent, with unique facts and a unique action. If the pages are the same, merge them.

## 4. Fake structured data

**Why it fails:** `AggregateRating` without real ratings, `FAQPage` with invisible questions, `Course` with invented outcomes. It is a manual-action risk and makes AI answers wrong.

**Instead:** mark up what is visible and true. If you do not have ratings, do not claim them.

## 5. Chasing a brand's navigational query

**Why it fails:** "BI", "Handelshøyskolen BI", "NRK", "Finn" are navigational. The official site owns them. A third party cannot outrank it reliably, and trying looks deceptive.

**Instead:** own `brand + need`: "BI timeplan", "BI eksamen", "pensum BI", course codes, campus modifiers. See the [case study](09-case-study-studiehacks.md).

## 6. Thin programmatic pages

**Why it fails:** 500 pages with a swapped city and a generic intro are thin/duplicate content. They dilute crawl budget and can trigger scaled-content enforcement.

**Instead:** 40–60 pages with real data and a unique computation, measure indexing, then scale. See [programmatic](03-programmatic.md).

## 7. Publishing before measuring

**Why it fails:** no GSC/BWT, no baseline, no idea which pages index. You cannot tell a content problem from a crawl problem.

**Instead:** verify GSC and BWT, submit the sitemap, save an audit JSON, then publish.

## 8. Ignoring Bing and Brave

**Why it fails:** ChatGPT search runs on Bing. Claude's search leans on Brave. If those indexes do not have you, the assistants cannot cite you.

**Instead:** import BWT from GSC, submit sitemap, IndexNow, Brave submit, and check `site:` monthly.

## 9. JavaScript-only content

**Why it fails:** some crawlers do not render; rendering is a second wave; AI crawlers often fetch raw HTML.

**Instead:** server-render or statically generate the content. Hydrate interactivity on top. Check with `curl`.

## 10. Duplicate pages and canonical chaos

**Why it fails:** `/page`, `/page/`, `/?utm=...`, `www` and apex competing; canonicals pointing elsewhere; pagination duplicates.

**Instead:** one canonical host, one canonical URL per page, self-referencing canonical, redirects for old URLs, clean internal links.

## 11. AI content at scale without data

**Why it fails:** generic LLM prose is the definition of "scaled content abuse" when it has no unique value. It also reads like every other page.

**Instead:** use AI to draft from a brief and real data, then edit. Add a fact, a test, a screenshot, a number. A human must own the claim.

## 12. Cloaking / hidden text / link schemes

**Why it fails:** serving different content to crawlers, hidden text, or footer link farms are explicit spam policies. Manual actions are hard to recover from.

**Instead:** show the same content to users and crawlers. If you would not show it to a reader, do not ship it.

## 13. "SEO score" worship

**Why it fails:** a 100/100 Lighthouse/SEO plugin score can coexist with a `noindex` page, a broken canonical, or zero demand. Scores are proxies, not outcomes.

**Instead:** use audits to find blockers, then measure indexed pages, impressions, clicks and queries.

## 14. Fake agent metadata (OAuth, MCP, API catalog)

**Why it fails:** publishing `/.well-known/oauth-protected-resource` or an MCP card for an API that does not exist makes agents try to authenticate against nothing. It may satisfy a scanner; it fails the agent.

**Instead:** publish what is true. A self-contained `auth.md` that says "no agent API" is better than fake OAuth metadata.

## 15. Rewriting the whole site when traffic is flat

**Why it fails:** you lose the few signals you have and cannot attribute the change. New domains are slow; flat for 6 weeks is normal.

**Instead:** fix blockers, add content in the winning cluster, earn links, wait one more cycle. Change one variable at a time.

## 16. No 404s / soft 404s

**Why it fails:** a catch-all 200 page for unknown URLs wastes crawl budget and confuses indexing. Deleted pages that return 200 are soft 404s.

**Instead:** return 404/410 for missing pages, 301 for moved pages, and keep a redirect map.

## 17. Over-optimising metadata

**Why it fails:** rewriting titles weekly, stuffing locations, using the same template on 200 pages. It churns without moving rankings.

**Instead:** one clear title per intent, then spend the time on the page's unique value and internal links.

## 18. Forgetting the entity

**Why it fails:** a brand name that is also a common phrase ("Studiehacks" / "study hacks") is ambiguous. Without entity signals, search engines and AI guess.

**Instead:** consistent name, `Organization`/`WebSite`/`Person` schema with stable `@id`, `sameAs`, a facts page, a single definition sentence reused everywhere.

## 19. Treating `llms.txt` as a ranking trick

**Why it fails:** it is a map, not a ranking factor. A malformed file (H2 sections that are not file lists, bare URLs) is worse than no file.

**Instead:** follow v2, link to markdown versions, keep it small, validate it.

## 20. Not updating content

**Why it fails:** prices, dates, exam forms and product features change. Stale facts are a reason not to cite you.

**Instead:** review the top pages quarterly; update the fact and the `lastmod` only when the content changes.

## The shortest version

- One page per intent.
- Earn the link.
- Measure before scaling.
- Tell the truth in schema and metadata.
- Do not fight a brand for its own name.
