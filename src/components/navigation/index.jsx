import { navLinks } from "../../constants/index";
import React, { useState } from "react";
import useScreenSize from "../../hooks/useScreenSize";
import { motion } from "framer-motion";
import NavButton from "./NavButtons";
import ResponsiveComponent from "../ResponsiveComponent";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const Navigation = () => {
  const angleIncrement = 360 / navLinks.length;
  const size = useScreenSize();
  const isLarge = size >= 1024;
  const isMedium = size >= 768;
  const [isRotating, setIsRotating] = useState(true);

  return (
    <div className="absolute top-0 left-0 w-full h-screen flex items-center justify-center text-white-800 pointer-events-none">
      <ResponsiveComponent>
        {({ size }) => {
          return size && size >= 480 ? (
            <div className="relative w-[80vw] h-[80vh] flex items-center justify-center">
              {/* Static container that doesn't rotate */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                {navLinks.map((btn, index) => {
                  const angleRad = (index * angleIncrement * Math.PI) / 180;
                  const radius = isLarge
                    ? "calc(18vw - 1rem)"
                    : isMedium
                    ? "calc(30vw - 1rem)"
                    : "calc(40vw - 1rem)";

                  // Calculate button position based on angle and radius
                  const x = `calc(${radius} * ${Math.cos(angleRad)})`;
                  const y = `calc(${radius} * ${Math.sin(angleRad)})`;

                  return (
                    <NavButton
                      key={btn.name}
                      x={x}
                      y={y}
                      angle={index * angleIncrement}
                      isWheelRotating={isRotating}
                      {...btn}
                    />
                  );
                })}
              </motion.div>

              {/* Visual rotating ring (purely decorative) */}
              <div
                className="absolute w-full h-full rounded-full border border-yellow-500/10 animate-spin-slow pointer-events-none"
                style={{
                  width: isLarge ? "36vw" : isMedium ? "60vw" : "80vw",
                  height: isLarge ? "36vw" : isMedium ? "60vw" : "80vw",
                  animationPlayState: isRotating ? "running" : "paused",
                }}
              />
            </div>
          ) : (
            <>
              {/* Mobile view with columns of buttons */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="w-full px-2.5 xs:p-0 xs:w-max flex flex-col space-y-4 items-start xs:items-center justify-center relative group xs:hidden"
              >
                {navLinks.slice(0, navLinks.length / 2).map((btn) => (
                  <NavButton key={btn.name} x={0} y={0} {...btn} />
                ))}
              </motion.div>

              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="w-full px-2.5 xs:p-0 xs:w-max flex flex-col space-y-4 items-end xs:items-center justify-center relative group xs:hidden"
              >
                {navLinks.slice(navLinks.length / 2).map((btn) => (
                  <NavButton
                    key={btn.name}
                    x={0}
                    y={0}
                    {...btn}
                    labelDirection="left"
                  />
                ))}
              </motion.div>
            </>
          );
        }}
      </ResponsiveComponent>
    </div>
  );
};

export default Navigation;
