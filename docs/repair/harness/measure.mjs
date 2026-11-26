// Lab measurement. Same journey, same clock (14:30 IST, afternoon), same doubles
// for every build. Usage:
//   node measure.mjs <baseUrl> <label> --tier=desktop|phone [--trials=3] [--trace]
import fs from "node:fs";
import path from "node:path";
import { launch, installCdpDoubles, attachErrorLog, DESKTOP_UA, IPHONE_UA, FULL_VISUAL_OVERRIDE, sleep, writeJson, EVIDENCE } from "./lib.mjs";

const base = process.argv[2];
const label = process.argv[3];
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).split("=")[1];
const tier = arg("tier", "desktop");
const trials = Number(arg("trials", "3"));
const gpu = arg("gpu", "1") === "1";
const override = arg("override", "1") === "1"; // webdriver=false + desktop UA for both builds
const wantTrace = process.argv.includes("--trace");
const FIXED_TIME = new Date("2026-11-20T09:00:00Z"); // 14:30 IST

const TIERS = {
  desktop: {
    ctx: { viewport: { width: 1440, height: 900 }, userAgent: DESKTOP_UA, deviceScaleFactor: 1 },
    net: { latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 },
    cpu: 1,
  },
  phone: {
    ctx: { viewport: { width: 390, height: 844 }, userAgent: IPHONE_UA, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    net: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 },
    cpu: 4,
  },
};
const T = TIERS[tier];

const INIT = (fixedIso) => {
  // Shift Date so the page sees 14:30 IST while time keeps flowing.
  const RealDate = Date; const offset = RealDate.parse(fixedIso) - RealDate.now();
  class ShiftedDate extends RealDate { constructor(...a) { if (a.length) super(...a); else super(RealDate.now() + offset); } static now() { return RealDate.now() + offset; } }
  window.Date = ShiftedDate;
  // rAF accounting: counts callbacks actually run, per wall-clock window.
  const raw = window.requestAnimationFrame.bind(window);
  window.__raf = { count: 0 };
  window.requestAnimationFrame = (cb) => raw((t) => { window.__raf.count++; cb(t); });
  window.__perf = { lcp: null, lcpEl: null, cls: 0, shifts: [], longTasks: [], events: [] };
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__perf.lcp = e.startTime;
        const el = e.element;
        window.__perf.lcpEl = el ? `${el.tagName}${el.id ? "#" + el.id : ""}.${String(el.className || "").slice(0, 60)} ${e.url ? e.url.slice(0, 120) : (el.textContent || "").slice(0, 40)}` : e.url;
        window.__perf.lcpSize = e.size;
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__perf.cls += e.value; window.__perf.shifts.push([Math.round(e.startTime), +e.value.toFixed(4)]); }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__perf.longTasks.push([Math.round(e.startTime), Math.round(e.duration)]);
    }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__perf.events.push([e.name, Math.round(e.startTime), Math.round(e.duration), Math.round(e.processingStart - e.startTime)]);
    }).observe({ type: "event", buffered: true, durationThreshold: 16 });
  } catch {}
};

const pct = (arr, p) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); return +s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))].toFixed(1); };
const median = (a) => pct(a, 50);

