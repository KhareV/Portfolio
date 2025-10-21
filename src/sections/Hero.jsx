// Hero.jsx
import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion } from "framer-motion";

import { styles } from "../styles";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FloatingNavigation from "../components/FloatingNavigation.jsx";
gsap.registerPlugin(ScrollTrigger);
import TopBoxBar from "../components/TopBoxBar.jsx";
const ChatBox = lazy(() => import("../components/Chatbox.jsx"));
import Messagebar from "../components/Messagebar.jsx";
import { MessageProvider } from "../MessageContext.jsx";
import Head from "../components/Head.jsx";
import {
  spacing,
  layout,
  responsive,
  transitions,
  cn,
} from "../styles/spacing";
import { useLoadingContext } from "../contexts/LoadingContext";

const Hero = () => {
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const { setHeroReady, setModelsReady } = useLoadingContext();

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

  // Signal when Hero component is mounted and ready
  useEffect(() => {
    console.log("Hero component mounted");
    // Give a small delay to ensure DOM is painted
    const timer = setTimeout(() => {
      setHeroReady(true);
      console.log("Hero marked as ready");
    }, 100);

    return () => clearTimeout(timer);
  }, [setHeroReady]);

  // Signal when 3D models are ready (after a buffer period)
  useEffect(() => {
    console.log("Starting 3D model buffer...");
    const timer = setTimeout(() => {
      setModelsReady(true);
      console.log("3D models marked as ready");
    }, 3000); // 3 seconds for 3D models to load

    return () => clearTimeout(timer);
  }, [setModelsReady]);

  useEffect(() => {
    let timeout;
    const currentRole = roles[currentTextIndex];
    let idx = 0;
    let isDeleting = false;
    let pauseTime = 0;

    const typeEffect = () => {
      if (!isDeleting && idx <= currentRole.length) {
        setDisplayText(currentRole.substring(0, idx));
        idx++;

        if (idx > currentRole.length) {
          setIsTypingComplete(true);
          pauseTime = 30;
        }

        timeout = setTimeout(typeEffect, 80);
      } else if (isDeleting && idx >= 0) {
        setDisplayText(currentRole.substring(0, idx));
        idx--;

        if (idx === 0) {
          isDeleting = false;
          setCurrentTextIndex((prev) => (prev + 1) % roles.length);
        }

        timeout = setTimeout(typeEffect, 40);
      } else if (pauseTime > 0) {
        pauseTime--;
        timeout = setTimeout(typeEffect, 50);
      } else {
        setIsTypingComplete(false);
        isDeleting = true;
        timeout = setTimeout(typeEffect, 100);
      }
    };

    typeEffect();

    return () => clearTimeout(timeout);
  }, [currentTextIndex]);

  const handlePointerDown = (e) => {
    setRotation([
      e.object.rotation.x,
      e.object.rotation.y,
      e.object.rotation.z,
    ]);
  };

  useGSAP(() => {
    if (headingRef.current) {
      const text = headingRef.current;
      gsap.fromTo(
        text,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
      );
    }

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
        className={cn("relative w-full min-h-screen mx-auto overflow-visible")}
      >
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="stars-sm"></div>
          <div className="stars-md"></div>
          <div className="stars-lg"></div>
        </div>

        <div
          className={cn(
            "relative z-10",
            layout.flex.between,
            "flex-col lg:flex-row items-start",
            spacing.container.padding,
            "pt-20 sm:pt-20 md:pt-20 lg:pt-20 min-h-screen"
          )}
        >
          <motion.div
            className={cn(
              "flex-1",
              layout.flex.col,
              "items-start w-full lg:max-w-[60%]"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <div className={cn(layout.flex.colCenter, spacing.text.marginTop)}>
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
                <span
                  className={cn(
                    "text-yellow-600 hover:text-yellow-500",
                    transitions.default
                  )}
                >
                  Vedant
                </span>
                <span className="waving-hand ml-2">👋</span>
              </h1>

              <div
                className={cn(
                  "h-[40px] overflow-hidden",
                  spacing.text.marginTop
                )}
              >
                <div ref={textRef} className={layout.flex.center}>
                  <span
                    className={cn(
                      responsive.text.lg,
                      "font-medium typing-text-gradient"
                    )}
                  >
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
                className={cn(
                  styles.heroSubText,
                  spacing.section.marginTop,
                  "text-white-100",
                  layout.maxWidth.lg
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, ease: "easeInOut", delay: 1 }}
              >
                B.Tech. CSE student at VIT Chennai with 40+ projects and
                multiple hackathon wins. Specializing in full-stack development,
                blockchain solutions, and AI integration.
              </motion.p>

              <div
                className={cn(
                  spacing.section.marginTop,
                  layout.flex.wrap,
                  spacing.grid.gapSmall
                )}
              >
                <motion.span
                  className={cn(
                    spacing.interactive.padding,
                    "bg-purple-900/30 border border-purple-500/30 rounded-full",
                    responsive.text.xs,
                    "text-purple-300"
                  )}
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
                  className={cn(
                    spacing.interactive.padding,
                    "bg-blue-900/30 border border-blue-500/30 rounded-full",
                    responsive.text.xs,
                    "text-blue-300"
                  )}
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
                  className={cn(
                    spacing.interactive.padding,
                    "bg-green-900/30 border border-green-500/30 rounded-full",
                    responsive.text.xs,
                    "text-green-300"
                  )}
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

            <motion.div
              ref={projectsRef}
              className={cn(
                layout.grid.cols2,
                spacing.grid.gap,
                spacing.section.marginTop,
                "w-full",
                layout.maxWidth.xl,
                spacing.section.marginBottom
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    "project-card backdrop-blur-sm bg-black/40",
                    "border border-gray-800",
                    spacing.card.padding,
                    "rounded-lg hover:border-yellow-600/50",
                    transitions.default
                  )}
                  whileHover={{
                    y: -5,
                    boxShadow: `0 10px 25px -5px ${project.color}20`,
                    borderColor: `${project.color}50`,
                  }}
                >
                  <h3
                    className={cn(responsive.text.lg, "font-bold")}
                    style={{ color: project.color }}
                  >
                    {project.name}
                  </h3>
                  <p className={cn("text-gray-300", spacing.text.marginTop)}>
                    {project.description}
                  </p>
                  <p
                    className={cn(
                      responsive.text.xs,
                      "text-gray-400",
                      spacing.text.marginTop
                    )}
                  >
                    {project.users || project.achievement || project.tech}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className={cn(
              responsive.hideOnMobile,
              "lg:block flex-1 h-[800px] w-full max-w-[450px] relative"
            )}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, delay: 0.8 }}
          >
            <div className="chatbox-container absolute top-12 right-0 w-full h-full">
              <div className="chatbox-wrapper relative w-full h-full rounded-2xl shadow-2xl">
                <MessageProvider>
                  <Suspense
                    fallback={
                      <div
                        className={cn(
                          layout.flex.center,
                          "h-full bg-black/40 backdrop-blur-sm rounded-2xl border border-gray-800"
                        )}
                      >
                        <div className="text-white">Loading chat...</div>
                      </div>
                    }
                  >
                    <ChatBox />
                  </Suspense>
                </MessageProvider>
              </div>
            </div>
          </motion.div>
        </div>

        {isButtonVisible && (
          <motion.div
            className={cn(
              "fixed bottom-8 left-0 right-0 z-50",
              layout.flex.center
            )}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <FloatingNavigation />
          </motion.div>
        )}
      </section>
    </>
  );
};

export default Hero;
