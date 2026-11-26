// P-05/P-13: no hydration errors for full, phone, reduced-motion visitors; no automation special-casing.
import { test, expect } from "@playwright/test";
import { mockGithub, IPHONE_UA } from "./helpers.mjs";

const modes = {
  "desktop full": {},
  "phone (emulated)": { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: IPHONE_UA },
  "reduced motion": { reducedMotion: "reduce" },
  "lighthouse-like UA": { userAgent: "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse" },
};

for (const [name, opts] of Object.entries(modes)) {
  test(`no hydration error: ${name}`, async ({ browser }) => {
    const context = await browser.newContext({ ...opts, timezoneId: "Asia/Kolkata" });
    await mockGithub(context);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && /hydrat|#418|#423|#425/i.test(m.text())) errors.push(m.text()); });
    await page.goto("/");
    await page.waitForTimeout(6000);
    expect(errors, errors.join("\n")).toEqual([]);
    await context.close();
  });
}

test("automation (navigator.webdriver) gets the full experience, not a lab variant", async ({ page, context }) => {
  await mockGithub(context);
  await page.goto("/");
  await page.waitForTimeout(6000);
  expect(await page.evaluate(() => navigator.webdriver)).toBe(true);
  await expect(page.locator("html.lenis, html[class*='lenis']")).toHaveCount(1, { timeout: 10_000 });
  await page.evaluate(() => document.getElementById("projects")?.scrollIntoView());
  await expect(page.locator("#projects canvas")).toHaveCount(1, { timeout: 15_000 });
  await expect(page.getByText("Lightweight preview enabled")).toHaveCount(0);
});

test("SSR HTML contains a semantic h1 with the full intro text", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const h1 = html.match(/<h1[\s\S]*?<\/h1>/);
  expect(h1, "h1 present").toBeTruthy();
  expect(h1[0].replace(/<[^>]+>/g, "")).toContain("Vedant Khare");
});

test("static HTML does not preload a build-time day-phase plate", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).not.toMatch(/<link[^>]+rel="preload"[^>]+as="image"[^>]+(cofounder-bg|after_alt|vegas_night_hero|niag_night_hero)/);
});
