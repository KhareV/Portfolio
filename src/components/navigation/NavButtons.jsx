// NavButton.jsx
import {
  Github,
  Home,
  Linkedin,
  NotebookText,
  Palette,
  Phone,
  Twitter,
  User,
} from "lucide-react";
import React, { useState, useRef } from "react";
import ResponsiveComponent from "../ResponsiveComponent";
import clsx from "clsx";
import { motion } from "framer-motion";

const getIcon = (icon) => {
  switch (icon) {
    case "Home":
      return <Home className="w-full h-auto" strokeWidth={1.5} />;
    case "About":
      return <User className="w-full h-auto" strokeWidth={1.5} />;
    case "Work":
      return <Palette className="w-full h-auto" strokeWidth={1.5} />;
    case "Contact":
      return <Phone className="w-full h-auto" strokeWidth={1.5} />;
    default:
      return <Home className="w-full h-auto" strokeWidth={1.5} />;
  }
};

const item = {
  hidden: { scale: 0 },
  show: { scale: 1 },
};

const NavButton = ({
  x,
  y,
  name,
  href,
  icon,
  angle = 0,
  isWheelRotating = true,
  labelDirection = "right",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <ResponsiveComponent>
      {({ size }) => {
        return size && size >= 480 ? (
          <div
            ref={buttonRef}
            className="absolute z-50 pointer-events-auto"
            style={{
              transform: `translate(${x}, ${y})`,
              zIndex: isHovered ? 100 : 50,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.a
              variants={item}
              href={href}
              className={`text-foreground rounded-full flex items-center justify-center transition-all duration-300 ${
                isHovered
                  ? "bg-yellow-600/30 border-yellow-500/50 shadow-[0_0_15px_rgba(255,217,0,0.5)]"
                  : "custom-bg"
              }`}
              aria-label={name}
            >
              {/* Button content with self-counter-rotation */}
              <div
                className={`relative w-14 h-14 p-4 flex items-center justify-center ${
                  isWheelRotating ? "animate-spin-slow-reverse" : ""
                }`}
              >
                {/* Static icon that brightens on hover */}
                <div
                  className={`transition-all duration-300 ${
                    isHovered ? "text-yellow-400 scale-125" : ""
                  }`}
                >
                  {getIcon(icon)}
                </div>

                {/* Tooltip that appears on hover */}
                <div
                  className={`absolute px-3 py-1.5 bg-black/80 border border-yellow-500/30 rounded-md left-16 text-yellow-100 whitespace-nowrap text-sm transition-all duration-300 ${
                    isHovered
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2"
                  }`}
                >
                  {name}
                </div>
              </div>
            </motion.a>
          </div>
        ) : (
          <div
            className="w-fit pointer-events-auto cursor-pointer z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.a
              variants={item}
              href={href}
              className={`text-foreground rounded-full flex items-center justify-center transition-all duration-300 ${
                isHovered
                  ? "bg-yellow-600/30 border-yellow-500/50 shadow-[0_0_15px_rgba(255,217,0,0.5)]"
                  : "custom-bg"
              }`}
              aria-label={name}
            >
              <span className="relative w-10 h-10 xs:w-14 xs:h-14 p-2.5 xs:p-4 flex items-center justify-center">
                <span
                  className={`transition-all duration-300 ${
                    isHovered ? "text-yellow-400 scale-125" : ""
                  }`}
                >
                  {getIcon(icon)}
                </span>

                {/* Tooltip */}
                <span
                  className={`absolute px-3 py-1.5 bg-black/80 border border-yellow-500/30 rounded-md ${
                    labelDirection === "left"
                      ? "right-full mr-3"
                      : "left-full ml-3"
                  } top-1/2 -translate-y-1/2 text-yellow-100 whitespace-nowrap text-sm transition-all duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {name}
                </span>
              </span>
            </motion.a>
          </div>
        );
      }}
    </ResponsiveComponent>
  );
};

export default NavButton;
