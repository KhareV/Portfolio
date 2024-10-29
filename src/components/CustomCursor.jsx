// CustomCursor.js
import React, { useEffect, useRef } from "react";

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const trailsRef = useRef([]);
  const requestRef = useRef();
  const isHovered = useRef(false);
  const hoverTargetCenter = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const TRAIL_COUNT = 3;
    const trails = Array.from({ length: TRAIL_COUNT }, () => {
      const trail = document.createElement("div");
      trail.className = "trail";
      document.body.appendChild(trail);
      return trail;
    });
    trailsRef.current = trails;

    let mousePosition = { x: 0, y: 0 };
    let currentPosition = { x: 0, y: 0 };

    const mouseMoveHandler = (event) => {
      mousePosition.x = event.clientX;
      mousePosition.y = event.clientY;
    };

    const setHoverState = (target) => {
      const rect = target.getBoundingClientRect();
      hoverTargetCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      isHovered.current = true;
    };

    const resetHoverState = () => {
      isHovered.current = false;
    };

    const animate = () => {
      if (isHovered.current) {
        currentPosition.x = hoverTargetCenter.current.x;
        currentPosition.y = hoverTargetCenter.current.y;
      } else {
        currentPosition.x += (mousePosition.x - currentPosition.x) * 0.3;
        currentPosition.y += (mousePosition.y - currentPosition.y) * 0.3;
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px)`;
        cursorRef.current.style.width = isHovered.current ? "30px" : "20px";
        cursorRef.current.style.height = isHovered.current ? "30px" : "20px";
      }

      trailsRef.current.forEach((trail, index) => {
        const delay = index * 0.05; // Adjusted delay for smoother effect
        requestAnimationFrame(() => {
          trail.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px)`;
        });
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    const targets = document.querySelectorAll("button, a");
    targets.forEach((target) => {
      target.addEventListener("mouseenter", () => setHoverState(target));
      target.addEventListener("mouseleave", resetHoverState);
    });

    window.addEventListener("mousemove", mouseMoveHandler);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
      cancelAnimationFrame(requestRef.current);
      trails.forEach((trail) => trail.remove());
      targets.forEach((target) => {
        target.removeEventListener("mouseenter", () => setHoverState(target));
        target.removeEventListener("mouseleave", resetHoverState);
      });
    };
  }, []);

  return <div ref={cursorRef} className="cursor" />;
};

export default CustomCursor;
