// Phase selection at IST boundaries from a browser in another time zone.
import { chromium } from "playwright";
import { writeJson } from "./lib.mjs";
const base = process.argv[2];
const b = await chromium.launch();
const rows = [];
const istUtc = (h, m) => new Date(Date.UTC(2026, 10, 20, h, m) - 330 * 60000).toISOString();
for (const [h, m] of [[4, 59], [5, 0], [11, 59], [12, 0], [16, 59], [17, 0], [20, 59], [21, 0], [0, 0]]) {
  for (const vp of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const c = await b.newContext({ timezoneId: "America/Los_Angeles", viewport: vp });
    await c.addInitScript((iso) => { const R = Date; const off = R.parse(iso) - R.now(); class D extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + off); } static now() { return R.now() + off; } } window.Date = D; }, istUtc(h, m));
    await c.route(/\/_vercel\//, (r) => r.fulfill({ status: 200, body: "" }));
    const p = await c.newPage(); const hero = []; const bad = []; const errs = [];
    p.on("response", (r) => { if (/\/media\/hero\//.test(r.url())) hero.push(`${r.status()} ${r.url().split("/media/hero/")[1]}`); if (r.status() >= 400 && !/_vercel/.test(r.url())) bad.push(r.status() + " " + r.url()); });
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(base + "/"); await p.waitForTimeout(1200);
    const s = await p.evaluate(() => ({ phase: document.documentElement.dataset.phase, clock: document.querySelector("#hero time")?.textContent, bg: getComputedStyle(document.querySelector(".hero-art")).backgroundImage.match(/hero\/([\w-]+\.\w+)/)?.[1] }));
    rows.push({ ist: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`, vw: vp.width, ...s, heroRequests: [...new Set(hero)], bad, errs });
    await c.close();
  }
}
await b.close();
for (const r of rows) console.log(r.ist, r.vw, r.phase, r.clock, r.bg, JSON.stringify(r.heroRequests), r.bad.length, r.errs.length);
console.log(writeJson("phases-repaired.json", rows));
