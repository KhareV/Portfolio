import React, { useEffect, useState } from "react";
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

const LoadingSpinner = ({ onLoadComplete, shouldHide = false }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Lock body scroll while loading
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    return () => {
      // Cleanup: restore body scroll
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, []);

  useEffect(() => {
    if (shouldHide && isVisible) {
      // Start fade out animation after a slight delay
      const startFadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 500); // Extra 500ms delay before starting fade

      // Wait for fade animation to complete before hiding
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
        onLoadComplete();

        // Restore body scroll
        document.body.style.overflow = "auto";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.height = "";
      }, 1500); // Increased: 500ms delay + 1000ms fade duration

      return () => {
        clearTimeout(startFadeTimer);
        clearTimeout(fadeTimer);
      };
    }
  }, [shouldHide, isVisible, onLoadComplete]);

  const icons = [
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

  if (!isVisible) return null;

  return (
    <div className={`loading-screen ${fadeOut ? "fade-out" : ""}`}>
      <div className="loading-content">
        <div className="snake-container">
          <div className="snake">
            {icons.map((icon, index) => (
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
