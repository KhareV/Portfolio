import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CHAT_ERRORS,
  MAX_CHAT_BODY_BYTES,
  createRateLimiter,
  exceedsContentLength,
  getClientKey,
  parseChatPayload,
  readBodyWithLimit,
} from "../../app/lib/chatValidation.js";
import {
  CHAT_SOURCE_HEADER,
  GROQ_CHAT_URL,
  createChatHandler,
  formatAnswer,
  getFallbackResponse,
} from "../../app/lib/chatHandler.js";

const FAKE_KEY = "gsk_SENTINEL_FAKE";
const silentLogger = { warn() {}, error() {} };

const post = (body, headers = {}) =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });

const okGroq = (content) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

// ---------- parseChatPayload ----------

test("parseChatPayload accepts a normal question", () => {
  assert.deepEqual(parseChatPayload('{"question":"hello"}'), {
    ok: true,
    question: "hello",
  });
});

test("parseChatPayload rejects malformed / non-object / non-string input with 400", () => {
  const cases = [
    ["", CHAT_ERRORS.invalidBody],
    ["{bad", CHAT_ERRORS.invalidBody],
    ["null", CHAT_ERRORS.invalidBody],
    ["123", CHAT_ERRORS.invalidBody],
    ['"str"', CHAT_ERRORS.invalidBody],
    ["[1,2]", CHAT_ERRORS.invalidBody],
    ["{}", CHAT_ERRORS.invalidQuestion],
    ['{"question":null}', CHAT_ERRORS.invalidQuestion],
    ['{"question":123}', CHAT_ERRORS.invalidQuestion],
    ['{"question":""}', CHAT_ERRORS.invalidQuestion],
    ['{"question":"   "}', CHAT_ERRORS.invalidQuestion],
    ['{"question":["a"]}', CHAT_ERRORS.invalidQuestion],
  ];
  for (const [body, error] of cases) {
    const result = parseChatPayload(body);
    assert.equal(result.ok, false, body);
    assert.equal(result.status, 400, body);
    assert.equal(result.error, error, body);
  }
});

test("parseChatPayload enforces the 1000-char question cap (trimmed)", () => {
  assert.equal(parseChatPayload(JSON.stringify({ question: "a".repeat(1000) })).ok, true);
  assert.equal(
    parseChatPayload(JSON.stringify({ question: `  ${"a".repeat(1000)}  ` })).ok,
    true,
  );
  const tooLong = parseChatPayload(JSON.stringify({ question: "a".repeat(1001) }));
  assert.deepEqual(tooLong, { ok: false, status: 400, error: CHAT_ERRORS.questionTooLong });
});

// ---------- body size ----------

test("exceedsContentLength only trips on a numeric header above the cap", () => {
  assert.equal(exceedsContentLength(null), false);
  assert.equal(exceedsContentLength(""), false);
  assert.equal(exceedsContentLength("abc"), false);
  assert.equal(exceedsContentLength(String(MAX_CHAT_BODY_BYTES)), false);
  assert.equal(exceedsContentLength(String(MAX_CHAT_BODY_BYTES + 1)), true);
});

test("readBodyWithLimit stops buffering past the cap even without Content-Length", async () => {
  const chunk = new Uint8Array(4096).fill(97);
  let pulls = 0;
  const stream = new ReadableStream({
    pull(controller) {
      pulls += 1;
      if (pulls > 100) controller.close();
      else controller.enqueue(chunk);
    },
  });
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    body: stream,
    duplex: "half",
  });
  const result = await readBodyWithLimit(request, 16 * 1024);
  assert.deepEqual(result, { ok: false, reason: "too_large" });
  assert.ok(pulls < 10, `pulled ${pulls} chunks`);
});

test("readBodyWithLimit returns text under the cap", async () => {
  const result = await readBodyWithLimit(post('{"question":"héllo"}'));
  assert.deepEqual(result, { ok: true, text: '{"question":"héllo"}' });
});

