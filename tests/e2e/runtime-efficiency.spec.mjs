// P-07/P-08/P-16/P-18: no offscreen rendering, no leaked contexts, no detached playing videos, idle settles.
import { test, expect } from "@playwright/test";
import { mockGithub, dismissConsentIfShown, scrollToId, DRAW_COUNTER } from "./helpers.mjs";

test.beforeEach(async ({ context }) => {
  await mockGithub(context);
  await context.addInitScript(DRAW_COUNTER);
});

const drawsDuring = async (page, ms) => {
  const a = await page.evaluate(() => window.__draws);
  await page.waitForTimeout(ms);
  return (await page.evaluate(() => window.__draws)) - a;
};

test("no WebGL draws while every canvas is offscreen (at hero, after all stages)", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(8000);
  await dismissConsentIfShown(page, 4000);
  await scrollToId(page, "projects");
  await page.waitForTimeout(3000);
  expect(await drawsDuring(page, 1000)).toBeGreaterThan(30); // visible scene renders
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  expect(await drawsDuring(page, 2000)).toBe(0);
});

test("About globe in/out cycling does not grow WebGL contexts or evict the project scene", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(8000);
  await dismissConsentIfShown(page, 4000);
  await scrollToId(page, "projects");
  await page.waitForTimeout(2500);
  const baseline = await page.evaluate(() => window.__glContexts);
  for (let i = 0; i < 10; i++) {
    await scrollToId(page, "about");
    await page.evaluate(() => window.scrollBy(0, 900));
    await page.waitForTimeout(700);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
  }
  const after = await page.evaluate(() => window.__glContexts);
  expect(after - baseline).toBeLessThanOrEqual(2);
  await scrollToId(page, "projects");
  await page.waitForTimeout(1500);
  const lost = await page.evaluate(() => {
    const c = document.querySelector("#projects canvas");
    const gl = c && (c.getContext("webgl2") || c.getContext("webgl"));
    return gl ? gl.isContextLost() : "no-canvas";
  });
  expect(lost).toBe(false);
});

test("switching projects leaves only the selected project video playing; none when offscreen", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(8000);
  await dismissConsentIfShown(page, 4000);
  await scrollToId(page, "projects");
  await page.waitForTimeout(2500);
  const next = page.getByRole("button", { name: "Next project" });
  for (let i = 0; i < 5; i++) { await next.click(); await page.waitForTimeout(900); }
  const playing = await page.evaluate(() => [...(window.__videos || [])].filter((v) => !v.paused).length);
  expect(playing).toBeLessThanOrEqual(1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => [...(window.__videos || [])].filter((v) => !v.paused).length)).toBe(0);
});

test("idle page settles: few animation callbacks at the hero after load", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(9000);
  await dismissConsentIfShown(page, 3000);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(1500);
  const a = await page.evaluate(() => window.__raf);
  await page.waitForTimeout(3000);
  const perSec = ((await page.evaluate(() => window.__raf)) - a) / 3;
  test.info().annotations.push({ type: "rafPerSec", description: String(perSec) });
  // Baseline: ~185/s (Lenis + Sunflower + offscreen canvases). Lenis (60/s) + framer idle may remain.
  expect(perSec).toBeLessThan(130);
});