async function oneRun(browser, runIdx, { warm = false, context: reuse } = {}) {
  const context = reuse ?? (await browser.newContext(T.ctx));
  if (!reuse) {
    if (override) await context.addInitScript(FULL_VISUAL_OVERRIDE);
    await context.addInitScript(INIT, FIXED_TIME.toISOString());
  }
  const page = await context.newPage();
  const errors = attachErrorLog(page);
  const cdp = await context.newCDPSession(page);
  await installCdpDoubles(cdp);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, ...T.net });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: T.cpu });
  const reqs = new Map();
  let phase = "initial";
  const bytes = {};
  cdp.on("Network.responseReceived", (e) => reqs.set(e.requestId, { url: e.response.url, type: e.type, phase, status: e.response.status, fromCache: e.response.fromDiskCache || e.response.fromServiceWorker }));
  cdp.on("Network.loadingFinished", (e) => {
    const r = reqs.get(e.requestId); if (!r) return;
    const key = `${r.phase}:${r.type}`;
    bytes[key] = (bytes[key] || 0) + e.encodedDataLength;
    r.bytes = e.encodedDataLength;
  });
  if (wantTrace && runIdx === 0 && !warm) await browser.startTracing(page, { path: path.join(EVIDENCE, `trace-${label}-${tier}.json`), screenshots: false, categories: ["devtools.timeline", "disabled-by-default-devtools.timeline.frame", "blink.user_timing", "gpu"] });

  const snap = async (name, windowMs) => {
    const before = await page.evaluate(() => window.__raf.count);
    await sleep(windowMs);
    const s = await page.evaluate(() => ({
      raf: window.__raf.count,
      canvases: document.querySelectorAll("canvas").length,
      videosPlaying: [...document.querySelectorAll("video")].filter((v) => !v.paused).length,
      scrollY: Math.round(scrollY),
    }));
    return { name, rafPerSec: +(((s.raf - before) / windowMs) * 1000).toFixed(1), canvases: s.canvases, videosPlaying: s.videosPlaying, scrollY: s.scrollY };
  };

  const t0 = Date.now();
  await page.goto(base + "/", { waitUntil: "load", timeout: 120000 });
  const loadMs = Date.now() - t0;
  await sleep(6000);
  const phases = [];
  phases.push(await snap("hero-idle", 3000));
  const dismissModal = async () => {
    const no = page.getByRole("button", { name: /^No$/ });
    if (await no.count()) { await no.first().click({ timeout: 2000 }).catch(() => {}); return true; }
    return false;
  };
  const modalSeen = await dismissModal();
  const initialBytes = { ...bytes };

  // scroll sequence with frame timing (wheel input, like a person)
  phase = "scroll";
  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    const raw = window.requestAnimationFrame;
    const tick = (t) => { window.__frames.push(t - last); last = t; if (!window.__stopFrames) raw(tick); };
    raw(tick);
  });
  await page.mouse.move(T.ctx.viewport.width / 2, T.ctx.viewport.height / 2);
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 260); await sleep(60); }
  for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, -320); await sleep(50); } // fast reversal
  for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, 300); await sleep(60); }
  const frames = await page.evaluate(() => { window.__stopFrames = true; return window.__frames.slice(2); });

  // projects
  phase = "projects";
  await page.evaluate(() => document.getElementById("projects")?.scrollIntoView({ block: "start" }));
  phases.push(await snap("projects", 4000));
  // interaction timing: next project x3
  const modalSeenLate = await dismissModal();
  const nextBtn = page.locator('[aria-label="Next project"]').first();
  const interactions = [];
  for (let i = 0; i < 3; i++) {
    if (!(await nextBtn.count())) break;
    const t = await page.evaluate(() => performance.now());
    await nextBtn.click({ timeout: 5000 }).catch(() => {});
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))));
    interactions.push(+(await page.evaluate((s) => performance.now() - s, t)).toFixed(1));
    await sleep(700);
  }
  phase = "contact";
  await page.evaluate(() => document.getElementById("contact")?.scrollIntoView({ block: "start" }));
  phases.push(await snap("contact", 4000));
  phase = "idle-top";
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1500);
  phases.push(await snap("idle-top", 5000));
  // background tab: hide, then return
  await cdp.send("Emulation.setFocusEmulationEnabled", { enabled: false }).catch(() => {});
  const perf = await page.evaluate(() => window.__perf);
  if (wantTrace && runIdx === 0 && !warm) await browser.stopTracing();

  const jsInitial = Object.entries(initialBytes).filter(([k]) => k.endsWith(":Script")).reduce((a, [, v]) => a + v, 0);
  const allInitial = Object.values(initialBytes).reduce((a, v) => a + v, 0);
  const all = Object.values(bytes).reduce((a, v) => a + v, 0);
  const jsAll = Object.entries(bytes).filter(([k]) => k.endsWith(":Script")).reduce((a, [, v]) => a + v, 0);
  const heroImg = [...reqs.values()].filter((r) => /_next\/image|newimages/.test(r.url) && r.phase === "initial").map((r) => `${r.status} ${decodeURIComponent(r.url.replace(base, "")).slice(0, 110)} ${r.bytes ?? "?"}B`);
  const result = {
    run: runIdx, warm, loadMs, modalSeen: modalSeen || modalSeenLate,
    lcp: perf.lcp && +perf.lcp.toFixed(0), lcpEl: perf.lcpEl, cls: +perf.cls.toFixed(4), shifts: perf.shifts.slice(0, 10),
    longTasks: perf.longTasks.length, longTaskMs: perf.longTasks.reduce((a, [, d]) => a + d, 0), maxLongTask: Math.max(0, ...perf.longTasks.map(([, d]) => d)),
    tbtApprox: perf.longTasks.reduce((a, [, d]) => a + Math.max(0, d - 50), 0),
    events: perf.events.slice(0, 12), nextProjectMs: interactions,
    bytes: { jsInitial, allInitial, jsAll, all, byKey: bytes },
    frames: { n: frames.length, p50: pct(frames, 50), p95: pct(frames, 95), over33: frames.filter((f) => f > 33.4).length, over50: frames.filter((f) => f > 50).length },
    phases, heroImg: heroImg.slice(0, 8),
    errors: { page: errors.page.slice(0, 5), badStatus: errors.badStatus.filter((s) => !/_vercel/.test(s)).slice(0, 8), analytics404: errors.badStatus.filter((s) => /_vercel/.test(s)).length },
  };
  await page.close();
  return { result, context };
}

