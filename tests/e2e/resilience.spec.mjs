// P-01/P-02/P-03/P-20: a failed third-party or asset request must never replace the whole portfolio.
import { test, expect } from "@playwright/test";
import { mockGithub, collectErrors, dismissConsentIfShown, scrollToId } from "./helpers.mjs";

const SECTIONS = ["hero", "about", "projects", "contact", "work"];

async function expectPageIntact(page) {
  for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toHaveCount(1);
  await expect(page.getByText("Application error")).toHaveCount(0);
}

const faults = [
  ["studio HDR 404", /\.hdr(\?|$)/],
  ["computer.glb 404", /computer\.glb/],
  ["planet glb 404", /scene\.opt\.glb/],
  ["developer.glb 404", /developer\.glb/],
  ["avatar fbx 404", /\.fbx(\?|$)/],
  ["draco decoder 404", /draco_(decoder|wasm_wrapper)/],
  ["project video 404", /\.mp4(\?|$)/],
];

for (const [name, pattern] of faults) {
  test(`fault isolation: ${name}`, async ({ page, context }) => {
    await mockGithub(context);
    await context.route(pattern, (route) => route.fulfill({ status: 404, body: "missing" }));
    const errors = collectErrors(page);
    await page.goto("/");
    await page.waitForTimeout(7000);
    await dismissConsentIfShown(page, 4000);
    for (const id of ["projects", "work"]) {
      await scrollToId(page, id);
      await page.waitForTimeout(2500);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(2500);
    await expectPageIntact(page);
    // the injected fault may log errors, but must not unmount the app
    test.info().annotations.push({ type: "errors", description: errors.slice(0, 3).join(" | ") });
  });
}

test("fault isolation: all third-party hosts blocked (offline CDN)", async ({ page, context }) => {
  await context.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (route) => route.abort("blockedbyclient"));
  await page.goto("/");
  await page.waitForTimeout(7000);
  await dismissConsentIfShown(page, 4000);
  await scrollToId(page, "projects");
  await page.waitForTimeout(4000);
  await expectPageIntact(page);
  // healthy path needs no CDN: the project canvas must exist
  await expect(page.locator("#projects canvas")).toHaveCount(1);
});

test("GitHub: corrupted localStorage cache does not crash the page", async ({ page, context }) => {
  await mockGithub(context);
  await context.addInitScript(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("github-stats-cache")) localStorage.removeItem(k);
    }
    localStorage.setItem("github-stats-cache-v1", JSON.stringify({ cachedAt: Date.now(), repos: "oops", topRepos: "oops", languages: 5 }));
  });
  await page.goto("/");
  await page.waitForTimeout(6000);
  await expectPageIntact(page);
});

test("GitHub: upstream 500 shows an error state without crashing", async ({ page, context }) => {
  await mockGithub(context, { status: 500 });
  await page.goto("/");
  await page.waitForTimeout(6000);
  await expectPageIntact(page);
  await expect(page.getByText(/Unable to fetch GitHub data/i)).toBeVisible();
});
