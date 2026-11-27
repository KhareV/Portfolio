// Cross-browser smoke (@xbrowser): full page renders, all sections present, no uncaught errors,
// no failed same-origin requests. Runs on chromium, firefox and webkit projects.
import { test, expect } from "@playwright/test";
import { mockGithub, dismissConsentIfShown, scrollToId } from "./helpers.mjs";

test("@xbrowser full page renders without errors", async ({ page, context }) => {
  await mockGithub(context);
  const errors = [];
  const failed = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.url().startsWith(new URL(page.url() || "http://localhost").origin) && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });
  await page.goto("/");
  await page.waitForTimeout(7000);
  await dismissConsentIfShown(page, 5000);
  for (const id of ["about", "projects", "contact", "work"]) {
    await scrollToId(page, id);
    await page.waitForTimeout(1500);
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(2000);
  await expect(page.locator("#footer")).toBeVisible();
  expect(errors, errors.join("\n")).toEqual([]);
  expect(failed.filter((f) => !/_vercel/.test(f)), failed.join("\n")).toEqual([]);
});
