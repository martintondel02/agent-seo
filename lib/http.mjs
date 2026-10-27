// Minimal HTTP helpers. No dependencies: Node 20+ has fetch, AbortSignal.timeout
// and URL. The toolkit is meant to run from a fresh clone without npm install.

export const VERSION = "0.1.0";
export const DEFAULT_UA = `agent-seo/${VERSION} (+https://github.com/martintondel02/agent-seo)`;

/** Accept a bare host, a URL with/without scheme, and return a URL object. */
export function normalizeUrl(input) {
  if (!input || typeof input !== "string") throw new Error("A URL is required");
  let value = input.trim();
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  const url = new URL(value);
  url.hash = "";
  return url;
}

export function originOf(url) {
  const u = typeof url === "string" ? new URL(url) : url;
  return `${u.protocol}//${u.host}`;
}

export function isSameOrigin(a, b) {
  try {
    return new URL(a).origin === new URL(b).origin;
  } catch {
    return false;
  }
}

export function absolute(href, base) {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

export function headersToObject(headers) {
  const out = {};
  for (const [key, value] of headers.entries()) {
    const k = key.toLowerCase();
    out[k] = out[k] ? `${out[k]}, ${value}` : value;
  }
  return out;
}

/**
 * Fetch a URL and return a plain object. Never throws for network errors:
 * `status` is 0 and `error` explains what happened, so callers can report it.
 */
export async function fetchUrl(input, options = {}) {
  const {
    method = "GET",
    headers = {},
    timeout = 20_000,
    readBody = method !== "HEAD",
    accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  } = options;

  const started = Date.now();
  try {
    const response = await fetch(input, {
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(timeout),
      headers: {
        "user-agent": DEFAULT_UA,
        accept,
        "accept-language": "en-US,en;q=0.9,nb;q=0.8",
        ...headers,
      },
    });
    const body = readBody ? await response.text() : "";
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: headersToObject(response.headers),
      body,
      bytes: body.length,
      timeMs: Date.now() - started,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: "NETWORK_ERROR",
      url: String(input),
      headers: {},
      body: "",
      bytes: 0,
      timeMs: Date.now() - started,
      error: error?.message ?? String(error),
    };
  }
}

export async function fetchText(url, options = {}) {
  const res = await fetchUrl(url, options);
  return res.body;
}

export function contentType(res) {
  return (res.headers["content-type"] ?? "").split(";")[0].trim().toLowerCase();
}

export function header(res, name) {
  return res.headers[name.toLowerCase()] ?? null;
}

/** True when the response is HTML (or has no content type, which is common). */
export function isHtml(res) {
  const type = contentType(res);
  return type === "" || type === "text/html" || type === "application/xhtml+xml";
}

export function normalizeForCompare(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    let pathname = u.pathname.replace(/\/+$/, "") || "/";
    return `${u.protocol}//${u.host.toLowerCase()}${pathname}${u.search}`;
  } catch {
    return String(url);
  }
}
