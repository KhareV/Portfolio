// P-12: hero image requests must all succeed, match the displayed IST phase, and not be duplicated.
import { test, expect } from "@playwright/test";
import { mockGithub } from "./helpers.mjs";

const PHASES = {
  morning: ["2026-11-27T08:00:00+05:30", "cofounder-bg"],
  afternoon: ["2026-11-27T14:00:00+05:30", "after_alt"],
  evening: ["2026-11-27T18:30:00+05:30", "vegas_night_hero"],
  night: ["2026-11-27T02:00:00+05:30", "niag_night_hero"],
};

for (const tz of ["Asia/Kolkata", "America/New_York"]) {
  for (const [phase, [iso, file]] of Object.entries(PHASES)) {
    test(`hero ${phase} plate (${tz}): no 4xx, only the displayed plate requested`, async ({ browser }) => {
      const context = await browser.newContext({ timezoneId: tz });
      await mockGithub(context);
      const page = await context.newPage();
      await page.clock.setFixedTime(new Date(iso));
      const bad = [];
      const plates = [];
      page.on("response", (r) => {
        const u = decodeURIComponent(r.url());
        if (r.status() >= 400 && r.url().startsWith("http://localhost")) bad.push(`${r.status()} ${u}`);
        const m = u.match(/newimages\/(cofounder-bg|after_alt|hero-1|vegas_night_hero|niag_night_hero)\.avif/);
        if (m) plates.push(m[1]);
      });
      await page.goto("/");
      await page.waitForTimeout(4000);
      expect(bad, bad.join("\n")).toEqual([]);
      const shown = await page.evaluate(() => [...document.querySelectorAll("#hero img")].map((i) => decodeURIComponent(i.currentSrc)));
      expect(shown.join(" ")).toContain(file);
      expect([...new Set(plates)]).toEqual([file]);
      await context.close();
    });
  }
}

// Image weight: the idle preloader must warm the optimised next/image variants the page
// displays, never the multi-megabyte source PNGs (previously ~2.3 MB before first input).
test("idle preload fetches optimised spotlight/logo variants, not raw source PNGs", async ({ browser }) => {
  const context = await browser.newContext();
  await mockGithub(context);
  const page = await context.newPage();
  const raw = [];
  const optimised = [];
  page.on("request", (r) => {
    const u = decodeURIComponent(r.url());
    if (/\/assets\/(spotlight\d|codechef|ispace|hackathons|dandiya)\.png$/.test(new URL(r.url()).pathname)) raw.push(u);
    if (/_next\/image\?url=\/assets\/spotlight\d\.png/.test(u)) optimised.push(u);
  });
  await page.goto("/");
  await page.waitForTimeout(6000);
  expect(raw, raw.join("\n")).toEqual([]);
  expect(new Set(optimised.map((u) => u.match(/spotlight\d/)[0])).size).toBe(5);
  await context.close();
});
