"use client";

import { useState, useEffect } from "react";

const CRITICAL_IMAGE_ASSETS = [
  "/assets/terminal.png",
  "/assets/close.svg",
  "/assets/menu.svg",
  "/newimages/cofounder-bg.avif",
];

const SUPPORTING_IMAGE_ASSETS = [
  "/assets/spotlight1.png",
  "/assets/spotlight2.png",
  "/assets/spotlight3.png",
  "/assets/spotlight4.png",
  "/assets/spotlight5.png",
  "/assets/codechef.png",
  "/assets/ispace.png",
  "/assets/hackathons.png",
  "/assets/dandiya.png",
];

const HEAVY_MODEL_ASSETS = [
  "/models/computer.glb",
  "/models/human/developer.glb",
  "/models/animations/idle.fbx",
  "/models/animations/salute.fbx",
  "/models/animations/clapping.fbx",
  "/models/animations/victory.fbx",
  "/planet/scene.opt.glb",
];

const PROJECT_VIDEO_ASSETS = [
  "/textures/project/project1.mp4",
  "/textures/project/project2.mp4",
  "/textures/project/project3.mp4",
  "/textures/project/project4.mp4",
  "/textures/project/project5.mp4",
];

const BACKGROUND_WARMUP_TIMEOUT = 1500;

const getCurrentHeroImage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "/newimages/cofounder-bg.avif";
  if (hour < 16) return "/newimages/hero-2.avif";
  if (hour < 20) return "/newimages/hero-3.avif";
  return "/newimages/hero-4.avif";
};

const getConnectionProfile = () => {
  if (typeof navigator === "undefined") {
    return { isConstrained: false };
  }

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) {
    return { isConstrained: false };
  }

  const slowType = /(^|\b)(slow-2g|2g)\b/i.test(connection.effectiveType || "");
  return {
    isConstrained: Boolean(connection.saveData) || slowType,
  };
};

const runWhenIdle = (task, timeout = BACKGROUND_WARMUP_TIMEOUT) => {
  if (typeof window === "undefined") {
    return null;
  }

  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(task, { timeout });
  }

  return window.setTimeout(task, 180);
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

const preloadImage = (src) => {
  return new Promise((resolve) => {
    const img = new Image();

    const done = () => resolve();

    img.onload = done;
    img.onerror = done;
    img.src = src;

    if (typeof img.decode === "function") {
      img.decode().then(done).catch(done);
    }
  });
};

const preloadBinary = async (src, signal) => {
  try {
    const response = await fetch(src, {
      cache: "force-cache",
      signal,
    });

    if (!response.ok) {
      return;
    }

    await response.arrayBuffer();
  } catch {
    // Ignore warmup failures and keep app interactive.
  }
};

const preloadBatch = async (
  assets,
  loader,
  { concurrency = 3, signal } = {},
) => {
  if (!assets.length) {
    return;
  }

  let pointer = 0;
  const workerCount = Math.max(1, Math.min(concurrency, assets.length));

  const workers = Array.from({ length: workerCount }, async () => {
    while (pointer < assets.length) {
      if (signal?.aborted) {
        return;
      }

      const currentIndex = pointer;
      pointer += 1;
      const asset = assets[currentIndex];
      await loader(asset, signal);
    }
  });

  await Promise.allSettled(workers);
};

const waitForFonts = async () => {
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Never block readiness on font errors.
    }
  }
};

const waitForDocumentReady = () => {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve();
      return;
    }

    if (document.readyState === "complete") {
      resolve();
      return;
    }

    window.addEventListener("load", resolve, { once: true });
  });
};

/**
 * Preload strategy:
 * 1) Await only critical, above-fold assets.
 * 2) Warm heavy models/videos in idle time without blocking first paint.
 */
const usePreloadResources = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    let idleTaskId = null;

    const connectionProfile = getConnectionProfile();

    const criticalImages = [
      ...new Set([...CRITICAL_IMAGE_ASSETS, getCurrentHeroImage()]),
    ];

    const loadResources = async () => {
      try {
        // Unblock initial render as soon as critical assets are warm.
        await Promise.allSettled([
          ...criticalImages.map(preloadImage),
          preloadBinary(PROJECT_VIDEO_ASSETS[0], abortController.signal),
          waitForFonts(),
          waitForDocumentReady(),
        ]);

        if (!mounted) {
          return;
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (mounted) {
              setIsReady(true);
            }
          });
        });

        // Warm remaining assets in idle time; skip heavy warmup on constrained networks.
        idleTaskId = runWhenIdle(async () => {
          const backgroundJobs = [...SUPPORTING_IMAGE_ASSETS.map(preloadImage)];

          if (!connectionProfile.isConstrained) {
            backgroundJobs.push(
              preloadBatch(HEAVY_MODEL_ASSETS, preloadBinary, {
                concurrency: 2,
                signal: abortController.signal,
              }),
            );

            backgroundJobs.push(
              preloadBatch(PROJECT_VIDEO_ASSETS.slice(1), preloadBinary, {
                concurrency: 2,
                signal: abortController.signal,
              }),
            );
          }

          await Promise.allSettled(backgroundJobs);
        });
      } catch (error) {
        console.error("Error preloading resources:", error);
        if (mounted) {
          setIsReady(true);
        }
      }
    };

    loadResources();

    return () => {
      mounted = false;
      abortController.abort();
      cancelIdleTask(idleTaskId);
    };
  }, []);

  return isReady;
};

export default usePreloadResources;
