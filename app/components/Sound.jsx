"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { useLoadingContext } from "../contexts/LoadingContext";
import useDeviceDetection from "../hooks/useDeviceDetection";

const Sound = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const hasShownModalRef = useRef(false);
  const { isAppReady } = useLoadingContext();
  const { isMobile } = useDeviceDetection();

  useEffect(() => {
    if (!isAppReady) return; // Wait for loading to complete
    if (hasShownModalRef.current) return; // Already shown modal this session

    // Small delay after loading completes to ensure smooth transition
    const initTimer = setTimeout(() => {
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
    const audio = audioRef.current;
    if (!audio || !isAudioEnabled) {
      return;
    }

    if (isPlaying) {
      // Try to play, but don't change state if it fails (browser policy)
      audio.play().catch(() => {
        // Playback can fail before a trusted interaction.
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, isAudioEnabled]);

  useEffect(() => {
    if (isAudioEnabled && audioRef.current) {
      audioRef.current.load();
    }
  }, [isAudioEnabled]);

  const handleFirstUserInteraction = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Handle play() promise rejection without noisy logging.
      });
    }
    document.removeEventListener("click", handleFirstUserInteraction);
    document.removeEventListener("keydown", handleFirstUserInteraction);
    document.removeEventListener("touchstart", handleFirstUserInteraction);
  };

  const handleConsent = () => {
    setIsAudioEnabled(true);
    setIsPlaying(true);
    document.addEventListener("click", handleFirstUserInteraction);
    document.addEventListener("keydown", handleFirstUserInteraction);
    document.addEventListener("touchstart", handleFirstUserInteraction);
    setShowModal(false);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setShowModal(false);
  };

  const toggle = () => {
    if (!isAudioEnabled) {
      setIsAudioEnabled(true);
      setIsPlaying(true);
      return;
    }

    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="text-white-800 fixed top-4 right-2.5 xs:right-4 z-50 group">
      {showModal && <Modal onClose={handleClose} toggle={handleConsent} />}
      <audio ref={audioRef} loop preload="none">
        {isAudioEnabled ? (
          <source
            src="/y2mate.com - Lil Peep  XXXTENTACION  Falling Down (1).mp3"
            type="audio/mpeg"
          />
        ) : null}
        Your browser does not support the audio element.
      </audio>
      <motion.button
        onClick={toggle}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
        className={`${
          isMobile ? "w-8 h-8 p-2" : "w-10 h-10 xs:w-14 xs:h-14 p-2.5 xs:p-4"
        } text-foreground rounded-full flex items-center justify-center cursor-pointer z-50 custom-bg`}
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