const browser = await launch("chromium", { gpu });
const runs = [];
let lastCtx = null;
for (let i = 0; i < trials; i++) {
  const { result, context } = await oneRun(browser, i);
  runs.push(result);
  if (i < trials - 1) await context.close(); else lastCtx = context;
  console.log(`[${label}/${tier}] cold#${i} LCP=${result.lcp} CLS=${result.cls} TBT~${result.tbtApprox} jsInit=${result.bytes.jsInitial} allInit=${result.bytes.allInitial} all=${result.bytes.all} frames p50/p95=${result.frames.p50}/${result.frames.p95} >33=${result.frames.over33} >50=${result.frames.over50} next=${result.nextProjectMs} phases=${result.phases.map((p) => `${p.name}:${p.rafPerSec}raf/${p.canvases}c/${p.videosPlaying}v`).join(" ")} errs=${result.errors.page.length}`);
}
const { result: warm } = await oneRun(browser, 99, { warm: true, context: lastCtx });
console.log(`[${label}/${tier}] warm LCP=${warm.lcp} jsInit=${warm.bytes.jsInitial} allInit=${warm.bytes.allInitial} all=${warm.bytes.all}`);
await browser.close();

const cold = runs;
const summary = {
  label, tier, gpu, override, trials,
  medians: {
    lcp: median(cold.map((r) => r.lcp)), lcpRange: [Math.min(...cold.map((r) => r.lcp)), Math.max(...cold.map((r) => r.lcp))],
    cls: median(cold.map((r) => r.cls)), tbt: median(cold.map((r) => r.tbtApprox)), longTasks: median(cold.map((r) => r.longTasks)),
    jsInitial: median(cold.map((r) => r.bytes.jsInitial)), allInitial: median(cold.map((r) => r.bytes.allInitial)), all: median(cold.map((r) => r.bytes.all)), jsAll: median(cold.map((r) => r.bytes.jsAll)),
    frameP50: median(cold.map((r) => r.frames.p50)), frameP95: median(cold.map((r) => r.frames.p95)), over33: median(cold.map((r) => r.frames.over33)), over50: median(cold.map((r) => r.frames.over50)),
    nextProjectMs: median(cold.flatMap((r) => r.nextProjectMs)),
    rafHeroIdle: median(cold.map((r) => r.phases[0]?.rafPerSec)), rafProjects: median(cold.map((r) => r.phases[1]?.rafPerSec)), rafContact: median(cold.map((r) => r.phases[2]?.rafPerSec)), rafIdleTop: median(cold.map((r) => r.phases[3]?.rafPerSec)),
  },
  warm: { lcp: warm.lcp, allInitial: warm.bytes.allInitial, jsInitial: warm.bytes.jsInitial },
  runs: cold, warmRun: warm,
};
const f = writeJson(`measure-${label}-${tier}${gpu ? "-gpu" : "-swgl"}.json`, summary);
console.log("MEDIANS", JSON.stringify(summary.medians));
console.log("evidence:", f);
