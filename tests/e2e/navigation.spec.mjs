// P-06: cold hash deep links, early nav clicks, back/forward must land on the target section.
import { test, expect } from "@playwright/test";
import { mockGithub } from "./helpers.mjs";

const landedOn = async (page, id) =>
  page.evaluate((i) => {
    const el = document.getElementById(i);
    return el ? Math.abs(el.getBoundingClientRect().top) : Infinity;
  }, id);

for (const id of ["about", "contact", "work"]) {
  test(`cold deep link /#${id} lands on the section`, async ({ page, context }) => {
    await mockGithub(context);
    await page.goto(`/#${id}`);
    await expect.poll(() => landedOn(page, id), { timeout: 12_000, intervals: [250] }).toBeLessThan(6);
    // and stays there once everything has settled
    await page.waitForTimeout(3000);
    expect(await landedOn(page, id)).toBeLessThan(6);
  });
}

test("nav click before staged sections mount still lands", async ({ page, context }) => {
  await mockGithub(context);
  await page.goto("/");
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const a = document.querySelector('header a[href="#contact"]');
    a && a.click();
  });
  await expect.poll(() => landedOn(page, "contact"), { timeout: 12_000, intervals: [250] }).toBeLessThan(6);
});

test("reload with hash and back/forward land", async ({ page, context }) => {
  await mockGithub(context);
  await page.goto("/#work");
  await expect.poll(() => landedOn(page, "work"), { timeout: 12_000 }).toBeLessThan(6);
  await page.reload();
  await expect.poll(() => landedOn(page, "work"), { timeout: 12_000 }).toBeLessThan(6);
  await page.evaluate(() => { location.hash = "#about"; });
  await expect.poll(() => landedOn(page, "about"), { timeout: 8_000 }).toBeLessThan(6);
  await page.goBack();
  await expect.poll(() => landedOn(page, "work"), { timeout: 8_000 }).toBeLessThan(6);
});
