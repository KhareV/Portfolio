"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { experience, profile } from "../content/site";
import SceneBoundary from "../components/SceneBoundary";
import { useViewport, useVisualTier } from "../lib/useVisualTier";
import { usePreflight } from "../lib/preflight";

const AVATAR_ASSETS = ["/models/human/developer.glb", ...["idle", "salute", "clapping", "victory"].map((n) => `/models/animations/${n}.fbx`)];

const ExperienceScene = dynamic(() => import("../components/WorkExperienceScene"), { ssr: false, loading: () => null });

export default function Experience() {
  const tier = useVisualTier();
  const developerRef = useRef(null);
  const idleTimer = useRef(null);
  const [failed, setFailed] = useState(false);
  const [sceneRef, near, active] = useViewport({ nearMargin: "300px 0px" });
  const assets = usePreflight(AVATAR_ASSETS, tier === "full" && near);
  const showScene = tier === "full" && !failed && assets !== "failed";

  const play = useCallback((name) => {
    window.clearTimeout(idleTimer.current);
    developerRef.current?.playAnimation?.(name);
  }, []);
  const settle = useCallback(() => {
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => developerRef.current?.playAnimation?.("idle"), 200);
  }, []);

  return (
    <section id="experience" data-anchor aria-labelledby="experience-title" className="relative bg-[#FEFFFC] px-5 py-20 sm:px-10 sm:py-24">
      {/* Legacy fragment: #work pointed here before Work meant projects. */}
      <span id="work" data-anchor aria-hidden="true" className="absolute top-0" />
      <div className="mx-auto max-w-7xl">
        <h2 id="experience-title" data-anchor-heading className="text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
          Experience
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">{profile.walmartRole}.</p>

        <div className={`mt-10 grid grid-cols-1 gap-6 ${showScene ? "lg:grid-cols-3" : ""}`}>
          {showScene ? (
            <div ref={sceneRef} className="relative hidden h-[28rem] overflow-hidden rounded-2xl border border-[#d9dfd1] bg-[#f6f8f2] lg:block" aria-hidden="true">
              {near && assets === "ok" ? (
                <SceneBoundary name="avatar" onFail={() => setFailed(true)} fallback={null}>
                  <ExperienceScene developerRef={developerRef} isActive={active} onFail={() => setFailed(true)} />
                </SceneBoundary>
              ) : null}
            </div>
          ) : null}

          <ol className={`rounded-2xl border border-[#d9dfd1] bg-[#f8faf4] p-3 sm:p-5 ${showScene ? "lg:col-span-2" : ""}`}>
            {experience.map((item) => (
              <li
                key={item.id}
                onPointerEnter={() => play(item.animation)}
                onPointerLeave={settle}
                onFocus={() => play(item.animation)}
                onBlur={settle}
                className="grid grid-cols-[auto_1fr] items-start gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-[#d4dcc8] hover:bg-[#eef3e7] sm:gap-5 sm:p-4"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[#d7dfcc] bg-white p-2">
                  <Image unoptimized src={item.icon} alt="" width={40} height={40} className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.org}</h3>
                  <p className="text-sm text-slate-600">
                    {item.role} · <span>{item.dates}</span>
                  </p>
                  <p className="mt-2 text-slate-700">{item.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
