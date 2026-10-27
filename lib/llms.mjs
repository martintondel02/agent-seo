// Validator for the llms.txt v2 format (https://llmstxt.org).
//
// Structure, in order:
//   optional BOM
//   # H1
//   > blockquote summary
//   details (paragraphs/lists; no headings)
//   zero or more H2 sections, each a markdown file list:
//     - [name](url): optional note
//   ## Optional (convention)

const LINK_LINE = /^- \[[^\]]+\]\(([^)]+)\)(?::\s*.+)?$/;

export function validateLlms(text, { baseUrl = null } = {}) {
  const errors = [];
  const warnings = [];
  const sections = [];
  const links = [];

  if (typeof text !== "string" || text.trim() === "") {
    return {
      ok: false,
      errors: ["The file is empty."],
      warnings,
      sections,
      links,
      title: null,
      summary: null,
    };
  }

  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/);

  const firstContent = lines.findIndex((line) => line.trim() !== "");
  if (firstContent === -1) {
    return { ok: false, errors: ["The file has no content."], warnings, sections, links, title: null, summary: null };
  }

  const h1 = lines[firstContent].match(/^#\s+(.+?)\s*$/);
  if (!h1) {
    errors.push("The first non-empty line must be an H1: `# Site name`.");
  }

  let cursor = firstContent + 1;
  while (cursor < lines.length && lines[cursor].trim() === "") cursor++;
  const summaryLine = lines[cursor] ?? "";
  const summary = summaryLine.startsWith(">") ? summaryLine.replace(/^>\s?/, "").trim() : null;
  if (!summary) {
    warnings.push("No blockquote summary immediately after the H1.");
  } else {
    cursor++;
  }

  const firstH2 = lines.findIndex((line) => /^##\s+/.test(line));
  const detailEnd = firstH2 === -1 ? lines.length : firstH2;
  for (let i = cursor; i < detailEnd; i++) {
    if (/^#{1,6}\s+/.test(lines[i])) {
      errors.push(`Heading before the first H2 is not allowed: ${lines[i].trim()}`);
    }
  }

  if (firstH2 === -1) {
    warnings.push("No H2 file-list sections found.");
  }

  let current = null;
  for (let i = firstH2 === -1 ? lines.length : firstH2; i < lines.length; i++) {
    const line = lines[i];
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = { title: heading[1], links: [] };
      sections.push(current);
      continue;
    }
    if (!line.trim()) continue;
    if (/^#{1,6}\s+/.test(line)) {
      errors.push(`Headings inside a file-list section are not allowed: ${line.trim()}`);
      continue;
    }
    const match = line.match(LINK_LINE);
    if (!match) {
      errors.push(`H2 sections may only contain markdown links, found: ${line.trim()}`);
      continue;
    }
    const rawUrl = match[1];
    let resolved = rawUrl;
    if (baseUrl) {
      try {
        resolved = new URL(rawUrl, baseUrl).href;
      } catch {
        errors.push(`Invalid URL in link: ${rawUrl}`);
      }
    }
    const link = { url: resolved, rawUrl, line: i + 1 };
    links.push(link);
    if (current) current.links.push(link);
  }

  for (const section of sections) {
    if (!section.links.length) warnings.push(`Section “${section.title}” has no links.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    sections,
    links,
    title: h1 ? h1[1] : null,
    summary,
  };
}

export function llmsMarkdownSummary(result) {
  const lines = [];
  lines.push(`H1: ${result.title ?? "missing"}`);
  lines.push(`Summary: ${result.summary ? "yes" : "no"}`);
  lines.push(`Sections: ${result.sections.length}`);
  lines.push(`Links: ${result.links.length}`);
  if (result.warnings.length) {
    lines.push("");
    lines.push("Warnings:");
    for (const warning of result.warnings) lines.push(`  ! ${warning}`);
  }
  if (result.errors.length) {
    lines.push("");
    lines.push("Errors:");
    for (const error of result.errors) lines.push(`  x ${error}`);
  }
  return lines.join("\n");
}
