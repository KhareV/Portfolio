"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { profile } from "../content/site";
import SceneBoundary from "../components/SceneBoundary";
import { useViewport, useVisualTier } from "../lib/useVisualTier";

const Prism = dynamic(() => import("./Prism"), { ssr: false, loading: () => null });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DRAFT_KEY = "contact-draft-v1";
const EMAILJS = {
  service: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  template: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  key: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};
const configured = Boolean(EMAILJS.service && EMAILJS.template && EMAILJS.key);
const EMPTY = { name: "", email: "", message: "" };

const mailtoFor = (form) => {
  const subject = encodeURIComponent(`Portfolio enquiry${form.name ? ` from ${form.name}` : ""}`);
  const body = encodeURIComponent(`${form.message || ""}${form.email ? `\n\nReply to: ${form.email}` : ""}`);
  return `mailto:${profile.email}?subject=${subject}&body=${body}`;
};

export default function Contact() {
  const tier = useVisualTier();
  const [bgRef, near, active] = useViewport({ nearMargin: "300px 0px" });
  const [bgFailed, setBgFailed] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ kind: "idle", text: "" }); // idle|sending|sent|error|unconfigured|invalid
  const sendingRef = useRef(false);

  // Retain an unsent draft for this tab (survives reloads and failures).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
      if (saved && typeof saved === "object") setForm({ ...EMPTY, ...saved });
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (form.name || form.email || form.message) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      else sessionStorage.removeItem(DRAFT_KEY);
    } catch {}
  }, [form]);

  const errors = {
    name: form.name.trim() ? "" : "Enter your name.",
    email: EMAIL_RE.test(form.email.trim()) ? "" : "Enter a valid email address.",
    message: form.message.trim() ? "" : "Enter a message.",
  };
  const show = (f) => (touched[f] || status.kind === "invalid") && errors[f];

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sendingRef.current) return; // duplicate submit guard
    if (errors.name || errors.email || errors.message) {
      setStatus({ kind: "invalid", text: "Please fix the highlighted fields." });
      const first = ["name", "email", "message"].find((f) => errors[f]);
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    if (!configured) {
      setStatus({ kind: "unconfigured", text: "The form can't send messages from this site right now." });
      return;
    }
    sendingRef.current = true;
    setStatus({ kind: "sending", text: "Sending…" });
    try {
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.send(
        EMAILJS.service,
        EMAILJS.template,
        { from_name: form.name.trim(), from_email: form.email.trim(), to_name: profile.name, to_email: profile.email, message: form.message.trim() },
        { publicKey: EMAILJS.key },
      );
      setForm(EMPTY);
      setTouched({});
      setStatus({ kind: "sent", text: "Thanks — your message was sent. I'll reply by email." });
    } catch (error) {
      console.warn("[contact] send failed", error?.status || error?.message || error);
      setStatus({ kind: "error", text: "Your message wasn't sent. Your draft is kept below — try again, or email me directly." });
    } finally {
      sendingRef.current = false;
    }
  };

  const field = "w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-400";
  const border = (f) => (show(f) ? "border-rose-400/80" : "border-white/15 focus:border-white/40");

  return (
    <section id="contact" data-anchor aria-labelledby="contact-title" className="relative isolate overflow-hidden bg-black font-site-default">
      <div ref={bgRef} aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.08),transparent_50%),radial-gradient(circle_at_75%_65%,rgba(255,255,255,0.06),transparent_52%),linear-gradient(180deg,#05060a_0%,#0a0d13_100%)]">
        {tier === "full" && near && !bgFailed ? (
          <SceneBoundary name="prism" onFail={() => setBgFailed(true)} fallback={null}>
            <Prism animationType="3drotate" timeScale={0.5} height={3.6} baseWidth={5.5} scale={3.6} hueShift={0} colorFrequency={1} noise={0} glow={1.2} hoverStrength={1.5} inertia={0.08} transparent steps={84} paused={!active} onFail={() => setBgFailed(true)} />
          </SceneBoundary>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
      </div>

      <div className="mx-auto flex min-h-[100svh] max-w-3xl flex-col justify-center px-5 py-24 sm:px-6">
        <h2 id="contact-title" data-anchor-heading className="text-center text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Let&apos;s talk
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-base text-slate-300 sm:text-lg">
          Whether you&apos;re looking to build something new or improve what exists, I&apos;m here to help bring your vision to life.
        </p>
        <p className="mt-6 text-center text-lg text-white">
          Email{" "}
          <a href={`mailto:${profile.email}`} className="font-medium underline decoration-white/40 underline-offset-4 hover:decoration-white">
            {profile.email}
          </a>
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-10 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-8" aria-describedby="contact-status">
          {[
            ["name", "Name", "text", "name"],
            ["email", "Email", "email", "email"],
          ].map(([f, label, type, ac]) => (
            <div key={f}>
              <label htmlFor={`contact-${f}`} className="mb-2 block text-sm font-medium text-slate-200">
                {label}
              </label>
              <input id={`contact-${f}`} name={f} type={type} autoComplete={ac} value={form[f]} onChange={onChange} onBlur={() => setTouched((t) => ({ ...t, [f]: true }))} required aria-invalid={Boolean(show(f))} aria-describedby={show(f) ? `contact-${f}-error` : undefined} className={`${field} ${border(f)}`} />
              {show(f) ? (
                <p id={`contact-${f}-error`} className="mt-2 text-sm text-rose-300">
                  {errors[f]}
                </p>
              ) : null}
            </div>
          ))}
          <div>
            <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-slate-200">
              Message
            </label>
            <textarea id="contact-message" name="message" rows={5} value={form.message} onChange={onChange} onBlur={() => setTouched((t) => ({ ...t, message: true }))} required aria-invalid={Boolean(show("message"))} aria-describedby={show("message") ? "contact-message-error" : undefined} className={`${field} ${border("message")} resize-y`} />
            {show("message") ? (
              <p id="contact-message-error" className="mt-2 text-sm text-rose-300">
                {errors.message}
              </p>
            ) : null}
          </div>

          <button type="submit" disabled={status.kind === "sending"} aria-disabled={status.kind === "sending"} className="js-only flex min-h-12 w-full items-center justify-center rounded-lg border border-white/25 bg-white/10 font-medium text-white hover:bg-white/15 disabled:cursor-wait disabled:opacity-60">
            {status.kind === "sending" ? "Sending…" : "Send message"}
          </button>
          <p className="no-js-only text-sm text-slate-300">
            Sending from this form needs JavaScript —{" "}
            <a className="underline" href={`mailto:${profile.email}`}>
              email {profile.email}
            </a>{" "}
            instead.
          </p>

          <div id="contact-status" role="status" aria-live="polite" className="min-h-[1.5rem] text-sm">
            {status.kind === "sent" ? <p className="text-emerald-300">{status.text}</p> : null}
            {status.kind === "invalid" ? <p className="text-rose-300">{status.text}</p> : null}
            {status.kind === "error" || status.kind === "unconfigured" ? (
              <p className="text-amber-200">
                {status.text}{" "}
                <a className="font-medium text-white underline underline-offset-4" href={mailtoFor(form)}>
                  Open your email app with this message
                </a>{" "}
                or write to {profile.email}.
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
