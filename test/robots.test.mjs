import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseRobots, parseContentSignals, aiCoverage, isPathAllowed } from "../lib/robots.mjs";

const robots = parseRobots(
  (await readFile(new URL("./fixtures/robots.txt", import.meta.url), "utf8")).replaceAll(
    "__ORIGIN__",
    "https://example.com",
  ),
);

test("parses sitemap and Content Signals", () => {
  assert.deepEqual(robots.sitemaps, ["https://example.com/sitemap.xml"]);
  const signals = parseContentSignals(robots.contentSignals);
  assert.equal(signals.aiTrain, "yes");
  assert.equal(signals.search, "yes");
  assert.equal(signals.aiInput, "yes");
});

test("knows GPTBot is explicitly allowed and other agents fall back to *", () => {
  const coverage = aiCoverage(robots);
  const gpt = coverage.policies.find((policy) => policy.agent === "gptbot");
  assert.equal(gpt.explicit, true);
  assert.equal(gpt.blocked, false);
  assert.ok(coverage.explicit >= 2);
});

test("honours the longest matching rule", () => {
  assert.equal(isPathAllowed(robots, "/", "gptbot"), true);
  assert.equal(isPathAllowed(robots, "/private/secret", "*"), false);
  assert.equal(isPathAllowed(robots, "/public", "*"), true);
});
