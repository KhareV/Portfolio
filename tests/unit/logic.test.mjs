// Unit regressions: node --test tests/unit
import { test } from "node:test";
import assert from "node:assert/strict";
import { istHour, phaseAt, phaseForHour, istClock } from "../../app/lib/time.js";
import { decideTier } from "../../app/lib/visualPolicy.js";
import { offlineAnswer, validateQuestion } from "../../app/lib/chatAnswers.js";
import { buildViewModel, isValidViewModel, lastPushByMonth } from "../../app/lib/github.js";
import { starPositions } from "../../app/components/starField.js";
import { projects } from "../../app/content/site.js";

// IST = UTC+05:30
const ist = (hh, mm = 0) => new Date(Date.UTC(2026, 10, 20, hh, mm) - 330 * 60000);

test("day phase boundaries are computed in IST", () => {
  const cases = [
    [4, 59, "night"], [5, 0, "morning"], [11, 59, "morning"], [12, 0, "afternoon"],
    [16, 59, "afternoon"], [17, 0, "evening"], [20, 59, "evening"], [21, 0, "night"], [0, 0, "night"], [23, 59, "night"],
  ];
  for (const [h, m, phase] of cases) assert.equal(phaseAt(ist(h, m)), phase, `${h}:${m}`);
  assert.equal(istHour(ist(0, 0)), 0, "midnight is hour 0, not 24");
  assert.match(istClock(ist(0, 5)), /^12:05\s?AM$/);
  assert.equal(phaseForHour(12), "afternoon");
});

test("visual tier policy never depends on user agent and degrades safely", () => {
  const base = { webgl: { available: true, software: false }, reducedMotion: false, saveData: false, effectiveType: "4g", deviceMemory: 8, hardwareConcurrency: 8, coarsePointer: false, viewportWidth: 1440 };
  assert.equal(decideTier(base), "full");
  assert.equal(decideTier({ ...base, webgl: { available: false } }), "static");
  assert.equal(decideTier({ ...base, reducedMotion: true }), "static");
  assert.equal(decideTier({ ...base, saveData: true }), "static");
  assert.equal(decideTier({ ...base, webgl: { available: true, software: true } }), "lite");
  assert.equal(decideTier({ ...base, coarsePointer: true, viewportWidth: 390 }), "lite");
  assert.equal(decideTier({ ...base, effectiveType: "3g" }), "lite");
  assert.equal(decideTier({ ...base, override: "full", webgl: { available: false } }), "static", "cannot force WebGL that does not exist");
});

test("every visible starter question gets a useful offline answer", () => {
  assert.match(offlineAnswer("what projects have you built?").answer, /PropertyDhundo[\s\S]*MedWe/);
  for (const p of projects) assert.ok(offlineAnswer("projects").answer.includes(p.source));
  assert.match(offlineAnswer("what are your strongest skills?").answer, /React/);
  assert.match(offlineAnswer("how can i contact you?").answer, /kharevedant05@gmail\.com[\s\S]*linkedin\.com\/in\/kharevedant05/);
  assert.match(offlineAnswer("tell me about yourself").answer, /VIT Chennai/);
  assert.equal(validateQuestion("   ").ok, false);
  assert.equal(validateQuestion("x".repeat(501)).ok, false);
  assert.equal(validateQuestion(42).ok, false);
});

test("GitHub view model validates shape and only charts dated data", () => {
  const now = new Date("2026-11-20T00:00:00Z");
  const user = { login: "KhareV", public_repos: 2, followers: 1, following: 1 };
  const repos = [
    { id: 1, name: "a", html_url: "https://github.com/KhareV/a", stargazers_count: 3, forks_count: 0, language: "JavaScript", pushed_at: "2026-11-02T00:00:00Z" },
    { id: 2, name: "b", html_url: "https://github.com/KhareV/b", stargazers_count: 0, language: null, pushed_at: "2025-01-01T00:00:00Z" },
    { name: 5 }, // malformed entry dropped
  ];
  const vm = buildViewModel(user, repos, now);
  assert.ok(isValidViewModel(vm));
  assert.equal(vm.totals.repos, 2);
  assert.equal(vm.languages[0].count, 1);
  assert.equal(vm.totals.reposWithLanguage, 1);
  assert.equal(vm.pushes.at(-1).count, 1, "Nov 2026 bucket");
  assert.equal(vm.pushes.reduce((a, b) => a + b.count, 0), 1, "older push is outside the 12-month window");
  assert.equal(buildViewModel(user, "nope", now), null);
  assert.equal(buildViewModel(null, [], now), null);
  assert.ok(isValidViewModel(buildViewModel(user, [], now)), "zero repositories is a valid, empty state");
  assert.equal(isValidViewModel({ version: 1 }), false, "old/malformed cache is rejected");
  assert.equal(lastPushByMonth([], now).length, 12);
});

test("star field is made of complete XYZ triples with finite bounds", () => {
  const pos = starPositions(1500, 60);
  assert.equal(pos.length % 3, 0);
  assert.equal(pos.length / 3, 1500);
  let maxR = 0;
  for (let i = 0; i < pos.length; i += 3) maxR = Math.max(maxR, Math.hypot(pos[i], pos[i + 1], pos[i + 2]));
  assert.ok(Number.isFinite(maxR) && maxR <= 60);
});
