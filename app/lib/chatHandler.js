// Handler for POST /api/chat (wired in app/api/chat/route.jsx).
// Request:  { "question": string (1–500 chars) }
// Response: 200 { answer: string, source: "model" | "offline", notice?: string }
//           400 { error: string }      invalid payload
// The answer is plain text; the client renders it as text (never as HTML).
// Provider secrets are read server-side only (GROQ_API_KEY / MY_SECRET_API_KEY).
import getSystemPrompt from "./chatPrompt.js";
import { offlineAnswer, validateQuestion } from "./chatAnswers.js";

const PROVIDER_TIMEOUT_MS = Number(process.env.CHAT_TIMEOUT_MS) || 8000;
const GROQ_BASE = process.env.GROQ_API_BASE || "https://api.groq.com/openai/v1";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const json = (body, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function offline(question, notice) {
  const { answer } = offlineAnswer(question);
  return json({ answer, source: "offline", ...(notice ? { notice } : {}) });
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Request body must be JSON." }, 400);
  }
  const check = validateQuestion(payload?.question);
  if (!check.ok) return json({ error: check.error }, 400);
  const question = check.question;

  const apiKey = process.env.GROQ_API_KEY || process.env.MY_SECRET_API_KEY;
  if (!apiKey) return offline(question);

  try {
    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.6,
        max_tokens: 600,
        messages: [
          { role: "system", content: getSystemPrompt() },
          { role: "user", content: question },
        ],
      }),
    });
    if (!res.ok) throw new Error(`provider status ${res.status}`);
    const data = await res.json();
    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) throw new Error("provider returned no answer");
    return json({ answer: answer.trim().slice(0, 4000), source: "model" });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    console.warn("[chat] provider unavailable:", timedOut ? "timeout" : error?.message);
    return offline(
      question,
      timedOut
        ? "The live assistant took too long, so this answer comes from saved notes."
        : "The live assistant is unavailable, so this answer comes from saved notes.",
    );
  }
}
