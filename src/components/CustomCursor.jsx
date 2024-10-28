// CustomCursor.js
import React, { useEffect, useRef } from "react";

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const trailsRef = useRef([]);
  const requestRef = useRef();
  const previousTimeRef = useRef();

  useEffect(() => {
    let trails = [];
    // Reduced to just 3 trail elements for a smaller tail
    const TRAIL_COUNT = 3;

    // Create trail elements
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const trail = document.createElement("div");
      trail.className = "trail";
      document.body.appendChild(trail);
      trails.push(trail);
    }
    trailsRef.current = trails;

    let mousePosition = { x: 0, y: 0 };
    let currentPosition = { x: 0, y: 0 };

    const mouseMoveHandler = (event) => {
      mousePosition.x = event.clientX;
      mousePosition.y = event.clientY;
    };

    const animate = (time) => {
      if (previousTimeRef.current !== undefined) {
        // Increased to 0.4 for snappier movement
        currentPosition.x += (mousePosition.x - currentPosition.x) * 0.4;
        currentPosition.y += (mousePosition.y - currentPosition.y) * 0.4;

        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate(${currentPosition.x}px, ${currentPosition.y}px)`;
        }

        trailsRef.current.forEach((trail, index) => {
          // Reduced delay for tighter trail
          const delay = index * 0.02;
          const x = currentPosition.x;
          const y = currentPosition.y;

          setTimeout(() => {
            trail.style.transform = `translate(${x}px, ${y}px)`;
          }, delay * 1000);
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", mouseMoveHandler);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
      cancelAnimationFrame(requestRef.current);
      trailsRef.current.forEach((trail) => {
        trail.remove();
      });
    };
  }, []);

  return <div ref={cursorRef} className="cursor" />;
};

export default CustomCursor;
