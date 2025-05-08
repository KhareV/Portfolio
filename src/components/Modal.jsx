import React from "react";
import { createPortal } from "react-dom";

const Modal = ({ onClose, toggle }) => {
  const modalRoot = document.getElementById("my-modal");
  if (!modalRoot) return null;

  return createPortal(
    <div className="z-50 text-white-800 fixed inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background/20 border border-accent/30 border-solid backdrop-blur-[6px] py-8 px-6 xs:px-10 sm:px-16 rounded shadow-glass-inset text-center space-y-8">
        <p className="font-light">Do you like to play the background music?</p>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggle}
            className="px-4 py-2 border border-accent/30 border-solid hover:shadow-glass-sm rounded mr-2"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-accent/30 border-solid hover:shadow-glass-sm rounded"
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
