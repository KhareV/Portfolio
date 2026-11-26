// Shared test harness helpers. Test doubles only: nothing here talks to real
// GitHub, Groq, EmailJS or CDNs. Every override is explicit and labelled.
import fs from "node:fs";
import path from "node:path";
import { chromium, webkit, firefox } from "playwright";

const SCRATCH = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const DRACO_DIR = path.join(
  SCRATCH,
  "baseline/node_modules/three/examples/jsm/libs/draco/gltf",
);

export const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
export const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

// Valid 2x2 Radiance RGBE file (flat-ish studio grey). Width < 8 => no RLE.
export const tinyHdr = () => {
  const header = Buffer.from(
    "#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y 2 +X 2\n",
    "ascii",
  );
  const px = Buffer.from([128, 128, 128, 129, 200, 200, 200, 128, 90, 90, 100, 128, 160, 160, 170, 128]);
  return Buffer.concat([header, px]);
};

export const githubFixture = () => {
  const now = Date.parse("2026-11-20T10:00:00Z");
  const names = [
    ["Property-Dhundo-Property-Buying-and-Selling", "JavaScript", 6, 2],
    ["SIH-MedWE-Pharmacy-Website", "JavaScript", 5, 1],
    ["ChatApp", "JavaScript", 3, 1],
    ["Pixabay-Gallery", "JavaScript", 2, 0],
    ["Nodejs-OpenAI-Image-Generator", "JavaScript", 2, 0],
    ["Portfolio", "JavaScript", 4, 1],
    ["skillbridge", "Solidity", 3, 1],
    ["dsa-notes", "C++", 1, 0],
  ];
  return {
    user: {
      login: "KhareV",
      name: "Vedant Khare (fixture)",
      bio: "Fixture bio for local tests",
      avatar_url: "https://avatars.githubusercontent.com/u/0?v=4",
      public_repos: names.length,
      followers: 10,
      following: 5,
    },
    repos: names.map(([name, language, stars, forks], i) => ({
      id: 1000 + i,
      name,
      html_url: `https://github.com/KhareV/${name}`,
      description: `Fixture description for ${name}`,
      language,
      stargazers_count: stars,
      forks_count: forks,
      open_issues_count: 0,
      pushed_at: new Date(now - i * 86400000 * 9).toISOString(),
      created_at: new Date(now - (i + 3) * 86400000 * 60).toISOString(),
      updated_at: new Date(now - i * 86400000 * 9).toISOString(),
      fork: false,
    })),
  };
};

// 1x1 transparent PNG for avatar double.
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

/**
 * Install network test doubles on a context.
 * opts.hdr: "valid" | "abort" | "real"(not allowed: we never hit the CDN)
 * opts.github: "ok" | "rate-limit" | "malformed" | "empty" | "offline"
 * opts.chat: null (pass through to local server) | function(route)
 * opts.blockAnalytics: account for /_vercel/insights separately
 */
export async function installDoubles(context, opts = {}) {
  const log = { external: [], aborted: [], analytics: [] };
  const fx = githubFixture();
  const hdrMode = opts.hdr ?? "valid";
  const gh = opts.github ?? "ok";

  await context.route(/raw\.githack\.com\/.*\.hdr$/, (route) => {
    log.external.push(route.request().url());
    if (hdrMode === "abort") {
      log.aborted.push(route.request().url());
      return route.abort("failed");
    }
    return route.fulfill({ status: 200, contentType: "application/octet-stream", body: tinyHdr() });
  });

  await context.route(/www\.gstatic\.com\/draco\/.*/, (route) => {
    const url = route.request().url();
    log.external.push(url);
    if (opts.draco === "abort") {
      log.aborted.push(url);
      return route.abort("failed");
    }
    const file = path.join(DRACO_DIR, path.basename(new URL(url).pathname));
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: "" });
    const type = file.endsWith(".wasm") ? "application/wasm" : "text/javascript";
    return route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(file) });
  });

  await context.route(/api\.github\.com\/.*/, (route) => {
    const url = route.request().url();
    log.external.push(url);
    if (gh === "offline") return route.abort("internetdisconnected");
    if (gh === "rate-limit")
      return route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ message: "API rate limit exceeded" }), headers: { "x-ratelimit-remaining": "0" } });
    if (gh === "malformed") return route.fulfill({ status: 200, contentType: "application/json", body: "{not json" });
    const isRepos = /\/repos/.test(url);
    const body = isRepos ? (gh === "empty" ? [] : fx.repos) : fx.user;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });

  await context.route(/avatars\.githubusercontent\.com\/.*/, (route) =>
    route.fulfill({ status: 200, contentType: "image/png", body: PNG_1PX }),
  );

  await context.route(/api\.emailjs\.com\/.*/, (route) => {
    log.external.push(route.request().url());
    if (opts.emailjs === "fail") return route.fulfill({ status: 500, body: "fail" });
    return route.fulfill({ status: 200, contentType: "text/plain", body: "OK" });
  });

  await context.route(/\/_vercel\/insights\/.*/, (route) => {
    log.analytics.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "text/javascript", body: "/* analytics double */" });
  });

  // Anything else off-origin: record and block so nothing leaves the machine.
  await context.route(
    (url) => !/^(http:\/\/(localhost|127\.0\.0\.1)|data:|blob:)/.test(url.href) &&
      !/(raw\.githack|gstatic|api\.github|avatars\.githubusercontent|emailjs|_vercel)/.test(url.href),
    (route) => {
      log.external.push("BLOCKED " + route.request().url());
      return route.abort("blockedbyclient");
    },
  );

  return log;
}

