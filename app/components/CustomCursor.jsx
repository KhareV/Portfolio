"use client";

import React, { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR = "button, a, input, textarea, select, .interactive";
const BASE_FOLLOW_EASING = 0.22;
const HOVER_FOLLOW_EASING = 0.28;
const MAX_MAGNETIC_STRENGTH = 0.58;
const MIN_MAGNETIC_RADIUS = 80;
const MAX_MAGNETIC_RADIUS = 220;

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorOuterRef = useRef(null);
  const trailsRef = useRef([]);
  const requestRef = useRef(null);
  const activeTargetRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const supportsFinePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setIsEnabled(supportsFinePointer && !prefersReducedMotion);
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let currentPosition = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    const magneticTarget = {
      x: currentPosition.x,
      y: currentPosition.y,
      radius: 64,
    };
    const isHovered = { current: false };
    const isClicked = { current: false };
    let previousTimestamp = 0;
    const velocity = { x: 0, y: 0 };

    const deviceMemory =
      typeof navigator !== "undefined" && navigator.deviceMemory
        ? navigator.deviceMemory
        : 8;
    const TRAIL_COUNT = deviceMemory <= 4 ? 2 : 3;
    const trails = Array.from({ length: TRAIL_COUNT }, (_, index) => {
      const trail = document.createElement("div");
      trail.className = "trail";
      trail.style.opacity = String(0.6 - index * 0.12);
      trail.style.scale = String(1 - index * 0.08);
      document.body.appendChild(trail);
      return trail;
    });
    trailsRef.current = trails;

    const trailPositions = trails.map(() => ({
      x: currentPosition.x,
      y: currentPosition.y,
    }));

    const getInteractiveTarget = (target) => {
      if (!(target instanceof Element)) {
        return null;
      }
      return target.closest(INTERACTIVE_SELECTOR);
    };

    const updateMagneticTargetFromElement = (element) => {
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      magneticTarget.x = rect.left + rect.width / 2;
      magneticTarget.y = rect.top + rect.height / 2;
      magneticTarget.radius = Math.min(
        MAX_MAGNETIC_RADIUS,
        Math.max(MIN_MAGNETIC_RADIUS, Math.max(rect.width, rect.height) * 1.8),
      );
    };

    const resolveInteractiveTarget = (event) => {
      if (typeof document === "undefined") {
        return null;
      }

      const hitElement = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );
      if (hitElement) {
        return getInteractiveTarget(hitElement);
      }

      return getInteractiveTarget(event.target);
    };

    const clearCursorStateClasses = () => {
      cursorRef.current?.classList.remove(
        "cursor-hover",
        "cursor-link",
        "cursor-button",
      );
      cursorOuterRef.current?.classList.remove("cursor-outer-hover");
    };

    const setActiveTarget = (target) => {
      if (target === activeTargetRef.current) {
        return;
      }

      activeTargetRef.current = target;
      isHovered.current = Boolean(target);

      if (!target) {
        clearCursorStateClasses();
        return;
      }

      updateMagneticTargetFromElement(target);

      cursorRef.current?.classList.add("cursor-hover");
      cursorOuterRef.current?.classList.add("cursor-outer-hover");
      cursorRef.current?.classList.remove("cursor-link", "cursor-button");

      if (target.tagName === "A") {
        cursorRef.current?.classList.add("cursor-link");
      }
      if (target.tagName === "BUTTON") {
        cursorRef.current?.classList.add("cursor-button");
      }
    };

    const mouseMoveHandler = (event) => {
      mousePosition.x = event.clientX;
      mousePosition.y = event.clientY;

      const target = resolveInteractiveTarget(event);
      setActiveTarget(target);

      const now = performance.now();
      if (previousTimestamp) {
        const dt = now - previousTimestamp;
        if (dt > 0) {
          velocity.x = (mousePosition.x - currentPosition.x) / dt;
          velocity.y = (mousePosition.y - currentPosition.y) / dt;
        }
      }
      previousTimestamp = now;
    };

    const mouseDownHandler = () => {
      isClicked.current = true;
      cursorRef.current?.classList.add("cursor-clicked");
      cursorOuterRef.current?.classList.add("cursor-outer-clicked");
    };

    const mouseUpHandler = () => {
      isClicked.current = false;
      cursorRef.current?.classList.remove("cursor-clicked");
      cursorOuterRef.current?.classList.remove("cursor-outer-clicked");
    };

    const leaveWindowHandler = () => {
      setActiveTarget(null);
    };

    const animate = () => {
      let targetX = mousePosition.x;
      let targetY = mousePosition.y;
      let followEasing = BASE_FOLLOW_EASING;

      const activeTarget = activeTargetRef.current;
      if (activeTarget?.isConnected) {
        updateMagneticTargetFromElement(activeTarget);

        const dx = magneticTarget.x - mousePosition.x;
        const dy = magneticTarget.y - mousePosition.y;
        const distance = Math.hypot(dx, dy);
        const normalized = Math.max(0, 1 - distance / magneticTarget.radius);
        const attractionStrength =
          Math.pow(normalized, 1.35) * MAX_MAGNETIC_STRENGTH;

        targetX = mousePosition.x + dx * attractionStrength;
        targetY = mousePosition.y + dy * attractionStrength;
        followEasing = HOVER_FOLLOW_EASING;
        isHovered.current = normalized > 0.03;
      } else if (activeTarget) {
        setActiveTarget(null);
        isHovered.current = false;
      } else {
        isHovered.current = false;
      }

      currentPosition.x += (targetX - currentPosition.x) * followEasing;
      currentPosition.y += (targetY - currentPosition.y) * followEasing;

      if (cursorRef.current) {
        const speed = Math.sqrt(
          velocity.x * velocity.x + velocity.y * velocity.y,
        );
        const dynamicScale = isHovered.current
          ? 1.2
          : Math.max(0.85, Math.min(1.08, 1 + speed * 0.001));

        cursorRef.current.style.transform = `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0) scale(${isClicked.current ? 0.8 : dynamicScale})`;
        cursorRef.current.style.boxShadow = isHovered.current
          ? "0 0 20px 5px rgba(255, 217, 0, 0.6)"
          : "0 0 10px rgba(255, 217, 0, 0.25)";
      }

      if (cursorOuterRef.current) {
        cursorOuterRef.current.style.transform = `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0) scale(${isHovered.current ? 1.6 : 1})`;
      }

      let leaderX = currentPosition.x;
      let leaderY = currentPosition.y;
      trails.forEach((trail, index) => {
        const smoothing = Math.max(0.08, 0.2 - index * 0.04);
        trailPositions[index].x +=
          (leaderX - trailPositions[index].x) * smoothing;
        trailPositions[index].y +=
          (leaderY - trailPositions[index].y) * smoothing;

        trail.style.transform = `translate3d(${trailPositions[index].x}px, ${trailPositions[index].y}px, 0) scale(${isHovered.current ? 0.85 - index * 0.1 : 1 - index * 0.1})`;
        trail.style.opacity = String(
          isHovered.current ? 0.3 - index * 0.06 : 0.55 - index * 0.1,
        );

        leaderX = trailPositions[index].x;
        leaderY = trailPositions[index].y;
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    const visibilityHandler = () => {
      if (document.hidden) {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
        }
        return;
      }

      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0)`;
      cursorRef.current.style.opacity = "1";
    }

    if (cursorOuterRef.current) {
      cursorOuterRef.current.style.transform = `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0)`;
      cursorOuterRef.current.style.opacity = "1";
    }

    window.addEventListener("mousemove", mouseMoveHandler, { passive: true });
    window.addEventListener("mousedown", mouseDownHandler, { passive: true });
    window.addEventListener("mouseup", mouseUpHandler, { passive: true });
    window.addEventListener("mouseleave", leaveWindowHandler, {
      passive: true,
    });
    document.addEventListener("visibilitychange", visibilityHandler);

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      window.removeEventListener("mouseleave", leaveWindowHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);

      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }

      trails.forEach((trail) => trail.remove());
      trailsRef.current = [];
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      <div ref={cursorOuterRef} className="cursor-outer" />
      <div ref={cursorRef} className="cursor" />
    </>
  );
};

export default CustomCursor;
