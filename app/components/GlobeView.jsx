"use client";

import { useEffect, useRef } from "react";
import Globe from "react-globe.gl";

/**
 * react-globe.gl with an explicit teardown. The About card still mounts the
 * globe when it scrolls into view and unmounts it when it leaves (so the
 * library's animate-in plays on every entry, exactly as before), but the
 * library never disposes its renderer or stops its frame tickers on unmount:
 * every entry leaked a WebGL context (Chrome then evicted the oldest — the
 * project scene) and left animation loops running. We release them here.
 */
export default function GlobeView(props) {
  const globeRef = useRef(null);

  useEffect(() => {
    return () => {
      const globe = globeRef.current;
      if (!globe) return;
      try {
        globe.pauseAnimation?.();
        globe.controls?.()?.dispose?.();
        const renderer = globe.renderer?.();
        renderer?.dispose?.();
        renderer?.forceContextLoss?.();
      } catch (error) {
        console.warn("Globe teardown failed:", error);
      }
    };
  }, []);

  return <Globe ref={globeRef} {...props} />;
}
