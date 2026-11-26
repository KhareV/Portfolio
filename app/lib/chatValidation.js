// Pure request-validation and rate-limit helpers for the /api/chat route.
// Kept free of Next.js imports so they can be unit-tested with `node --test`.

export const MAX_CHAT_BODY_BYTES = 16 * 1024;
export const MAX_QUESTION_CHARS = 1000;
export const RATE_LIMIT_MAX_REQUESTS = 20;
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_TRACKED_CLIENTS = 5000;

export const CHAT_ERRORS = Object.freeze({
  invalidBody: "Invalid request body",
  invalidQuestion: "Invalid question payload",
  questionTooLong: "Question is too long",
  bodyTooLarge: "Request body too large",
  rateLimited: "Too many requests",
  internal: "Failed to process message",
});

/**
 * Returns true when a Content-Length header value is present and exceeds the cap.
 * A missing/garbled header returns false (the streamed body is still capped).
 */
export const exceedsContentLength = (headerValue, maxBytes = MAX_CHAT_BODY_BYTES) => {
  if (headerValue === null || headerValue === undefined || headerValue === "") {
    return false;
  }
  const length = Number(headerValue);
  return Number.isFinite(length) && length > maxBytes;
};

/**
 * Reads a request body as text, refusing to buffer more than `maxBytes`.
 * Resolves to { ok: true, text } or { ok: false, reason: "too_large" | "unreadable" }.
 */
export const readBodyWithLimit = async (request, maxBytes = MAX_CHAT_BODY_BYTES) => {
  if (!request.body) {
    return { ok: true, text: "" };
  }

  const reader = request.body.getReader();
  const chunks = [];
  let received = 0;

  while (true) {
    let result;
    try {
      result = await reader.read();
    } catch {
      return { ok: false, reason: "unreadable" };
    }
    const { done, value } = result;
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        // ignore cancellation errors
      }
      return { ok: false, reason: "too_large" };
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { ok: true, text: new TextDecoder().decode(merged) };
};

/**
 * Parses and validates the JSON body text of a chat request.
 * Returns { ok: true, question } or { ok: false, status, error } with a
 * generic client-facing error (never an internal exception message).
 */
export const parseChatPayload = (bodyText, maxChars = MAX_QUESTION_CHARS) => {
  let payload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return { ok: false, status: 400, error: CHAT_ERRORS.invalidBody };
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, status: 400, error: CHAT_ERRORS.invalidBody };
  }

  const { question } = payload;

  if (typeof question !== "string" || !question.trim()) {
    return { ok: false, status: 400, error: CHAT_ERRORS.invalidQuestion };
  }

  if (question.trim().length > maxChars) {
    return { ok: false, status: 400, error: CHAT_ERRORS.questionTooLong };
  }

  return { ok: true, question };
};

/**
 * Best-effort client identifier from proxy headers. On Vercel the platform
 * sets x-forwarded-for; elsewhere it can be spoofed, so this limiter is only
 * a coarse abuse brake, not a security boundary.
 */
export const getClientKey = (headers) => {
  const forwarded = headers?.get?.("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = headers?.get?.("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();
  return "unknown";
};

/**
 * Fixed-window in-memory rate limiter. State is per server instance (resets on
 * cold start / not shared between serverless instances), hence "best-effort".
 */
export const createRateLimiter = ({
  limit = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS,
  maxTracked = RATE_LIMIT_MAX_TRACKED_CLIENTS,
  now = () => Date.now(),
} = {}) => {
  const buckets = new Map();

  const prune = (currentTime) => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= currentTime) buckets.delete(key);
    }
    // Still too many distinct clients: drop the oldest entries (Map keeps insertion order).
    while (buckets.size >= maxTracked) {
      const oldestKey = buckets.keys().next().value;
      buckets.delete(oldestKey);
    }
  };

  const check = (key) => {
    const currentTime = now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= currentTime) {
      if (!bucket && buckets.size >= maxTracked) prune(currentTime);
      bucket = { count: 0, resetAt: currentTime + windowMs };
      buckets.delete(key);
      buckets.set(key, bucket);
    }

    if (bucket.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - currentTime) / 1000)),
      };
    }

    bucket.count += 1;
    return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
  };

  return { check, size: () => buckets.size };
};
