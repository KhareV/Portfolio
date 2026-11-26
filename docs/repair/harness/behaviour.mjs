import { launch, installDoubles, DESKTOP_UA, sleep, writeJson } from "./lib.mjs";
const base = process.argv[2], label = process.argv[3];
const b = await launch("chromium", { gpu: true });
const c = await b.newContext({ viewport: { width: 1440, height: 900 }, userAgent: DESKTOP_UA });
await installDoubles(c, {});
await c.addInitScript(() => { window.__n = 0; const raw = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => { window.__n++; return raw(cb); };
  window.__styleWrites = 0; const d = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, "transform"); });
const p = await c.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
const rate = async (ms = 1000) => { const a = await p.evaluate(() => window.__n); await sleep(ms); return Math.round(((await p.evaluate(() => window.__n)) - a) * 1000 / ms); };
const out = {};
await p.goto(base + "/#about"); await sleep(2500);
const sf = p.locator("svg.sunflower, main svg").filter({ has: p.locator("rect") }).first();
out.sunflowerRects = await p.evaluate(() => document.querySelectorAll("svg rect").length);
await sf.scrollIntoViewIfNeeded(); await sleep(1200);
const box = await sf.boundingBox();
await p.mouse.move(5, 5); await sleep(800);
out.sunflowerVisibleResting = await rate();
await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
out.sunflowerHoverMoving = await (async () => { const a = await p.evaluate(() => window.__n); for (let i = 0; i < 10; i++) { await p.mouse.move(box.x + box.width * (0.3 + i * 0.04), box.y + box.height / 2); await sleep(100); } return (await p.evaluate(() => window.__n)) - a; })();
await sleep(1500);
out.sunflowerPointerStationaryAfter1_5s = await rate();
await p.mouse.move(5, 5); await sleep(1500);
out.sunflowerAfterLeaveSettled = await rate();
await p.evaluate(() => window.scrollTo(0, 0)); await sleep(1000);
out.offscreen = await rate();
// background tab
await p.evaluate(() => document.getElementById("projects").scrollIntoView({ behavior: "instant" })); await sleep(3000);
out.projectsActive = await rate();
const cdp = await c.newCDPSession(p);
// Emulated background tab (headless keeps pages "visible"): override + event.
const setVis = (v) => p.evaluate((v) => { Object.defineProperty(document, "visibilityState", { value: v, configurable: true }); Object.defineProperty(document, "hidden", { value: v === "hidden", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); }, v);
await setVis("hidden"); await sleep(800);
out.projectsWhileHiddenRaf = await rate();
out.sceneVideoPausedWhileHidden = await p.evaluate(() => "n/a (video element not in DOM; paused via active=false)");
await setVis("visible"); await sleep(1500);
out.projectsAfterReturn = await rate();
out.canvasAfterReturn = await p.evaluate(() => document.querySelectorAll("#projects canvas").length);
// reduced motion switched on while open
await p.emulateMedia({ reducedMotion: "reduce" }); await sleep(1200);
out.tierAfterReduce = await p.evaluate(() => document.documentElement.dataset.visuals);
out.canvasesAfterReduce = await p.evaluate(() => document.querySelectorAll("canvas").length);
out.rafAfterReduce = await rate();
// accessibility tree basics
const snap = await p.accessibility?.snapshot?.().catch(() => null);
out.a11y = await p.evaluate(() => ({ h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()), landmarks: [...document.querySelectorAll("header,nav,main,footer,section[aria-labelledby]")].map((e) => e.tagName.toLowerCase() + (e.getAttribute("aria-label") ? `[${e.getAttribute("aria-label")}]` : e.id ? `#${e.id}` : "")), mains: document.querySelectorAll("main").length, imgsNoAlt: [...document.querySelectorAll("img:not([alt])")].length, buttonsNoName: [...document.querySelectorAll("button")].filter((b) => !(b.getAttribute("aria-label") || b.textContent.trim())).length }));
out.errors = errs;
await b.close();
console.log(JSON.stringify(out, null, 1)); console.log(writeJson(`behaviour-${label}.json`, out));
