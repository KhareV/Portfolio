("use client");
import React, {
  Suspense,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Canvas } from "@react-three/fiber";
import {
  Center,
  OrbitControls,
  Environment,
  Sparkles,
} from "@react-three/drei";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { ReactLenis } from "lenis/react";
import { debounce } from "lodash";
import {
  Globe,
  MapPin,
  Calendar,
  Wallet,
  ChevronDown,
  Code,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
} from "lucide-react";

import { myProjects } from "../constants/index.js";
import CanvasLoader from "../components/CanvasLoader.jsx";
import DemoComputer from "../components/DemoComputer.jsx";

// Enhanced Star animation styles with better mobile performance
const StarAnimationStyles = () => (
  <style jsx="true" global="true">{`
    @keyframes twinkle {
      0%,
      100% {
        opacity: 0.2;
      }
      50% {
        opacity: 1;
      }
    }

    @keyframes floatStar {
      0%,
      100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-15px);
      }
    }

    .stars-sm,
    .stars-md,
    .stars-lg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      will-change: opacity;
    }

    .stars-sm {
      background-image: radial-gradient(1px 1px at 10% 20%, white, transparent),
        radial-gradient(1px 1px at 40% 10%, white, transparent),
        radial-gradient(1px 1px at 70% 40%, white, transparent),
        radial-gradient(1px 1px at 90% 60%, white, transparent);
      background-size: 1000px 1000px;
      animation: twinkle 8s ease-in-out infinite alternate;
    }

    .stars-md {
      background-image: radial-gradient(
          1.5px 1.5px at 15% 15%,
          white,
          transparent
        ),
        radial-gradient(1.5px 1.5px at 45% 15%, white, transparent),
        radial-gradient(1.5px 1.5px at 75% 45%, white, transparent);
      background-size: 1000px 1000px;
      animation: twinkle 12s ease-in-out infinite alternate;
    }

    .stars-lg {
      background-image: radial-gradient(2px 2px at 5% 25%, white, transparent),
        radial-gradient(2px 2px at 35% 5%, white, transparent),
        radial-gradient(2px 2px at 65% 35%, white, transparent);
      background-size: 1000px 1000px;
      animation: twinkle 15s ease-in-out infinite alternate;
    }

    /* Enhanced responsive sticky sections */
    .sticky-section {
      position: sticky;
      top: 0;
      min-height: 100vh;
      min-height: 100dvh; /* Dynamic viewport height for mobile */
      width: 100%;
      transform: translateZ(0);
      will-change: transform;
      backface-visibility: hidden;
      overflow: hidden;
      /* Fixed: Ensure no horizontal overflow */
      max-width: 100vw;
    }

    /* Responsive gradients */
    @keyframes gradientShift {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .animated-gradient {
      background-size: 200% 200%;
      animation: gradientShift 15s ease infinite;
    }

    .floating {
      animation: floatStar 6s ease-in-out infinite;
    }

    /* Enhanced responsive glass effects */
    .glass-card {
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-hover {
      transition: all 0.3s ease;
    }

    .card-hover:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.5);
    }

    .tech-tag {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .tech-tag:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }

    /* Fixed: Enhanced mobile container constraints */
    .mobile-container {
      max-width: 100vw;
      overflow-x: hidden;
      padding-left: clamp(1rem, 4vw, 2rem);
      padding-right: clamp(1rem, 4vw, 2rem);
    }

    /* Fixed: Prevent any element from extending beyond viewport */
    .mobile-safe {
      max-width: 100%;
      box-sizing: border-box;
    }

    /* Mobile-specific optimizations */
    @media (max-width: 768px) {
      .stars-sm,
      .stars-md,
      .stars-lg {
        animation-duration: 4s;
        background-size: 500px 500px;
      }

      .sticky-section {
        min-height: 100vh;
        min-height: 100svh; /* Small viewport height for mobile */
        /* Fixed: Additional mobile constraints */
        padding-left: 0;
        padding-right: 0;
        margin-left: 0;
        margin-right: 0;
      }

      .animated-gradient {
        animation-duration: 8s;
      }

      /* Fixed: Mobile content safety */
      .mobile-content {
        margin-left: auto;
        margin-right: auto;
        max-width: calc(100vw - 2rem);
        width: 100%;
      }
    }

    /* Fixed: Ultra-small screen safety */
    @media (max-width: 480px) {
      .mobile-container {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
      }

      .mobile-content {
        max-width: calc(100vw - 1.5rem);
      }
    }

    /* Prevent horizontal overflow */
    body,
    html {
      overflow-x: hidden;
      max-width: 100vw;
    }

    /* Fixed: Ensure all child elements respect viewport width */
    * {
      box-sizing: border-box;
    }
  `}</style>
);

