"use client";

import React, { memo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  spacing,
  layout,
  borders,
  transitions,
  cn,
} from "../styles/spacing.jsx";

const Modal = ({ onClose, toggle }) => {
  const modalRoot = document.getElementById("my-modal");

  if (!modalRoot) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ willChange: "opacity", transform: "translateZ(0)" }}
    >
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[6px]"
        style={{
          WebkitBackdropFilter: "blur(6px)",
          backdropFilter: "blur(6px)",
          willChange: "opacity, backdrop-filter",
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          willChange: "transform, opacity",
          transform: "translateZ(0)",
        }}
        className={cn(
          "relative w-[min(92vw,460px)] overflow-hidden",
          "rounded-3xl border border-white/20",
          "bg-[linear-gradient(150deg,rgba(18,30,75,0.95),rgba(10,19,45,0.94))]",
          "shadow-[0_24px_70px_rgba(2,6,23,0.58)]",
          "text-center",
          spacing.card.padding,
          "space-y-7",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/12 to-transparent" />

        <p className="relative text-white font-semibold tracking-wide text-lg">
          Would you like to play the background music?
        </p>

        <p className="relative text-[0.95rem] text-white/70 leading-relaxed px-1">
          Enable ambient sound for a richer browsing experience.
        </p>

        <div
          className={cn(layout.flex.center, spacing.interactive.gap, "pt-1")}
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggle}
            className={cn(
              "min-w-[118px] bg-white text-slate-900 hover:bg-slate-100",
              "border border-white/90",
              spacing.interactive.padding,
              borders.rounded.lg,
              transitions.default,
            )}
          >
            Yes
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            className={cn(
              "min-w-[118px] bg-white/8 hover:bg-white/14",
              "border border-white/30",
              "text-white/85 hover:text-white",
              spacing.interactive.padding,
              borders.rounded.lg,
              transitions.default,
            )}
          >
            No
          </motion.button>
        </div>
      </motion.div>
    </motion.div>,
    modalRoot,
  );
};

export default memo(Modal);
