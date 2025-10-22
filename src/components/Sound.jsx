import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { useLoadingContext } from "../contexts/LoadingContext";

const Sound = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const hasShownModalRef = useRef(false);
  const { isAppReady } = useLoadingContext();

  useEffect(() => {
    if (!isAppReady) return; // Wait for loading to complete
    if (hasShownModalRef.current) return; // Already shown modal this session

    console.log("App is ready, showing music prompt...");

    // Small delay after loading completes to ensure smooth transition
    const initTimer = setTimeout(() => {
      // Always show modal on page load (removed localStorage check)
      console.log("Showing music modal...");
      setShowModal(true);
      hasShownModalRef.current = true;
    }, 3500); // Smooth delay after loading completes

    return () => {
      clearTimeout(initTimer);
      document.removeEventListener("click", handleFirstUserInteraction);
      document.removeEventListener("keydown", handleFirstUserInteraction);
      document.removeEventListener("touchstart", handleFirstUserInteraction);
    };
  }, [isAppReady]);

  // Effect to handle audio when isPlaying changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // Try to play, but don't change state if it fails (browser policy)
        audioRef.current.play().catch((error) => {
          console.log("Playback failed:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleFirstUserInteraction = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Handle play() promise rejection
        console.log("Playback failed, waiting for explicit user interaction");
      });
    }
    document.removeEventListener("click", handleFirstUserInteraction);
    document.removeEventListener("keydown", handleFirstUserInteraction);
    document.removeEventListener("touchstart", handleFirstUserInteraction);
  };

  const handleConsent = () => {
    setIsPlaying(true);
    document.addEventListener("click", handleFirstUserInteraction);
    document.addEventListener("keydown", handleFirstUserInteraction);
    document.addEventListener("touchstart", handleFirstUserInteraction);
    setShowModal(false);

    // Restore overflow and force complete cursor reset
    setTimeout(() => {
      document.body.style.overflow = "";

      // Remove hover classes from cursor elements
      const cursor = document.querySelector(".cursor");
      const cursorOuter = document.querySelector(".cursor-outer");
      if (cursor) {
        cursor.classList.remove(
          "cursor-hover",
          "cursor-link",
          "cursor-button",
          "cursor-clicked"
        );
      }
      if (cursorOuter) {
        cursorOuter.classList.remove(
          "cursor-outer-hover",
          "cursor-outer-clicked"
        );
      }

      // Force a mouse move event to reactivate custom cursor
      const moveEvent = new MouseEvent("mousemove", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      document.dispatchEvent(moveEvent);
    }, 100);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setShowModal(false);

    // Restore overflow and force complete cursor reset
    setTimeout(() => {
      document.body.style.overflow = "";

      // Remove hover classes from cursor elements
      const cursor = document.querySelector(".cursor");
      const cursorOuter = document.querySelector(".cursor-outer");
      if (cursor) {
        cursor.classList.remove(
          "cursor-hover",
          "cursor-link",
          "cursor-button",
          "cursor-clicked"
        );
      }
      if (cursorOuter) {
        cursorOuter.classList.remove(
          "cursor-outer-hover",
          "cursor-outer-clicked"
        );
      }

      // Force a mouse move event to reactivate custom cursor
      const moveEvent = new MouseEvent("mousemove", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      document.dispatchEvent(moveEvent);
    }, 100);
  };

  const toggle = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
  };

  return (
    <div className="text-white-800 fixed top-4 right-2.5 xs:right-4 z-50 group">
      {showModal && <Modal onClose={handleClose} toggle={handleConsent} />}
      <audio ref={audioRef} loop>
        <source
          src="/y2mate.com - Lil Peep  XXXTENTACION  Falling Down (1).mp3"
          type="audio/mpeg"
        />
        Your browser does not support the audio element.
      </audio>
      <motion.button
        onClick={toggle}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
        className="w-10 h-10 xs:w-14 xs:h-14 text-foreground rounded-full flex items-center justify-center cursor-pointer z-50 p-2.5 xs:p-4 custom-bg"
        aria-label="Sound control button"
        name="Sound control button"
      >
        {isPlaying ? (
          <Volume2
            className="w-full h-full text-foreground group-hover:text-accent"
            strokeWidth={1.5}
          />
        ) : (
          <VolumeX
            className="w-full h-full text-foreground group-hover:text-accent"
            strokeWidth={1.5}
          />
        )}
      </motion.button>
    </div>
  );
};

export default Sound;
