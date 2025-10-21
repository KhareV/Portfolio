import React, { useState, useEffect } from "react";

const MobileConstructionPageFallback = () => {
  const [currentText, setCurrentText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const fullText = "Site under construction for mobile devices...";

  useEffect(() => {
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

  return (
    <div className="min-h-screen construction-bg flex items-center justify-center p-4 overflow-hidden relative mobile-construction">
      {/* Simple animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-20 construction-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center z-10 max-w-md mx-auto">
        {/* Construction Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-6xl mb-4 bounce-gentle">🚧</div>

            {/* Animated gears */}
            <div className="absolute -top-2 -right-2 text-2xl gear-rotate">
              ⚙️
            </div>
            <div className="absolute -bottom-2 -left-2 text-xl gear-rotate-reverse">
              🔧
            </div>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl font-bold text-white mb-6 font-mono">
          <span className="text-yellow-400">Vedant's</span>
          <br />
          <span className="text-white">Portfolio</span>
        </h1>

        {/* Typing Animation */}
        <div className="text-lg text-gray-300 mb-8 font-mono min-h-[2rem]">
          {currentText}
          <span
            className={`${
              showCursor ? "opacity-100" : "opacity-0"
            } text-yellow-400 typing-cursor`}
          >
            |
          </span>
        </div>

        {/* Device Icons */}
        <div className="flex justify-center space-x-8 mb-8">
          <div
            className="text-red-400 text-3xl bounce-gentle"
            style={{ animationDelay: "0s" }}
          >
            📱
          </div>
          <div className="text-gray-400 text-2xl mx-4 self-center opacity-50">
            ✖️
          </div>
          <div
            className="text-green-400 text-3xl bounce-gentle"
            style={{ animationDelay: "1s" }}
          >
            💻
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 pulse-glow">
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
        </div>

        {/* Loading Animation */}
        <div className="mt-8">
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-yellow-400 rounded-full bounce-gentle"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Working on mobile version...
          </p>
        </div>

        {/* Contact Links */}
        <div className="mt-8 flex justify-center space-x-6">
          <a
            href="https://linkedin.com/in/vedant-khare-6b31ba250"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center space-x-2"
          >
            <span>📧</span>
            <span>LinkedIn</span>
          </a>
          <a
            href="https://github.com/KhareV"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-300 transition-colors text-sm flex items-center space-x-2"
          >
            <span>💻</span>
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 right-4">
        <div className="text-yellow-400 text-2xl opacity-20 gear-rotate">
          ⚡
        </div>
      </div>

      <div className="absolute bottom-4 left-4">
        <div className="text-yellow-400 text-xl opacity-20 gear-rotate-reverse">
          🛠️
        </div>
      </div>
    </div>
  );
};

export default MobileConstructionPageFallback;
