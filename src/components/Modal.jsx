import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  spacing,
  layout,
  borders,
  transitions,
  cn,
} from "../styles/spacing.js";

const Modal = ({ onClose, toggle }) => {
  const modalRoot = document.getElementById("my-modal");

  useEffect(() => {
    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      // Restore original overflow only
      document.body.style.overflow = originalOverflow || "";

      // Force reset cursor state when modal closes
      setTimeout(() => {
        // Trigger mouseleave on all buttons to reset cursor
        const buttons = document.querySelectorAll("button");
        buttons.forEach((button) => {
          const leaveEvent = new MouseEvent("mouseleave", {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          button.dispatchEvent(leaveEvent);
        });

        // Reset cursor classes
        const cursor = document.querySelector(".cursor");
        const cursorOuter = document.querySelector(".cursor-outer");
        if (cursor) {
          cursor.classList.remove(
            "cursor-hover",
            "cursor-link",
            "cursor-button",
            "cursor-clicked"
          );
          cursor.style.transition = "";
        }
        if (cursorOuter) {
          cursorOuter.classList.remove(
            "cursor-outer-hover",
            "cursor-outer-clicked"
          );
        }
      }, 50);
    };
  }, []);
  if (!modalRoot) {
    console.warn("Modal root element not found");
    return null;
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "z-[9999] text-white-800 fixed inset-0 bg-background/60 backdrop-blur-sm",
          layout.flex.center
        )}
        onClick={(e) => {
          // Prevent closing when clicking inside modal
          if (e.target === e.currentTarget) {
            // Optional: close on backdrop click
            // onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            delay: 0.1,
          }}
          className={cn(
            "bg-background/20 backdrop-blur-[6px] shadow-glass-inset text-center",
            borders.default,
            borders.rounded.lg,
            spacing.card.padding,
            "space-y-8"
          )}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="font-light"
          >
            Do you like to play the background music?
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className={cn(layout.flex.center, spacing.interactive.gap)}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggle}
              className={cn(
                spacing.interactive.padding,
                borders.default,
                "hover:shadow-glass-sm hover:bg-accent/10",
                borders.rounded.md,
                transitions.default
              )}
            >
              Yes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={cn(
                spacing.interactive.padding,
                borders.default,
                "hover:shadow-glass-sm hover:bg-accent/10",
                borders.rounded.md,
                transitions.default
              )}
            >
              No
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    modalRoot
  );
};

export default Modal;
