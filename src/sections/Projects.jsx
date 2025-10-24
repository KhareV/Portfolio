import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

import { myProjects } from "../constants/index.js";
import CanvasLoader from "../components/CanvasLoader.jsx";
import DemoComputer from "../components/DemoComputer.jsx";
import TechIcon from "../components/TechIcon.jsx";
import useDeviceDetection from "../hooks/useDeviceDetection";

const projectCount = myProjects.length;

const Projects = () => {
  const { isMobile } = useDeviceDetection();
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);

  const handleNavigation = (direction) => {
    setSelectedProjectIndex((prevIndex) => {
      if (direction === "previous") {
        return prevIndex === 0 ? projectCount - 1 : prevIndex - 1;
      } else {
        return prevIndex === projectCount - 1 ? 0 : prevIndex + 1;
      }
    });
  };

  useGSAP(() => {
    gsap.fromTo(
      `.animatedText`,
      { opacity: 0 },
      { opacity: 1, duration: 1, stagger: 0.2, ease: "power2.inOut" }
    );
  }, [selectedProjectIndex]);

  const currentProject = myProjects[selectedProjectIndex];

  return (
    <section className="c-space my-20 relative z-10" id="projects">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <p className="head-text mb-4">My Selected Work</p>
        <p className="text-white-600 text-lg mb-12">
          Explore my portfolio of innovative projects showcasing modern web
          technologies
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 grid-cols-1 mt-12 gap-8 w-full">
        {/* Project Details Card */}
        <motion.div
          key={selectedProjectIndex}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 relative sm:p-10 py-10 px-5 bg-gradient-to-br from-black-200 via-black-300 to-black-200 rounded-2xl border border-black-300 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300"
        >
          {/* Spotlight Effect */}
          <div className="absolute top-0 right-0 opacity-50">
            <img
              src={currentProject.spotlight}
              alt="spotlight"
              className="w-full h-96 object-cover rounded-xl"
            />
          </div>

          {/* Project Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="p-4 backdrop-filter backdrop-blur-3xl w-fit rounded-xl relative z-10 hover:scale-110 transition-transform duration-300"
            style={currentProject.logoStyle}
          >
            <img
              className="w-12 h-12 shadow-lg"
              src={currentProject.logo}
              alt="logo"
            />
          </motion.div>

          {/* Project Title and Description */}
          <div className="flex flex-col gap-4 text-white-600 my-3 relative z-10">
            <motion.h3
              className="text-white text-3xl font-bold animatedText bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {currentProject.title}
            </motion.h3>

            <motion.p
              className="animatedText text-white-600 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {currentProject.desc}
            </motion.p>
            {currentProject.subdesc && (
              <motion.p
                className="animatedText text-white-500 text-sm leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {currentProject.subdesc}
              </motion.p>
            )}
          </div>

          {/* Tech Stack */}
          <div className="flex flex-col gap-4 relative z-10">
            <p className="text-white font-semibold text-sm uppercase tracking-wider">
              Tech Stack
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {currentProject.tags.map((tag, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="tech-logo group relative hover:scale-125 transition-transform duration-300"
                >
                  <TechIcon icon={tag.icon} className="w-full h-full" />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black-300 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {tag.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Site Link */}
          <motion.a
            href={currentProject.href}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/50 w-fit relative z-10 group"
          >
            <ExternalLink className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            <span>View Live Project</span>
          </motion.a>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-auto pt-6 border-t border-black-300 relative z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="arrow-btn group bg-black-300 hover:bg-yellow-500 transition-colors duration-300 p-3 rounded-full"
              onClick={() => handleNavigation("previous")}
              aria-label="Previous project"
            >
              <ChevronLeft className="w-6 h-6 text-white group-hover:text-black transition-colors duration-300" />
            </motion.button>

            <div className="flex gap-2">
              {myProjects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedProjectIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === selectedProjectIndex
                      ? "bg-yellow-500 w-8"
                      : "bg-white-600 hover:bg-white-500"
                  }`}
                  aria-label={`Go to project ${index + 1}`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="arrow-btn group bg-black-300 hover:bg-yellow-500 transition-colors duration-300 p-3 rounded-full"
              onClick={() => handleNavigation("next")}
              aria-label="Next project"
            >
              <ChevronRight className="w-6 h-6 text-white group-hover:text-black transition-colors duration-300" />
            </motion.button>
          </div>
        </motion.div>

        {/* 3D Canvas */}
        <motion.div
          key={`canvas-${selectedProjectIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="border-2 border-black-300 bg-black-200 rounded-2xl h-96 md:h-full overflow-hidden hover:border-yellow-500/50 transition-all duration-300 shadow-xl hover:shadow-yellow-500/20"
        >
          <Canvas
            dpr={isMobile ? [1, 1] : [1, 2]}
            gl={{
              antialias: !isMobile,
              powerPreference: isMobile ? "low-power" : "high-performance",
            }}
          >
            <ambientLight intensity={Math.PI} />
            <directionalLight position={[10, 10, 5]} intensity={0.5} />
            <Center>
              <Suspense fallback={<CanvasLoader />}>
                <group
                  scale={isMobile ? 1.5 : 2}
                  position={[0, -3, 0]}
                  rotation={[0, -0.1, 0]}
                >
                  <DemoComputer texture={currentProject.texture} />
                </group>
              </Suspense>
            </Center>
            <OrbitControls maxPolarAngle={Math.PI / 2} enableZoom={false} />
          </Canvas>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
