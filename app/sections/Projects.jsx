"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

import { myProjects } from "../constants/index.jsx";
import TechIcon from "../components/TechIcon.jsx";
import useDeviceDetection from "../hooks/useDeviceDetection.jsx";

const ProjectScene = dynamic(() => import("../components/ProjectScene.jsx"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center text-sm font-medium text-slate-500">
      Loading 3D preview...
    </div>
  ),
});

const PROJECT_COUNT = myProjects.length;

const Projects = ({ disableHeavyVisuals = false }) => {
  const { isMobile } = useDeviceDetection();
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const hasProjects = PROJECT_COUNT > 0;

  const handleNavigation = useCallback((direction) => {
    setSelectedProjectIndex((prevIndex) => {
      if (direction === "previous") {
        return prevIndex === 0 ? PROJECT_COUNT - 1 : prevIndex - 1;
      }
      return prevIndex === PROJECT_COUNT - 1 ? 0 : prevIndex + 1;
    });
  }, []);

  const handleSectionKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNavigation("next");
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleNavigation("previous");
      }
    },
    [handleNavigation],
  );

  const currentProject = useMemo(() => {
    if (!hasProjects) {
      return null;
    }

    return myProjects[selectedProjectIndex] ?? myProjects[0];
  }, [hasProjects, selectedProjectIndex]);

  if (!hasProjects || !currentProject) {
    return (
      <section
        className="font-site-default py-16 sm:py-24 relative z-10 px-4 sm:px-10 overflow-hidden bg-[#FEFFFC]"
        id="projects"
      >
        <div className="max-w-7xl mx-auto rounded-[2rem] border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-3">
            Selected Work.
          </h2>
          <p className="text-slate-500 text-base md:text-lg">
            Projects are being prepared and will be visible shortly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="projects-v2 font-site-default py-16 sm:py-24 relative z-10 px-4 sm:px-10 overflow-hidden bg-[#FEFFFC] focus-visible:outline-none"
      id="projects"
      tabIndex={0}
      role="region"
      aria-label="Projects showcase. Use left and right arrow keys to navigate projects."
      onKeyDown={handleSectionKeyDown}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 sm:mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tighter text-slate-900 mb-4">
              Selected Work.
            </h2>
            <p className="text-slate-500 text-base sm:text-lg md:text-xl font-light max-w-xl leading-relaxed tracking-wide">
              A curated showcase of digital experiences, built with precision
              and modern web technologies.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 grid-cols-1 gap-8 w-full items-stretch">
          <div className="lg:col-span-5 flex flex-col gap-8 relative py-8 sm:py-10 px-5 sm:px-8 md:px-10 min-h-[24rem] sm:min-h-[28rem] bg-white/95 backdrop-blur-sm rounded-[2.5rem] border border-slate-200 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.28)] hover:shadow-[0_24px_60px_-24px_rgba(15,23,42,0.32)] transition-shadow duration-700 transform-gpu [will-change:transform]">
            <div className="absolute inset-0 opacity-[0.02] mix-blend-luminosity pointer-events-none overflow-hidden rounded-[2.5rem] select-none">
              <Image
                src={currentProject.spotlight}
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                quality={52}
                className="w-full h-full object-cover"
              />
            </div>

            <div
              className="p-3.5 bg-white border border-black/[0.04] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] w-fit rounded-2xl relative z-10"
              style={currentProject.logoStyle}
            >
              <Image
                className="w-9 h-9 object-contain"
                src={currentProject.logo}
                alt={`${currentProject.title} logo`}
                width={36}
                height={36}
                sizes="36px"
              />
            </div>

            <div className="flex flex-col gap-4 relative z-10 mt-2">
              <h3 className="text-slate-900 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight opacity-100">
                {currentProject.title}
              </h3>

              <p className="text-slate-500 font-light leading-relaxed text-[17px] opacity-100">
                {currentProject.desc}
              </p>

              {currentProject.subdesc && (
                <p className="text-slate-400 font-light text-[15px] leading-relaxed mt-[-4px] opacity-100">
                  {currentProject.subdesc}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 relative z-10 mt-4">
              <p className="text-slate-600 font-semibold text-[10px] uppercase tracking-[0.28em]">
                Tech Stack
              </p>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {(currentProject.tags ?? []).map((tag, index) => (
                  <div
                    key={tag.id ?? `${tag.name}-${index}`}
                    className="group relative flex items-center gap-2 h-11 px-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <TechIcon
                      icon={tag.icon}
                      className="w-5 h-5 text-slate-700 opacity-100 transition-colors duration-300"
                    />
                    <span className="text-[12px] font-medium leading-none text-slate-700">
                      {tag.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-auto pt-8 border-t border-black/[0.04] relative z-10 gap-6 sm:gap-0">
              <a
                href={currentProject.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-all duration-300 hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] w-fit group active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <span className="text-[14px] font-medium tracking-wide">
                  Live Project
                </span>
                <ExternalLink
                  strokeWidth={2.5}
                  className="w-[14px] h-[14px] group-hover:rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                />
              </a>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  className="group bg-transparent hover:bg-slate-50 border border-black/[0.06] hover:border-black/[0.15] transition-all duration-300 p-3 rounded-full flex items-center justify-center active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  onClick={() => handleNavigation("previous")}
                  aria-label="Previous project"
                >
                  <ChevronLeft
                    strokeWidth={2}
                    className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors duration-300"
                  />
                </button>
                <button
                  className="group bg-transparent hover:bg-slate-50 border border-black/[0.06] hover:border-black/[0.15] transition-all duration-300 p-3 rounded-full flex items-center justify-center active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                  onClick={() => handleNavigation("next")}
                  aria-label="Next project"
                >
                  <ChevronRight
                    strokeWidth={2}
                    className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors duration-300"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-[2.5rem] h-[clamp(20rem,72vw,34rem)] lg:h-[40rem] overflow-hidden transition-all duration-500 relative flex items-center justify-center group shadow-[inset_0_0_80px_rgba(15,23,42,0.04)] transform-gpu [will-change:transform]">
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20 flex gap-2 items-center bg-white/50 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-black/[0.03]">
              {myProjects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedProjectIndex(index)}
                  className="grid h-8 w-8 place-items-center rounded-full transition-all duration-300 ease-out hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  aria-current={index === selectedProjectIndex}
                  aria-label={`Go to project ${index + 1}`}
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-500 ease-out ${
                      index === selectedProjectIndex
                        ? "bg-slate-800 w-6"
                        : "bg-slate-300 hover:bg-slate-400 w-1.5"
                    }`}
                  />
                </button>
              ))}
            </div>

            {disableHeavyVisuals ? (
              <div className="absolute inset-0 z-10 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.72),rgba(248,250,252,0.94))]">
                <div className="rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 text-center shadow-sm">
                  <p className="text-sm font-medium text-slate-700">
                    Lightweight preview enabled for faster loading.
                  </p>
                </div>
              </div>
            ) : (
              <ProjectScene
                texture={currentProject.texture}
                isMobile={isMobile}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(Projects);
