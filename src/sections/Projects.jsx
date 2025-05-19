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

// Enhanced Star animation styles
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

    .stars-sm {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(1px 1px at 10% 20%, white, transparent),
        radial-gradient(1px 1px at 40% 10%, white, transparent),
        radial-gradient(1px 1px at 70% 40%, white, transparent),
        radial-gradient(1px 1px at 90% 60%, white, transparent);
      background-size: 1000px 1000px;
      animation: twinkle 8s ease-in-out infinite alternate;
      will-change: opacity;
    }

    .stars-md {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(
          1.5px 1.5px at 15% 15%,
          white,
          transparent
        ),
        radial-gradient(1.5px 1.5px at 45% 15%, white, transparent),
        radial-gradient(1.5px 1.5px at 75% 45%, white, transparent);
      background-size: 1000px 1000px;
      animation: twinkle 12s ease-in-out infinite alternate;
      will-change: opacity;
    }

    .stars-lg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(2px 2px at 5% 25%, white, transparent),
        radial-gradient(2px 2px at 35% 5%, white, transparent),
        radial-gradient(2px 2px at 65% 35%, white, transparent);
      background-size: 1000px 1000px;
      animation: twinkle 15s ease-in-out infinite alternate;
      will-change: opacity;
    }

    /* Create proper stacking with z-index and sticky positioning */
    .sticky-section {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100%;
      transform: translateZ(0); /* Hardware acceleration */
      will-change: transform; /* Hint to browser */
      backface-visibility: hidden; /* Another performance hint */
      overflow: hidden;
    }

    /* Gradient animations */
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

    /* Floating animation for decorative elements */
    .floating {
      animation: floatStar 6s ease-in-out infinite;
    }

    /* Enhanced glow effects */
    .glow-effect {
      box-shadow: 0 0 25px 5px rgba(123, 97, 255, 0.2);
    }

    /* Glassmorphism effect */
    .glass-card {
      backdrop-filter: blur(16px);
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

    /* Enhanced tech tag styling */
    .tech-tag {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .tech-tag:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }
  `}</style>
);

const Projects = () => {
  const [activeSection, setActiveSection] = useState(0);
  const totalSections = myProjects.length + 2; // Header, projects, and footer
  const sectionRefs = useRef([]);
  const prefersReducedMotion = useReducedMotion();
  const isScrolling = useRef(false);
  const containerRef = useRef(null);

  // Initialize refs array for all sections
  useEffect(() => {
    // Create references for header, all projects, and footer
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
      threshold: [0.25, 0.55, 0.75], // Multiple thresholds for smoother transitions
    };

    const observerCallback = (entries) => {
      if (isScrolling.current) return; // Skip updates while programmatic scrolling

      // Find the most visible section
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

    // Observe all section elements
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
      isScrolling.current = true; // Flag to prevent observer updates during programmatic scrolling

      sectionRefs.current[index].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Set active section immediately for UI feedback
      setActiveSection(index);

      // Reset flag after animation completes
      setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    }
  };

  // Configure Lenis for better performance
  const lenisOptions = {
    smoothWheel: true,
    smoothTouch: false, // Disable on touch devices for better performance
    syncTouch: true,
    syncTouchLerp: 0.1, // Lower value for smoother performance
    touchInertiaMultiplier: 20,
    wheelMultiplier: 0.8, // Reduce multiplier for smoother scrolling
    lerp: 0.08, // Lower value for smoother performance
    duration: 1.2,
  };

  return (
    <>
      <StarAnimationStyles />
      <ReactLenis root options={lenisOptions}>
        <div
          className="bg-[#030014] relative"
          style={{ height: `${totalSections * 100}vh` }}
        >
          {/* Header Section - highest z-index */}
          <HeaderSection
            ref={(el) => (sectionRefs.current[0] = { current: el })}
            onScrollDown={() => scrollToSection(1)}
            isActive={activeSection === 0}
            reducedMotion={prefersReducedMotion}
            style={{ zIndex: totalSections }} // Highest z-index
          />

          {/* Project Sections - decreasing z-index as we go down */}
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
              style={{ zIndex: totalSections - (index + 1) }} // Decreasing z-index
            />
          ))}

          {/* Footer Section - lowest z-index */}
          <FooterSection
            ref={(el) =>
              (sectionRefs.current[totalSections - 1] = { current: el })
            }
            isActive={activeSection === totalSections - 1}
            reducedMotion={prefersReducedMotion}
            style={{ zIndex: 1 }} // Lowest z-index
          />

          {/* Navigation stays on top of everything */}
        </div>
      </ReactLenis>
    </>
  );
};

// Enhanced Navigation dots component
const Navigation = ({ totalSections, activeSection, onNavigate }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5, duration: 0.3 }}
    className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3 p-3 glass-card backdrop-blur-xl rounded-full"
  >
    {Array.from({ length: totalSections }).map((_, index) => (
      <motion.button
        key={index}
        onClick={() => onNavigate(index)}
        className={`w-3 h-3 rounded-full transition-all duration-300 ${
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

// Enhanced Header section with advanced animations
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

    // Split text for character animation
    const titleText = "My Selected Work";
    const titleChars = titleText.split("");

    return (
      <section
        ref={ref}
        className="sticky-section flex flex-col items-center justify-center text-white"
        style={style}
      >
        {/* Enhanced gradient background with moving animation */}
        <div className="absolute inset-0 animated-gradient bg-gradient-to-b from-[#0f0a29] via-[#0a0a24] to-[#030014]"></div>

        {/* Star field effect - enhanced and conditionally rendered */}
        {isActive && !reducedMotion && (
          <div className="absolute inset-0 overflow-hidden opacity-40">
            <div className="stars-sm"></div>
            <div className="stars-md"></div>
            <div className="stars-lg"></div>
          </div>
        )}

        {/* Enhanced grid background */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] 
                 bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"
        ></div>

        {/* Animated decorative elements */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full 
                   bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/3 left-1/3 w-40 h-40 rounded-full 
                   bg-gradient-to-r from-pink-600/20 to-purple-600/20 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 inline-block"
          >
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-violet-500 
                      font-medium tracking-wider text-lg px-6 py-3 rounded-full glass-card shadow-xl shadow-purple-900/20"
            >
              MY PROJECTS SHOWCASE
            </span>
          </motion.div>

          <div className="overflow-hidden mb-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1]">
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
            className="block text-3xl md:text-4xl lg:text-5xl opacity-90 font-medium
                     bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-blue-300"
          >
            Innovations in Web Development
          </motion.span>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="max-w-md mx-auto text-lg text-blue-100/90 drop-shadow-md mt-6"
          >
            Scroll to explore my projects and see what I've built
          </motion.p>

          {/* Enhanced scroll indicator */}
          {!reducedMotion && (
            <motion.button
              onClick={onScrollDown}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                y: [0, 10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                delay: 0.6,
              }}
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2 cursor-pointer 
                      glass-card p-4 rounded-full hover:bg-white/20 transition-all duration-300
                      border border-white/20 shadow-lg shadow-purple-900/20 glow-effect"
              aria-label="Scroll down"
            >
              <ChevronDown className="w-6 h-6 text-purple-300" />
            </motion.button>
          )}

          {/* Enhanced decorative elements */}
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-pink-600/10 blur-3xl"></div>
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>
        </div>
      </section>
    );
  }
);

