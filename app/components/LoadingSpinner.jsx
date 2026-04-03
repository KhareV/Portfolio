"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FaReact,
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaNode,
  FaGitAlt,
  FaNpm,
  FaDatabase,
  FaDocker,
  FaAws,
  FaPython,
  FaVuejs,
} from "react-icons/fa";

const ICONS = [
  { Icon: FaReact, color: "#61DAFB" },
  { Icon: FaHtml5, color: "#E34F26" },
  { Icon: FaCss3Alt, color: "#1572B6" },
  { Icon: FaJs, color: "#F7DF1E" },
  { Icon: FaNode, color: "#339933" },
  { Icon: FaGitAlt, color: "#F05032" },
  { Icon: FaNpm, color: "#CB3837" },
  { Icon: FaDatabase, color: "#336791" },
  { Icon: FaDocker, color: "#2496ED" },
  { Icon: FaAws, color: "#FF9900" },
  { Icon: FaPython, color: "#3776AB" },
  { Icon: FaVuejs, color: "#4FC08D" },
];

const captureBodyStyles = () => ({
  overflow: document.body.style.overflow,
  position: document.body.style.position,
  width: document.body.style.width,
  height: document.body.style.height,
});

const lockBodyScroll = () => {
  Object.assign(document.body.style, {
    overflow: "hidden",
    position: "fixed",
    width: "100%",
    height: "100%",
  });
};

const restoreBodyStyles = (styles) => {
  if (!styles) {
    return;
  }

  Object.assign(document.body.style, styles);
};

const LoadingSpinner = ({ onLoadComplete, shouldHide = false }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const originalBodyStylesRef = useRef(null);

  useEffect(() => {
    originalBodyStylesRef.current = captureBodyStyles();
    lockBodyScroll();

    return () => {
      restoreBodyStyles(originalBodyStylesRef.current);
    };
  }, []);

  useEffect(() => {
    if (shouldHide && isVisible) {
      // Start fade out immediately when ready
      setFadeOut(true);

      // Wait for fade animation to complete before hiding
      const fadeTimer = window.setTimeout(() => {
        setIsVisible(false);
        onLoadComplete();

        restoreBodyStyles(originalBodyStylesRef.current);
      }, 800); // 800ms fade duration

      return () => {
        window.clearTimeout(fadeTimer);
      };
    }
  }, [shouldHide, isVisible, onLoadComplete]);

  if (!isVisible) return null;

  return (
    <div className={`loading-screen ${fadeOut ? "fade-out" : ""}`}>
      <div className="loading-content">
        <div className="snake-container">
          <div className="snake">
            {ICONS.map((icon, index) => (
              <div
                key={index}
                className="icon-wrapper"
                style={{
                  "--color": icon.color,
                  "--delay": `${index * 0.12}s`,
                  "--index": index,
                }}
              >
                <icon.Icon />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
