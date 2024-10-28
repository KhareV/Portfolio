import React from "react";
import { motion } from "framer-motion";
import { FaHtml5, FaCss3Alt, FaReact, FaNodeJs } from "react-icons/fa";
import { SiNextdotjs, SiMongodb, SiExpress } from "react-icons/si";

const logos = [
  { icon: <FaHtml5 />, name: "HTML Logo", delay: 0 },
  { icon: <FaCss3Alt />, name: "CSS Logo", delay: 0.4 },
  { icon: <FaReact />, name: "React Logo", delay: 0.8 },
  { icon: <SiNextdotjs />, name: "Next.js Logo", delay: 1.2 },
  { icon: <SiMongodb />, name: "MongoDB Logo", delay: 1.6 },
  { icon: <SiExpress />, name: "Express Logo", delay: 2 },
  { icon: <FaNodeJs />, name: "Node.js Logo", delay: 2.4 },
];

const LogoAnimation = () => {
  return (
    <div className="bg-tertiary p-4 pt-8 rounded-lg shadow-lg mt-10 mx-auto w-full max-w-4xl flex justify-around items-center">
      {logos.map((logo, index) => (
        <motion.div
          className="text-white text-5xl p-4"
          key={index}
          title={logo.name}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0, scale: [1, 1.05, 1] }}
          transition={{
            delay: logo.delay,
            duration: 1.5, // Slower slide-in
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1.5, // Pause between floats
          }}
        >
          {logo.icon}
        </motion.div>
      ))}
    </div>
  );
};

export default LogoAnimation;
