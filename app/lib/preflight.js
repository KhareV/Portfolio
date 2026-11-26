"use client";

import { useEffect, useState } from "react";

// Fetch a scene's optional assets in code we control before mounting its
// renderer. A network failure here keeps the poster and never reaches the
// WebGL loaders (whose separate React root reports errors globally). The
// loaders then read the same URLs from the HTTP cache.
const results = new Map();

export function preflight(urls) {
  const key = urls.join("|");
  if (!results.has(key)) {
    results.set(
      key,
      Promise.all(
        urls.map((u) =>
          fetch(u, { cache: "force-cache" }).then((r) => {
            if (!r.ok) throw new Error(`${u} → ${r.status}`);
            return r.arrayBuffer();
          }),
        ),
      ).then(
        () => true,
        (error) => {
          console.warn("[scene] optional assets unavailable:", error?.message || error);
          results.delete(key); // allow a later retry (e.g. after reconnecting)
          return false;
        },
      ),
    );
  }
  return results.get(key);
}

/** "idle" until `enabled`, then "checking" → "ok" | "failed". */
export function usePreflight(urls, enabled) {
  const [state, setState] = useState("idle");
  const key = urls.join("|");
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setState((s) => (s === "ok" ? s : "checking"));
    preflight(key.split("|")).then((ok) => alive && setState(ok ? "ok" : "failed"));
    return () => {
      alive = false;
    };
  }, [enabled, key]);
  return state;
}

export const DRACO_FILES = ["/draco/draco_wasm_wrapper.js", "/draco/draco_decoder.wasm"];
