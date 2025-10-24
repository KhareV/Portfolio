import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";

import Developer from "../components/Developer.jsx";
import CanvasLoader from "../components/CanvasLoader.jsx";
import { workExperiences } from "../constants/index.js";
import { useEffect } from "react";
import {
  spacing,
  layout,
  responsive,
  transitions,
  cn,
} from "../styles/spacing.js";
import useDeviceDetection from "../hooks/useDeviceDetection";

const WorkExperience = () => {
  const [animationName, setAnimationName] = useState("idle");
  const { isMobile } = useDeviceDetection();

  return (
    <motion.section
      className={cn("c-space", spacing.section.marginY, "relative z-10")}
      id="work"
      initial={{ opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="w-full text-white-600">
        <motion.p
          className="head-text"
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.1 }}
        >
          My Work Experience
        </motion.p>

        <div className="work-container">
          {!isMobile && (
            <div className="work-canvas">
              <Canvas>
                <ambientLight intensity={7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} />

                <Suspense fallback={<CanvasLoader />}>
                  <Developer
                    position-y={-3}
                    scale={3}
                    animationName={animationName}
                  />
                </Suspense>
              </Canvas>
            </div>
          )}

          <motion.div
            className="work-content"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className={cn(spacing.section.paddingY, spacing.card.padding)}>
              {workExperiences.map((item, index) => (
                <motion.div
                  key={index}
                  onClick={() =>
                    setAnimationName(item.animation?.toLowerCase() || "idle")
                  }
                  onPointerOver={() =>
                    setAnimationName(item.animation?.toLowerCase() || "idle")
                  }
                  onPointerOut={() => setAnimationName("idle")}
                  className="work-content_container group"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1 + 0.3,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true, amount: 0.1 }}
                >
                  <div
                    className={cn(
                      layout.flex.col,
                      "h-full justify-start items-center",
                      spacing.text.paddingX
                    )}
                  >
                    <div className="work-content_logo">
                      <img className="w-full h-full" src={item.icon} alt="" />
                    </div>

                    <div className="work-content_bar" />
                  </div>

                  <div className={cn(spacing.card.padding)}>
                    <p className="font-bold text-white-800">{item.name}</p>
                    <p
                      className={cn(
                        responsive.text.sm,
                        spacing.text.marginBottom
                      )}
                    >
                      {item.pos} -- <span>{item.duration}</span>
                    </p>
                    <p
                      className={cn(
                        "group-hover:text-white",
                        transitions.default
                      )}
                    >
                      {item.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default WorkExperience;
