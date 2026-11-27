// Work-timeline avatar: deterministic animation identity and transition tests.
// Reads the real AnimationMixer state through the opt-in probe in Developer.jsx
// (window.__PORTFOLIO_ANIMATION_PROBE__), never screenshots or pose guesses.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";
import { mockGithub, dismissConsentIfShown } from "./helpers.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(here, "..", "..", "public");

// Owner-approved mapping (app/constants/index.jsx). Order = timeline order.
const ROWS = [
  { label: /^Walmart Global Tech - Software Development Engineer/, animation: "kick" },
  { label: /^Walmart Global Tech - Software Engineer Intern/, animation: "dance" },
  { label: /^CodeChef College Chapter/, animation: "victory" },
  { label: /^iSpace College Club/, animation: "swing" },
  { label: /^Hackathon Leadership/, animation: "salute" },
  { label: /^Dandiya Night Organizer/, animation: "clapping" },
];
const SOURCES = {
  idle: "/models/animations/idle.glb",
  salute: "/models/animations/salute.glb",
  clapping: "/models/animations/clapping.glb",
  victory: "/models/animations/victory.glb",
  dance: "/models/animations/dance.glb",
  kick: "/models/animations/kick.glb",
  swing: "/models/animations/swing.glb",
};

/** Sum of every channel's output keyframe values, read straight from the GLB file. */
function glbFingerprint(publicPath) {
  const b = fs.readFileSync(path.join(PUBLIC, publicPath));
  const jsonLen = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + jsonLen).toString("utf8"));
  const binStart = 20 + jsonLen + 8;
  const anim = json.animations[0];
  const width = { SCALAR: 1, VEC3: 3, VEC4: 4 };
  let sum = 0;
  let duration = 0;
  for (const channel of anim.channels) {
    const sampler = anim.samplers[channel.sampler];
    const read = (index) => {
      const acc = json.accessors[index];
      const view = json.bufferViews[acc.bufferView];
      const offset = binStart + (view.byteOffset || 0) + (acc.byteOffset || 0);
      const n = acc.count * width[acc.type];
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) out[i] = b.readFloatLE(offset + i * 4);
      return out;
    };
    for (const v of read(sampler.output)) sum += v;
    const times = read(sampler.input);
    duration = Math.max(duration, times[times.length - 1]);
  }
  return { sum, tracks: anim.channels.length, duration };
}

const snapshot = (page) => page.evaluate(() => window.__workAnimation?.snapshot() ?? null);

/** The one clip that should be visible once a cross-fade has settled. */
async function expectOnly(page, name, { timeout = 3000 } = {}) {
  let log = [];
  await expect
    .poll(async () => {
      log = await page.evaluate(() => (window.__workAnimationLog || []).slice(-8));
      const s = await snapshot(page);
      if (!s) return "no probe";
      const visible = s.actions.filter((a) => a.running && a.weight > 0.001).map((a) => `${a.name}:${a.weight.toFixed(2)}`);
      return visible.join(",");
    }, { timeout, intervals: [100], message: `expected only "${name}"` })
    .toBe(`${name}:1.00`)
    .catch((error) => {
      error.message += `\nrecent avatar transitions: ${JSON.stringify(log)}`;
      throw error;
    });
  const s = await snapshot(page);
  expect(s.requested).toBe(name);
  expect(s.active).toBe(name);
  return s;
}

const row = (page, label) => page.locator("#work").getByRole("button", { name: label });

async function center(locator) {
  const box = await locator.boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/** A pointer position over the canvas: inside the section, over no timeline row. */
async function neutralPoint(page) {
  const box = await page.locator("#work canvas").first().boundingBox();
  const vh = page.viewportSize().height;
  const top = Math.max(box.y, 0), bottom = Math.min(box.y + box.height, vh);
  return { x: box.x + box.width / 2, y: (top + bottom) / 2 };
}

/** Scroll so rows [from..to] are all inside the viewport (the list is taller than 900 px). */
async function showRows(page, from, to) {
  await page.evaluate(([a, b]) => {
    const rows = [...document.querySelectorAll("#work [role=button]")];
    const top = rows[a].getBoundingClientRect().top + window.scrollY;
    const bottom = rows[b].getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo(0, (top + bottom) / 2 - window.innerHeight / 2);
  }, [from, to]);
  await page.waitForTimeout(800);
  for (const i of [from, to]) {
    const box = await page.locator("#work [role=button]").nth(i).boundingBox();
    expect(box.y, `row ${i} top in view`).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height, `row ${i} bottom in view`).toBeLessThanOrEqual(page.viewportSize().height);
  }
}

async function openWork(page, context, { delayAnimationsMs = 0 } = {}) {
  await context.addInitScript(() => {
    window.__PORTFOLIO_ANIMATION_PROBE__ = true;
  });
  await mockGithub(context);
  if (delayAnimationsMs) {
    await context.route(/\/models\/animations\/.*\.glb$/, async (route) => {
      await new Promise((r) => setTimeout(r, delayAnimationsMs));
      await route.fallback();
    });
  }
  await page.goto("/", { waitUntil: "load" });
  await dismissConsentIfShown(page);
  await page.mouse.move(5, 5);
  // staged sections mount progressively; wheel down until #work exists
  for (let i = 0; i < 60 && !(await page.locator("#work").count()); i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(150);
  }
  await page.mouse.move(5, 5);
  await bringWorkIntoView(page);
}

