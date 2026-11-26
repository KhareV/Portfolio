// Screenshots for human review. node shots.mjs <base> <label> [--phase=HH:MM IST]
import { launch, installDoubles, attachErrorLog, DESKTOP_UA, IPHONE_UA, sleep, EVIDENCE } from "./lib.mjs";
import path from "node:path"; import fs from "node:fs";
const base = process.argv[2], label = process.argv[3];
const iso = (process.argv.find((a) => a.startsWith("--at=")) ?? "--at=2026-11-20T09:00:00Z").split("=")[1];
const gpu = !process.argv.includes("--swgl");
const dir = path.join(EVIDENCE, "shots", label); fs.mkdirSync(dir, { recursive: true });
const b = await launch("chromium", { gpu });
for (const [name, ctx] of [["desktop", { viewport: { width: 1440, height: 900 }, userAgent: DESKTOP_UA }], ["phone", { viewport: { width: 390, height: 844 }, userAgent: IPHONE_UA, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const c = await b.newContext(ctx);
  await c.addInitScript((fixedIso) => { const R = Date; const off = R.parse(fixedIso) - R.now(); class D extends R { constructor(...a) { if (a.length) super(...a); else super(R.now() + off); } static now() { return R.now() + off; } } window.Date = D; }, iso);
  await installDoubles(c, {});
  const p = await c.newPage(); const errs = attachErrorLog(p);
  await p.goto(base + "/", { waitUntil: "load" }); await sleep(2500);
  await p.screenshot({ path: path.join(dir, `${name}-1-hero.png`) });
  for (const id of ["projects", "experience", "about", "github", "contact"]) {
    await p.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: "start", behavior: "instant" }), id); await sleep(2200);
    await p.screenshot({ path: path.join(dir, `${name}-${id}.png`) });
  }
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(1500);
  await p.screenshot({ path: path.join(dir, `${name}-footer.png`) });
  console.log(name, "errors:", JSON.stringify({ page: errs.page, console: errs.console.slice(0, 5), bad: errs.badStatus.slice(0, 5) }));
  await c.close();
}
await b.close(); console.log(dir);
