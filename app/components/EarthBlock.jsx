"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SceneBoundary from "./SceneBoundary";
import { useViewport, useVisualTier } from "../lib/useVisualTier";
import { DRACO_FILES, usePreflight } from "../lib/preflight";

const ASSETS = ["/planet/scene.opt.glb", ...DRACO_FILES];

const EarthScene = dynamic(() => import("./Earth"), { ssr: false, loading: () => null });

// Decorative night-sky interlude before Contact. Static gradient for every
// tier; the planet scene is added only on "full", only when near, and is
// paused whenever it is offscreen or the tab is hidden.
export default function EarthBlock() {
  const tier = useVisualTier();
  const [ref, near, active] = useViewport({ nearMargin: "500px 0px" });
  const [failed, setFailed] = useState(false);
  const assets = usePreflight(ASSETS, tier === "full" && near);
  return (
    <div aria-hidden="true" className="bg-black px-4 py-6">
      <div
        ref={ref}
        className="relative mx-auto h-[70vh] max-h-[720px] min-h-[360px] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_30%_35%,rgba(125,211,252,0.15),transparent_52%),radial-gradient(circle_at_72%_64%,rgba(167,139,250,0.15),transparent_48%),linear-gradient(180deg,#020617_0%,#000_100%)]"
      >
        {tier === "full" && near && assets === "ok" && !failed ? (
          <SceneBoundary name="earth" onFail={() => setFailed(true)} fallback={null}>
            <EarthScene active={active} onFail={() => setFailed(true)} />
          </SceneBoundary>
        ) : null}
      </div>
    </div>
  );
}
