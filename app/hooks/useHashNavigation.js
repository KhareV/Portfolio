"use client";

import { useEffect } from "react";

const MAX_WAIT_MS = 15000;
const SETTLE_FRAMES = 3;
const DRIFT_TOLERANCE_PX = 4;
const CORRECTION_WINDOW_MS = 2500;
const USER_SCROLL_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"];
// Sections that mount in later render stages. Unknown hashes are left alone.
const STAGED_SECTION_IDS = new Set(["about", "projects", "contact", "work", "footer"]);

const decodeHash = (hash) => {
  if (!hash || hash.length < 2) return null;
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
};

const isBodyLocked = () =>
  typeof document !== "undefined" &&
  document.body.style.position === "fixed";

const targetTop = (el) => el.getBoundingClientRect().top + window.scrollY;

/**
 * Sections below the hero mount in later render stages, so a cold `/#contact`
 * (or a nav click made before they mount) used to find no target and stay at
 * the top. This hook:
 *  - asks the shell to mount all stages when the hash target is missing,
 *  - waits for the real target geometry (element present, loader scroll lock
 *    released, position stable for a few frames) — no fixed timeouts,
 *  - scrolls exactly once (Lenis if active, native otherwise) and corrects
 *    only for layout drift that happens before the user scrolls themselves,
 *  - cancels on user input or a newer navigation.
 * Anchors whose targets already exist keep their original behaviour (Lenis
 * `anchors` / native fragment scrolling).
 */
export default function useHashNavigation({ lenisRef, onTargetMissing }) {
  useEffect(() => {
    let rafId = null;
    let generation = 0;
    let cancelUserListeners = null;

    const stop = () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = null;
      cancelUserListeners?.();
      cancelUserListeners = null;
    };

    const scrollToTop = (top, smooth) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(top, { immediate: !smooth, force: true });
      } else {
        window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
      }
    };

    const navigate = (id, { smooth }) => {
      stop();
      const myGeneration = ++generation;
      const startedAt = performance.now();
      let lastTop = null;
      let stableFrames = 0;
      let landedAt = null;
      let landedTop = null;

      const onUserInput = () => stop();
      USER_SCROLL_EVENTS.forEach((name) =>
        window.addEventListener(name, onUserInput, { passive: true }),
      );
      cancelUserListeners = () =>
        USER_SCROLL_EVENTS.forEach((name) =>
          window.removeEventListener(name, onUserInput),
        );

      const tick = () => {
        if (myGeneration !== generation) return;
        const now = performance.now();
        if (now - startedAt > MAX_WAIT_MS) {
          stop();
          return;
        }

        const el = document.getElementById(id);
        if (!el || isBodyLocked()) {
          stableFrames = 0;
          rafId = window.requestAnimationFrame(tick);
          return;
        }

        const top = Math.round(targetTop(el));
        stableFrames = lastTop !== null && Math.abs(top - lastTop) < 1 ? stableFrames + 1 : 0;
        lastTop = top;

        if (landedAt === null) {
          if (stableFrames >= SETTLE_FRAMES) {
            scrollToTop(top, smooth);
            landedAt = now;
            landedTop = top;
          }
        } else if (now - landedAt > CORRECTION_WINDOW_MS) {
          stop();
          return;
        } else if (Math.abs(top - landedTop) > DRIFT_TOLERANCE_PX && stableFrames >= SETTLE_FRAMES) {
          // Content above the target finished mounting after we landed.
          scrollToTop(top, false);
          landedTop = top;
        }

        rafId = window.requestAnimationFrame(tick);
      };

      rafId = window.requestAnimationFrame(tick);
    };

    const handle = (id, opts) => {
      if (!id || !STAGED_SECTION_IDS.has(id)) return;
      if (!document.getElementById(id)) {
        onTargetMissing?.();
        navigate(id, opts);
      } else if (opts.cold || opts.forceTracking) {
        navigate(id, opts);
      }
    };

    // 1) cold load with a fragment (also covers reload)
    const initialId = decodeHash(window.location.hash);
    if (initialId && initialId !== "hero") {
      handle(initialId, { smooth: false, cold: true });
    }

    // 2) clicks on in-page anchors whose target has not mounted yet
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!anchor) return;
      const id = decodeHash(anchor.getAttribute("href"));
      if (!id || !STAGED_SECTION_IDS.has(id) || document.getElementById(id)) return; // existing/unknown targets: unchanged behaviour
      event.preventDefault();
      if (window.location.hash !== `#${id}`) {
        window.history.pushState(null, "", `#${id}`);
      }
      handle(id, { smooth: true });
    };

    // 3) back/forward and manual hash changes to not-yet-mounted targets
    const onHashChange = () => {
      const id = decodeHash(window.location.hash);
      if (id && !document.getElementById(id)) handle(id, { smooth: false });
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);

    return () => {
      generation++;
      stop();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, [lenisRef, onTargetMissing]);
}
