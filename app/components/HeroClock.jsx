"use client";

import { useEffect, useState } from "react";
import { istClock, phaseAt } from "../lib/time";

// Server HTML and the first client render both show a neutral placeholder, so
// hydration is deterministic. After mount the clock shows Chennai time (IST),
// ticks on minute boundaries, and keeps html[data-phase] in sync while the page
// stays open (with a short crossfade via data-phase-prev).
export default function HeroClock() {
  const [clock, setClock] = useState(null);

  useEffect(() => {
    let timer;
    const root = document.documentElement;
    const sync = () => {
      const now = new Date();
      setClock(istClock(now));
      const next = phaseAt(now);
      const current = root.getAttribute("data-phase");
      if (current && current !== next) {
        root.setAttribute("data-phase-prev", current);
        window.setTimeout(() => root.removeAttribute("data-phase-prev"), 1500);
      }
      root.setAttribute("data-phase", next);
    };
    const schedule = () => {
      sync();
      timer = window.setTimeout(schedule, 60000 - (Date.now() % 60000) + 50);
    };
    schedule();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        window.clearTimeout(timer);
        schedule();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <span className="ml-auto text-white/75 tabular-nums">
      <span className="sr-only">Local time in Chennai: </span>
      <time suppressHydrationWarning>{clock ?? "—"}</time> IST
    </span>
  );
}
