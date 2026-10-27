---
name: geo-ai-search
description: Make a site retrievable and citable by ChatGPT, Claude, Gemini and Perplexity. Use when the goal is AI visibility, AI Overviews or assistant recommendations.
---

# GEO / AI search

Use this skill when the goal is **"be recommended by an assistant"**, not just "rank in Google".

## The order

1. **Can AI crawlers fetch the page?**
   ```bash
   for ua in "GPTBot/1.2" "OAI-SearchBot/1.0" "ClaudeBot/1.0" "PerplexityBot/1.0" "Bravebot/1.0"; do
     curl -s -o /dev/null -w "%{http_code} $ua\n" -A "Mozilla/5.0 (compatible; $ua)" https://example.com/
   done
   ```
   A 403 is usually Cloudflare/WAF. Fix before content.
2. **Is the site in the index the engine uses?**
   - ChatGPT → Bing (BWT + IndexNow).
   - Claude → Brave (submit URL, links).
   - Gemini → Google (GSC, sitemap, ranking).
3. **Is there independent corroboration?** GitHub, Reddit answer, student org, YouTube, niche press. One real mention beats 50 directories.
4. **Is the page machine-readable?**
   - answer-first definition,
   - FAQ with real questions,
   - facts page,
   - schema (`Organization`, `WebSite`, `SoftwareApplication`, `FAQPage`),
   - `llms.txt` v2 + markdown twins,
   - stable URLs, real `lastmod`.

## Audit

Run the 12-prompt audit monthly in ChatGPT, Claude, Gemini and Perplexity. Log mentions and cited URLs. Do not change the prompts each month.

## Guardrails

- Do not promise AI mentions.
- Do not spam forums/Reddit.
- Do not publish fake facts or reviews.
- Do not treat `llms.txt` as a ranking factor; it is a map.
- If steps 1–2 fail, do not polish step 4.
