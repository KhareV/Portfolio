"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { funFacts, profile, starterQuestions } from "../content/site";
import { MAX_QUESTION_LENGTH } from "../lib/chatAnswers";
import { usePrefersReducedMotion, useViewport } from "../lib/useVisualTier";

const REQUEST_TIMEOUT_MS = 12000;

// Render plain text with clickable URLs/emails; never injects HTML.
function RichText({ text }) {
  const parts = String(text).split(/(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.]+)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part))
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all text-emerald-300 underline underline-offset-2">
          {part}
        </a>
      );
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part))
      return (
        <a key={i} href={`mailto:${part}`} className="text-emerald-300 underline underline-offset-2">
          {part}
        </a>
      );
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function ChatBox() {
  const [messages, setMessages] = useState([]); // {id, q, a?, state: pending|done|error, source?, notice?}
  const [draft, setDraft] = useState("");
  const [factIndex, setFactIndex] = useState(0);
  const logRef = useRef(null);
  const [rootRef, , active] = useViewport();
  const busy = messages.some((m) => m.state === "pending");
  const reducedMotion = usePrefersReducedMotion();

  // Fun-fact ticker only runs while visible, tab visible, and motion allowed.
  useEffect(() => {
    if (!active || reducedMotion) return;
    const id = window.setInterval(() => setFactIndex((i) => (i + 1) % funFacts.length), 6000);
    return () => window.clearInterval(id);
  }, [active, reducedMotion]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const ask = useCallback(
    async (question, retryId) => {
      const q = String(question || "").trim();
      if (!q || busy) return;
      const id = retryId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setMessages((prev) =>
        retryId
          ? prev.map((m) => (m.id === id ? { ...m, state: "pending", a: undefined } : m))
          : [...prev, { id, q, state: "pending" }],
      );
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || typeof data.answer !== "string") throw new Error(data.error || `status ${res.status}`);
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, state: "done", a: data.answer, source: data.source, notice: data.notice } : m)));
      } catch (error) {
        const reason = error?.name === "TimeoutError" ? "The assistant took too long to respond." : "The assistant could not be reached.";
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, state: "error", a: reason } : m)));
      }
    },
    [busy],
  );

  const onSubmit = (e) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    ask(q);
  };

  return (
    <div ref={rootRef} className="flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-950/75 text-slate-100 shadow-2xl backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="text-lg font-medium text-white">Ask about my work</h2>
          <p className="mt-0.5 text-xs text-slate-300">Projects, skills, experience, contact.</p>
        </div>
      </div>

      <div className="border-b border-white/10 bg-black/20 px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/90">Fun fact</p>
        <p className="mt-1 min-h-[2.5rem] text-sm leading-snug text-slate-200">{funFacts[factIndex]}</p>
      </div>

      <div ref={logRef} role="log" aria-live="polite" aria-label="Conversation" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-[13.5px] leading-relaxed">
        {messages.length === 0 ? (
          <p className="text-slate-300">
            Hi — I&apos;m a small assistant for {profile.name}&apos;s portfolio. Pick a question below or type your own.
          </p>
        ) : null}
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col gap-2">
            <p className="max-w-[85%] self-end rounded-2xl rounded-tr-sm border border-emerald-400/25 bg-emerald-500/15 px-3.5 py-2 text-emerald-50">
              <span className="sr-only">You asked: </span>
              {m.q}
            </p>
            <div className="max-w-[92%] self-start whitespace-pre-line rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-3.5 py-2.5">
              {m.state === "pending" ? (
                <span className="text-slate-400">Thinking…</span>
              ) : m.state === "error" ? (
                <span className="flex flex-col items-start gap-2">
                  <span className="text-rose-200">{m.a}</span>
                  <button type="button" onClick={() => ask(m.q, m.id)} disabled={busy} className="rounded-full border border-white/25 px-3 py-1 text-xs text-white hover:bg-white/10 disabled:opacity-50">
                    Try again
                  </button>
                  <span className="text-xs text-slate-400">
                    Or email <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>
                  </span>
                </span>
              ) : (
                <>
                  <RichText text={m.a} />
                  {m.source === "offline" ? (
                    <span className="mt-2 block text-[11px] text-slate-400">{m.notice ?? "Answered from saved notes."}</span>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 bg-black/25 p-4">
        <div className="js-only mb-3 flex flex-wrap gap-2">
          {starterQuestions.map((q) => (
            <button key={q} type="button" onClick={() => ask(q)} disabled={busy} className="min-h-9 rounded-full border border-white/15 bg-white/5 px-3 text-xs text-slate-200 hover:bg-white/10 disabled:opacity-50">
              {q}
            </button>
          ))}
        </div>
        <form className="js-only relative flex items-center" onSubmit={onSubmit}>
          <label htmlFor="chat-input" className="sr-only">
            Your question
          </label>
          <input
            id="chat-input"
            value={draft}
            maxLength={MAX_QUESTION_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask me anything…"
            autoComplete="off"
            className="h-12 w-full rounded-full border border-white/15 bg-black/40 pl-5 pr-24 text-sm text-white placeholder:text-slate-400 focus:border-emerald-400/60"
          />
          <button type="submit" disabled={busy || !draft.trim()} className="absolute right-1.5 h-9 rounded-full bg-emerald-500 px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-400">
            Send
          </button>
        </form>
        <p className="no-js-only text-sm text-slate-300">
          The assistant needs JavaScript. You can email <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a>.
        </p>
      </div>
    </div>
  );
}
