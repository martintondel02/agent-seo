// robots.txt parsing, AI-agent coverage, and Content Signals.
// RFC 9309 behaviour is approximated: longest matching rule wins, Allow wins
// ties. That is enough for auditing and for a polite same-origin crawl.

export const AI_AGENTS = [
  "gptbot",
  "oai-searchbot",
  "chatgpt-user",
  "claudebot",
  "claude-web",
  "claude-user",
  "anthropic-ai",
  "perplexitybot",
  "perplexity-user",
  "google-extended",
  "applebot",
  "applebot-extended",
  "bravebot",
  "ccbot",
  "cohere-ai",
  "bingbot",
];

export const AI_AGENT_LABELS = {
  gptbot: "GPTBot (OpenAI training)",
  "oai-searchbot": "OAI-SearchBot (ChatGPT search)",
  "chatgpt-user": "ChatGPT-User (on-demand fetch)",
  claudebot: "ClaudeBot (Anthropic training)",
  "claude-web": "Claude-Web (legacy)",
  "claude-user": "Claude-User (on-demand fetch)",
  "anthropic-ai": "anthropic-ai",
  perplexitybot: "PerplexityBot",
  "perplexity-user": "Perplexity-User",
  "google-extended": "Google-Extended (Gemini training control)",
  applebot: "Applebot",
  "applebot-extended": "Applebot-Extended (Apple AI)",
  bravebot: "Bravebot (Brave/Claude search)",
  ccbot: "CCBot (Common Crawl)",
  "cohere-ai": "cohere-ai",
  bingbot: "Bingbot (Bing/ChatGPT index)",
};

export function parseRobots(text = "") {
  const groups = [];
  const sitemaps = [];
  const contentSignals = [];
  let current = null;
  let lastWasAgent = false;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }

    if (field === "sitemap") {
      sitemaps.push(value);
      lastWasAgent = false;
      continue;
    }

    if (field === "content-signal") {
      contentSignals.push(value);
      if (current) current.rules.push({ type: "content-signal", value });
      lastWasAgent = false;
      continue;
    }

    if (field === "allow" || field === "disallow") {
      if (!current) {
        current = { agents: ["*"], rules: [] };
        groups.push(current);
      }
      current.rules.push({ type: field, value });
      lastWasAgent = false;
      continue;
    }

    lastWasAgent = false;
  }

  return {
    groups,
    sitemaps,
    contentSignals,
    raw: text,
    hasContentSignal: contentSignals.length > 0,
  };
}

export function parseContentSignals(values = []) {
  const out = { aiTrain: null, search: null, aiInput: null, raw: values };
  for (const line of values) {
    for (const part of line.split(",")) {
      const [key, rawValue] = part.split("=").map((s) => s.trim().toLowerCase());
      if (!key || !rawValue) continue;
      if (key === "ai-train") out.aiTrain = rawValue;
      if (key === "search") out.search = rawValue;
      if (key === "ai-input") out.aiInput = rawValue;
    }
  }
  return out;
}

function matchingGroups(robots, agent) {
  const specific = robots.groups.filter((g) => g.agents.includes(agent));
  if (specific.length) return specific;
  return robots.groups.filter((g) => g.agents.includes("*"));
}

function patternToRegExp(pattern) {
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const escaped = body.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}${anchored ? "$" : ""}`);
}

export function isPathAllowed(robots, path, agent = "*") {
  const groups = matchingGroups(robots, agent);
  if (!groups.length) return true;

  let best = null;
  for (const group of groups) {
    for (const rule of group.rules) {
      if (rule.type !== "allow" && rule.type !== "disallow") continue;
      if (!rule.value) continue;
      let re;
      try {
        re = patternToRegExp(rule.value);
      } catch {
        continue;
      }
      if (!re.test(path)) continue;
      const candidate = {
        allow: rule.type === "allow",
        length: rule.value.replace(/\$$/, "").length,
      };
      if (
        !best ||
        candidate.length > best.length ||
        (candidate.length === best.length && candidate.allow)
      ) {
        best = candidate;
      }
    }
  }
  return best ? best.allow : true;
}

export function agentPolicy(robots, agent) {
  const groups = robots.groups.filter((g) => g.agents.includes(agent));
  const explicit = groups.length > 0;
  const blocked = !isPathAllowed(robots, "/", agent);
  return { agent, explicit, blocked, allowed: !blocked };
}

export function aiCoverage(robots) {
  const policies = AI_AGENTS.map((agent) => ({
    ...agentPolicy(robots, agent),
    label: AI_AGENT_LABELS[agent] ?? agent,
  }));
  const explicit = policies.filter((p) => p.explicit);
  return {
    policies,
    explicit: explicit.length,
    total: AI_AGENTS.length,
    blocked: policies.filter((p) => p.blocked).map((p) => p.agent),
    missing: policies.filter((p) => !p.explicit).map((p) => p.agent),
  };
}
