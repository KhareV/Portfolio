// Shared test doubles: nothing leaves localhost. GitHub data is served to the
// browser's /api/github request; analytics is stubbed; anything else external
// is blocked and recorded so a test can assert on it.
import { test as base, expect } from "@playwright/test";

export const githubVm = (overrides = {}) => ({
  version: 2,
  fetchedAt: new Date().toISOString(),
  user: { login: "KhareV", name: "Vedant Khare", bio: "", avatarUrl: null, publicRepos: 3, followers: 4, following: 2 },
  totals: { repos: 3, stars: 5, reposWithLanguage: 2 },
  top: [
    { id: 1, name: "Portfolio", url: "https://github.com/KhareV/Portfolio", description: "This site", language: "JavaScript", stars: 4, forks: 1, pushedAt: new Date().toISOString() },
    { id: 2, name: "ChatApp", url: "https://github.com/KhareV/ChatApp", description: "", language: "JavaScript", stars: 1, forks: 0, pushedAt: new Date().toISOString() },
  ],
  starLeaders: [
    { id: 1, name: "Portfolio", url: "https://github.com/KhareV/Portfolio", stars: 4 },
    { id: 2, name: "ChatApp", url: "https://github.com/KhareV/ChatApp", stars: 1 },
  ],
  languages: [{ name: "JavaScript", count: 2, pct: 100 }],
  pushes: Array.from({ length: 12 }, (_, i) => ({ key: `k${i}`, label: "M", year: 2026, count: i === 11 ? 2 : 0 })),
  ...overrides,
});

export const test = base.extend({
  external: [
    async ({ context }, use) => {
      const seen = [];
      await context.route(/\/_vercel\/insights\//, (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
      await context.route(/\/api\/github$/, (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(githubVm()) }));
      await context.route(
        (url) => !/^(http:\/\/(localhost|127\.0\.0\.1)|data:|blob:)/.test(url.href),
        (r) => {
          seen.push(r.request().url());
          return r.abort("blockedbyclient");
        },
      );
      await use(seen);
    },
    { auto: true },
  ],
  pageErrors: [
    async ({ page }, use) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e.message || e)));
      page.on("console", (m) => {
        if (m.type() === "error" && /hydrat|Minified React error/i.test(m.text())) errors.push(m.text());
      });
      await use(errors);
    },
    { auto: true },
  ],
});

export { expect };

/** The target is on screen just below the fixed header, and its heading has focus. */
export async function expectAtTarget(page, id, { focus = true } = {}) {
  // Wait until the target rests in the band just below the fixed header
  // (both bounds, so a smooth scroll still in flight does not count).
  await expect
    .poll(async () => {
      const top = await page.evaluate((i) => document.getElementById(i).getBoundingClientRect().top, id);
      return top > -40 && top < 120 ? "at-target" : Math.round(top);
    }, { timeout: 8000 })
    .toBe("at-target");
  if (focus) {
    await expect
      .poll(() => page.evaluate((i) => document.getElementById(i).contains(document.activeElement) && document.activeElement !== document.body, id))
      .toBe(true);
  }
}
