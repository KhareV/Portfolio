import { test } from "node:test";
import assert from "node:assert/strict";

import { TimeoutError, withTimeout } from "../../app/lib/withTimeout.js";

test("withTimeout resolves with the underlying value", async () => {
  assert.equal(await withTimeout(Promise.resolve(42), 50), 42);
});

test("withTimeout propagates the underlying rejection", async () => {
  await assert.rejects(withTimeout(Promise.reject(new Error("send failed")), 50), /send failed/);
});

test("withTimeout rejects with TimeoutError for a hung promise", async () => {
  const started = Date.now();
  await assert.rejects(withTimeout(new Promise(() => {}), 30), TimeoutError);
  assert.ok(Date.now() - started < 1000);
});
