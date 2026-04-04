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

const OPTIONAL_HEAVY_ASSETS = [
  "/models/computer.glb",
  "/models/human/developer.glb",
  "/planet/scene.opt.glb",
];

const BACKGROUND_WARMUP_TIMEOUT = 1500;
const HEAVY_WARMUP_DELAY_MS = 12000;
const CRITICAL_WARMUP_CAP_MS = 1800;

const getCurrentHeroImage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "/newimages/cofounder-bg.avif";
  if (hour < 16) return "/newimages/hero-2.avif";
  if (hour < 20) return "/newimages/hero-3.avif";
  return "/newimages/hero-4.avif";
};

const getConnectionProfile = () => {
  if (typeof navigator === "undefined") {
    return { isConstrained: false, canWarmHeavy: false };
  }

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const slowType = /(^|\b)(slow-2g|2g|3g)\b/i.test(
    connection?.effectiveType || "",
  );
  const downlink = Number(connection?.downlink ?? 10);
  const deviceMemory = Number(navigator.deviceMemory ?? 8);
  const hardwareConcurrency = Number(navigator.hardwareConcurrency ?? 8);
  const isConstrained =
    Boolean(connection?.saveData) || slowType || downlink < 1.5;

  return {
    isConstrained,
    canWarmHeavy:
      !isConstrained &&
      downlink >= 5 &&
      deviceMemory >= 6 &&
      hardwareConcurrency >= 6,
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
    let settled = false;

    const done = () => {
      if (settled) {
        return;
      }

      settled = true;
      resolve();
    };

    img.onload = done;
    img.onerror = done;
    img.src = src;

    if (typeof img.decode === "function") {
      img.decode().then(done).catch(done);
    }
  });
};

const waitForTimeout = (ms) => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    window.setTimeout(resolve, ms);
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

/**
 * Preload strategy:
 * 1) Await only critical, above-fold assets.
 * 2) Warm supporting images in idle time.
 * 3) Warm heavy 3D assets only on capable devices after interaction/timeout.
 */
const usePreloadResources = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    let idleTaskId = null;
    let heavyIdleTaskId = null;
    let heavyWarmupTimerId = null;
    const interactionListeners = [];
    let heavyWarmupTriggered = false;

    const connectionProfile = getConnectionProfile();

    const criticalImages = [
      ...new Set([...CRITICAL_IMAGE_ASSETS, getCurrentHeroImage()]),
    ];

    const loadResources = async () => {
      try {
        // Never block startup beyond a short budget for critical warmup.
        await Promise.race([
          Promise.allSettled([
            ...criticalImages.map(preloadImage),
            waitForFonts(),
          ]),
          waitForTimeout(CRITICAL_WARMUP_CAP_MS),
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

        // Warm supporting assets in idle time while keeping startup lightweight.
        idleTaskId = runWhenIdle(async () => {
          if (connectionProfile.isConstrained) {
            return;
          }

          await preloadBatch(
            SUPPORTING_IMAGE_ASSETS,
            async (src) => preloadImage(src),
            {
              concurrency: 2,
              signal: abortController.signal,
            },
          );
        });

        if (connectionProfile.canWarmHeavy) {
          const triggerHeavyWarmup = () => {
            if (heavyWarmupTriggered) {
              return;
            }

            heavyWarmupTriggered = true;
            window.clearTimeout(heavyWarmupTimerId);

            interactionListeners.forEach(({ eventName, listener }) => {
              window.removeEventListener(eventName, listener);
            });
            interactionListeners.length = 0;

            heavyIdleTaskId = runWhenIdle(async () => {
              await preloadBatch(OPTIONAL_HEAVY_ASSETS, preloadBinary, {
                concurrency: 1,
                signal: abortController.signal,
              });
            }, 3200);
          };

          const registerListener = (eventName) => {
            const listener = () => triggerHeavyWarmup();
            interactionListeners.push({ eventName, listener });
            window.addEventListener(eventName, listener, {
              passive: true,
              once: true,
            });
          };

          registerListener("pointerdown");
          registerListener("keydown");
          registerListener("touchstart");

          heavyWarmupTimerId = window.setTimeout(
            triggerHeavyWarmup,
            HEAVY_WARMUP_DELAY_MS,
          );
        }
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
      cancelIdleTask(heavyIdleTaskId);
      window.clearTimeout(heavyWarmupTimerId);
      interactionListeners.forEach(({ eventName, listener }) => {
        window.removeEventListener(eventName, listener);
      });
    };
  }, []);

  return isReady;
};

export default usePreloadResources;
