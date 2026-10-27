import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  getTitle,
  getMeta,
  getCanonical,
  getH1s,
  getLinks,
  getJsonLd,
  countWords,
  getHtmlLang,
  getOpenGraph,
  getImages,
} from "../lib/html.mjs";

const html = (await readFile(new URL("./fixtures/page.html", import.meta.url), "utf8")).replaceAll(
  "__ORIGIN__",
  "https://example.com",
);

test("reads title, description, canonical and language", () => {
  assert.match(getTitle(html), /Example SEO page/);
  assert.match(getMeta(html, "description"), /practical example/);
  assert.equal(getCanonical(html), "https://example.com/");
  assert.equal(getHtmlLang(html), "en");
});

test("finds exactly one H1", () => {
  assert.deepEqual(getH1s(html), ["Example SEO page"]);
});

test("parses JSON-LD without errors", () => {
  const data = getJsonLd(html);
  assert.equal(data.errors.length, 0);
  assert.ok(data.types.includes("WebPage"));
});

test("counts words and internal links", () => {
  assert.ok(countWords(html) > 100);
  const links = getLinks(html, "https://example.com/");
  assert.equal(links.length, 3);
  assert.ok(links.every((link) => !link.external));
});

test("reads Open Graph and images", () => {
  const og = getOpenGraph(html);
  assert.equal(og.image, "https://example.com/og.png");
  assert.equal(getImages(html).length, 0);
});
