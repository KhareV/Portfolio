// Contract tests for POST /api/chat with a stubbed provider (no network).
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.CHAT_TIMEOUT_MS = "150";
const realFetch = globalThis.fetch;
const { POST } = await import("../../app/api/chat/route.js");
const call = (body) => POST(new Request("http://local/api/chat", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));

beforeEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.GROQ_API_KEY;
});

test("invalid payloads are rejected with a readable error", async () => {
  for (const body of ["not json", { question: "" }, { question: "   " }, { question: 7 }, { question: "x".repeat(600) }]) {
    const res = await call(body);
    assert.equal(res.status, 400);
    assert.equal(typeof (await res.json()).error, "string");
  }
});

test("missing configuration answers offline (and never calls out)", async () => {
  globalThis.fetch = () => assert.fail("provider must not be called without a key");
  const data = await (await call({ question: "what projects have you built?" })).json();
  assert.equal(data.source, "offline");
  assert.match(data.answer, /PropertyDhundo/);
});

test("provider success returns plain text from the model", async () => {
  process.env.GROQ_API_KEY = "test-key";
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /chat\/completions$/);
    assert.equal(init.headers.Authorization, "Bearer test-key");
    return Response.json({ choices: [{ message: { content: "  <b>hi</b> there  " } }] });
  };
  const data = await (await call({ question: "hello" })).json();
  assert.deepEqual(data, { answer: "<b>hi</b> there", source: "model" }); // rendered as text by the client
});

test("provider timeout is bounded and falls back with a notice", async () => {
  process.env.GROQ_API_KEY = "test-key";
  globalThis.fetch = (_u, init) => new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(init.signal.reason)));
  const t = Date.now();
  const data = await (await call({ question: "how can i contact you?" })).json();
  assert.ok(Date.now() - t < 2000);
  assert.equal(data.source, "offline");
  assert.match(data.notice, /too long/);
  assert.match(data.answer, /kharevedant05@gmail\.com/);
});

test("provider failure and empty answers fall back", async () => {
  process.env.GROQ_API_KEY = "test-key";
  globalThis.fetch = async () => new Response("boom", { status: 500 });
  assert.equal((await (await call({ question: "skills" })).json()).source, "offline");
  globalThis.fetch = async () => Response.json({ choices: [] });
  assert.equal((await (await call({ question: "skills" })).json()).source, "offline");
});
