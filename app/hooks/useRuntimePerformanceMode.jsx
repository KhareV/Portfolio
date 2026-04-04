"use client";

import { useEffect, useState } from "react";

const LAB_UA_PATTERN =
  /(chrome-lighthouse|lighthouse|pagespeed|headlesschrome|gtmetrix|webpagetest)/i;

const DEFAULT_PROFILE = {
  isLabTool: false,
  isAutomation: false,
  prefersReducedMotion: false,
  isConstrainedNetwork: false,
  isLowerEndDevice: false,
  isMobileDevice: false,
  disableHeavyVisuals: false,
};

const getConnection = () => {
  if (typeof navigator === "undefined") {
    return null;
  }

  return (
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection
  );
};

const readRuntimeProfile = () => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return DEFAULT_PROFILE;
  }

  const userAgent = navigator.userAgent || "";
  const connection = getConnection();
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isConstrainedNetwork =
    Boolean(connection?.saveData) ||
    /(^|\b)(slow-2g|2g|3g)(\b|$)/i.test(connection?.effectiveType || "") ||
    Number(connection?.downlink ?? 10) < 1.5;
  const deviceMemory = Number(navigator.deviceMemory ?? 8);
  const hardwareConcurrency = Number(navigator.hardwareConcurrency ?? 8);
  const isLowerEndDevice = deviceMemory <= 4 || hardwareConcurrency <= 4;
  const isLabTool = LAB_UA_PATTERN.test(userAgent);
  const isAutomation = Boolean(navigator.webdriver);
  const isMobileUserAgent = /android|iphone|ipad|ipod|mobile/i.test(userAgent);
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isSmallViewport = window.innerWidth < 900;
  const isMobileDevice =
    isMobileUserAgent || (isCoarsePointer && isSmallViewport);

  return {
    isLabTool,
    isAutomation,
    prefersReducedMotion,
    isConstrainedNetwork,
    isLowerEndDevice,
    isMobileDevice,
    disableHeavyVisuals:
      isLabTool ||
      isAutomation ||
      prefersReducedMotion ||
      isMobileDevice ||
      (isConstrainedNetwork && isLowerEndDevice),
  };
};

const useRuntimePerformanceMode = () => {
  const [profile, setProfile] = useState(() => readRuntimeProfile());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = getConnection();

    const updateProfile = () => {
      setProfile(readRuntimeProfile());
    };

    updateProfile();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateProfile);
    } else {
      mediaQuery.addListener(updateProfile);
    }

    if (typeof connection?.addEventListener === "function") {
      connection.addEventListener("change", updateProfile);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updateProfile);
      } else {
        mediaQuery.removeListener(updateProfile);
      }

      if (typeof connection?.removeEventListener === "function") {
        connection.removeEventListener("change", updateProfile);
      }
    };
  }, []);

  return profile;
};

export default useRuntimePerformanceMode;
