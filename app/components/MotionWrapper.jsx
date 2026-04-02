// Server component wrapper - client boundary pushed down
"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

// Extract motion wrapper to minimize client bundle
const MotionWrapper = ({ children, className }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default MotionWrapper;
