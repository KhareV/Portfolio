import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name) => fs.readFileSync(path.join(here, "..", "fixtures", name));

export const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

/** Serve public GitHub data from a recorded fixture (never hits api.github.com). */
export async function mockGithub(context, { status = 200, body } = {}) {
  await context.route("https://api.github.com/**", (route) => {
    const url = route.request().url();
    if (status !== 200) {
      return route.fulfill({ status, contentType: "application/json", body: body ?? '{"message":"mock"}', headers: { "access-control-allow-origin": "*" } });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: fixture(url.includes("/repos") ? "github-repos.json" : "github-user.json"),
    });
  });
  await context.route(/_vercel\/(insights|speed-insights)/, (route) => route.fulfill({ status: 204, body: "" }));
}

/** Block every third-party request so tests prove the page needs no CDN. */
export async function blockThirdParty(context) {
  await context.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => {
    if (route.request().url().startsWith("https://api.github.com/")) return route.fallback();
    return route.abort("blockedbyclient");
  });
}

export function collectErrors(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

export async function dismissConsentIfShown(page, timeout = 12_000) {
  const no = page.locator("#my-modal").getByRole("button", { name: "No" });
  try {
    await no.waitFor({ state: "visible", timeout });
    await no.click();
  } catch {
    /* modal not shown in this mode */
  }
}

/** Count WebGL draw calls per canvas (instrumentation only, test-side). */
export const DRAW_COUNTER = () => {
  window.__draws = 0;
  window.__glContexts = 0;
  const wrap = (proto) => {
    for (const fn of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"]) {
      const orig = proto[fn];
      if (!orig) continue;
      proto[fn] = function (...a) { window.__draws++; return orig.apply(this, a); };
    }
  };
  if (window.WebGLRenderingContext) wrap(WebGLRenderingContext.prototype);
  if (window.WebGL2RenderingContext) wrap(WebGL2RenderingContext.prototype);
  const ogc = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (kind, ...a) {
    const c = ogc.call(this, kind, ...a);
    if (c && /webgl/.test(kind) && !this.__counted && this.width > 1) { this.__counted = true; window.__glContexts++; (window.__glList = window.__glList || []).push(c); }
    return c;
  };
  window.__videos = [];
  const oce = Document.prototype.createElement;
  Document.prototype.createElement = function (tag, ...a) {
    const el = oce.call(this, tag, ...a);
    if (String(tag).toLowerCase() === "video") window.__videos.push(el);
    return el;
  };
  const oraf = window.requestAnimationFrame.bind(window);
  window.__raf = 0;
  window.requestAnimationFrame = (cb) => { window.__raf++; return oraf(cb); };
};

export async function scrollToId(page, id) {
  await page.evaluate((i) => {
    const el = document.getElementById(i);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  }, id);
}
