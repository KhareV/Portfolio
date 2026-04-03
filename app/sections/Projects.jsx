"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Center,
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

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
      }
      return prevIndex === projectCount - 1 ? 0 : prevIndex + 1;
    });
  };

  const hasProjects = myProjects.length > 0;
  const currentProject = hasProjects
    ? (myProjects[selectedProjectIndex] ?? myProjects[0])
    : null;

  if (!hasProjects || !currentProject) {
    return (
      <section
        className="font-site-default py-24 relative z-10 px-5 sm:px-10 overflow-hidden"
        id="projects"
        style={{ backgroundColor: "#FEFFFC" }}
      >
        <div className="max-w-7xl mx-auto rounded-[2rem] border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-3">
            Selected Work.
          </h2>
          <p className="text-slate-500 text-base md:text-lg">
            Projects are being prepared and will be visible shortly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="projects-v2 font-site-default py-24 relative z-10 px-5 sm:px-10 overflow-hidden"
      id="projects"
      style={{ backgroundColor: "#FEFFFC" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-slate-900 mb-4">
              Selected Work.
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-light max-w-xl leading-relaxed tracking-wide">
              A curated showcase of digital experiences, built with precision
              and modern web technologies.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 grid-cols-1 gap-8 w-full items-stretch">
          <div className="lg:col-span-5 flex flex-col gap-8 relative sm:p-12 py-10 px-8 min-h-[30rem] bg-white/95 backdrop-blur-sm rounded-[2.5rem] border border-slate-200 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.28)] hover:shadow-[0_24px_60px_-24px_rgba(15,23,42,0.32)] transition-shadow duration-700 transform-gpu [will-change:transform]">
            <div className="absolute inset-0 opacity-[0.02] mix-blend-luminosity pointer-events-none overflow-hidden rounded-[2.5rem] select-none">
              <Image
                src={currentProject.spotlight}
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                quality={52}
                className="w-full h-full object-cover"
              />
            </div>

            <div
              className="p-3.5 bg-white border border-black/[0.04] shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] w-fit rounded-2xl relative z-10"
              style={currentProject.logoStyle}
            >
              <Image
                className="w-9 h-9 object-contain"
                src={currentProject.logo}
                alt={`${currentProject.title} logo`}
                width={36}
                height={36}
                sizes="36px"
              />
            </div>

            <div className="flex flex-col gap-4 relative z-10 mt-2">
              <h3 className="text-slate-900 text-3xl sm:text-4xl font-semibold tracking-tight opacity-100">
                {currentProject.title}
              </h3>

              <p className="text-slate-500 font-light leading-relaxed text-[17px] opacity-100">
                {currentProject.desc}
              </p>

              {currentProject.subdesc && (
                <p className="text-slate-400 font-light text-[15px] leading-relaxed mt-[-4px] opacity-100">
                  {currentProject.subdesc}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 relative z-10 mt-4">
              <p className="text-slate-600 font-semibold text-[10px] uppercase tracking-[0.28em]">
                Tech Stack
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {(currentProject.tags ?? []).map((tag, index) => (
                  <div
                    key={index}
                    className="group relative flex items-center gap-2 h-11 px-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <TechIcon
                      icon={tag.icon}
                      className="w-5 h-5 text-slate-700 opacity-100 transition-colors duration-300"
                    />
                    <span className="text-[12px] font-medium leading-none text-slate-700">
                      {tag.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-auto pt-8 border-t border-black/[0.04] relative z-10 gap-6 sm:gap-0">
              <a
                href={currentProject.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-all duration-300 hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] w-fit group active:scale-[0.98]"
              >
                <span className="text-[14px] font-medium tracking-wide">
                  Live Project
                </span>
                <ExternalLink
                  strokeWidth={2.5}
                  className="w-[14px] h-[14px] group-hover:rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                />
              </a>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  className="group bg-transparent hover:bg-slate-50 border border-black/[0.06] hover:border-black/[0.15] transition-all duration-300 p-3 rounded-full flex items-center justify-center active:scale-90"
                  onClick={() => handleNavigation("previous")}
                  aria-label="Previous project"
                >
                  <ChevronLeft
                    strokeWidth={2}
                    className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors duration-300"
                  />
                </button>
                <button
                  className="group bg-transparent hover:bg-slate-50 border border-black/[0.06] hover:border-black/[0.15] transition-all duration-300 p-3 rounded-full flex items-center justify-center active:scale-90"
                  onClick={() => handleNavigation("next")}
                  aria-label="Next project"
                >
                  <ChevronRight
                    strokeWidth={2}
                    className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors duration-300"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-[2.5rem] h-[28rem] lg:h-auto overflow-hidden transition-all duration-500 relative flex items-center justify-center group shadow-[inset_0_0_80px_rgba(15,23,42,0.04)] transform-gpu [will-change:transform]">
            <div className="absolute top-8 right-8 z-20 flex gap-2 items-center bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-black/[0.03]">
              {myProjects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedProjectIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                    index === selectedProjectIndex
                      ? "bg-slate-800 w-6"
                      : "bg-slate-300 hover:bg-slate-400 w-1.5"
                  }`}
                  aria-label={`Go to project ${index + 1}`}
                />
              ))}
            </div>

            <Canvas
              className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing"
              dpr={isMobile ? [1, 1.25] : [1, 1.5]}
              gl={{
                antialias: !isMobile,
                alpha: true,
                powerPreference: isMobile ? "low-power" : "high-performance",
              }}
              camera={{ position: [0, 0, 12], fov: 45 }}
            >
              <Environment preset="studio" environmentIntensity={0.8} />
              <ambientLight intensity={0.6} color="#ffffff" />
              <directionalLight
                position={[5, 10, 5]}
                intensity={1.5}
                color="#ffffff"
                castShadow
              />
              <directionalLight
                position={[-5, 5, -5]}
                intensity={0.5}
                color="#e2e8f0"
              />

              <Center>
                <Suspense fallback={<CanvasLoader />}>
                  <group
                    scale={isMobile ? 1.4 : 1.7}
                    position={[0, -1.8, 0]}
                    rotation={[0, -0.2, 0]}
                  >
                    <DemoComputer texture={currentProject.texture} />
                  </group>

                  <ContactShadows
                    position={[0, -2.5, 0]}
                    opacity={0.3}
                    scale={15}
                    blur={2.5}
                    far={4}
                    color="#0f172a"
                  />
                </Suspense>
              </Center>

              <OrbitControls
                maxPolarAngle={Math.PI / 2 + 0.1}
                minPolarAngle={Math.PI / 3}
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.8}
                rotateSpeed={0.5}
              />
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
