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
import CustomCursor from "./CustomCursor";

const LoadingSpinner = ({ onLoadComplete }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide overflow when component mounts
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setLoading(false);
      onLoadComplete();
    }, 5500);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      // Ensure overflow is reset to auto, irrespective of loading state
      document.body.style.overflow = "auto";
    };
  }, [onLoadComplete]);

  useEffect(() => {
    // When loading state changes, toggle overflow
    if (!loading) {
      document.body.style.overflow = "auto";
    }
  }, [loading]);

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

  return (
    <>
      <CustomCursor />
      loading ? (
      <div className="loading-screen">
        <div className="snake">
          {icons.map((icon, index) => (
            <div
              key={index}
              className="icon-wrapper"
              style={{
                "--color": icon.color,
                "--delay": `${index * 0.15}s`,
              }}
            >
              <icon.Icon />
            </div>
          ))}
        </div>
      </div>
      ) : null
    </>
  );
};

export default LoadingSpinner;