/** Explicitly labelled override so the OLD revision takes its full visual branch. */
export const FULL_VISUAL_OVERRIDE = () => {
  Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false, configurable: true });
};

export async function launch(kind = "chromium", { gpu = false, headless = true } = {}) {
  if (kind === "webkit") return webkit.launch({ headless });
  if (kind === "firefox") return firefox.launch({ headless });
  const args = gpu
    ? ["--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"]
    : ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"];
  if (kind === "chrome") return chromium.launch({ channel: "chrome", headless, args });
  return chromium.launch({ headless, args });
}

export function attachErrorLog(page) {
  const errors = { page: [], console: [], failed: [], badStatus: [] };
  page.on("pageerror", (e) => errors.page.push(String(e?.message || e).slice(0, 400)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.console.push(m.text().slice(0, 400));
  });
  page.on("requestfailed", (r) => errors.failed.push(`${r.url().slice(0, 160)} :: ${r.failure()?.errorText}`));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.badStatus.push(`${r.status()} ${r.url().slice(0, 200)}`);
  });
  return errors;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function writeJson(name, data) {
  const dir = path.join(SCRATCH, "evidence");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}
export const EVIDENCE = path.join(SCRATCH, "evidence");

/** CDP Fetch-based doubles (keeps the HTTP cache enabled, unlike context.route). */
export async function installCdpDoubles(cdp, opts = {}) {
  const fx = githubFixture();
  const b64 = (buf) => Buffer.from(buf).toString("base64");
  await cdp.send("Fetch.enable", {
    patterns: ["*raw.githack.com*", "*gstatic.com/draco*", "*api.github.com*", "*avatars.githubusercontent.com*", "*/_vercel/insights*", "*api.emailjs.com*", "*fonts.googleapis.com*", "*fonts.gstatic.com*"].map((urlPattern) => ({ urlPattern })),
  });
  cdp.on("Fetch.requestPaused", async (e) => {
    const url = e.request.url;
    const ok = (body, type, status = 200) => cdp.send("Fetch.fulfillRequest", { requestId: e.requestId, responseCode: status, responseHeaders: [{ name: "Content-Type", value: type }, { name: "Access-Control-Allow-Origin", value: "*" }, { name: "Cache-Control", value: "public, max-age=3600" }], body: b64(body) }).catch(() => {});
    if (/\.hdr/.test(url)) return opts.hdr === "abort" ? cdp.send("Fetch.failRequest", { requestId: e.requestId, errorReason: "Failed" }).catch(() => {}) : ok(tinyHdr(), "application/octet-stream");
    if (/gstatic\.com\/draco/.test(url)) {
      const file = path.join(DRACO_DIR, path.basename(new URL(url).pathname));
      return fs.existsSync(file) ? ok(fs.readFileSync(file), file.endsWith(".wasm") ? "application/wasm" : "text/javascript") : ok("", "text/plain", 404);
    }
    if (/api\.github\.com/.test(url)) return ok(JSON.stringify(/\/repos/.test(url) ? fx.repos : fx.user), "application/json");
    if (/avatars\.githubusercontent/.test(url)) return ok(PNG_1PX, "image/png");
    if (/_vercel\/insights/.test(url)) return ok("/* analytics double */", "text/javascript");
    if (/emailjs/.test(url)) return ok("OK", "text/plain");
    return cdp.send("Fetch.failRequest", { requestId: e.requestId, errorReason: "BlockedByClient" }).catch(() => {});
  });
}
