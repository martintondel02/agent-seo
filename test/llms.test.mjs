import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateLlms } from "../lib/llms.mjs";

const valid = await readFile(new URL("./fixtures/llms.txt", import.meta.url), "utf8");
const invalid = await readFile(new URL("./fixtures/llms-invalid.txt", import.meta.url), "utf8");

test("accepts a v2 file with file-list H2 sections", () => {
  const result = validateLlms(valid, { baseUrl: "https://example.com/llms.txt" });
  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.sections.length, 2);
  assert.equal(result.links.length, 4);
});

test("rejects non-link content inside an H2 section", () => {
  const result = validateLlms(invalid);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /only contain markdown links/);
});

test("requires an H1", () => {
  const result = validateLlms("> summary\n\n## Pages\n\n- [Home](https://example.com/)");
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /H1/);
});

test("warns when the blockquote summary is missing", () => {
  const result = validateLlms("# Example\n\n## Pages\n\n- [Home](https://example.com/)");
  assert.ok(result.warnings.some((warning) => /blockquote/i.test(warning)));
});