const Projects = () => {
  const [activeSection, setActiveSection] = useState(0);
  const totalSections = myProjects.length + 2;
  const sectionRefs = useRef([]);
  const prefersReducedMotion = useReducedMotion();
  const isScrolling = useRef(false);
  const containerRef = useRef(null);

  // Initialize refs array for all sections
  useEffect(() => {
    sectionRefs.current = Array(totalSections)
      .fill()
      .map(() => React.createRef());
  }, [totalSections]);

  // Debounced function to update the active section
  const updateActiveSection = useCallback(
    debounce((sectionIndex) => {
      setActiveSection(sectionIndex);
    }, 100),
    []
  );

  // Set up intersection observer to track which section is visible
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRefs.current.length) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: [0.25, 0.55, 0.75],
    };

    const observerCallback = (entries) => {
      if (isScrolling.current) return;

      let maxVisibility = 0;
      let mostVisibleSection = activeSection;

      entries.forEach((entry) => {
        const sectionIndex = Number(entry.target.dataset.sectionIndex);

        if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
          maxVisibility = entry.intersectionRatio;
          mostVisibleSection = sectionIndex;
        }
      });

      if (mostVisibleSection !== activeSection && maxVisibility > 0) {
        updateActiveSection(mostVisibleSection);
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    sectionRefs.current.forEach((ref, index) => {
      if (ref.current) {
        ref.current.dataset.sectionIndex = index;
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
      updateActiveSection.cancel();
    };
  }, [updateActiveSection, activeSection]);

  // Function to scroll to a specific section
  const scrollToSection = (index) => {
    if (sectionRefs.current[index]?.current) {
      isScrolling.current = true;

      sectionRefs.current[index].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setActiveSection(index);

      setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    }
  };

  // Enhanced Lenis options for better mobile performance
  const lenisOptions = {
    smoothWheel: true,
    smoothTouch: false,
    syncTouch: true,
    syncTouchLerp: 0.1,
    touchInertiaMultiplier: 20,
    wheelMultiplier: 0.8,
    lerp: 0.08,
    duration: 1.2,
  };

  return (
    <>
      <StarAnimationStyles />
      <ReactLenis root options={lenisOptions}>
        <div
          className="bg-[#030014] relative overflow-x-hidden mobile-safe"
          style={{ height: `${totalSections * 100}vh`, maxWidth: "100vw" }}
        >
          {/* Header Section */}
          <HeaderSection
            ref={(el) => (sectionRefs.current[0] = { current: el })}
            onScrollDown={() => scrollToSection(1)}
            isActive={activeSection === 0}
            reducedMotion={prefersReducedMotion}
            style={{ zIndex: totalSections }}
          />

          {/* Project Sections */}
          {myProjects.map((project, index) => (
            <ProjectSection
              key={project.title}
              ref={(el) => (sectionRefs.current[index + 1] = { current: el })}
              project={project}
              index={index}
              isActive={activeSection === index + 1}
              totalProjects={myProjects.length}
              onNextSection={() => scrollToSection(index + 2)}
              onPrevSection={() => scrollToSection(index)}
              reducedMotion={prefersReducedMotion}
              style={{ zIndex: totalSections - (index + 1) }}
            />
          ))}

          {/* Footer Section */}
          <FooterSection
            ref={(el) =>
              (sectionRefs.current[totalSections - 1] = { current: el })
            }
            isActive={activeSection === totalSections - 1}
            reducedMotion={prefersReducedMotion}
            style={{ zIndex: 1 }}
          />

          {/* Enhanced Navigation for mobile */}
          <Navigation
            totalSections={totalSections}
            activeSection={activeSection}
            onNavigate={scrollToSection}
          />
        </div>
      </ReactLenis>
    </>
  );
};

