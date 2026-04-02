"use client";

import React, { Suspense, lazy, useEffect, useState } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import { LoadingProvider, useLoadingContext } from "./contexts/LoadingContext";
import useDeviceDetection from "./hooks/useDeviceDetection";
import usePreloadResources from "./hooks/usePreloadResources";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Critical above-fold components - load immediately
const loadNavbar = () => import("./sections/Navbar");
const loadHero = () => import("./sections/Hero");
const loadCustomCursor = () => import("./components/CustomCursor");

const Navbar = lazy(loadNavbar);
const Hero = lazy(loadHero);
const CustomCursor = lazy(loadCustomCursor);

// Below-fold components - lazy load with lower priority
const loadAbout = () => import("./sections/About");
const loadProjects = () => import("./sections/Projects");
const loadContact = () => import("./sections/Contact");
const loadFooter = () => import("./sections/Footer");
const loadWorkExperience = () => import("./sections/WorkExperience");
const loadGithub = () => import("./sections/Github");
const loadTimeBands = () => import("./components/TimeBands");

const About = lazy(loadAbout);
const Projects = lazy(loadProjects);
const Contact = lazy(loadContact);
const Footer = lazy(loadFooter);
const WorkExperience = lazy(loadWorkExperience);
const Github = lazy(loadGithub);
const TimeBands = lazy(loadTimeBands);

// Non-essential components - lowest priority
const loadLogoAnimation = () => import("./components/LogoAnimation");
const loadEarthCanvas = () => import("./components/Earth");
const loadSound = () => import("./components/Sound");
const loadDeviceDebugInfo = () => import("./components/DeviceDebugInfo");

const LogoAnimation = lazy(loadLogoAnimation);
const EarthCanvas = lazy(loadEarthCanvas);
const Sound = lazy(loadSound);
const DeviceDebugInfo = lazy(loadDeviceDebugInfo);

const AppContent = () => {
  const isResourcesReady = usePreloadResources();
  const { isAppReady } = useLoadingContext();
  const { isMobile } = useDeviceDetection();
  const [areLazyChunksReady, setAreLazyChunksReady] = useState(false);

  const isFullyLoaded = isResourcesReady && isAppReady && areLazyChunksReady;

  useEffect(() => {
    let mounted = true;

    const preloadLazyChunks = async () => {
      try {
        await Promise.all([
          loadNavbar(),
          loadHero(),
          loadCustomCursor(),
          loadAbout(),
          loadProjects(),
          loadContact(),
          loadFooter(),
          loadWorkExperience(),
          loadGithub(),
          loadTimeBands(),
          loadLogoAnimation(),
          loadSound(),
          loadDeviceDebugInfo(),
          ...(isMobile ? [] : [loadEarthCanvas()]),
        ]);
      } catch (error) {
        console.warn("Lazy chunk preload warning:", error);
      } finally {
        if (mounted) {
          setAreLazyChunksReady(true);
        }
      }
    };

    preloadLazyChunks();

    return () => {
      mounted = false;
    };
  }, [isMobile]);

  return (
    <>
      <LoadingSpinner shouldHide={isFullyLoaded} onLoadComplete={() => {}} />

      <Suspense fallback={null}>
        <DeviceDebugInfo show={false} />
      </Suspense>

      <div
        className="overflow-x-hidden"
        style={{ visibility: isFullyLoaded ? "visible" : "hidden" }}
      >
        <Suspense fallback={null}>
          <CustomCursor />
        </Suspense>
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <Suspense fallback={null}>
          <Hero />
        </Suspense>
        <Suspense fallback={null}>
          <TimeBands className="-mt-px" />
        </Suspense>

        <Suspense fallback={null}>
          <About />
        </Suspense>
        <Suspense fallback={null}>
          <Github />
        </Suspense>
        <Suspense fallback={null}>
          <LogoAnimation isLoading={!isFullyLoaded} />
        </Suspense>
        <Suspense fallback={null}>
          <Sound />
        </Suspense>

        <Suspense fallback={null}>
          <Projects />
        </Suspense>
        <Suspense fallback={null}>
          <Contact />
        </Suspense>
        <Suspense fallback={null}>
          <WorkExperience />
        </Suspense>
        {!isMobile && (
          <Suspense fallback={null}>
            <div className="relative mx-4 my-10 rounded-[2rem] border border-white/15 bg-black p-4 md:p-6 shadow-[0_24px_60px_rgba(2,6,23,0.45)] overflow-hidden">
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 12% 18%, rgba(255,255,255,0.8) 1.2px, transparent 2px), radial-gradient(circle at 68% 26%, rgba(255,255,255,0.55) 1px, transparent 2px), radial-gradient(circle at 86% 72%, rgba(255,255,255,0.65) 1.1px, transparent 2px), radial-gradient(circle at 34% 78%, rgba(255,255,255,0.45) 1px, transparent 2px), radial-gradient(circle at 55% 52%, rgba(255,255,255,0.35) 0.9px, transparent 2px)",
                  backgroundSize:
                    "240px 240px, 280px 280px, 320px 320px, 260px 260px, 300px 300px",
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-transparent to-sky-400/10" />

              <div className="relative z-10 rounded-[1.4rem] overflow-hidden">
                <EarthCanvas />
              </div>
            </div>
          </Suspense>
        )}
        <Suspense fallback={null}>
          <>
            <TimeBands />
            <Footer />
          </>
        </Suspense>
      </div>
      <div id="my-modal" />
    </>
  );
};

export default function Page() {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
}
