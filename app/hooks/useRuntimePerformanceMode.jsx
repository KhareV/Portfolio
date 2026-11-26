"use client";

import { useSyncExternalStore } from "react";

// Rendering policy: heavy visuals are disabled for an explicit user
// preference (reduced motion), for phones (mobile UA, or coarse pointer on a
// small viewport — the existing mobile design), and for a constrained network
// on a low-end device. There is deliberately NO special case for Lighthouse,
// headless browsers or navigator.webdriver: automated audits measure the same
// experience real visitors get.
const DEFAULT_PROFILE = Object.freeze({
  prefersReducedMotion: false,
  isConstrainedNetwork: false,
  isLowerEndDevice: false,
  isMobileDevice: false,
  disableHeavyVisuals: false,
});

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

// Device class is decided once per page load (as before): a later resize or
// rotation does not swap the visual variant mid-visit.
let mobileDeviceAtLoad = null;
const getIsMobileDeviceAtLoad = (userAgent) => {
  if (mobileDeviceAtLoad === null) {
    const isMobileUserAgent = /android|iphone|ipad|ipod|mobile/i.test(userAgent);
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isSmallViewport = window.innerWidth < 900;
    mobileDeviceAtLoad = isMobileUserAgent || (isCoarsePointer && isSmallViewport);
  }
  return mobileDeviceAtLoad;
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
  const isMobileDevice = getIsMobileDeviceAtLoad(userAgent);

  return {
    prefersReducedMotion,
    isConstrainedNetwork,
    isLowerEndDevice,
    isMobileDevice,
    disableHeavyVisuals:
      prefersReducedMotion ||
      isMobileDevice ||
      (isConstrainedNetwork && isLowerEndDevice),
  };
};

// Snapshot cache: useSyncExternalStore needs a stable identity while the
// underlying values are unchanged (otherwise every read would re-render).
let cachedProfile = null;
let cachedKey = "";

const getSnapshot = () => {
  const next = readRuntimeProfile();
  const key = JSON.stringify(next);
  if (key !== cachedKey) {
    cachedKey = key;
    cachedProfile = Object.freeze(next);
  }
  return cachedProfile;
};

// The static prerender cannot know the visitor's device, so the server and the
// hydration pass both use the default profile; React then switches to the
// client snapshot without a hydration mismatch (previously React error #418).
const getServerSnapshot = () => DEFAULT_PROFILE;

// Same change sources as before: reduced-motion preference and network changes.
const subscribe = (onChange) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = getConnection();

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", onChange);
  } else {
    mediaQuery.addListener(onChange);
  }

  if (typeof connection?.addEventListener === "function") {
    connection.addEventListener("change", onChange);
  }

  return () => {
    if (typeof mediaQuery.removeEventListener === "function") {
      mediaQuery.removeEventListener("change", onChange);
    } else {
      mediaQuery.removeListener(onChange);
    }

    if (typeof connection?.removeEventListener === "function") {
      connection.removeEventListener("change", onChange);
    }
  };
};

const useRuntimePerformanceMode = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export default useRuntimePerformanceMode;
