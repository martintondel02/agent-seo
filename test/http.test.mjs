import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUrl, normalizeForCompare, originOf } from "../lib/http.mjs";

test("normalizeUrl adds https and strips the hash", () => {
  const url = normalizeUrl("example.com/page#section");
  assert.equal(url.href, "https://example.com/page");
});

test("normalizeUrl keeps an explicit http scheme", () => {
  assert.equal(normalizeUrl("http://localhost:3000/").protocol, "http:");
});

test("normalizeForCompare ignores trailing slashes and host case", () => {
  assert.equal(
    normalizeForCompare("https://Example.com/path/"),
    normalizeForCompare("https://example.com/path"),
  );
});

test("originOf returns scheme and host", () => {
  assert.equal(originOf("https://example.com/a/b"), "https://example.com");
});
