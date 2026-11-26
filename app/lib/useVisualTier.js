"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { decideTier, readTierInput } from "./visualPolicy";

// Shared store: computed once on the client, recomputed when motion or
// connection preferences change while the page is open.
let tier = null;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

function compute() {
  try {
    tier = decideTier(readTierInput());
  } catch {
    tier = "static";
  }
  if (typeof document !== "undefined") document.documentElement.dataset.visuals = tier;
  return tier;
}

let wired = false;
function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    compute();
    emit();
  };
  mq.addEventListener?.("change", onChange);
  const conn = navigator.connection;
  conn?.addEventListener?.("change", onChange);
}

function subscribe(cb) {
  wire();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// "pending" on the server and during hydration, so markup is deterministic.
export function useVisualTier() {
  return useSyncExternalStore(
    subscribe,
    () => tier ?? compute(),
    () => "pending",
  );
}

/**
 * Viewport state for one element via a callback ref.
 *   near   – latched true once within `nearMargin` of the viewport (load gate)
 *   active – live: intersecting (with `activeMargin`) AND the tab is visible
 * Elements attached later (e.g. after the visual tier resolves) are observed
 * when they attach; nothing is assumed while the ref is empty.
 */
export function useViewport({ nearMargin = "600px 0px", activeMargin = "0px" } = {}) {
  const [el, setEl] = useState(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      setInView(true);
      return;
    }
    const nearIo = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setNear(true);
        nearIo.disconnect();
      }
    }, { rootMargin: nearMargin });
    const activeIo = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: activeMargin });
    nearIo.observe(el);
    activeIo.observe(el);
    return () => {
      nearIo.disconnect();
      activeIo.disconnect();
    };
  }, [el, nearMargin, activeMargin]);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return [setEl, near, inView && pageVisible];
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener?.("change", cb);
      return () => mq.removeEventListener?.("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}
