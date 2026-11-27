// Owner-approved work-timeline facts must match every place that restates them
// (assistant prompt, no-key fallback, Chatbox fun facts). Read-only, no network.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const constants = read("app/constants/index.jsx");
const prompt = read("app/api/chat/prompt.jsx");
const chatbox = read("app/components/Chatbox.jsx");
const handler = read("app/lib/chatHandler.js");

test("timeline lists the SDE role, then the internship, with the approved dates", () => {
  const sde = constants.indexOf('pos: "Software Development Engineer"');
  const intern = constants.indexOf('pos: "Software Engineer Intern"');
  assert.ok(sde > 0 && intern > sde, "SDE entry comes first, then the internship");
  assert.match(constants, /duration: "Starting Jan 2027"/);
  assert.match(constants, /duration: "May 2026 - Jul 2026"/);
});

test("assistant prompt knows both Walmart roles and must not invent details", () => {
  assert.match(prompt, /Software Development Engineer.*Jan 2027/);
  assert.match(prompt, /Software Engineer Intern.*May 2026 - Jul 2026/);
  assert.match(prompt, /Do not invent responsibilities/);
  assert.doesNotMatch(prompt, /Incoming SWE Intern/);
});

test("chat fun fact and no-key fallback agree with the timeline", () => {
  assert.doesNotMatch(chatbox, /Incoming Software Engineering Intern/);
  assert.match(chatbox, /Software Development Engineer in Jan 2027/);
  assert.match(handler, /walmart:[\s\S]*May 2026 - Jul 2026[\s\S]*Jan 2027/);
});
