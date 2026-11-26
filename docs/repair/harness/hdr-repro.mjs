// HDR isolation: control (valid tiny HDR) vs treatment (abort only the HDR).
// Usage: node hdr-repro.mjs <baseUrl> <label> [--context-loss] [--browser=chromium|chrome]
import { launch, installDoubles, attachErrorLog, DESKTOP_UA, FULL_VISUAL_OVERRIDE, sleep, writeJson } from "./lib.mjs";

const base = process.argv[2] ?? "http://localhost:3101";
const label = process.argv[3] ?? "baseline";
const contextLoss = process.argv.includes("--context-loss");
const browserKind = (process.argv.find((a) => a.startsWith("--browser=")) ?? "--browser=chromium").split("=")[1];
const forceOldOverride = !process.argv.includes("--no-override");

async function run(hdr) {
  const browser = await launch(browserKind, { gpu: process.argv.includes("--gpu") });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: DESKTOP_UA,
    deviceScaleFactor: 1,
  });
  if (forceOldOverride) await context.addInitScript(FULL_VISUAL_OVERRIDE);
  const log = await installDoubles(context, { hdr });
  const page = await context.newPage();
  const errors = attachErrorLog(page);
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  // trigger the staged mount like a visitor would (first interaction), then wait
  await sleep(800);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 200);
  await sleep(9000);

  if (contextLoss) {
    await page.evaluate(() => {
      for (const c of document.querySelectorAll("canvas")) {
        const gl = c.getContext("webgl2") || c.getContext("webgl");
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      }
    });
    await sleep(2500);
  }

  const state = await page.evaluate(() => {
    const ids = ["hero", "about", "projects", "work", "experience", "contact", "footer"];
    return {
      sections: ids.filter((id) => document.getElementById(id)),
      sectionCount: document.querySelectorAll("section").length,
      h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()).slice(0, 3),
      h2: [...document.querySelectorAll("h2")].map((h) => h.textContent.trim()).slice(0, 12),
      mailto: document.querySelectorAll('a[href^="mailto:"]').length,
      canvases: document.querySelectorAll("canvas").length,
      bodyText: document.body.innerText.slice(0, 200),
      appError: /Application error/i.test(document.body.innerText),
      projectsControls: !!document.querySelector('[aria-label="Next project"]'),
    };
  });
  const result = { hdr, contextLoss, browser: browserKind, state, hdrRequests: log.external.filter((u) => /\.hdr/.test(u)), aborted: log.aborted, errors: { page: errors.page, console: errors.console.slice(0, 8) } };
  await browser.close();
  return result;
}

const control = await run("valid");
const treatment = await run("abort");
const file = writeJson(`hdr-${label}${contextLoss ? "-ctxloss" : ""}.json`, { base, control, treatment });
console.log(JSON.stringify({ control: { sections: control.state.sections, appError: control.state.appError, pageErrors: control.errors.page.length, hdr: control.hdrRequests.length, canvases: control.state.canvases }, treatment: { sections: treatment.state.sections, appError: treatment.state.appError, pageErrors: treatment.errors.page, hdr: treatment.hdrRequests.length, canvases: treatment.state.canvases, mailto: treatment.state.mailto, body: treatment.state.bodyText } }, null, 1));
console.log("evidence:", file);
