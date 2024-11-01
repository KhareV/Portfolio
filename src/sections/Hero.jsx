// Hero.jsx
import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import Developer from "../components/Developer";
import LoadingSpinner from "../components/LoadingSpinner"; // Adjust the import path as needed
import Button from "../components/Button";
import CanvasLoader from "../components/CanvasLoader";
import { styles } from "../styles";
import ComputerCanvas from "../components/HackerRoom.jsx";
import Wizard from "../components/Wizard.jsx";
import Navigation from "../components/navigation/index.jsx";
import ComputersCanvas from "../components/HackerRoom.jsx";
import WizardSec from "./WizardSec.jsx";
const Hero = () => {
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [rotation, setRotation] = useState([0, 0, 0]);

  useEffect(() => {
    const contactSection = document.getElementById("contact");
    const footerSection = document.getElementById("footer");

    if (!contactSection || !footerSection) return;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.target.id === "contact" || entry.target.id === "footer") {
          setIsButtonVisible(!entry.isIntersecting);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
    });

    observer.observe(contactSection);
    observer.observe(footerSection);

    return () => {
      if (contactSection) observer.unobserve(contactSection);
      if (footerSection) observer.unobserve(footerSection);
    };
  }, []);

  const handlePointerDown = (e) => {
    // Save the rotation on pointer down
    setRotation([
      e.object.rotation.x,
      e.object.rotation.y,
      e.object.rotation.z,
    ]);
  };

  return (
    <>
      <section className="relative w-full h-screen mx-auto">
        <div className="absolute inset-0 top-[120px] max-w-7xl mx-auto flex flex-row items-start gap-10">
          <motion.div
            className={`${styles.paddingX} flex flex-col items-start gap-5`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
          >
            <div className="flex flex-col justify-center items-center mt-5">
              <motion.div
                className="w-5 h-5 rounded-full bg-yellow-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              />
              <motion.div
                className="w-1 h-40 sm:h-80 bg-yellow-600"
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>

            <div>
              <motion.h1
                className={`${styles.heroHeadText} text-white`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.8 }}
              >
                Hi, I'm <span className="text-yellow-600 ">Vedant</span>
                <span className="waving-hand">👋</span>
              </motion.h1>
              <motion.p
                className={`${styles.heroSubText} mt-2 text-white-100`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeInOut", delay: 1 }}
              >
                Building Products & Brands <br className="sm:block hidden" />
                Interfaces and web applications.
              </motion.p>
            </div>
          </motion.div>

          {/* Developer 3D Model - Centered and slightly larger */}
        </div>

        {/* Computer Canvas - Positioned directly below text */}
        <WizardSec />
        {isButtonVisible && (
          <div className="fixed bottom-7 left-0 right-0 w-full z-10 c-space">
            <a href="#about" className="w-fit">
              <Button
                name="Let's work together"
                isBeam
                containerClass="sm:w-fit w-full sm:min-w-96"
              />
            </a>
          </div>
        )}
      </section>
    </>
  );
};

export default Hero;