async function bringWorkIntoView(page) {
  // Put the timeline list in view (top of the section near the top of the viewport).
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.evaluate(() => {
      const el = document.getElementById("work");
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40);
    });
    await page.waitForTimeout(700);
    const top = await page.evaluate(() => document.getElementById("work").getBoundingClientRect().top);
    if (Math.abs(top - 40) < 60) return;
  }
}

async function waitForAvatar(page) {
  await expect.poll(() => page.evaluate(() => Boolean(window.__workAnimation)), { timeout: 30_000 }).toBe(true);
}

// Headless on purpose: in a headed window the real OS cursor, if it rests over the
// browser, hovers timeline rows and changes the clip under test. Mixer state and the
// CPU-skinned bounds do not depend on GPU fidelity.
test.use({ headless: true });

test.describe("work avatar animation identity", () => {
  test("each timeline entry plays its own distinct clip from its own file, then returns to idle", async ({ page, context }) => {
    await openWork(page, context);
    await waitForAvatar(page);
    const idle = await expectOnly(page, "idle");

    // the loaded clips are exactly the files on disk (fingerprint of every keyframe value)
    for (const a of idle.actions) {
      expect(a.source).toBe(SOURCES[a.name]);
      const file = glbFingerprint(a.source);
      expect(a.tracks, `${a.name} tracks`).toBe(file.tracks);
      expect(Math.abs(a.duration - file.duration), `${a.name} duration`).toBeLessThan(1e-4);
      expect(Math.abs(a.fingerprint - file.sum) / Math.max(1, Math.abs(file.sum)), `${a.name} fingerprint`).toBeLessThan(1e-6);
    }
    // all clips differ from each other
    expect(new Set(idle.actions.map((a) => a.fingerprint.toFixed(3))).size).toBe(idle.actions.length);
    expect(new Set(ROWS.map((r) => r.animation)).size).toBe(ROWS.length);

    const neutral = await neutralPoint(page);
    for (const r of ROWS) {
      const target = row(page, r.label);
      await expect(target).toHaveCount(1);
      await target.scrollIntoViewIfNeeded();
      const p = await center(target);
      await page.mouse.move(p.x, p.y, { steps: 4 });
      await expectOnly(page, r.animation);
      await page.mouse.move(neutral.x, neutral.y, { steps: 4 });
      await expectOnly(page, "idle");
    }
  });

  test("a fast sweep across rows settles on the last row hovered; a pending idle timer cannot override it", async ({ page, context }) => {
    await openWork(page, context);
    await waitForAvatar(page);
    await expectOnly(page, "idle");
    await showRows(page, 1, 5);
    const first = await center(row(page, ROWS[1].label));
    const dandiya = await center(row(page, /^Dandiya Night Organizer/));
    const ispace = await center(row(page, /^iSpace College Club/));
    const neutral = await neutralPoint(page);

    await page.mouse.move(first.x, first.y);
    await page.mouse.move(dandiya.x, dandiya.y, { steps: 10 }); // ~2 events per row, 4 rows crossed
    await expectOnly(page, "clapping");
    await page.mouse.move(ispace.x, ispace.y, { steps: 3 }); // back up across Hackathon
    await expectOnly(page, "swing");

    // leave (arms the 180 ms idle timer) and re-enter a row before it fires
    await page.mouse.move(neutral.x, neutral.y);
    await page.mouse.move(dandiya.x, dandiya.y);
    await page.waitForTimeout(600);
    await expectOnly(page, "clapping");
    await page.mouse.move(neutral.x, neutral.y);
    await page.mouse.move(dandiya.x, dandiya.y);
    await page.waitForTimeout(600);
    await expectOnly(page, "clapping");
  });

  test("a row hovered while the avatar is still loading is played once it loads", async ({ page, context }) => {
    await openWork(page, context, { delayAnimationsMs: 2500 });
    // the canvas exists but the clips are still in flight
    await expect(page.locator("#work canvas")).toHaveCount(1, { timeout: 20_000 });
    expect(await page.evaluate(() => Boolean(window.__workAnimation))).toBe(false);
    const ispace = await center(row(page, /^iSpace College Club/));
    await page.mouse.move(ispace.x, ispace.y, { steps: 3 });
    await waitForAvatar(page);
    await expectOnly(page, "swing", { timeout: 5000 });
    await page.mouse.move((await neutralPoint(page)).x, (await neutralPoint(page)).y, { steps: 3 });
    await expectOnly(page, "idle");
  });

  test("keyboard focus and pointer hover: hover wins, focus resumes when the pointer leaves, Escape/blur return to idle", async ({ page, context }) => {
    await openWork(page, context);
    await waitForAvatar(page);
    const neutral = await neutralPoint(page);
    await page.mouse.move(neutral.x, neutral.y);
    await expectOnly(page, "idle");

    // keyboard: focus CodeChef, Tab to iSpace
    await row(page, /^CodeChef College Chapter/).evaluate((el) => el.focus({ preventScroll: true }));
    await page.keyboard.press("Tab");
    await expect(row(page, /^iSpace College Club/)).toBeFocused();
    await expectOnly(page, "swing");

    const sde = await center(row(page, ROWS[0].label));
    await page.mouse.move(sde.x, sde.y, { steps: 3 });
    await expectOnly(page, "kick");
    await page.mouse.move(neutral.x, neutral.y, { steps: 3 });
    await expectOnly(page, "swing"); // focus is still on iSpace

    await page.keyboard.press("Escape");
    await expectOnly(page, "idle");
    await page.keyboard.press("Tab"); // Hackathon
    await expectOnly(page, "salute");
    await page.keyboard.press("Enter");
    await expectOnly(page, "salute");
    await page.evaluate(() => document.activeElement.blur());
    await expectOnly(page, "idle");
  });

  test.describe("touch screen (desktop width)", () => {
    test.use({ hasTouch: true });
    test("a tap keeps the clip after the finger lifts; tapping elsewhere returns to idle", async ({ page, context }) => {
      await openWork(page, context);
      await waitForAvatar(page);
      await expectOnly(page, "idle");
      await showRows(page, 2, 5);
      const dandiya = await center(row(page, /^Dandiya Night Organizer/));
      await page.touchscreen.tap(dandiya.x, dandiya.y);
      await page.waitForTimeout(600); // longer than the 180 ms idle delay
      await expectOnly(page, "clapping");
      const elsewhere = await neutralPoint(page);
      await page.touchscreen.tap(elsewhere.x, elsewhere.y);
      await expectOnly(page, "idle");
    });
  });

  test("smooth scrolling under a resting pointer never leaves a clip that does not match the row under it; re-entry starts idle", async ({ page, context }) => {
    await openWork(page, context);
    await waitForAvatar(page);
    const ispace = await center(row(page, /^iSpace College Club/));
    await page.mouse.move(ispace.x, ispace.y, { steps: 3 });
    await expectOnly(page, "swing");

    const rowUnderPointer = () =>
      page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y)?.closest("#work [role=button]");
        return el ? el.getAttribute("aria-label") : null;
      }, ispace);
    const expected = (label) => (label ? ROWS.find((r) => r.label.test(label))?.animation : "idle");

    for (const dy of [180, 180, -360, 420, -420]) {
      await page.mouse.wheel(0, dy); // Lenis smooth scroll, pointer does not move
      await page.waitForTimeout(1500);
      await page.mouse.move(ispace.x, ispace.y); // same position: lets the browser re-hit-test, like a real resting hand
      await expectOnly(page, expected(await rowUnderPointer()));
    }

    // scroll the whole section away and back with the pointer parked outside the timeline
    await page.mouse.move(5, 5);
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(2000);
    await bringWorkIntoView(page);
    await page.mouse.move((await neutralPoint(page)).x, (await neutralPoint(page)).y);
    await expectOnly(page, "idle");
    const logBefore = await page.evaluate(() => window.__workAnimationLog.length);
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => window.__workAnimationLog.length)).toBe(logBefore);
  });

  for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    test.describe(`framing ${viewport.width}x${viewport.height}`, () => {
      test.use({ viewport });
      test("the widest clips (kick, swing, dance) and idle stay entirely inside the canvas", async ({ page, context }) => {
        test.setTimeout(150_000);
        await openWork(page, context);
        await waitForAvatar(page);
        const bounds = () => page.evaluate(() => window.__workAnimation.bounds());
        for (const name of ["kick", "swing", "dance"]) {
          const r = ROWS.find((x) => x.animation === name);
          await row(page, r.label).evaluate((el) => el.focus({ preventScroll: true }));
          await page.keyboard.press("Enter");
          const duration = (await snapshot(page)).actions.find((a) => a.name === name).duration;
          const end = Date.now() + (duration + 0.5) * 1000;
          let worst = { maxAbsX: 0, minY: 0, maxY: 0 };
          while (Date.now() < end) {
            const b = await bounds();
            worst = { maxAbsX: Math.max(worst.maxAbsX, b.maxAbsX), minY: Math.min(worst.minY, b.minY), maxY: Math.max(worst.maxY, b.maxY) };
            await page.waitForTimeout(60);
          }
          expect(worst.maxAbsX, `${name} widest point (NDC)`).toBeLessThanOrEqual(1);
          expect(worst.minY, `${name} lowest point (NDC)`).toBeGreaterThanOrEqual(-1);
          expect(worst.maxY, `${name} highest point (NDC)`).toBeLessThanOrEqual(1);
          await page.evaluate(() => document.activeElement.blur());
        }
        // idle returns to the original framing (camera distance of the Canvas, sqrt(8^2+0.2^2))
        await expectOnly(page, "idle");
        await expect.poll(async () => +(await snapshot(page)).framing.current.toFixed(3), { timeout: 5000 }).toBe(8.002);
      });
    });
  }
});
