import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MobileConstructionPageFallback from "./MobileConstructionPageFallback";

const MobileConstructionPage = () => {
  const [currentText, setCurrentText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [hasMotionError, setHasMotionError] = useState(false);

  const fullText = "Site under construction for mobile devices...";

  useEffect(() => {
    // Test if motion is available
    try {
      // This will throw if motion components are not available
      if (!motion) {
        setHasMotionError(true);
        return;
      }
    } catch (error) {
      setHasMotionError(true);
      return;
    }

    let index = 0;
    const typeText = () => {
      if (index < fullText.length) {
        setCurrentText(fullText.slice(0, index + 1));
        index++;
        setTimeout(typeText, 100);
      }
    };

    const timer = setTimeout(typeText, 1000);

    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(cursorInterval);
    };
  }, []);

  // Fallback to non-motion version if there are issues
  if (hasMotionError) {
    return <MobileConstructionPageFallback />;
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 overflow-hidden relative mobile-construction">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-20"
              initial={{
                x: Math.random() * (window.innerWidth || 800),
                y: Math.random() * (window.innerHeight || 600),
              }}
              animate={{
                x: Math.random() * (window.innerWidth || 800),
                y: Math.random() * (window.innerHeight || 600),
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        <div className="text-center z-10 max-w-md mx-auto">
          {/* Construction Icon Animation */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
          >
            <div className="relative">
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🚧
              </motion.div>

              {/* Animated gears */}
              <motion.div
                className="absolute -top-2 -right-2 text-2xl"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                ⚙️
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-2 text-xl"
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                🔧
              </motion.div>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className="text-4xl font-bold text-white mb-6 font-mono"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <span className="text-yellow-400">Vedant's</span>
            <br />
            <span className="text-white">Portfolio</span>
          </motion.h1>

          {/* Typing Animation */}
          <motion.div
            className="text-lg text-gray-300 mb-8 font-mono min-h-[2rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {currentText}
            <span
              className={`${
                showCursor ? "opacity-100" : "opacity-0"
              } text-yellow-400`}
            >
              |
            </span>
          </motion.div>

          {/* Device Icons */}
          <motion.div
            className="flex justify-center space-x-8 mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <motion.div
              className="text-red-400 text-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📱
            </motion.div>
            <motion.div
              className="text-gray-400 text-2xl mx-4 self-center"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✖️
            </motion.div>
            <motion.div
              className="text-green-400 text-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              💻
            </motion.div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">
              Best Experience Awaits! 🌟
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              This portfolio is optimized for desktop and laptop viewing to
              showcase interactive 3D elements and animations.
            </p>
            <div className="text-xs text-gray-400">
              Please access from a laptop or desktop computer for the full
              experience.
            </div>
          </motion.div>

          {/* Loading Animation */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            <div className="flex justify-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Working on mobile version...
            </p>
          </motion.div>

          {/* Contact Links */}
          <motion.div
            className="mt-8 flex justify-center space-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
          >
            <motion.a
              href="https://linkedin.com/in/vedant-khare-6b31ba250"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>📧</span>
              <span>LinkedIn</span>
            </motion.a>
            <motion.a
              href="https://github.com/KhareV"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors text-sm flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>💻</span>
              <span>GitHub</span>
            </motion.a>
          </motion.div>
        </div>

        {/* Corner decoration */}
        <div className="absolute top-4 right-4">
          <motion.div
            className="text-yellow-400 text-2xl opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ⚡
          </motion.div>
        </div>

        <div className="absolute bottom-4 left-4">
          <motion.div
            className="text-yellow-400 text-xl opacity-20"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            🛠️
          </motion.div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Motion animation error:", error);
    return <MobileConstructionPageFallback />;
  }
};

export default MobileConstructionPage;