// Completely responsive Navigation component
const Navigation = ({ totalSections, activeSection, onNavigate }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5, duration: 0.3 }}
    className="fixed right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-[100] 
               flex flex-col gap-2 sm:gap-3 p-2 sm:p-3 glass-card backdrop-blur-xl rounded-full
               scale-75 sm:scale-90 md:scale-100"
  >
    {Array.from({ length: totalSections }).map((_, index) => (
      <motion.button
        key={index}
        onClick={() => onNavigate(index)}
        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
          activeSection === index
            ? "bg-gradient-to-r from-pink-500 to-violet-500 scale-125 shadow-lg shadow-pink-500/30"
            : "bg-white/30 hover:bg-white/70"
        }`}
        whileHover={{ scale: 1.2 }}
        aria-label={`Navigate to section ${index + 1}`}
      />
    ))}
  </motion.div>
);

// Fully responsive Header section - Fixed container constraints
const HeaderSection = React.forwardRef(
  ({ onScrollDown, isActive, reducedMotion, style }, ref) => {
    useGSAP(() => {
      if (isActive && !reducedMotion) {
        gsap.fromTo(
          ".header-title-char",
          {
            opacity: 0,
            y: 20,
            rotateX: -90,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            stagger: 0.05,
            duration: 0.8,
            ease: "back.out(1.7)",
          }
        );
      }
    }, [isActive]);

    const titleText = "My Selected Work";
    const titleChars = titleText.split("");

    return (
      <section
        ref={ref}
        className="sticky-section flex flex-col items-center justify-center text-white mobile-container"
        style={style}
      >
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 animated-gradient bg-gradient-to-b from-[#0f0a29] via-[#0a0a24] to-[#030014]"></div>

        {/* Responsive star field */}
        {isActive && !reducedMotion && (
          <div className="absolute inset-0 overflow-hidden opacity-40">
            <div className="stars-sm"></div>
            <div className="stars-md"></div>
            <div className="stars-lg"></div>
          </div>
        )}

        {/* Responsive grid background */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] 
                 bg-[size:30px_30px] sm:bg-[size:40px_40px] md:bg-[size:60px_60px] 
                 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"
        ></div>

        {/* Responsive animated decorative elements */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full 
                   bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-2xl sm:blur-3xl"
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/3 left-1/3 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full 
                   bg-gradient-to-r from-pink-600/20 to-purple-600/20 blur-2xl sm:blur-3xl"
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Fixed: Enhanced responsive content with better mobile constraints */}
        <div className="relative z-10 text-center w-full mobile-content">
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-4 sm:mb-6 md:mb-8 inline-block"
          >
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-500 
                      font-medium tracking-wider text-xs sm:text-sm md:text-lg 
                      px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full glass-card shadow-xl shadow-purple-900/20"
            >
              MY PROJECTS SHOWCASE
            </span>
          </motion.div>

          <div className="overflow-hidden mb-3 sm:mb-4 md:mb-6">
            <h1
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl 
                         font-bold tracking-tighter leading-[1.1] px-2 break-words"
            >
              {titleChars.map((char, index) => (
                <span
                  key={index}
                  className="header-title-char inline-block bg-clip-text text-transparent 
                         bg-gradient-to-r from-white via-blue-100 to-gray-300 drop-shadow-[0_2px_2px_rgba(10,10,50,0.5)]"
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>

          <motion.span
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="block text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 
                     opacity-90 font-medium px-2 break-words
                     bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-blue-300"
          >
            Innovations in Web Development
          </motion.span>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="max-w-xs sm:max-w-sm md:max-w-md mx-auto text-sm sm:text-base md:text-lg 
                     text-blue-100/90 drop-shadow-md mt-4 sm:mt-6 px-4"
          >
            Scroll to explore my projects and see what I've built
          </motion.p>

          {/* Responsive scroll indicator */}
          {!reducedMotion && (
            <motion.button
              onClick={onScrollDown}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                y: [0, 5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: 0.6,
              }}
              className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 cursor-pointer 
                      glass-card p-2 sm:p-3 md:p-4 rounded-full hover:bg-white/20 transition-all duration-300
                      border border-white/20 shadow-lg shadow-purple-900/20"
              aria-label="Scroll down"
            >
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-300" />
            </motion.button>
          )}

          {/* Responsive decorative elements */}
          <div
            className="absolute -bottom-10 sm:-bottom-15 md:-bottom-20 -right-10 sm:-right-15 md:-right-20 
                        w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full bg-pink-600/10 blur-2xl sm:blur-3xl"
          ></div>
          <div
            className="absolute -top-10 sm:-top-15 md:-top-20 -left-10 sm:-left-15 md:-left-20 
                        w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full bg-blue-600/10 blur-2xl sm:blur-3xl"
          ></div>
        </div>
      </section>
    );
  }
);

HeaderSection.displayName = "HeaderSection";

// Fixed: Completely responsive Project section with enhanced mobile safety
const ProjectSection = React.forwardRef(
  (
    {
      project,
      index,
      isActive,
      totalProjects,
      onNextSection,
      onPrevSection,
      reducedMotion,
      style,
    },
    ref
  ) => {
    const [hovered, setHovered] = useState(false);
    const modelRef = useRef(null);

    useGSAP(() => {
      if (isActive && !reducedMotion && modelRef.current) {
        gsap.fromTo(
          modelRef.current,
          { rotationY: -15 },
          {
            rotationY: 15,
            duration: 8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          }
        );
      }
    }, [isActive, modelRef.current]);

    const isEven = index % 2 === 0;
    const colors = [
      {
        bg: "from-indigo-950 via-purple-900 to-indigo-950",
        accent: "purple",
        destination: "text-violet-400",
        cardColor: "#5196fd",
        glow: "rgba(123, 97, 255, 0.2)",
      },
      {
        bg: "from-blue-950 via-cyan-900 to-blue-950",
        accent: "blue",
        destination: "text-cyan-400",
        cardColor: "#8f89ff",
        glow: "rgba(99, 179, 237, 0.2)",
      },
      {
        bg: "from-emerald-950 via-teal-900 to-emerald-950",
        accent: "green",
        destination: "text-emerald-400",
        cardColor: "#13006c",
        glow: "rgba(72, 187, 120, 0.2)",
      },
      {
        bg: "from-amber-950 via-orange-900 to-amber-950",
        accent: "orange",
        destination: "text-amber-400",
        cardColor: "#ed649e",
        glow: "rgba(237, 100, 158, 0.2)",
      },
      {
        bg: "from-red-950 via-rose-900 to-red-950",
        accent: "red",
        destination: "text-rose-400",
        cardColor: "#fd521a",
        glow: "rgba(253, 82, 26, 0.2)",
      },
    ];

    const themeColor = colors[index % colors.length];
    const gradientBg = themeColor.bg;
    const destinationColor = themeColor.destination;
    const cardColor = themeColor.cardColor;
    const glowColor = themeColor.glow;

    return (
      <section
        ref={ref}
        className="sticky-section flex items-center mobile-safe"
        style={style}
      >
        {/* Enhanced animated background */}
        <div
          className={`absolute inset-0 animated-gradient bg-gradient-to-b ${gradientBg}`}
        ></div>

        {/* Responsive background effects */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 
                   rounded-full blur-2xl sm:blur-3xl opacity-20 bg-white"
          animate={
            isActive && !reducedMotion
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }
              : {}
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Responsive grid pattern */}
        {isActive && (
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] 
                      bg-[size:20px_20px] sm:bg-[size:30px_30px] md:bg-[size:40px_40px] 
                      [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

        {/* Fixed: Enhanced responsive main content with proper mobile constraints */}
        <div className="mobile-container relative z-10 py-4 sm:py-6 md:py-8 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-6 sm:gap-8 md:gap-12 mobile-content">
            {/* Fixed: Responsive project details with enhanced mobile safety */}
            <motion.div
              className={`w-full lg:w-[45%] ${
                isEven ? "lg:order-1" : "lg:order-2"
              } mb-6 lg:mb-0 mobile-safe`}
              initial={{
                opacity: reducedMotion ? 0.8 : 0,
                x: reducedMotion ? 0 : isEven ? -50 : 50,
              }}
              animate={{
                opacity: isActive ? 1 : 0.6,
                x: isActive || reducedMotion ? 0 : isEven ? -20 : 20,
              }}
              transition={{
                duration: reducedMotion ? 0.2 : 0.6,
                ease: "easeOut",
              }}
            >
              <div className="space-y-4 sm:space-y-5 md:space-y-6 mobile-safe">
                <div>
                  <motion.div
                    className={`inline-block text-xs sm:text-sm font-medium tracking-wider ${destinationColor} 
                             px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass-card backdrop-blur-xl 
                             border border-white/10 shadow-sm mobile-safe`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Code size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span>
                        PROJECT {index + 1} OF {totalProjects}
                      </span>
                    </div>
                  </motion.div>

                  <motion.h2
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight 
                            leading-tight mt-3 sm:mt-4 break-words mobile-safe
                            bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 drop-shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: isActive ? 1 : 0.7,
                      y: isActive ? 0 : 10,
                    }}
                    transition={{
                      delay: 0.2,
                      duration: 0.5,
                    }}
                  >
                    {project.title}
                  </motion.h2>
                </div>

                <motion.div
                  className="glass-card rounded-xl p-4 sm:p-5 md:p-6 lg:p-7 shadow-xl card-hover mobile-safe"
                  whileHover={{ scale: 1.02 }}
                  style={{
                    boxShadow: `0 10px 30px -10px ${glowColor}`,
                  }}
                >
                  <div className="space-y-4 sm:space-y-5">
                    <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed break-words">
                      {project.desc}
                    </p>
                    <p className="text-gray-300 text-sm md:text-base hidden sm:block break-words">
                      {project.subdesc}
                    </p>

                    {/* Fixed: Responsive Tech Stack with mobile safety */}
                    <div className="pt-4 sm:pt-5 border-t border-white/10">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-300 mb-3 sm:mb-4 flex items-center gap-2">
                        <span className="w-1 h-3 sm:h-4 rounded bg-gradient-to-r from-pink-500 to-purple-500"></span>
                        TECH STACK
                      </h4>
                      <div className="flex flex-wrap gap-2 sm:gap-3 mobile-safe">
                        {project.tags.map((tag) => (
                          <motion.div
                            key={tag.id}
                            className="tech-tag flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 
                                     rounded-full text-xs sm:text-sm shadow-sm mobile-safe"
                            whileHover={{
                              y: -3,
                              backgroundColor: "rgba(255, 255, 255, 0.15)",
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 10,
                            }}
                          >
                            <img
                              src={tag.path}
                              alt={tag.name}
                              className="w-3 h-3 sm:w-4 sm:h-4"
                            />
                            <span className={`${destinationColor} truncate`}>
                              {tag.name}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Fixed: Fully responsive action buttons with mobile safety */}
                <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6 mobile-safe">
                  <motion.a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg bg-gradient-to-r 
                              from-white/90 to-white/80 text-[#030014] font-medium 
                              hover:from-white hover:to-white/90 transition-all duration-300
                              flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base mobile-safe"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0 10px 25px -5px ${glowColor}`,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                    View on GitHub
                  </motion.a>

                  <div className="flex gap-2 sm:gap-3 mobile-safe">
                    {index > 0 && (
                      <motion.button
                        onClick={onPrevSection}
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-lg glass-card
                                font-medium hover:bg-white/20 transition-all duration-300
                                shadow-lg shadow-black/20 text-white text-xs sm:text-sm md:text-base
                                flex items-center justify-center gap-1.5 sm:gap-2 mobile-safe"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </motion.button>
                    )}

                    {index < totalProjects - 1 && (
                      <motion.button
                        onClick={onNextSection}
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-lg glass-card
                                font-medium hover:bg-white/20 transition-all duration-300 
                                shadow-lg shadow-black/20 text-white text-xs sm:text-sm md:text-base
                                flex items-center justify-center gap-1.5 sm:gap-2 mobile-safe"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="hidden sm:inline">Next Project</span>
                        <span className="sm:hidden">Next</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Fixed: Responsive 3D Computer Model with enhanced mobile constraints */}
            <motion.div
              ref={modelRef}
              initial={{
                opacity: reducedMotion ? 0.8 : 0,
                scale: reducedMotion ? 0.95 : 0.9,
              }}
              animate={{
                opacity: isActive ? 1 : 0.7,
                scale: isActive ? 1 : 0.95,
              }}
              transition={{
                duration: reducedMotion ? 0.2 : 0.6,
                ease: "easeOut",
              }}
              className={`w-full lg:w-[55%] ${
                isEven ? "lg:order-2" : "lg:order-1"
              } mobile-safe`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <motion.div
                style={{
                  backgroundColor: cardColor,
                }}
                className="relative h-[250px] sm:h-[300px] md:h-[380px] lg:h-[420px] xl:h-[500px] 
                         w-full rounded-xl sm:rounded-2xl overflow-hidden 
                         shadow-2xl shadow-black/50 border border-white/10 mx-auto 
                         max-w-lg lg:max-w-none mobile-safe"
                animate={{
                  rotate:
                    typeof window !== "undefined" && window.innerWidth >= 1024
                      ? isEven
                        ? 3
                        : -3
                      : 0,
                  y: hovered ? -10 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
              >
                <Canvas>
                  <ambientLight intensity={Math.PI / 1.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1.5} />
                  <spotLight
                    position={[0, 25, 0]}
                    angle={0.3}
                    penumbra={1}
                    intensity={2}
                    castShadow
                  />

                  <Center>
                    <Suspense fallback={<CanvasLoader />}>
                      <group
                        scale={
                          typeof window !== "undefined"
                            ? window.innerWidth < 640
                              ? 1.8
                              : window.innerWidth < 1024
                              ? 2.0
                              : 2.2
                            : 2.0
                        }
                        position={[0, -3, 0]}
                        rotation={[0, hovered ? 0.2 : -0.1, 0]}
                      >
                        <DemoComputer texture={project.texture} />
                      </group>

                      {isActive && !reducedMotion && (
                        <Sparkles
                          count={
                            typeof window !== "undefined" &&
                            window.innerWidth < 640
                              ? 25
                              : 50
                          }
                          scale={6}
                          size={1}
                          speed={0.3}
                          opacity={0.2}
                        />
                      )}

                      <Environment preset="city" />
                    </Suspense>
                  </Center>
                  <OrbitControls
                    maxPolarAngle={Math.PI / 2}
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={
                      hovered &&
                      typeof window !== "undefined" &&
                      window.innerWidth >= 1024
                    }
                    autoRotate={
                      hovered &&
                      typeof window !== "undefined" &&
                      window.innerWidth >= 1024
                    }
                    autoRotateSpeed={1}
                  />
                </Canvas>

                {/* Fixed: Responsive project logo overlay with mobile safety */}
                <motion.div
                  className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 
                           p-2 sm:p-2.5 md:p-3 backdrop-filter backdrop-blur-3xl rounded-lg z-10 mobile-safe"
                  style={project.logoStyle}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <img
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 shadow-sm"
                    src={project.logo}
                    alt="logo"
                  />
                </motion.div>
              </motion.div>

              {/* Fixed: Responsive decorative elements with proper positioning */}
              {isActive && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute ${
                      isEven ? "right-0 bottom-0" : "left-0 bottom-0"
                    } w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
                              border-r-2 border-b-2 border-white/20 rounded-br-2xl -z-10 floating hidden lg:block`}
                  ></motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute ${
                      isEven ? "left-0 top-0" : "right-0 top-0"
                    } w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24
                              border-l-2 border-t-2 border-white/20 rounded-tl-2xl -z-10 floating hidden lg:block`}
                    style={{ animationDelay: "0.3s" }}
                  ></motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    );
  }
);

ProjectSection.displayName = "ProjectSection";

// Fixed: Fully responsive Footer section with mobile safety
const FooterSection = React.forwardRef(
  ({ isActive, reducedMotion, style }, ref) => {
    useGSAP(() => {
      if (isActive && !reducedMotion) {
        gsap.fromTo(
          ".connect-text",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          }
        );

        gsap.fromTo(
          ".footer-line",
          { width: "0%" },
          {
            width: "100%",
            duration: 1.2,
            ease: "power3.inOut",
            delay: 0.3,
          }
        );
      }
    }, [isActive]);

    return (
      <section
        ref={ref}
        className="sticky-section flex flex-col items-center justify-center mobile-container"
        style={style}
      >
        {/* Enhanced animated gradient background */}
        <div className="absolute inset-0 animated-gradient bg-gradient-to-t from-[#0f0a29] via-[#0a0a24] to-[#030014]"></div>

        {/* Responsive star field */}
        {isActive && !reducedMotion && (
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="stars-sm"></div>
            <div className="stars-md"></div>
            <div className="stars-lg"></div>
          </div>
        )}

        {/* Responsive grid background */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] 
                  bg-[size:20px_20px] sm:bg-[size:30px_30px] md:bg-[size:40px_40px] 
                  [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
        ></div>

        {/* Responsive decorative elements */}
        <motion.div
          className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-700/10 blur-2xl sm:blur-3xl rounded-full"
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-0 right-0 w-1/4 h-1/4 bg-blue-700/10 blur-2xl sm:blur-3xl rounded-full"
          animate={{
            x: [0, -8, 0],
            y: [0, 8, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10 text-center w-full mobile-content">
          <div className="overflow-hidden px-2">
            <h1
              className="connect-text text-[18vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw] xl:text-[8vw] 
                        font-bold tracking-tighter break-words
                        bg-clip-text text-transparent bg-gradient-to-b from-white via-purple-100 to-purple-400"
            >
              Let's Connect
            </h1>
          </div>

          <div className="mt-3 sm:mt-4 flex justify-center">
            <div className="footer-line h-px w-16 sm:w-20 md:w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>

          <motion.p
            initial={{ opacity: 0.5 }}
            animate={{ opacity: isActive ? 0.9 : 0.5 }}
            transition={{ duration: 0.6 }}
            className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-center 
                     max-w-xs sm:max-w-sm md:max-w-md mx-auto text-gray-300 px-4 break-words"
          >
            Interested in working together? Have questions about my projects?
            I'd love to hear from you!
          </motion.p>

          <motion.div
            initial={reducedMotion ? { opacity: 0.7 } : { opacity: 0, y: 20 }}
            animate={{ opacity: isActive ? 1 : 0.7, y: isActive ? 0 : 10 }}
            transition={{ duration: reducedMotion ? 0.3 : 0.7, delay: 0.2 }}
            className="mt-8 sm:mt-10 md:mt-12"
          ></motion.div>
        </div>
      </section>
    );
  }
);

FooterSection.displayName = "FooterSection";

export default Projects;
