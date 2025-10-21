import { useState, useEffect } from "react";

const usePreloadResources = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const startTime = Date.now();
    const MINIMUM_LOADING_TIME = 6000; // 6 seconds - reduced since Hero handles its own timing

    const imagesToPreload = [
      "/assets/terminal.png",
      "/assets/arrow-up.png",
      "/assets/close.svg",
      "/assets/menu.svg",
      "/assets/left-arrow.png",
      "/assets/right-arrow.png",
      "/assets/github.svg",
      "/assets/twitter.svg",
      "/assets/instagram.svg",
    ];

    const preloadImages = imagesToPreload.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve; // Resolve even on error to prevent blocking
      });
    });

    // Wait for document to be ready
    const waitForDocumentReady = () => {
      return new Promise((resolve) => {
        if (document.readyState === "complete") {
          resolve();
        } else {
          window.addEventListener("load", resolve, { once: true });
        }
      });
    };

    // Ensure minimum loading time
    const ensureMinimumTime = async () => {
      const elapsed = Date.now() - startTime;
      const remaining = MINIMUM_LOADING_TIME - elapsed;
      if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
      }
    };

    // Main loading sequence
    const loadResources = async () => {
      try {
        // Start all loading tasks in parallel
        const loadingTasks = [
          waitForDocumentReady(),
          Promise.all(preloadImages),
          new Promise((resolve) => setTimeout(resolve, 3000)), // 3 second buffer for initial resources
        ];

        // Wait for all resources to load
        await Promise.all(loadingTasks);

        // Ensure we've shown the loading spinner for at least the minimum time
        await ensureMinimumTime();

        // Check if component is still mounted before updating state
        if (mounted) {
          console.log("Resources ready");
          setIsReady(true);
        }
      } catch (error) {
        console.error("Error preloading resources:", error);

        // Even on error, ensure minimum time before showing content
        await ensureMinimumTime();

        if (mounted) {
          setIsReady(true); // Set ready even on error
        }
      }
    };

    loadResources();

    return () => {
      mounted = false;
    };
  }, []);

  return isReady;
};

export default usePreloadResources;
