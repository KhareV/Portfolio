"use client";

import { useViewport } from "../lib/useVisualTier";

// CSS picks the day-phase plate; `.is-near` gates the download until the
// footer is within ~1.5 viewports, so it never competes with the hero.
export default function FooterArt() {
  const [ref, near] = useViewport({ nearMargin: "150% 0px" });
  return <div ref={ref} aria-hidden="true" className={`footer-art absolute inset-0 -z-20 ${near ? "is-near" : ""}`} />;
}