HeaderSection.displayName = "HeaderSection";

// Enhanced Project section with 3D interactions and improved aesthetics
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

    // Use GSAP for subtle animations when section becomes active
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

    // Enhanced visual variety based on index
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
    const accentColor = themeColor.accent;
    const destinationColor = themeColor.destination;
    const cardColor = themeColor.cardColor;
    const glowColor = themeColor.glow;

    return (
      <section
        ref={ref}
        className="sticky-section flex items-center"
        style={style} // Apply z-index here
      >
        {/* Enhanced animated background with accent color */}
        <div
          className={`absolute inset-0 animated-gradient bg-gradient-to-b ${gradientBg}`}
        ></div>

        {/* Enhanced background effects */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-20 bg-white"
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

        {/* Enhanced grid pattern with mask */}
        {isActive && (
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] 
                      bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"
          />
        )}

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

        {/* Main content */}
        <div className="container mx-auto relative z-10 px-6 md:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8 md:gap-12">
            {/* Project details */}
            <motion.div
              className={`md:w-[45%] ${
                isEven ? "md:order-1" : "md:order-2"
              } mb-8 md:mb-0`}
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
              <div className="space-y-6">
                <div>
                  <motion.div
                    className={`inline-block text-sm font-medium tracking-wider ${destinationColor} 
                             px-4 py-2 rounded-full glass-card backdrop-blur-xl border border-white/10 shadow-sm`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex items-center gap-2">
                      <Code size={14} />
                      <span>
                        PROJECT {index + 1} OF {totalProjects}
                      </span>
                    </div>
                  </motion.div>

                  <motion.h2
                    className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mt-4 
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
                  className="glass-card rounded-xl p-7 shadow-xl card-hover"
                  whileHover={{ scale: 1.02 }}
                  style={{
                    boxShadow: `0 10px 30px -10px ${glowColor}`,
                  }}
                >
                  <div className="space-y-5">
                    <p className="text-gray-200 text-lg">{project.desc}</p>
                    <p className="text-gray-300 hidden md:block">
                      {project.subdesc}
                    </p>

                    {/* Enhanced Tech Stack */}
                    <div className="pt-5 border-t border-white/10">
                      <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 rounded bg-gradient-to-r from-pink-500 to-purple-500"></span>
                        TECH STACK
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {project.tags.map((tag) => (
                          <motion.div
                            key={tag.id}
                            className="tech-tag flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                                     text-sm shadow-sm"
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
                              className="w-4 h-4"
                            />
                            <span className={destinationColor}>{tag.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Call-to-action buttons with improved responsive layout */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-6 mb-8">
                  <motion.a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`px-5 py-3 rounded-lg bg-gradient-to-r 
                              from-white/90 to-white/80 text-[#030014] font-medium 
                              hover:from-white hover:to-white/90 transition-all duration-300
                              flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto`}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: `0 10px 25px -5px ${glowColor}`,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Github className="w-5 h-5" />
                    View on GitHub
                  </motion.a>

                  <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    {index > 0 && (
                      <motion.button
                        onClick={onPrevSection}
                        className="px-5 py-3 rounded-lg glass-card
                                font-medium hover:bg-white/20 transition-all duration-300
                                shadow-lg shadow-black/20 text-white
                                flex items-center gap-2 flex-1 sm:flex-initial justify-center sm:justify-start"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Previous
                      </motion.button>
                    )}

                    {index < totalProjects - 1 && (
                      <motion.button
                        onClick={onNextSection}
                        className="px-5 py-3 rounded-lg glass-card
                                font-medium hover:bg-white/20 transition-all duration-300 
                                shadow-lg shadow-black/20 text-white
                                flex items-center gap-2 flex-1 sm:flex-initial justify-center sm:justify-start"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Next Project
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced 3D Computer Model */}
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
              className={`md:w-[55%] ${isEven ? "md:order-2" : "md:order-1"}`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <motion.div
                style={{
                  backgroundColor: cardColor,
                }}
                className={`relative h-[420px] md:h-[500px] w-full rounded-2xl overflow-hidden 
                           shadow-2xl shadow-black/50 border border-white/10`}
                animate={{
                  rotate: isEven ? 3 : -3,
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
                        scale={2.2}
                        position={[0, -3, 0]}
                        rotation={[0, hovered ? 0.2 : -0.1, 0]}
                      >
                        <DemoComputer texture={project.texture} />
                      </group>

                      {/* Add subtle sparkles for aesthetic enhancement */}
                      {isActive && !reducedMotion && (
                        <Sparkles
                          count={50}
                          scale={6}
                          size={1}
                          speed={0.3}
                          opacity={0.2}
                        />
                      )}

                      {/* Add subtle environment lighting */}
                      <Environment preset="city" />
                    </Suspense>
                  </Center>
                  <OrbitControls
                    maxPolarAngle={Math.PI / 2}
                    enableZoom={false}
                    enablePan={false}
                    enableRotate={hovered}
                    autoRotate={hovered}
                    autoRotateSpeed={1}
                  />
                </Canvas>

                {/* Enhanced project logo overlay with animation */}
                <motion.div
                  className="absolute top-4 left-4 p-3 backdrop-filter backdrop-blur-3xl rounded-lg z-10"
                  style={project.logoStyle}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <img
                    className="w-10 h-10 shadow-sm"
                    src={project.logo}
                    alt="logo"
                  />
                </motion.div>
              </motion.div>

              {/* Enhanced decorative elements */}
              {isActive && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute ${
                      isEven ? "-right-8 -bottom-8" : "-left-8 -bottom-8"
                    } w-24 h-24 
                              border-r-2 border-b-2 border-white/20 rounded-br-2xl -z-10 floating`}
                  ></motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute ${
                      isEven ? "-left-8 -top-8" : "-right-8 -top-8"
                    } w-24 h-24  
                              border-l-2 border-t-2 border-white/20 rounded-tl-2xl -z-10 floating`}
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

// Enhanced Footer section with advanced animations
const FooterSection = React.forwardRef(
  ({ isActive, reducedMotion, style }, ref) => {
    // Use GSAP for text reveal animation
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
        className="sticky-section flex flex-col items-center justify-center"
        style={style} // Apply z-index here
      >
        {/* Enhanced animated gradient background */}
        <div className="absolute inset-0 animated-gradient bg-gradient-to-t from-[#0f0a29] via-[#0a0a24] to-[#030014]"></div>

        {/* Enhanced star field */}
        {isActive && !reducedMotion && (
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="stars-sm"></div>
            <div className="stars-md"></div>
            <div className="stars-lg"></div>
          </div>
        )}

        {/* Enhanced grid background */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] 
                  bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"
        ></div>

        {/* Enhanced decorative elements with animations */}
        <motion.div
          className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-700/10 blur-3xl rounded-full"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-0 right-0 w-1/4 h-1/4 bg-blue-700/10 blur-3xl rounded-full"
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

        <div className="relative z-10 max-w-5xl px-6 text-center">
          <div className="overflow-hidden">
            <h1
              className="connect-text text-[14vw] md:text-[10vw] lg:text-[8vw] font-bold tracking-tighter 
                        bg-clip-text text-transparent bg-gradient-to-b from-white via-purple-100 to-purple-400"
            >
              Let's Connect
            </h1>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="footer-line h-px w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>

          <motion.p
            initial={{ opacity: 0.5 }}
            animate={{ opacity: isActive ? 0.9 : 0.5 }}
            transition={{ duration: 0.6 }}
            className="mt-8 text-xl text-center max-w-md mx-auto text-gray-300"
          >
            Interested in working together? Have questions about my projects?
            I'd love to hear from you!
          </motion.p>

          <motion.div
            initial={reducedMotion ? { opacity: 0.7 } : { opacity: 0, y: 20 }}
            animate={{ opacity: isActive ? 1 : 0.7, y: isActive ? 0 : 10 }}
            transition={{ duration: reducedMotion ? 0.3 : 0.7, delay: 0.2 }}
            className="mt-12"
          ></motion.div>
        </div>
      </section>
    );
  }
);

FooterSection.displayName = "FooterSection";

export default Projects;
