"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import SceneBoundary from "./SceneBoundary";
import { useViewport, useVisualTier } from "../lib/useVisualTier";

// ---- Copy email --------------------------------------------------------------
export function CopyEmail({ email }) {
  const [status, setStatus] = useState("idle"); // idle | copied | failed
  const timer = useRef(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        ok = true;
      }
    } catch {}
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = email;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {}
    }
    setStatus(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <a href={`mailto:${email}`} className="rounded-xl border border-[#cfd8c4] bg-[#f0f3ea] px-4 py-3 font-medium text-[#2f3d2f] underline-offset-4 hover:underline">
          {email}
        </a>
        <button type="button" onClick={copy} className="js-only rounded-xl border border-[#cfd8c4] bg-white px-4 py-3 text-sm font-medium text-[#2f3d2f] hover:border-green-600/50">
          {status === "copied" ? "Copied" : "Copy"}
          <span className="sr-only"> email address</span>
        </button>
      </div>
      <p role="status" className="min-h-[1.25rem] text-sm text-green-700">
        {status === "copied" ? "Email copied to clipboard." : status === "failed" ? "Couldn't copy — select the address above instead." : ""}
      </p>
    </div>
  );
}

// ---- Marquee pause offscreen -------------------------------------------------
export function PauseOffscreen({ children, className = "" }) {
  const [ref, , active] = useViewport();
  return (
    <div ref={ref} data-paused={active ? "false" : "true"} className={className}>
      {children}
    </div>
  );
}

// ---- Globe -------------------------------------------------------------------
const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false, loading: () => null });

// Same points as before the repair: ten capitals plus Chennai (labelled).
const LOCATIONS = [
  [55.7558, 37.6173], [45.4215, -75.6972], [39.9042, 116.4074], [38.8977, -77.0365], [-15.7975, -47.8919],
  [-35.2809, 149.13], [28.6139, 77.209], [-34.6037, -58.3816], [51.1694, 71.4491], [36.7538, 3.0588],
].map(([lat, lng]) => ({ lat, lng, color: "#c17a57" }))
  .concat({ lat: 13.0827, lng: 80.2707, color: "#fbbf24", label: "Chennai, India" });

export function AboutGlobe() {
  const tier = useVisualTier();
  const [ref, near, active] = useViewport({ nearMargin: "200px 0px" });
  const [failed, setFailed] = useState(false);
  const show = tier === "full" && near && !failed;
  return (
    <div ref={ref} className="relative grid h-[260px] w-full place-items-center overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_30%_30%,#1e3a5f_0%,#0f172a_50%,#020617_100%)] sm:h-[326px]">
      {/* Static fallback is always underneath. */}
      <div className="absolute inset-0 grid place-items-center px-6 text-center">
        <p className="text-sm leading-relaxed text-slate-100/90 sm:text-base">
          Based in Chennai, India · IST (UTC+5:30)
          <br />
          Open to remote collaboration across time zones.
        </p>
      </div>
      {show ? (
        <div className="absolute inset-0 bg-[#020617]" aria-hidden="true">
          <SceneBoundary name="globe" onFail={() => setFailed(true)} fallback={null}>
            <GlobeScene locations={LOCATIONS} active={active} onFail={() => setFailed(true)} />
          </SceneBoundary>
        </div>
      ) : null}
    </div>
  );
}
