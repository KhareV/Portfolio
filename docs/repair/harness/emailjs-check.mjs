// Configured EmailJS path with a captured send (no email leaves the machine).
import { chromium } from "playwright";
import { writeJson } from "./lib.mjs";
const base = "http://localhost:3103";
const b = await chromium.launch();
const out = {};
for (const mode of ["success", "failure"]) {
  const c = await b.newContext();
  const sends = [];
  await c.route(/api\.emailjs\.com/, async (r) => {
    sends.push({ url: r.request().url(), body: r.request().postData()?.slice(0, 300) });
    await new Promise((res) => setTimeout(res, 600)); // slow provider, to tempt a double submit
    return mode === "success" ? r.fulfill({ status: 200, body: "OK" }) : r.fulfill({ status: 500, body: "fail" });
  });
  await c.route(/\/_vercel\//, (r) => r.fulfill({ status: 200, body: "" }));
  const p = await c.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(base + "/#contact");
  await p.getByLabel("Name").fill("Test Sender");
  await p.getByLabel("Email").fill("sender@example.com");
  await p.getByLabel("Message").fill("Captured test message");
  const btn = p.getByRole("button", { name: "Send message" });
  await btn.click(); await p.keyboard.press("Enter").catch(() => {}); await btn.click({ force: true, timeout: 500 }).catch(() => {});
  await p.waitForTimeout(1500);
  out[mode] = {
    sendsCaptured: sends.length,
    payloadHasFields: /Test Sender/.test(sends[0]?.body || "") && /sender@example\.com/.test(sends[0]?.body || ""),
    status: await p.locator("#contact-status").innerText(),
    messageAfter: await p.getByLabel("Message").inputValue(),
    mailtoOffered: await p.getByRole("link", { name: "Open your email app with this message" }).count(),
    pageErrors: errs,
  };
  await c.close();
}
await b.close();
console.log(JSON.stringify(out, null, 1)); console.log(writeJson("emailjs-configured.json", out));
