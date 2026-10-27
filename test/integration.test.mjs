import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const execFileAsync = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const page = await readFile(join(root, "test/fixtures/page.html"), "utf8");
const robots = await readFile(join(root, "test/fixtures/robots.txt"), "utf8");
const sitemap = await readFile(join(root, "test/fixtures/sitemap.xml"), "utf8");
const llms = await readFile(join(root, "test/fixtures/llms.txt"), "utf8");

let server;
let origin;

test.before(async () => {
  server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const send = (status, type, body, extra = {}) => {
      res.writeHead(status, { "content-type": type, ...extra });
      res.end(body);
    };

    if (url.pathname === "/") {
      if ((req.headers.accept ?? "").includes("text/markdown")) {
        return send(200, "text/markdown; charset=utf-8", "# Example\n\n> Markdown for agents.\n");
      }
      return send(
        200,
        "text/html; charset=utf-8",
        page.replaceAll("__ORIGIN__", origin),
        {
          link: '</llms.txt>; rel="describedby", </llms.txt>; rel="service-desc"',
          "cache-control": "no-cache, must-revalidate",
          "x-content-type-options": "nosniff",
          "strict-transport-security": "max-age=31536000; includeSubDomains",
        },
      );
    }
    if (url.pathname === "/robots.txt") {
      return send(200, "text/plain; charset=utf-8", robots.replaceAll("__ORIGIN__", origin));
    }
    if (url.pathname === "/sitemap.xml") {
      return send(200, "application/xml", sitemap.replaceAll("__ORIGIN__", origin));
    }
    if (url.pathname === "/llms.txt") {
      return send(200, "text/plain; charset=utf-8", llms);
    }
    if (url.pathname === "/auth.md") {
      return send(200, "text/markdown; charset=utf-8", "# auth.md — Example\n\n> No agent API.\n");
    }
    return send(404, "text/html; charset=utf-8", "<h1>Not found</h1>");
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise((resolve) => server.close(resolve)));

test("audit works end to end and exits clean", async () => {
  const { stdout } = await execFileAsync(
    process.execPath,
    ["bin/seo.mjs", "audit", origin, "--json", "--no-fail"],
    { cwd: root, maxBuffer: 1024 * 1024 },
  );
  const report = JSON.parse(stdout);
  assert.equal(report.summary.fail, 0, JSON.stringify(report.checks.filter((c) => c.status === "fail"), null, 2));
  assert.ok(report.summary.pass >= 12);
  assert.equal(report.page.title, "Example SEO page — a useful title");
  assert.equal(report.page.canonical, `${origin}/`);
  assert.ok(report.checks.some((check) => check.id === "markdown" && check.status === "pass"));
  assert.ok(report.checks.some((check) => check.id === "llms" && check.status === "pass"));
  assert.ok(report.checks.some((check) => check.id === "content-signals" && check.status === "pass"));
});

test("llms CLI validates a local file", async () => {
  const { stdout } = await execFileAsync(
    process.execPath,
    ["bin/seo.mjs", "llms", "test/fixtures/llms.txt", "--json"],
    { cwd: root, maxBuffer: 1024 * 1024 },
  );
  const result = JSON.parse(stdout);
  assert.equal(result.ok, true);
  assert.equal(result.sections.length, 2);
});
