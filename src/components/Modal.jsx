import React, { useEffect } from "react";
import { createPortal } from "react-dom";
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
    <div
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
      <div
        className={cn(
          "bg-background/20 backdrop-blur-[6px] shadow-glass-inset text-center",
          borders.default,
          borders.rounded.lg,
          spacing.card.padding,
          "space-y-8"
        )}
      >
        <p className="font-light">Do you like to play the background music?</p>
        <div className={cn(layout.flex.center, spacing.interactive.gap)}>
          <button
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
          </button>
          <button
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
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
