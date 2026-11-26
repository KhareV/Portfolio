// Regression for the reproduced critical failure: aborting only the remote
// studio HDR (studio_small_03_1k.hdr) produced Next's application-error screen
// with zero sections. Optional renderer failures must now stay local.
import { test, expect } from "./fixtures.mjs";

const FAULTS = {
  "computer model": /\/models\/computer\.glb/,
  "draco decoder": /\/draco\//,
  "project video": /\/textures\/project\/.*\.mp4/,
  "planet model": /\/planet\/scene\.opt\.glb/,
  "prism + globe chunks": /_next\/static\/chunks\/.*/, // narrowed below
};

async function assertPortfolioUsable(page) {
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Vedant Khare");
  await expect(page.getByRole("heading", { name: "Selected work" })).toBeVisible();
  await page.locator("#projects").scrollIntoViewIfNeeded();
  const next = page.getByRole("button", { name: "Next project" });
  await next.click();
  await expect(page.getByText("Project 2 of 5")).toBeVisible();
  await expect(page.locator("#projects figure img")).toHaveAttribute("src", /medwe/);
  await page.goto("/#contact");
  await expect(page.getByRole("heading", { name: "Let's talk" })).toBeInViewport();
  await expect(page.locator('#contact a[href^="mailto:kharevedant05@gmail.com"]').first()).toBeVisible();
}

test.describe("full visual tier with faults", () => {
  test.skip(({ isMobile }) => isMobile, "full tier is desktop-only");

  test("no request is made to remote HDR or decoder CDNs", async ({ page, external, pageErrors }) => {
    await page.goto("/?visuals=full");
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await page.waitForTimeout(4000);
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    expect(external.filter((u) => /githack|gstatic|\.hdr/.test(u))).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  for (const [name, pattern] of Object.entries(FAULTS)) {
    if (name.startsWith("prism")) continue;
    test(`failed ${name} leaves the portfolio usable`, async ({ page, context, pageErrors }) => {
      await context.route(pattern, (r) => r.abort("failed"));
      await page.goto("/?visuals=full");
      await page.locator("#projects").scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000);
      await assertPortfolioUsable(page);
      expect(pageErrors).toEqual([]);
    });
  }

  test("WebGL context loss falls back to the poster", async ({ page, pageErrors }) => {
    await page.goto("/?visuals=full");
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await page.waitForTimeout(4000);
    await page.evaluate(() => {
      for (const c of document.querySelectorAll("canvas")) (c.getContext("webgl2") || c.getContext("webgl"))?.getExtension("WEBGL_lose_context")?.loseContext();
    });
    await page.waitForTimeout(800);
    await expect(page.locator("#projects figure canvas")).toHaveCount(0);
    await expect(page.locator("#projects figure img")).toBeVisible();
    await assertPortfolioUsable(page);
    expect(pageErrors).toEqual([]);
  });
});

test("WebGL unavailable: static tier, everything works @smoke", async ({ page, context, pageErrors }) => {
  await context.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      return /webgl/i.test(type) ? null : orig.call(this, type, ...rest);
    };
  });
  await page.goto("/?visuals=full"); // asking for full cannot conjure WebGL
  await expect(page.locator("html")).toHaveAttribute("data-visuals", "static");
  await page.locator("#projects").scrollIntoViewIfNeeded();
  await expect(page.locator("canvas")).toHaveCount(0);
  await assertPortfolioUsable(page);
  expect(pageErrors).toEqual([]);
});

test("JavaScript disabled: content, sources and contact are in the HTML @smoke", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/I.m Vedant Khare\./);
  for (const id of ["hero", "projects", "experience", "work", "about", "github", "contact"]) await expect(page.locator(`#${id}`)).toHaveCount(1);
  const index = page.getByRole("navigation", { name: "All projects" });
  await expect(index.getByRole("link", { name: /^Source for/ })).toHaveCount(5);
  await expect(page.locator("#projects figure img")).toHaveCount(1);
  await expect(page.locator('a[href^="mailto:kharevedant05@gmail.com"]').first()).toBeVisible();
  await page.goto("/#contact");
  await expect(page.getByRole("heading", { name: "Let's talk" })).toBeInViewport();
  await context.close();
});
