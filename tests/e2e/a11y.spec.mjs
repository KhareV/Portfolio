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
      // scope: the header/menu (below-the-fold content that fades in on scroll is out of scope)
      if (!el || el === document.body || !el.closest("header")) return null;
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
  // focus moves into the dialog itself — no focus ring painted on a button
  await expect(dialog).toBeFocused();
  const ring = await page.evaluate(() => {
    const cs = getComputedStyle(document.activeElement);
    return cs.outlineStyle === "none" || cs.outlineColor === "rgba(0, 0, 0, 0)" ? "invisible" : `${cs.outlineStyle} ${cs.outlineColor}`;
  });
  expect(ring).toBe("invisible");
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

test("footer becomes unfocusable again when the page grows without scrolling", async ({ page, context }) => {
  // Staged sections can mount after the footer: the page grows with no scroll event.
  await mockGithub(context);
  await page.goto("/");
  await page.waitForTimeout(6000);
  await dismissConsentIfShown(page, 6000);
  await page.waitForSelector("#footer", { state: "attached" });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => document.querySelector("#footer").inert)).toBe(false);
  // grow the page above the current position without scrolling
  await page.evaluate(() => {
    // no scroll anchoring: keep scrollY fixed, as when content mounts off-screen
    document.documentElement.style.overflowAnchor = "none";
    document.body.style.overflowAnchor = "none";
    const spacer = document.createElement("div");
    spacer.style.height = "6000px";
    document.querySelector("main")?.prepend(spacer);
  });
  await expect.poll(() => page.evaluate(() => document.querySelector("#footer").inert), { timeout: 3000 }).toBe(true);
});

test("footer is already visible in the very frame the reveal can first show it", async ({ page, context }) => {
  await mockGithub(context);
  await page.goto("/");
  await page.waitForTimeout(6000);
  await dismissConsentIfShown(page, 6000);
  // jump instantly to the bottom and inspect the footer before the next paint
  const states = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const footer = document.getElementById("footer");
        const before = getComputedStyle(footer).visibility;
        window.scrollTo(0, document.documentElement.scrollHeight);
        // scroll handlers run before the next frame's rAF callbacks/paint
        requestAnimationFrame(() => resolve({ before, firstFrame: getComputedStyle(footer).visibility }));
      }),
  );
  expect(states.before).toBe("hidden");
  expect(states.firstFrame).toBe("visible");
});

test("hero h1 exposes the complete name to assistive tech and does not announce per character", async ({ page, context }) => {
  await mockGithub(context);
  await page.goto("/");
  const h1 = page.locator("#hero h1");
  await expect(h1).not.toHaveAttribute("aria-live", /.+/);
  // accessible name is complete immediately (before typing finishes)
  await expect(page.getByRole("heading", { level: 1, name: "Hello, I'm Vedant Khare." })).toHaveCount(1);
  // the visible typed text still types out to the same words
  const typed = h1.locator('[aria-hidden="true"]');
  await expect(typed).toHaveText("Hello,I'm Vedant Khare.", { timeout: 10_000 });
});
