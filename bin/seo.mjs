#!/usr/bin/env node
import { audit } from "../commands/audit.mjs";
import { crawl } from "../commands/crawl.mjs";
import { llms } from "../commands/llms.mjs";
import { indexnow } from "../commands/indexnow.mjs";
import { gsc } from "../commands/gsc.mjs";
import { parseArgs } from "../lib/args.mjs";
import { VERSION } from "../lib/http.mjs";

const HELP = `agent-seo ${VERSION} — an agent-first SEO toolkit

Usage:
  seo audit <url> [--json] [--no-fail]
  seo crawl <url> [--max=25] [--concurrency=4] [--json] [--csv]
  seo llms <url|file> [--check-links] [--json]
  seo indexnow <sitemap-url|file> --key=KEY [--host=example.com] [--dry]
  seo gsc <sites|report|queries|pages|sitemaps|inspect|submit-sitemap> ...

Examples:
  seo audit https://example.com
  seo audit https://example.com --json > audit-before.json
  seo crawl https://example.com --max=50
  seo llms https://example.com/llms.txt --check-links
  seo indexnow https://example.com/sitemap.xml --key=abc123 --dry
  seo gsc sites
  seo gsc report sc-domain:example.com --days=28

Docs:
  README.md, AGENTS.md, docs/, skills/, templates/
`;

const COMMANDS = { audit, crawl, llms, indexnow, gsc };

async function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv[0] === "--help" || argv[0] === "-h" || argv[0] === "help") {
    console.log(HELP);
    return;
  }
  if (argv[0] === "--version" || argv[0] === "-v") {
    console.log(VERSION);
    return;
  }

  const [command, ...rest] = argv;
  const handler = COMMANDS[command];
  if (!handler) {
    console.error(`Unknown command “${command}”.\n`);
    console.log(HELP);
    process.exitCode = 1;
    return;
  }

  const { positional, flags } = parseArgs(rest);
  try {
    await handler(positional, flags);
  } catch (error) {
    console.error(`\n${error?.message ?? error}\n`);
    process.exitCode = 1;
  }
}

await main();
