"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Deterministic resource preloader - NO MAGIC TIMEOUTS
 * Loads only critical assets and exits when actually ready
 */
const usePreloadResources = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const criticalImages = [
      "/assets/terminal.png",
      "/assets/menu.svg",
      "/assets/close.svg",
      "/newimages/cofounder-bg.avif",
      "/newimages/hero-2.avif",
      "/newimages/hero-3.avif",
      "/newimages/hero-4.avif",
      "/assets/spotlight1.png",
      "/assets/spotlight2.png",
      "/assets/spotlight3.png",
      "/assets/spotlight4.png",
      "/assets/spotlight5.png",
      "/assets/codechef.png",
      "/assets/ispace.png",
      "/assets/hackathons.png",
      "/assets/dandiya.png",
      "/planet/textures/Clouds_baseColor.png",
      "/planet/textures/Planet_baseColor.png",
    ];

    const binaryAssets = [
      "/models/computer.glb",
      "/models/human/developer.glb",
      "/models/animations/idle.fbx",
      "/models/animations/salute.fbx",
      "/models/animations/clapping.fbx",
      "/models/animations/victory.fbx",
      "/planet/scene.gltf",
      "/planet/scene.bin",
    ];

    const mediaAssets = [
      "/textures/project/project1.mp4",
      "/textures/project/project2.mp4",
      "/textures/project/project3.mp4",
      "/textures/project/project4.mp4",
      "/textures/project/project5.mp4",
    ];

    const preloadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;

        const done = () => resolve();

        img.onload = done;
        img.onerror = done;

        if (typeof img.decode === "function") {
          img.decode().then(done).catch(done);
        }
      });
    };

    const preloadBinary = (src) => {
      return fetch(src, { cache: "force-cache" })
        .then((response) => {
          if (!response.ok) return null;
          return response.arrayBuffer();
        })
        .catch(() => null);
    };

    const preloadImages = criticalImages.map(preloadImage);
    const preloadBinaries = binaryAssets.map(preloadBinary);
    const preloadMedia = mediaAssets.map(preloadBinary);

    // Wait for document fonts to load
    const waitForFonts = async () => {
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.ready;
        } catch (error) {
          console.warn("Font loading error:", error);
        }
      }
    };

    // Wait for document ready state
    const waitForDocumentReady = () => {
      return new Promise((resolve) => {
        if (typeof document === "undefined") {
          resolve();
          return;
        }

        if (document.readyState === "complete") {
          resolve();
        } else {
          window.addEventListener("load", resolve, { once: true });
        }
      });
    };

    // Main loading sequence - NO ARTIFICIAL DELAYS
    const loadResources = async () => {
      try {
        // Load everything in parallel
        await Promise.allSettled([
          ...preloadImages,
          ...preloadBinaries,
          ...preloadMedia,
          waitForFonts(),
          waitForDocumentReady(),
        ]);

        // Small RAF delay to ensure paint
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (mounted) {
              setIsReady(true);
            }
          });
        });
      } catch (error) {
        console.error("Error preloading resources:", error);
        // Set ready even on error to prevent infinite loading
        if (mounted) {
          setIsReady(true);
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
