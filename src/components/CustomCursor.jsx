import React, { useEffect, useRef, useState } from "react";

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorOuterRef = useRef(null);
  const trailsRef = useRef([]);
  const requestRef = useRef();
  const isHovered = useRef(false);
  const isClicked = useRef(false);
  const hoverTargetCenter = useRef({ x: 0, y: 0 });
  const mutationObserverRef = useRef(null);
  const interactiveElements =
    "button, a, input, textarea, select, .interactive";

  useEffect(() => {
    const TRAIL_COUNT = 5; // Increasing trail count for smoother effect
    const trails = Array.from({ length: TRAIL_COUNT }, (_, index) => {
      const trail = document.createElement("div");
      trail.className = "trail";
      trail.style.opacity = 1 - index * 0.15; // Decreasing opacity for each trail
      trail.style.scale = 1 - index * 0.05; // Decreasing scale for each trail
      document.body.appendChild(trail);
      return trail;
    });
    trailsRef.current = trails;

    let mousePosition = { x: 0, y: 0 };
    let currentPosition = { x: 0, y: 0 };
    let previousTimestamp = 0;
    let velocity = { x: 0, y: 0 };

    const mouseMoveHandler = (event) => {
      mousePosition.x = event.clientX;
      mousePosition.y = event.clientY;

      // Calculate velocity for more dynamic cursor
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

      if (cursorRef.current) {
        cursorRef.current.classList.add("cursor-clicked");
      }

      if (cursorOuterRef.current) {
        cursorOuterRef.current.classList.add("cursor-outer-clicked");
      }
    };

    const mouseUpHandler = () => {
      isClicked.current = false;

      if (cursorRef.current) {
        cursorRef.current.classList.remove("cursor-clicked");
      }

      if (cursorOuterRef.current) {
        cursorOuterRef.current.classList.remove("cursor-outer-clicked");
      }
    };

    const setHoverState = (target) => {
      // Get target's center and dimensions
      const rect = target.getBoundingClientRect();
      hoverTargetCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
      };

      isHovered.current = true;

      // Immediate jump to target position for sudden effect
      if (cursorRef.current) {
        // Add special class to cursor for hover state
        cursorRef.current.classList.add("cursor-hover");
        // Apply instant transform for sudden effect
        currentPosition.x = hoverTargetCenter.current.x;
        currentPosition.y = hoverTargetCenter.current.y;
        cursorRef.current.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px) scale(1.2)`;
        cursorRef.current.style.transition =
          "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)";
      }

      if (cursorOuterRef.current) {
        cursorOuterRef.current.classList.add("cursor-outer-hover");
        cursorOuterRef.current.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px) scale(1.5)`;
      }

      // Check for specific interactive element types for custom styling
      if (target.tagName === "A") {
        cursorRef.current?.classList.add("cursor-link");
      } else if (target.tagName === "BUTTON") {
        cursorRef.current?.classList.add("cursor-button");
      }
    };

    const resetHoverState = () => {
      isHovered.current = false;

      // Remove all special classes
      if (cursorRef.current) {
        cursorRef.current.classList.remove(
          "cursor-hover",
          "cursor-link",
          "cursor-button"
        );
        cursorRef.current.style.transition =
          "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      }

      if (cursorOuterRef.current) {
        cursorOuterRef.current.classList.remove("cursor-outer-hover");
      }
    };

    const animate = () => {
      // Enhanced magnetic effect with more sudden response
      if (isHovered.current) {
        // Enhanced magnetic effect - instant snap with minor smoothing
        // The cursor jumps quickly to the target
        const target = hoverTargetCenter.current;

        // Calculate attraction strength - much stronger than before
        const attractionStrength = 0.9; // Very high for sudden effect (90% of the way there each frame)

        // Calculate new position with very strong magnetic pull
        currentPosition.x =
          mousePosition.x + (target.x - mousePosition.x) * attractionStrength;
        currentPosition.y =
          mousePosition.y + (target.y - mousePosition.y) * attractionStrength;
      } else {
        // When not hovering, cursor should follow mouse normally with subtle inertia
        const easing = 0.25; // Faster response than before (25% of the way there each frame)
        currentPosition.x += (mousePosition.x - currentPosition.x) * easing;
        currentPosition.y += (mousePosition.y - currentPosition.y) * easing;
      }

      // Apply position to cursor with additional effects
      if (cursorRef.current) {
        // Scale effect based on velocity for dynamic feeling
        const speed = Math.sqrt(
          velocity.x * velocity.x + velocity.y * velocity.y
        );
        const dynamicScale = isHovered.current
          ? 1.2
          : Math.max(0.8, Math.min(1.1, 1 + speed * 0.001));

        cursorRef.current.style.transform = `translate(${
          currentPosition.x
        }px, ${currentPosition.y}px) scale(${
          isClicked.current ? 0.8 : dynamicScale
        })`;

        // Enhanced glow effect
        cursorRef.current.style.boxShadow = isHovered.current
          ? `0 0 20px 5px rgba(255, 217, 0, 0.6)`
          : `0 0 10px rgba(255, 217, 0, 0.25)`;
      }

      // Animate outer cursor with slightly delayed follow for contrast
      if (cursorOuterRef.current) {
        // Outer ring follows with slight delay for visual interest
        const outerEasing = isHovered.current ? 0.3 : 0.15;
        const outerX = currentPosition.x;
        const outerY = currentPosition.y;

        cursorOuterRef.current.style.transform = `translate(${outerX}px, ${outerY}px) scale(${
          isHovered.current ? 1.8 : 1
        })`;
      }

      // Animate trails with staggered delay - trails follow more smoothly
      trailsRef.current.forEach((trail, index) => {
        const delay = (index + 1) * 0.03;

        setTimeout(() => {
          if (trail) {
            const trailScale = isHovered.current
              ? 0.8 - index * 0.08
              : 1 - index * 0.1;
            trail.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px) scale(${trailScale})`;
            trail.style.opacity = isHovered.current
              ? 0.3 - index * 0.05
              : 0.6 - index * 0.1;
          }
        }, delay * 1000);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    // Get all interactive elements
    const targets = document.querySelectorAll(interactiveElements);

    const mouseEnterHandler = (event) => setHoverState(event.currentTarget);
    const mouseLeaveHandler = resetHoverState;

    // Add event listeners to all targets
    targets.forEach((target) => {
      target.addEventListener("mouseenter", mouseEnterHandler);
      target.addEventListener("mouseleave", mouseLeaveHandler);
    });

    // Global event listeners
    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mousedown", mouseDownHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    // Start animation
    requestRef.current = requestAnimationFrame(animate);

    // Observe DOM changes to reapply cursor settings if elements reappear
    mutationObserverRef.current = new MutationObserver(() => {
      const updatedTargets = document.querySelectorAll(interactiveElements);
      updatedTargets.forEach((target) => {
        // Remove existing listeners to avoid duplicates
        target.removeEventListener("mouseenter", mouseEnterHandler);
        target.removeEventListener("mouseleave", mouseLeaveHandler);
        // Add fresh listeners
        target.addEventListener("mouseenter", mouseEnterHandler);
        target.addEventListener("mouseleave", mouseLeaveHandler);
      });
    });

    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup function
    return () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);
      cancelAnimationFrame(requestRef.current);
      trails.forEach((trail) => trail?.remove());
      targets.forEach((target) => {
        target.removeEventListener("mouseenter", mouseEnterHandler);
        target.removeEventListener("mouseleave", mouseLeaveHandler);
      });
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, []);

  return (
    <>
      <div ref={cursorOuterRef} className="cursor-outer" />
      <div ref={cursorRef} className="cursor" />
    </>
  );
};

export default CustomCursor;
