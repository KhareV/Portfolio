// Hero.jsx
import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import Developer from "../components/Developer";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/Button";
import CanvasLoader from "../components/CanvasLoader";
import { styles } from "../styles";
import ComputerCanvas from "../components/HackerRoom.jsx";
import Wizard from "../components/Wizard.jsx";
import FloatingNavigation from "../components/FloatingNavigation.jsx";
import ComputersCanvas from "../components/HackerRoom.jsx";
import WizardSec from "./WizardSec.jsx";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const projectsRef = useRef(null);
  const headingRef = useRef(null);

  const roles = [
    "Full-Stack Developer",
    "Hackathon Finalist",
    "Tech Enthusiast",
    "Blockchain Developer",
    "AI/ML Enthusiast",
  ];

  const projects = [
    {
      name: "MedWE",
      description: "Blockchain-backed medicine delivery platform",
      users: "5,000+ users",
      color: "#4ade80",
    },
    {
      name: "SkillBridge",
      description: "Privacy-first EdTech solution with ML and ZKPs",
      achievement: "Ranked 3rd nationally",
      color: "#60a5fa",
    },
    {
      name: "Voyageur",
      description: "AI-driven luxury travel planner",
      tech: "Blockchain-secured bookings",
      color: "#f472b6",
    },
    {
      name: "PropertyDhundo",
      description: "Real estate marketplace",
      tech: "AI-based price prediction",
      color: "#fbbf24",
    },
  ];

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

  // Improved typing effect for roles
  useEffect(() => {
    let timeout;
    const currentRole = roles[currentTextIndex];
    let idx = 0;
    let isDeleting = false;
    let pauseTime = 0;

    const typeEffect = () => {
      if (!isDeleting && idx <= currentRole.length) {
        // Still typing
        setDisplayText(currentRole.substring(0, idx));
        idx++;

        // When typing is complete, mark it complete and set a pause
        if (idx > currentRole.length) {
          setIsTypingComplete(true);
          pauseTime = 30; // Pause for 30 × 50ms = 1.5s
        }

        timeout = setTimeout(typeEffect, 80);
      } else if (isDeleting && idx >= 0) {
        // Deleting
        setDisplayText(currentRole.substring(0, idx));
        idx--;

        // If we've deleted everything, move to next word
        if (idx === 0) {
          isDeleting = false;
          setCurrentTextIndex((prev) => (prev + 1) % roles.length);
        }

        timeout = setTimeout(typeEffect, 40);
      } else if (pauseTime > 0) {
        // In pause state after typing is complete
        pauseTime--;
        timeout = setTimeout(typeEffect, 50);
      } else {
        // Start deleting
        setIsTypingComplete(false);
        isDeleting = true;
        timeout = setTimeout(typeEffect, 100);
      }
    };

    typeEffect();

    return () => clearTimeout(timeout);
  }, [currentTextIndex]);

  const handlePointerDown = (e) => {
    // Save the rotation on pointer down
    setRotation([
      e.object.rotation.x,
      e.object.rotation.y,
      e.object.rotation.z,
    ]);
  };

  // GSAP animations
  useGSAP(() => {
    // Animate the heading with a split text effect
    if (headingRef.current) {
      const text = headingRef.current;
      gsap.fromTo(
        text,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
      );
    }

    // Animate the project cards with staggered appearance
    if (projectsRef.current) {
      const cards = projectsRef.current.querySelectorAll(".project-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.2,
          duration: 0.8,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: projectsRef.current,
            start: "top bottom-=100px",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative w-full min-h-screen mx-auto overflow-visible pb-24"
      >
        {/* Add FloatingNavigation */}
        <FloatingNavigation />

        <div className="absolute inset-0 top-[120px] max-w-7xl mx-auto flex flex-col items-start gap-5 px-6 z-10">
          <motion.div
            className="flex flex-col items-start gap-5 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <div className="flex flex-col justify-center items-center mt-5">
              <motion.div
                className="w-5 h-5 rounded-full bg-yellow-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              />
              <motion.div
                className="w-1 sm:h-80 h-40 bg-gradient-to-b from-yellow-600 to-transparent"
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                transition={{ duration: 1.2, delay: 0.6 }}
              />
            </div>

            <div className="z-10">
              <h1
                ref={headingRef}
                className={`${styles.heroHeadText} text-white`}
              >
                Hi, I'm{" "}
                <span className="text-yellow-600 hover:text-yellow-500 transition-colors duration-300">
                  Vedant
                </span>
                <span className="waving-hand ml-2">👋</span>
              </h1>

              <div className="h-[40px] overflow-hidden mt-2">
                <div ref={textRef} className="flex items-center">
                  <span className="typing-text-gradient text-[22px] sm:text-[28px] md:text-[32px] font-medium">
                    {displayText}
                  </span>
                  <span
                    className={`h-8 ml-0.5 ${
                      isTypingComplete
                        ? "border-r-2 border-transparent"
                        : "border-r-2 border-yellow-400"
                    }`}
                  ></span>
                </div>
              </div>

              <motion.p
                className={`${styles.heroSubText} mt-6 text-white-100 max-w-lg`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeInOut", delay: 1 }}
              >
                B.Tech. CSE student at VIT Chennai with 40+ projects and
                multiple hackathon wins. Specializing in full-stack development,
                blockchain solutions, and AI integration.
              </motion.p>

              {/* Key achievements badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                <motion.span
                  className="px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full text-sm text-purple-300"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(139, 92, 246, 0.3)",
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  Top Hackathon Finalist
                </motion.span>
                <motion.span
                  className="px-3 py-1 bg-blue-900/30 border border-blue-500/30 rounded-full text-sm text-blue-300"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(59, 130, 246, 0.3)",
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.7 }}
                >
                  40+ Projects
                </motion.span>
                <motion.span
                  className="px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-sm text-green-300"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(34, 197, 94, 0.3)",
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8 }}
                >
                  Full-Stack Engineer
                </motion.span>
              </div>
            </div>

            {/* Project highlights - Moved to below the text on the left side */}
            <motion.div
              ref={projectsRef}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 w-full max-w-xl mb-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  className="project-card backdrop-blur-sm bg-black/40 border border-gray-800 p-5 rounded-lg hover:border-yellow-600/50 transition-all duration-300"
                  whileHover={{
                    y: -5,
                    boxShadow: `0 10px 25px -5px ${project.color}20`,
                    borderColor: `${project.color}50`,
                  }}
                >
                  <h3
                    className="text-xl font-bold"
                    style={{ color: project.color }}
                  >
                    {project.name}
                  </h3>
                  <p className="text-gray-300 mt-1">{project.description}</p>
                  <p className="text-sm text-gray-400 mt-3">
                    {project.users || project.achievement || project.tech}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* 3D Model Section - Moved higher up and to the right */}
        <div className="absolute bottom-20 md:bottom-32 right-0 md:right-5 lg:right-10 w-full max-w-[90%] h-[75vh] z-0">
          <WizardSec />
        </div>

        {isButtonVisible && (
          <motion.div
            className="fixed bottom-7 left-0 right-0 w-full z-20 flex justify-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <a href="#about">
              <Button
                name="Let's work together"
                isBeam
                containerClass="sm:w-fit w-full sm:min-w-96 hover:scale-105 transition-transform duration-300"
              />
            </a>
          </motion.div>
        )}
      </section>
    </>
  );
};

export default Hero;
