// Framework-agnostic implementation of POST /api/chat. The Next.js route in
// app/api/chat/route.jsx wires in env, prompt and the shared rate limiter;
// unit tests inject a mock fetch so the real Groq API is never called.

import {
  CHAT_ERRORS,
  MAX_CHAT_BODY_BYTES,
  MAX_QUESTION_CHARS,
  exceedsContentLength,
  getClientKey,
  parseChatPayload,
  readBodyWithLimit,
} from "./chatValidation.js";

export const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
export const GROQ_TIMEOUT_MS = 15000;
export const CHAT_SOURCE_HEADER = "x-chat-source";

export const escapeHtml = (input) => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const formatAnswer = (answer) => {
  const safeText = escapeHtml(String(answer).trim());
  return `<div class="leading-relaxed">${safeText.replace(/\n/g, "<br>")}</div>`;
};

export function getFallbackResponse(question) {
  const responseMap = {
    hello:
      "Hello! I am Vedant's assistant. Ask me about projects, skills, work, or contact details.",
    "who are you":
      "I am Vedant's portfolio assistant. I can answer questions about his background, projects, and experience.",
    "who r u":
      "I am Vedant's portfolio assistant. Ask me anything about his work and achievements.",
    contact:
      "You can reach Vedant at kharevedant05@gmail.com and connect on LinkedIn: https://www.linkedin.com/in/vedantkhare",
    default:
      "I can help with Vedant's profile, projects, skills, hackathons, and contact details. Ask any question.",
  };

  let answer = responseMap.default;
  const normalizedQuestion = question.toLowerCase();

  Object.keys(responseMap).forEach((key) => {
    if (normalizedQuestion.includes(key)) {
      answer = responseMap[key];
    }
  });

  return formatAnswer(answer);
}

const jsonError = (status, error, extraHeaders) =>
  Response.json({ error }, { status, headers: extraHeaders });

const answerResponse = (answer, source) =>
  Response.json(
    { answer, source },
    { status: 200, headers: { [CHAT_SOURCE_HEADER]: source } },
  );

class UpstreamError extends Error {
  constructor(reason) {
    super(reason);
    this.name = "UpstreamError";
  }
}

export const createChatHandler = ({
  apiKey,
  model = DEFAULT_GROQ_MODEL,
  getPrompt,
  fetchImpl = (...args) => fetch(...args),
  rateLimiter,
  timeoutMs = GROQ_TIMEOUT_MS,
  maxBodyBytes = MAX_CHAT_BODY_BYTES,
  maxQuestionChars = MAX_QUESTION_CHARS,
  logger = console,
}) => {
  const callModel = async (question) => {
    const prompt = getPrompt();

    const response = await fetchImpl(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: question,
          },
        ],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      // Status only: the upstream body is not logged.
      throw new UpstreamError(`Groq request failed with status ${response.status}`);
    }

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new UpstreamError("Groq returned a non-JSON body");
    }

    const answer = payload?.choices?.[0]?.message?.content;

    if (typeof answer !== "string" || !answer.trim()) {
      throw new UpstreamError("Invalid response format from Groq");
    }

    return formatAnswer(answer);
  };

  return async function handleChat(request) {
    try {
      if (rateLimiter) {
        const verdict = rateLimiter.check(getClientKey(request.headers));
        if (!verdict.allowed) {
          return jsonError(429, CHAT_ERRORS.rateLimited, {
            "Retry-After": String(verdict.retryAfterSeconds),
          });
        }
      }

      if (exceedsContentLength(request.headers.get("content-length"), maxBodyBytes)) {
        return jsonError(413, CHAT_ERRORS.bodyTooLarge);
      }

      const body = await readBodyWithLimit(request, maxBodyBytes);
      if (!body.ok) {
        return body.reason === "too_large"
          ? jsonError(413, CHAT_ERRORS.bodyTooLarge)
          : jsonError(400, CHAT_ERRORS.invalidBody);
      }

      const parsed = parseChatPayload(body.text, maxQuestionChars);
      if (!parsed.ok) {
        return jsonError(parsed.status, parsed.error);
      }

      const { question } = parsed;

      if (!apiKey) {
        logger.warn("Groq API key not found, using fallback responses");
        return answerResponse(getFallbackResponse(question), "fallback");
      }

      try {
        const answer = await callModel(question);
        return answerResponse(answer, "model");
      } catch (aiError) {
        const reason =
          aiError?.name === "TimeoutError"
            ? `Groq request timed out after ${timeoutMs} ms`
            : aiError?.name === "UpstreamError"
              ? aiError.message
              : `Groq request error (${aiError?.name || "Error"})`;
        logger.error("AI Error (serving fallback):", reason);
        // Keep HTTP 200 + friendly text (the chat UI depends on it); the
        // `source` field / x-chat-source header make degradation observable.
        return answerResponse(getFallbackResponse(question), "fallback");
      }
    } catch (error) {
      logger.error("Error processing chat request:", error?.name || "Error");
      return jsonError(500, CHAT_ERRORS.internal);
    }
  };
};
