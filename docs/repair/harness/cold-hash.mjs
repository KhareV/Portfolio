// Cold load at each fragment; read scroll + target geometry after settle.
// Usage: node cold-hash.mjs <baseUrl> <label> [--override] [--hashes=contact,projects]
import { launch, installDoubles, attachErrorLog, DESKTOP_UA, IPHONE_UA, FULL_VISUAL_OVERRIDE, sleep, writeJson } from "./lib.mjs";

const base = process.argv[2] ?? "http://localhost:3101";
const label = process.argv[3] ?? "baseline";
const override = process.argv.includes("--override");
const hashArg = process.argv.find((a) => a.startsWith("--hashes="));
const hashes = hashArg ? hashArg.split("=")[1].split(",") : ["contact", "projects", "about", "work", "hero"];
const browserKind = (process.argv.find((a) => a.startsWith("--browser=")) ?? "--browser=chromium").split("=")[1];
const settle = Number((process.argv.find((a) => a.startsWith("--settle=")) ?? "--settle=8000").split("=")[1]);

const viewports = [
  { name: "desktop-1440", viewport: { width: 1440, height: 900 }, userAgent: DESKTOP_UA, isMobile: false, hasTouch: false },
  { name: "phone-390", viewport: { width: 390, height: 844 }, userAgent: IPHONE_UA, isMobile: browserKind !== "firefox", hasTouch: true, deviceScaleFactor: 3 },
];

const results = [];
const browser = await launch(browserKind);
for (const vp of viewports) {
  for (const hash of hashes) {
    const { name, ...ctxOpts } = vp;
    if (browserKind === "firefox") delete ctxOpts.isMobile;
    const context = await browser.newContext(ctxOpts);
    if (override) await context.addInitScript(FULL_VISUAL_OVERRIDE);
    await installDoubles(context, {});
    const page = await context.newPage();
    const errors = attachErrorLog(page);
    const t0 = Date.now();
    await page.goto(`${base}/#${hash}`, { waitUntil: "domcontentloaded" });
    // when did the target first exist?
    let firstSeen = null;
    for (let i = 0; i < settle / 100; i++) {
      const exists = await page.evaluate((h) => !!document.getElementById(h), hash).catch(() => false);
      if (exists && firstSeen == null) firstSeen = Date.now() - t0;
      await sleep(100);
    }
    const s = await page.evaluate((h) => {
      const el = document.getElementById(h);
      const r = el?.getBoundingClientRect();
      const header = document.querySelector("header");
      const hb = header?.getBoundingClientRect();
      return {
        scrollY: Math.round(window.scrollY),
        exists: !!el,
        top: r ? Math.round(r.top) : null,
        visible: r ? r.top < innerHeight && r.bottom > 0 : false,
        headingTop: (() => { const hh = el?.querySelector("h1,h2"); return hh ? Math.round(hh.getBoundingClientRect().top) : null; })(),
        headerBottom: hb ? Math.round(hb.bottom) : null,
        active: document.activeElement ? `${document.activeElement.tagName}#${document.activeElement.id || ""}` : null,
        hashNow: location.hash,
        docHeight: document.documentElement.scrollHeight,
      };
    }, hash);
    results.push({ viewport: name, hash, firstSeenMs: firstSeen, ...s, pageErrors: errors.page });
    await context.close();
  }
}
await browser.close();
const file = writeJson(`cold-hash-${label}${override ? "-override" : ""}-${browserKind}.json`, results);
for (const r of results)
  console.log(`${r.viewport.padEnd(13)} #${r.hash.padEnd(9)} exists=${r.exists} firstSeen=${r.firstSeenMs}ms scrollY=${r.scrollY} top=${r.top} headingTop=${r.headingTop} visible=${r.visible} active=${r.active} errs=${r.pageErrors.length ? r.pageErrors[0].slice(0, 80) : 0}`);
console.log("evidence:", file);
