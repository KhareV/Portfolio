"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { projects } from "../content/site";
import SceneBoundary from "../components/SceneBoundary";
import { useViewport, useVisualTier } from "../lib/useVisualTier";
import { DRACO_FILES, usePreflight } from "../lib/preflight";

const SCENE_ASSETS = ["/models/computer.glb", ...DRACO_FILES];

// The 3D monitor is an optional layer over the poster. It is only requested on
// the "full" tier, only near the viewport, and any failure leaves the poster.
const ProjectScene = dynamic(() => import("../components/ProjectScene"), { ssr: false, loading: () => null });

const COUNT = projects.length;

function PreviewVideo({ project }) {
  // User-initiated playback for lite/static tiers (no autoplay, no data cost
  // until asked). Reduced-motion visitors can still choose to play it.
  const [playing, setPlaying] = useState(false);
  if (!playing) {
    return (
      <button type="button" onClick={() => setPlaying(true)} className="js-only absolute bottom-4 left-4 z-20 rounded-full bg-slate-950/80 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-slate-900">
        Play preview <span className="sr-only">of {project.title}</span>
      </button>
    );
  }
  return (
    <video
      key={project.slug}
      className="absolute inset-0 z-10 h-full w-full bg-black object-contain"
      src={project.video}
      poster={project.poster}
      controls
      autoPlay
      muted
      playsInline
      loop
      aria-label={`Screen recording of ${project.title}`}
    />
  );
}

export default function Projects() {
  const [index, setIndex] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [flat, setFlat] = useState(false); // visitor chose the full-size screenshot
  const tier = useVisualTier();
  const [viewerRef, near, active] = useViewport({ nearMargin: "150px 0px", activeMargin: "100px 0px" });
  const project = projects[index];
  const assets = usePreflight(SCENE_ASSETS, tier === "full" && near);
  const wantScene = tier === "full" && near && assets === "ok" && !sceneFailed && !flat;
  const sceneUnavailable = sceneFailed || assets === "failed";

  const go = useCallback((next) => {
    setSceneReady(false);
    setIndex((i) => (typeof next === "function" ? next(i) : next));
  }, []);
  const prev = useCallback(() => go((i) => (i - 1 + COUNT) % COUNT), [go]);
  const next = useCallback(() => go((i) => (i + 1) % COUNT), [go]);

  const onKeyDown = (e) => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  return (
    <section id="projects" data-anchor aria-labelledby="projects-title" className="relative bg-[#FEFFFC] px-5 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <h2 id="projects-title" data-anchor-heading className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Selected work
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Five projects with their source code. Each preview is a real capture of the running app.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Viewer */}
          <div
            ref={viewerRef}
            role="group"
            aria-roledescription="carousel"
            aria-label="Project viewer. Use the left and right arrow keys to change project."
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="lg:col-span-8 rounded-[2rem] focus-visible:outline-offset-4"
          >
            <figure className="relative aspect-video w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)]">
              <Image
                key={`poster-${project.slug}`}
                src={project.poster}
                alt={project.posterAlt}
                fill
                sizes="(min-width: 1280px) 820px, (min-width: 1024px) 66vw, 100vw"
                className="object-cover object-top"
              />
              {wantScene ? (
                <div className={`canvas-fade absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_40%,#f8fafc,#e2e8f0)] ${sceneReady ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                  <SceneBoundary name="project" onFail={() => setSceneFailed(true)} fallback={null}>
                    <ProjectScene
                      video={project.video}
                      active={active}
                      onReady={() => setSceneReady(true)}
                      onFail={() => setSceneFailed(true)}
                    />
                  </SceneBoundary>
                </div>
              ) : null}
              {tier === "full" && !sceneUnavailable ? (
                <button type="button" onClick={() => setFlat((f) => !f)} aria-pressed={flat} className="absolute right-4 top-4 z-20 rounded-full bg-slate-950/80 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-slate-900">
                  {flat ? "Show 3D monitor" : "Show full screenshot"}
                </button>
              ) : null}
              {tier === "lite" || tier === "static" || sceneUnavailable || flat ? <PreviewVideo key={`video-${project.slug}`} project={project} /> : null}
              <figcaption className="sr-only">{project.posterAlt}</figcaption>
            </figure>

            <div className="mt-6 flex flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 md:flex-row md:items-start md:justify-between">
              <div className="min-h-[9.5rem] max-w-xl" aria-live="polite" aria-atomic="true">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Project {index + 1} of {COUNT}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  {project.title} <span className="font-normal text-slate-500">— {project.subtitle}</span>
                </h3>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-slate-600">{project.desc}</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
                  {project.tags.map((t) => (
                    <li key={t} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-4 md:items-end">
                <a href={project.source} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800">
                  Source on GitHub<span className="sr-only"> for {project.title} (opens in a new tab)</span>
                </a>
                <div className="js-only flex items-center gap-2">
                  <button type="button" onClick={prev} aria-label="Previous project" className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100">
                    <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={next} aria-label="Next project" className="grid h-11 w-11 place-items-center rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100">
                    <ChevronRight aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Index: every project, its source link, and a selector. In the HTML
              even without JavaScript. */}
          <nav aria-label="All projects" className="lg:col-span-4">
            <ol className="flex flex-col gap-3">
              {projects.map((p, i) => (
                <li key={p.slug} className={`rounded-2xl border p-4 transition-colors ${i === index ? "border-slate-900 bg-white shadow-sm" : "border-slate-200 bg-white/70"}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <Image src={p.poster} alt="" fill sizes="96px" className="object-cover object-top" />
                    </div>
                    <div className="min-w-0">
                      <button type="button" onClick={() => go(i)} aria-pressed={i === index} className="js-only text-left font-semibold text-slate-900 underline-offset-4 hover:underline">
                        {p.title}
                        <span className="sr-only">: show in viewer</span>
                      </button>
                      <span className="no-js-only font-semibold text-slate-900">{p.title}</span>
                      <p className="truncate text-sm text-slate-500">{p.subtitle}</p>
                      <a href={p.source} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-700 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700">
                        Source<span className="sr-only"> for {p.title} (opens in a new tab)</span>
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
