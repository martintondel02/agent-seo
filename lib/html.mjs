// A small, dependency-free HTML reader for SEO checks. It is deliberately
// forgiving: real pages contain malformed markup, and an audit should still
// return the title, canonical and JSON-LD rather than crash.

const ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  oslash: "ø",
  Oslash: "Ø",
  aring: "å",
  Aring: "Å",
  aelig: "æ",
  AElig: "Æ",
};

export function decodeEntities(value = "") {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeFromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeFromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name] ?? ENTITIES[name.toLowerCase()] ?? match);
}

function safeFromCodePoint(code) {
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

export function stripTags(html = "") {
  return decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function findTags(html, name) {
  const re = new RegExp(`<${name}\\b[^>]*>`, "gi");
  return html.match(re) ?? [];
}

export function parseAttributes(tag) {
  const out = {};
  const body = tag.replace(/^<\s*\/?\s*[a-z0-9:-]+/i, "").replace(/\/?>$/, "");
  const re = /([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gi;
  let match;
  while ((match = re.exec(body))) {
    const name = match[1].toLowerCase();
    if (name === "" || name === "/") continue;
    out[name] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return out;
}

export function getTitle(html = "") {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1]).replace(/\s+/g, " ").trim() : null;
}

export function getMeta(html, name) {
  const wanted = name.toLowerCase();
  for (const tag of findTags(html, "meta")) {
    const attrs = parseAttributes(tag);
    if ((attrs.name ?? "").toLowerCase() === wanted) {
      return (attrs.content ?? "").trim();
    }
  }
  return null;
}

export function getMetaProperty(html, property) {
  const wanted = property.toLowerCase();
  for (const tag of findTags(html, "meta")) {
    const attrs = parseAttributes(tag);
    if ((attrs.property ?? "").toLowerCase() === wanted) {
      return (attrs.content ?? "").trim();
    }
  }
  return null;
}

export function getLinkRel(html, rel) {
  const wanted = rel.toLowerCase();
  const found = [];
  for (const tag of findTags(html, "link")) {
    const attrs = parseAttributes(tag);
    const rels = (attrs.rel ?? "").toLowerCase().split(/\s+/);
    if (rels.includes(wanted)) found.push(attrs);
  }
  return found;
}

export function getCanonical(html) {
  return getLinkRel(html, "canonical")[0]?.href ?? null;
}

export function getHreflang(html) {
  return getLinkRel(html, "alternate")
    .filter((a) => a.hreflang)
    .map((a) => ({ hreflang: a.hreflang, href: a.href ?? null }));
}

export function getHtmlLang(html) {
  const match = html.match(/<html\b[^>]*>/i);
  if (!match) return null;
  return parseAttributes(match[0]).lang ?? null;
}

export function getH1s(html) {
  const matches = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) ?? [];
  return matches.map((tag) => stripTags(tag));
}

export function countHeadings(html) {
  const count = (name) => (html.match(new RegExp(`<${name}\\b`, "gi")) ?? []).length;
  return { h1: count("h1"), h2: count("h2"), h3: count("h3") };
}

export function getLinks(html, baseUrl) {
  const links = [];
  const re = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html))) {
    const attrs = parseAttributes(match[0]);
    const href = attrs.href;
    if (!href) continue;
    const trimmed = href.trim();
    if (!trimmed || trimmed.startsWith("#") || /^(mailto|tel|javascript|data):/i.test(trimmed)) continue;
    let absolute = null;
    try {
      absolute = new URL(trimmed, baseUrl).href;
    } catch {
      continue;
    }
    links.push({
      href: absolute,
      text: stripTags(match[1]).replace(/\s+/g, " ").trim(),
      rel: (attrs.rel ?? "").toLowerCase(),
      external: new URL(absolute).origin !== new URL(baseUrl).origin,
    });
  }
  return links;
}

export function getImages(html) {
  return findTags(html, "img").map((tag) => {
    const attrs = parseAttributes(tag);
    return {
      src: attrs.src ?? "",
      alt: attrs.alt ?? null,
      missingAlt: attrs.alt === undefined || attrs.alt.trim() === "",
    };
  });
}

export function getJsonLd(html) {
  const blocks = [];
  const errors = [];
  const types = [];
  const scripts = html.match(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  ) ?? [];

  for (const script of scripts) {
    const content = script.replace(/^[\s\S]*?>/i, "").replace(/<\/script>$/i, "").trim();
    if (!content) continue;
    try {
      const parsed = JSON.parse(content);
      blocks.push(parsed);
      collectTypes(parsed, types);
    } catch (error) {
      errors.push(error.message);
    }
  }

  return { blocks, errors, types: [...new Set(types)] };
}

function collectTypes(value, out) {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) collectTypes(item, out);
    return;
  }
  if (typeof value !== "object") return;
  if (value["@type"]) {
    for (const type of Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]]) {
      if (typeof type === "string") out.push(type);
    }
  }
  if (value["@graph"]) collectTypes(value["@graph"], out);
  for (const key of ["mainEntity", "itemListElement", "hasPart", "about"]) {
    if (value[key]) collectTypes(value[key], out);
  }
}

export function countWords(html) {
  const text = stripTags(html);
  if (!text) return 0;
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

export function getOpenGraph(html) {
  return {
    title: getMetaProperty(html, "og:title"),
    description: getMetaProperty(html, "og:description"),
    image: getMetaProperty(html, "og:image"),
    type: getMetaProperty(html, "og:type"),
  };
}

export function getTwitter(html) {
  return {
    card: getMeta(html, "twitter:card"),
    title: getMeta(html, "twitter:title"),
    description: getMeta(html, "twitter:description"),
  };
}
