// P-25/P-26/P-27(aria part): hidden UI must not take focus; menu/modal keyboard semantics.
import { test, expect } from "@playwright/test";
import { mockGithub, IPHONE_UA, dismissConsentIfShown } from "./helpers.mjs";

const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: IPHONE_UA };

test("closed mobile menu links are not keyboard-focusable; toggle exposes state; Escape closes and returns focus", async ({ browser }) => {
  const context = await browser.newContext({ ...phone, timezoneId: "Asia/Kolkata" });
  await mockGithub(context);
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForTimeout(3000);
  const toggle = page.getByRole("button", { name: "Toggle menu" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  // Tab through the header: no focused element may be invisible
  const invisibleFocus = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      let n = el, op = 1;
      while (n && n.nodeType === 1) { op *= Number(getComputedStyle(n).opacity); n = n.parentElement; }
      return { tag: el.tagName, text: (el.textContent || "").trim().slice(0, 20), op };
    });
    if (info && info.op < 0.05) invisibleFocus.push(info);
  }
  expect(invisibleFocus, JSON.stringify(invisibleFocus)).toEqual([]);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await context.close();
});

test("consent modal is an accessible dialog and Escape dismisses it", async ({ page, context }) => {
  await mockGithub(context);
  await page.goto("/");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(page.locator("#my-modal").getByRole("button", { name: "Yes" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("covered footer links are not focusable until the footer is revealed", async ({ page, context }) => {
  await mockGithub(context);
  await page.goto("/");
  await page.waitForTimeout(6000);
  await dismissConsentIfShown(page, 6000);
  await page.evaluate(() => window.scrollTo(0, 0));
  const focusable = await page.evaluate(() => {
    const a = document.querySelector('#footer a[aria-label="Visit GitHub profile"]');
    if (!a) return "no-footer";
    a.focus();
    return document.activeElement === a;
  });
  expect(focusable).toBe(false);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1500);
  const focusableAtBottom = await page.evaluate(() => {
    const a = document.querySelector('#footer a[aria-label="Visit GitHub profile"]');
    a.focus();
    return document.activeElement === a;
  });
  expect(focusableAtBottom).toBe(true);
});

test("hero h1 exposes the complete name to assistive tech and does not announce per character", async ({ page, context }) => {
  await mockGithub(context);
  await page.goto("/");
  const h1 = page.locator("#hero h1");
  await expect(h1).not.toHaveAttribute("aria-live", /.+/);
  const name = await page.evaluate(() => {
    const h = document.querySelector("#hero h1");
    return h ? h.innerText + "|" + (h.querySelector(".sr-only")?.textContent || "") : "";
  });
  expect(name).toContain("I'm Vedant Khare.");
});
