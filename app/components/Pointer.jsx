"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const POINTER_STYLE_ID = "app-custom-pointer-style";
const EASING = 0.22;
const POINTER_ROTATION = -18;

const ensurePointerStyle = () => {
  if (typeof document === "undefined") {
    return null;
  }

  let style = document.getElementById(POINTER_STYLE_ID);
  if (style) {
    return style;
  }

  style = document.createElement("style");
  style.id = POINTER_STYLE_ID;
  style.textContent = `
    html[data-custom-pointer="on"],
    html[data-custom-pointer="on"] * {
      cursor: none !important;
    }
  `;
  document.head.appendChild(style);
  return style;
};

const Pointer = () => {
  const pointerRef = useRef(null);
  const frameRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const visibilityRef = useRef(false);
  const styleRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const supportsFinePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setIsEnabled(supportsFinePointer && !prefersReducedMotion);
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      document.documentElement.removeAttribute("data-custom-pointer");
      return;
    }

    const html = document.documentElement;
    styleRef.current = ensurePointerStyle();
    html.setAttribute("data-custom-pointer", "on");

    targetRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    currentRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    const animate = () => {
      currentRef.current.x +=
        (targetRef.current.x - currentRef.current.x) * EASING;
      currentRef.current.y +=
        (targetRef.current.y - currentRef.current.y) * EASING;

      if (pointerRef.current) {
        pointerRef.current.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0) rotate(${POINTER_ROTATION}deg)`;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    const updateVisibility = (visible) => {
      if (visibilityRef.current === visible) {
        return;
      }

      visibilityRef.current = visible;
      setIsVisible(visible);
    };

    const onMouseMove = (event) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
      updateVisibility(true);
    };

    const onMouseLeave = () => {
      updateVisibility(false);
    };

    const onMouseEnter = () => {
      updateVisibility(true);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });
    window.addEventListener("mouseenter", onMouseEnter, { passive: true });

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mouseenter", onMouseEnter);

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      html.removeAttribute("data-custom-pointer");
      if (styleRef.current && styleRef.current.parentNode) {
        try {
          styleRef.current.parentNode.removeChild(styleRef.current);
        } catch {
          // Style node might already be removed externally.
        }
      }
      styleRef.current = null;
    };
  }, [isEnabled]);

  if (!isEnabled || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <svg
        ref={pointerRef}
        aria-hidden="true"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          filter: "drop-shadow(0 2px 7px rgba(0, 0, 0, 0.35))",
          pointerEvents: "none",
          zIndex: 2147483647,
          willChange: "transform",
          transform: `translate3d(-100px, -100px, 0) rotate(${POINTER_ROTATION}deg)`,
          transformOrigin: "0 0",
          opacity: isVisible ? 1 : 0,
        }}
      >
        <path
          d="M1 1L1 18.6L6.3 13.6L10.1 23L13.3 21.6L9.6 12.4H18.6L1 1Z"
          fill="rgba(255, 255, 255, 0.98)"
          stroke="rgba(15, 23, 42, 0.9)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M3.2 3.1L3.2 14.7L6.8 11.3"
          stroke="rgba(148, 233, 255, 0.65)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </>,
    document.body,
  );
};

export default memo(Pointer);
