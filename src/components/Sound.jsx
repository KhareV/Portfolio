import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";

const Sound = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const initialRenderRef = useRef(true);

  useEffect(() => {
    if (!initialRenderRef.current) return;

    const consent = localStorage.getItem("musicConsent");
    const consentTime = localStorage.getItem("consentTime");
    const consentIsValid =
      consent &&
      consentTime &&
      new Date(consentTime).getTime() + 3 * 24 * 60 * 60 * 1000 >
        new Date().getTime();

    if (!consentIsValid) {
      // Show modal immediately on mount
      setShowModal(true);
    } else {
      setIsPlaying(consent === "true");
      if (consent === "true") {
        // Add event listeners for first interaction
        document.addEventListener("click", handleFirstUserInteraction);
        document.addEventListener("keydown", handleFirstUserInteraction);
        document.addEventListener("touchstart", handleFirstUserInteraction);
      }
    }

    initialRenderRef.current = false;

    return () => {
      document.removeEventListener("click", handleFirstUserInteraction);
      document.removeEventListener("keydown", handleFirstUserInteraction);
      document.removeEventListener("touchstart", handleFirstUserInteraction);
    };
  }, []);

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
    if (!isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Handle play() promise rejection
        console.log("Playback failed, waiting for explicit user interaction");
      });
      setIsPlaying(true);
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
    localStorage.setItem("musicConsent", "true");
    localStorage.setItem("consentTime", new Date().toISOString());
    setShowModal(false);
  };

  const handleClose = () => {
    setIsPlaying(false);
    localStorage.setItem("musicConsent", "false");
    localStorage.setItem("consentTime", new Date().toISOString());
    setShowModal(false);
  };

  const toggle = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    localStorage.setItem("musicConsent", String(newState));
    localStorage.setItem("consentTime", new Date().toISOString());
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
