// Regression for the reproduced cold-link miss: /#contact stayed at scrollY 0
// with Contact ~7,500 px below (desktop) / ~10,300 px (phone), because the
// section did not exist until a staged client mount.
import { test, expect, expectAtTarget } from "./fixtures.mjs";

const TARGETS = ["projects", "experience", "about", "github", "contact"];

for (const id of TARGETS) {
  test(`cold load at #${id} lands on the section with focus @smoke`, async ({ page, pageErrors }) => {
    await page.goto(`/#${id}`);
    await expectAtTarget(page, id);
    await page.waitForTimeout(2600); // late layout (fonts, data) must not move it
    await expectAtTarget(page, id, { focus: false });
    expect(pageErrors).toEqual([]);
  });
}

test("legacy #work still reaches the experience list; #home reaches the hero", async ({ page }) => {
  await page.goto("/#work");
  await expectAtTarget(page, "work", { focus: false });
  await expect(page.getByRole("heading", { level: 2, name: "Experience" })).toBeInViewport();
  await page.goto("/#home");
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
});

test("immediate first click, Back/Forward and refresh at depth", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop nav; phone menu covered below");
  await page.goto("/", { waitUntil: "commit" });
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" }).click();
  await expectAtTarget(page, "contact");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Work" }).click();
  await expectAtTarget(page, "projects");
  await page.goBack();
  await expect(page).toHaveURL(/#contact$/);
  await expectAtTarget(page, "contact", { focus: false });
  await page.goForward();
  await expectAtTarget(page, "projects", { focus: false });
  await page.reload();
  await expectAtTarget(page, "projects", { focus: false });
});

test("keyboard: skip link and nav activation move focus to the destination", async ({ page, isMobile, browserName }) => {
  test.skip(isMobile, "desktop nav");
  // WebKit follows macOS: plain Tab skips links unless the user enables it; Option-Tab includes them.
  const TAB = browserName === "webkit" ? "Alt+Tab" : "Tab";
  await page.goto("/");
  await page.keyboard.press(TAB);
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press(TAB); // logo
  await page.keyboard.press(TAB); // Work
  await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Work" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expectAtTarget(page, "projects");
});

test("phone menu: closed links are not focusable; open, select, Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone only");
  await page.goto("/");
  const menu = page.locator("header details");
  const summary = menu.locator("summary");
  // Closed: tabbing from the logo goes to the music/menu controls, never into hidden links.
  const focusables = await page.evaluate(() =>
    [...document.querySelectorAll("header details a")].map((a) => a.getBoundingClientRect().width > 0 && a.checkVisibility()),
  );
  expect(focusables.every((v) => v === false)).toBe(true);
  await expect(summary).toHaveAttribute("aria-label", "Menu");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(summary).toBeFocused();
  await summary.click();
  await menu.getByRole("link", { name: "Contact" }).click();
  await expect(menu).not.toHaveAttribute("open", "");
  await expectAtTarget(page, "contact");
});
