import { test, expect, githubVm } from "./fixtures.mjs";
import { projects } from "../../app/content/site.js";

test("project viewer: next/prev wrap both ways, arrows, index; poster/title/source agree @smoke", async ({ page }) => {
  await page.goto("/#projects");
  const viewer = page.getByRole("group", { name: /Project viewer/ });
  const check = async (i) => {
    const p = projects[i];
    await expect(viewer.getByText(`Project ${i + 1} of 5`)).toBeVisible();
    await expect(viewer.getByRole("heading", { level: 3 })).toContainText(p.title);
    await expect(viewer.locator("figure img")).toHaveCount(1); // no stale poster left behind
    await expect(viewer.locator("figure img")).toHaveAttribute("src", new RegExp(p.slug));
    await expect(viewer.getByRole("link", { name: /Source on GitHub/ })).toHaveAttribute("href", p.source);
  };
  await check(0);
  for (let i = 1; i <= 5; i++) {
    await page.getByRole("button", { name: "Next project" }).click();
    await check(i % 5);
  }
  await page.getByRole("button", { name: "Previous project" }).click();
  await check(4);
  await viewer.focus();
  await page.keyboard.press("ArrowRight");
  await check(0);
  await page.keyboard.press("ArrowLeft");
  await check(4);
  await page.getByRole("button", { name: /^MedWe/ }).click();
  await check(1);
  // rapid revisits settle on the last choice
  for (let k = 0; k < 7; k++) await page.getByRole("button", { name: "Next project" }).click();
  await check((1 + 7) % 5);
});

test("chat: starter question, failure with retry, blank input blocked", async ({ page, context }) => {
  let fail = true;
  await context.route(/\/api\/chat$/, async (r) => {
    if (fail) return r.fulfill({ status: 500, body: "{}" });
    const q = JSON.parse(r.request().postData()).question;
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ answer: `Answer to: ${q} <img src=x onerror=alert(1)>`, source: "offline" }) });
  });
  await page.goto("/");
  const send = page.getByRole("button", { name: "Send", exact: true });
  await expect(send).toBeDisabled();
  await page.getByLabel("Your question").fill("   ");
  await expect(send).toBeDisabled();
  await page.getByRole("button", { name: "what projects have you built?" }).click();
  await expect(page.getByText("The assistant could not be reached.")).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  const log = page.getByRole("log", { name: "Conversation" });
  await expect(log).toContainText("Answer to: what projects have you built?");
  await expect(log).toContainText("<img src=x onerror=alert(1)>"); // rendered as text, not HTML
  await expect(log.locator("img")).toHaveCount(0);
  await expect(log).toContainText("Answered from saved notes.");
});

test("chat against the real local route answers starters offline", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "how can i contact you?" }).click();
  await expect(page.getByRole("log", { name: "Conversation" }).getByRole("link", { name: "kharevedant05@gmail.com" })).toBeVisible();
});

test("contact: validation, unconfigured send keeps draft and offers prefilled email @smoke", async ({ page }) => {
  await page.goto("/#contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please fix the highlighted fields.")).toBeVisible();
  await expect(page.getByLabel("Name")).toBeFocused();
  await page.getByLabel("Name").fill("Test Recruiter");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Message").fill("Hello from a test");
  await page.getByLabel("Email").blur();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await page.getByLabel("Email").fill("recruiter@example.com");
  await page.getByRole("button", { name: "Send message" }).click();
  // This build has no EmailJS configuration: no network send, draft kept, direct route offered.
  const direct = page.getByRole("link", { name: "Open your email app with this message" });
  await expect(direct).toBeVisible();
  await expect(direct).toHaveAttribute("href", /^mailto:kharevedant05@gmail\.com\?subject=Portfolio%20enquiry%20from%20Test%20Recruiter&body=Hello%20from%20a%20test/);
  await expect(page.getByLabel("Message")).toHaveValue("Hello from a test");
  await page.reload();
  await expect(page.getByLabel("Message")).toHaveValue("Hello from a test"); // draft survives reload
});

test("GitHub: rate limit with no cache shows a link; stale cache is kept on failure", async ({ page, context }) => {
  await context.route(/\/api\/github$/, (r) => r.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "x", rateLimited: true }) }));
  await page.goto("/#github");
  await expect(page.getByText("GitHub's rate limit was reached.")).toBeVisible();
  await expect(page.getByRole("link", { name: /View the profile on GitHub/ })).toHaveAttribute("href", "https://github.com/KhareV");

  const stale = githubVm({ fetchedAt: new Date(Date.now() - 3 * 3600e3).toISOString() });
  await page.evaluate((vm) => localStorage.setItem("github-stats-cache-v2", JSON.stringify(vm)), stale);
  await page.reload();
  await expect(page.getByText(/Showing data saved/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Portfolio/ }).first()).toBeVisible();

  await page.evaluate(() => localStorage.setItem("github-stats-cache-v2", "{bad json"));
  await context.unroute(/\/api\/github$/);
  await context.route(/\/api\/github$/, (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(githubVm({ top: [], starLeaders: [], languages: [] })) }));
  await page.reload();
  await expect(page.getByText("No public repositories to show.")).toBeVisible();
  await expect(page.getByText("No listed repository has stars yet.")).toBeVisible();
});

test("music only starts on an explicit press; rejection is reported", async ({ page, context, isMobile }) => {
  await context.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      return Promise.reject(new DOMException("blocked", "NotAllowedError"));
    };
  });
  await page.goto("/");
  await page.waitForTimeout(4500); // the old site opened a music prompt here
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const btn = page.getByRole("button", { name: "Background music" });
  await expect(btn).toHaveAttribute("aria-pressed", "false");
  await btn.click();
  await expect(page.locator("#music-status")).toContainText("blocked");
  await expect(btn).toHaveAttribute("aria-pressed", "false");
});

test("reduced motion: static tier, no running marquee @smoke", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/#about");
  await expect(page.locator("html")).toHaveAttribute("data-visuals", "static");
  const anim = await page.locator(".marquee-track").first().evaluate((el) => getComputedStyle(el).animationName);
  expect(anim).toBe("none");
  await context.close();
});
