const MARKS = {
  pass: "✓",
  warn: "!",
  fail: "✗",
  info: "·",
};

export function summarize(checks) {
  const summary = { pass: 0, warn: 0, fail: 0, info: 0, total: checks.length };
  for (const check of checks) summary[check.status] = (summary[check.status] ?? 0) + 1;
  return summary;
}

export function renderChecks(checks, { heading = "Checks" } = {}) {
  const lines = [];
  const categories = [...new Set(checks.map((check) => check.category))];

  lines.push(`${heading}: ${checks.length}`);
  for (const category of categories) {
    lines.push("");
    lines.push(category);
    for (const check of checks.filter((c) => c.category === category)) {
      const detail = check.detail ? ` — ${check.detail}` : "";
      lines.push(`  ${MARKS[check.status] ?? "?"} ${check.label}${detail}`);
      if (check.fix && check.status !== "pass" && check.status !== "info") {
        lines.push(`      fix: ${check.fix}`);
      }
    }
  }
  return lines.join("\n");
}

export function renderSummary(summary) {
  return `${summary.pass} pass · ${summary.warn} warn · ${summary.fail} fail · ${summary.info} info`;
}

export function formatMs(ms) {
  if (!Number.isFinite(ms)) return "–";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function table(rows, columns) {
  if (!rows.length) return "";
  const widths = columns.map((column) =>
    Math.max(column.label.length, ...rows.map((row) => String(column.value(row) ?? "").length)),
  );
  const line = (cells) => cells.map((cell, i) => String(cell ?? "").padEnd(widths[i])).join("  ");
  return [
    line(columns.map((column) => column.label)),
    line(widths.map((width) => "─".repeat(width))),
    ...rows.map((row) => line(columns.map((column) => column.value(row)))),
  ].join("\n");
}
