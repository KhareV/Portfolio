"use client";
import { motion } from "motion/react";
import { FaBriefcase } from "react-icons/fa";
import { spacing, borders, transitions, cn } from "../styles/spacing.js";

export default function ResumeButton() {
  return (
    <a
      href="https://youtu.be/Sn3SUnL44w4?si=35OyaUUAQPh2BnYN&t=7"
      target="_blank"
      rel="noopener noreferrer"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 2, ease: "easeInOut" }}
        className={cn(
          "absolute bg-hubspot border-2 dark:text-foreground text-accent hover:scale-110",
          spacing.text.gap,
          borders.rounded.full,
          spacing.interactive.padding,
          transitions.default
        )}
      >
        {/* <p className="font-sans font-black text-xs">RESUME</p>{" "} */}
        <FaBriefcase className="sm:text-xl" />
      </motion.div>
    </a>
  );
}
