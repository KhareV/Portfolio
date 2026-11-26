import getSystemPrompt from "./prompt";
import {
  DEFAULT_GROQ_MODEL,
  createChatHandler,
} from "../../lib/chatHandler.js";
import { createRateLimiter } from "../../lib/chatValidation.js";

// Server-only key lookup. GROQ_API_KEY is the recommended name.
// MY_SECRET_API_KEY is a legacy server-side alias.
// DEPRECATED: NEXT_PUBLIC_GROQ_API_KEY is still honoured so an existing
// deployment does not silently lose chat, but NEXT_PUBLIC_* values are baked
// into build output; move the key to GROQ_API_KEY and delete this fallback.
const apiKey =
  process.env.GROQ_API_KEY ||
  process.env.MY_SECRET_API_KEY ||
  process.env.NEXT_PUBLIC_GROQ_API_KEY;

const GROQ_MODEL = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

// Best-effort, per-instance limiter (20 requests / 5 minutes per client IP).
const rateLimiter = createRateLimiter();

const handleChat = createChatHandler({
  apiKey,
  model: GROQ_MODEL,
  getPrompt: getSystemPrompt,
  rateLimiter,
});

export async function POST(request) {
  return handleChat(request);
}
