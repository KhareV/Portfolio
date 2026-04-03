"use client";

import React, { Suspense, lazy, useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { LoadingProvider, useLoadingContext } from "../contexts/LoadingContext";
import useDeviceDetection from "../hooks/useDeviceDetection";
import usePreloadResources from "../hooks/usePreloadResources";

const loadNavbar = () => import("../sections/Navbar");
const loadHero = () => import("../sections/Hero");
const loadPointer = () => import("./Pointer");

const Navbar = lazy(loadNavbar);
const Hero = lazy(loadHero);
const Pointer = lazy(loadPointer);

const loadAbout = () => import("../sections/About");
const loadProjects = () => import("../sections/Projects");
const loadContact = () => import("../sections/Contact");
const loadFooter = () => import("../sections/Footer");
const loadWorkExperience = () => import("../sections/WorkExperience");
const loadGithub = () => import("../sections/Github");
const loadTimeBands = () => import("./TimeBands");

const About = lazy(loadAbout);
const Projects = lazy(loadProjects);
const Contact = lazy(loadContact);
const Footer = lazy(loadFooter);
const WorkExperience = lazy(loadWorkExperience);
const Github = lazy(loadGithub);
const TimeBands = lazy(loadTimeBands);

const loadLogoAnimation = () => import("./LogoAnimation");
const loadEarthCanvas = () => import("./Earth");
const loadSound = () => import("./Sound");

const LogoAnimation = lazy(loadLogoAnimation);
const EarthCanvas = lazy(loadEarthCanvas);
const Sound = lazy(loadSound);

const runWhenIdle = (task, timeout = 2600) => {
  if (typeof window === "undefined") {
    return null;
  }

  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(task, { timeout });
  }

  return window.setTimeout(task, 260);
};

const cancelIdleTask = (id) => {
  if (typeof window === "undefined" || id == null) {
    return;
  }

  if ("cancelIdleCallback" in window) {
    window.cancelIdleCallback(id);
    return;
  }

  clearTimeout(id);
};

const isConstrainedConnection = () => {
  if (typeof navigator === "undefined") {
    return false;
  }

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) {
    return false;
  }

  const slowType = /(^|\b)(slow-2g|2g|3g)\b/i.test(
    connection.effectiveType || "",
  );

  return Boolean(connection.saveData) || slowType;
};

const AppContent = () => {
  const isResourcesReady = usePreloadResources();
  const { isAppReady } = useLoadingContext();
  const { isMobile } = useDeviceDetection();
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  const isFullyLoaded = isResourcesReady && isAppReady;

  useEffect(() => {
    let mounted = true;
    let lenisInstance = null;
    let rafId = null;
    let idleTaskId = null;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const startRafLoop = () => {
      if (rafId != null || !lenisInstance) {
        return;
      }

      const raf = (time) => {
        if (!lenisInstance) {
          rafId = null;
          return;
        }

        lenisInstance.raf(time);
        rafId = window.requestAnimationFrame(raf);
      };

      rafId = window.requestAnimationFrame(raf);
    };

    const stopRafLoop = () => {
      if (rafId == null) {
        return;
      }

      window.cancelAnimationFrame(rafId);
      rafId = null;
    };

    const onResize = () => {
      lenisInstance?.resize();
    };

    const onVisibilityChange = () => {
      if (!lenisInstance) {
        return;
      }

      if (document.visibilityState === "hidden") {
        lenisInstance.stop();
        stopRafLoop();
        return;
      }

      if (!prefersReducedMotion.matches) {
        lenisInstance.start();
        startRafLoop();
        lenisInstance.resize();
      }
    };

    const initLenis = async () => {
      if (!mounted || lenisInstance || prefersReducedMotion.matches) {
        return;
      }

      try {
        const { default: Lenis } = await import("lenis");

        if (!mounted || lenisInstance || prefersReducedMotion.matches) {
          return;
        }

        const deviceMemory = Number(navigator.deviceMemory ?? 8);
        const hardwareConcurrency = Number(navigator.hardwareConcurrency ?? 8);
        const isLowerEndDevice = deviceMemory <= 4 || hardwareConcurrency <= 4;

        lenisInstance = new Lenis({
          autoRaf: false,
          smoothWheel: true,
          syncTouch: true,
          normalizeWheel: true,
          anchors: true,
          lerp: isLowerEndDevice ? 0.085 : 0.11,
          syncTouchLerp: isLowerEndDevice ? 0.07 : 0.09,
          touchInertiaExponent: isLowerEndDevice ? 1.2 : 1.35,
          wheelMultiplier: isLowerEndDevice ? 0.9 : 1,
          touchMultiplier: 1,
        });

        startRafLoop();
        window.addEventListener("resize", onResize, { passive: true });
        window.addEventListener("orientationchange", onResize);
        document.addEventListener("visibilitychange", onVisibilityChange);
      } catch (error) {
        console.warn("Lenis initialization failed:", error);
      }
    };

    const onMotionPreferenceChange = (event) => {
      if (event.matches) {
        lenisInstance?.stop();
        stopRafLoop();
        return;
      }

      if (!lenisInstance) {
        initLenis();
        return;
      }

      lenisInstance.start();
      startRafLoop();
      lenisInstance.resize();
    };

    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener("change", onMotionPreferenceChange);
    } else {
      prefersReducedMotion.addListener(onMotionPreferenceChange);
    }

    idleTaskId = runWhenIdle(() => {
      initLenis();
    }, 1200);

    return () => {
      mounted = false;
      cancelIdleTask(idleTaskId);
      stopRafLoop();

      if (typeof prefersReducedMotion.removeEventListener === "function") {
        prefersReducedMotion.removeEventListener(
          "change",
          onMotionPreferenceChange,
        );
      } else {
        prefersReducedMotion.removeListener(onMotionPreferenceChange);
      }

      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      lenisInstance?.destroy();
      lenisInstance = null;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let idleTaskId = null;
    let revealTimerId = null;

    const revealDeferredSections = () => {
      if (mounted) {
        setShowDeferredSections(true);
      }
    };

    const maybePreloadDeferredChunks = async () => {
      if (isConstrainedConnection()) {
        return;
      }

      const chunkLoaders = [loadAbout, loadContact, loadFooter, loadGithub];

      await Promise.allSettled(chunkLoaders.map((loader) => loader()));
    };

    const onHashChange = () => revealDeferredSections();
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.3) {
        revealDeferredSections();
      }
    };

    if (window.location.hash && window.location.hash !== "#hero") {
      revealDeferredSections();
    }

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("scroll", onScroll, { passive: true });

    revealTimerId = window.setTimeout(
      revealDeferredSections,
      isMobile ? 5600 : 4200,
    );

    idleTaskId = runWhenIdle(() => {
      if (mounted) {
        maybePreloadDeferredChunks();
      }
    });

    return () => {
      mounted = false;
      window.clearTimeout(revealTimerId);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("scroll", onScroll);
      cancelIdleTask(idleTaskId);
    };
  }, [isMobile]);

  return (
    <>
      <LoadingSpinner shouldHide={isFullyLoaded} onLoadComplete={() => {}} />

      <div className="overflow-x-hidden">
        <Suspense fallback={null}>
          <Pointer />
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

        {showDeferredSections && (
          <>
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
          </>
        )}
      </div>
      <div id="my-modal" />
    </>
  );
};

export default function AppClientShell() {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
}
