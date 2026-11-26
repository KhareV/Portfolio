"use client";

import { useEffect } from "react";
import { legacyAnchors } from "../content/site";

// Native fragment navigation does the scrolling (all targets are in the server
// HTML with reserved layout). This only adds what the browser does not:
//  • moves keyboard focus to the target's heading after an in-page jump,
//  • re-anchors a cold deep link once if late content shifted it before the
//    visitor scrolled,
//  • maps legacy fragments (#work → experience) for focus purposes.
const resolve = (hash) => {
  const id = decodeURIComponent(String(hash || "").replace(/^#/, ""));
  if (!id) return null;
  const target = document.getElementById(legacyAnchors[id] ?? id) ?? document.getElementById(id);
  return target;
};

const headingFor = (el) =>
  el?.querySelector?.("[data-anchor-heading]") ?? (el?.matches?.("[data-anchor-heading]") ? el : null);

function focusTarget(el) {
  const heading = headingFor(el) ?? el;
  if (!heading) return;
  if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

export default function AnchorManager() {
  useEffect(() => {
    // Cold deep link: let the browser jump, then hold position through late
    // layout (fonts, data) until the visitor scrolls or 2.5 s pass.
    const initial = resolve(window.location.hash);
    let userScrolled = false;
    const markUser = () => (userScrolled = true);
    const userEvents = ["wheel", "touchstart", "keydown", "pointerdown"];
    userEvents.forEach((e) => window.addEventListener(e, markUser, { passive: true, once: true }));
    let ro;
    let stopTimer;
    if (initial) {
      const settle = () => {
        if (userScrolled) return;
        const top = initial.getBoundingClientRect().top;
        const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        if (Math.abs(top - offset) > 4) initial.scrollIntoView({ block: "start", behavior: "instant" });
      };
      settle();
      focusTarget(initial);
      ro = new ResizeObserver(settle);
      ro.observe(document.body);
      document.fonts?.ready.then(settle).catch(() => {});
      stopTimer = window.setTimeout(() => ro?.disconnect(), 2500);
    }

    // In-page links: browser scrolls; we move focus so keyboard and screen
    // reader users continue from the destination.
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;
      const target = resolve(a.getAttribute("href"));
      if (!target) return;
      ro?.disconnect();
      // same-hash clicks do not fire hashchange; scroll explicitly in that case
      if (a.getAttribute("href") === window.location.hash) {
        e.preventDefault();
        target.scrollIntoView({ block: "start" });
      }
      requestAnimationFrame(() => focusTarget(target));
    };
    const onPop = () => {
      const target = resolve(window.location.hash);
      if (target) focusTarget(target);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
      userEvents.forEach((e) => window.removeEventListener(e, markUser));
      ro?.disconnect();
      window.clearTimeout(stopTimer);
    };
  }, []);
  return null;
}
