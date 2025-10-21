import React from "react";
import { motion } from "framer-motion";

const SectionLoader = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-yellow-600/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-t-4 border-yellow-600"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
        <motion.p
          className="text-gray-400 text-sm"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SectionLoader;