// ---------- rate limiter ----------

test("createRateLimiter allows `limit` requests per window then 429s with Retry-After", () => {
  let now = 1_000_000;
  const limiter = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => now });
  for (let i = 0; i < 3; i += 1) assert.equal(limiter.check("1.2.3.4").allowed, true);
  const blocked = limiter.check("1.2.3.4");
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 60);
  assert.equal(limiter.check("5.6.7.8").allowed, true, "other clients unaffected");
  now += 30_000;
  assert.equal(limiter.check("1.2.3.4").retryAfterSeconds, 30);
  now += 30_000;
  assert.equal(limiter.check("1.2.3.4").allowed, true, "window reset");
});

test("createRateLimiter bounds memory", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxTracked: 10 });
  for (let i = 0; i < 100; i += 1) limiter.check(`ip-${i}`);
  assert.ok(limiter.size() <= 10, `size ${limiter.size()}`);
});

test("getClientKey prefers first x-forwarded-for hop, then x-real-ip", () => {
  assert.equal(getClientKey(new Headers({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" })), "9.9.9.9");
  assert.equal(getClientKey(new Headers({ "x-real-ip": "8.8.8.8" })), "8.8.8.8");
  assert.equal(getClientKey(new Headers()), "unknown");
});

// ---------- formatting / fallback ----------

test("formatAnswer escapes HTML exactly as before", () => {
  assert.equal(
    formatAnswer(` <img src=x onerror="a('1')"> & ok\nnext `),
    '<div class="leading-relaxed">&lt;img src=x onerror=&quot;a(&#039;1&#039;)&quot;&gt; &amp; ok<br>next</div>',
  );
});

test("getFallbackResponse keeps keyword semantics (last matching key wins)", () => {
  assert.match(getFallbackResponse("how can i contact you?"), /kharevedant05@gmail\.com/);
  assert.match(getFallbackResponse("hello"), /Hello! I am Vedant/);
  assert.match(getFallbackResponse("random"), /I can help with Vedant/);
});

// ---------- handler ----------

test("handler: no API key -> 200 fallback with source + header", async () => {
  const handler = createChatHandler({
    apiKey: undefined,
    getPrompt: () => "SYSTEM",
    fetchImpl: () => assert.fail("must not call upstream"),
    logger: silentLogger,
  });
  const res = await handler(post('{"question":"hello"}'));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get(CHAT_SOURCE_HEADER), "fallback");
  const body = await res.json();
  assert.equal(body.source, "fallback");
  assert.equal(body.answer, getFallbackResponse("hello"));
});

test("handler: model success -> source model, request shape unchanged", async () => {
  const calls = [];
  const handler = createChatHandler({
    apiKey: FAKE_KEY,
    model: "test-model",
    getPrompt: () => "SYSTEM",
    logger: silentLogger,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return okGroq("Model <b>hi</b>\nline2");
    },
  });
  const res = await handler(post('{"question":"what projects?"}'));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get(CHAT_SOURCE_HEADER), "model");
  const body = await res.json();
  assert.deepEqual(body, {
    answer: '<div class="leading-relaxed">Model &lt;b&gt;hi&lt;/b&gt;<br>line2</div>',
    source: "model",
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, GROQ_CHAT_URL);
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${FAKE_KEY}`);
  assert.ok(calls[0].init.signal instanceof AbortSignal, "upstream has a deadline signal");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    model: "test-model",
    temperature: 0.6,
    max_tokens: 800,
    messages: [
      { role: "system", content: "SYSTEM" },
      { role: "user", content: "what projects?" },
    ],
  });
});

test("handler: every upstream failure -> 200 fallback flagged as fallback", async () => {
  const failures = {
    "401": async () => new Response("bad key", { status: 401 }),
    "429": async () => new Response("slow down", { status: 429 }),
    "500": async () => new Response("oops", { status: 500 }),
    "bad json": async () => new Response("<html>", { status: 200 }),
    "empty choices": async () => new Response('{"choices":[]}', { status: 200 }),
    "blank content": async () => okGroq("   "),
    "network": async () => {
      throw new TypeError("fetch failed");
    },
  };
  for (const [name, fetchImpl] of Object.entries(failures)) {
    const handler = createChatHandler({
      apiKey: FAKE_KEY,
      getPrompt: () => "SYSTEM",
      logger: silentLogger,
      fetchImpl,
    });
    const res = await handler(post('{"question":"hello"}'));
    assert.equal(res.status, 200, name);
    assert.equal(res.headers.get(CHAT_SOURCE_HEADER), "fallback", name);
    const body = await res.json();
    assert.equal(body.source, "fallback", name);
    assert.equal(body.answer, getFallbackResponse("hello"), name);
  }
});

test("handler: hung upstream is cut off by the timeout and falls back", async () => {
  const handler = createChatHandler({
    apiKey: FAKE_KEY,
    getPrompt: () => "SYSTEM",
    logger: silentLogger,
    timeoutMs: 50,
    fetchImpl: (url, init) =>
      new Promise((_, reject) => {
        init.signal.addEventListener("abort", () => reject(init.signal.reason));
      }),
  });
  const started = Date.now();
  const res = await handler(post('{"question":"hello"}'));
  assert.ok(Date.now() - started < 2000);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).source, "fallback");
});

test("handler: malformed requests -> 400/413 with generic error and no upstream call", async () => {
  const handler = createChatHandler({
    apiKey: FAKE_KEY,
    getPrompt: () => "SYSTEM",
    logger: silentLogger,
    fetchImpl: () => assert.fail("must not call upstream"),
  });
  const cases = [
    [post(""), 400, CHAT_ERRORS.invalidBody],
    [post("{bad"), 400, CHAT_ERRORS.invalidBody],
    [post("null"), 400, CHAT_ERRORS.invalidBody],
    [post('{"question":123}'), 400, CHAT_ERRORS.invalidQuestion],
    [post(JSON.stringify({ question: "a".repeat(1001) })), 400, CHAT_ERRORS.questionTooLong],
    [post(JSON.stringify({ question: "a".repeat(20 * 1024) })), 413, CHAT_ERRORS.bodyTooLarge],
  ];
  for (const [request, status, error] of cases) {
    const res = await handler(request);
    assert.equal(res.status, status, error);
    assert.deepEqual(await res.json(), { error });
  }
});

test("handler: rate limit returns 429 + Retry-After before reading the body", async () => {
  let calls = 0;
  const handler = createChatHandler({
    apiKey: undefined,
    getPrompt: () => "SYSTEM",
    logger: silentLogger,
    rateLimiter: createRateLimiter({ limit: 2, windowMs: 60_000 }),
    fetchImpl: () => {
      calls += 1;
    },
  });
  const headers = { "x-forwarded-for": "203.0.113.7" };
  assert.equal((await handler(post('{"question":"hi"}', headers))).status, 200);
  assert.equal((await handler(post('{"question":"hi"}', headers))).status, 200);
  const limited = await handler(post('{"question":"hi"}', headers));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "60");
  assert.deepEqual(await limited.json(), { error: CHAT_ERRORS.rateLimited });
  assert.equal(
    (await handler(post('{"question":"hi"}', { "x-forwarded-for": "198.51.100.1" }))).status,
    200,
  );
  assert.equal(calls, 0);
});

test("handler: unexpected internal error -> 500 without internal details", async () => {
  const handler = createChatHandler({
    apiKey: undefined,
    getPrompt: () => "SYSTEM",
    logger: silentLogger,
    rateLimiter: {
      check() {
        throw new Error("SECRET INTERNAL DETAIL");
      },
    },
  });
  const res = await handler(post('{"question":"hi"}'));
  assert.equal(res.status, 500);
  const text = await res.text();
  assert.equal(text, JSON.stringify({ error: CHAT_ERRORS.internal }));
});
