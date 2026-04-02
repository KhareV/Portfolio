"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Mail, Copy, Check, Code2, Globe2, Heart } from "lucide-react";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });
import Button from "../components/Button.jsx";
import Sunflower from "../components/Sunflower.jsx";
import TechMarquee from "../components/TechMarquee.jsx";
import ItemLayout from "../components/ItemLayout.jsx";
import {
  spacing,
  layout,
  responsive,
  transitions,
  cn,
} from "../styles/spacing";
import useDeviceDetection from "../hooks/useDeviceDetection";

const About = () => {
  const { isMobile } = useDeviceDetection();
  const [hasCopied, setHasCopied] = useState(false);

  const softCardClass =
    "relative overflow-hidden rounded-[30px] border border-[#d4d7cf] bg-[#f6f7f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_28px_rgba(121,126,112,0.12)]";
  const fixedSizeCardClass = "w-full h-full";

  const handleCopy = () => {
    navigator.clipboard.writeText("kharevedant05@gmail.com");
    setHasCopied(true);

    setTimeout(() => {
      setHasCopied(false);
    }, 4000);
  };

  // Animation settings for Framer Motion
  const slideIn = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1, ease: "easeInOut" },
    },
  };

  return (
    <section
      className={cn(
        "c-space",
        "bg-[#FEFFFC]",
        spacing.section.marginTop,
        spacing.section.paddingY,
      )}
      id="about"
    >
      <motion.h2
        className="text-4xl md:text-6xl font-semibold tracking-tighter text-slate-900 mb-14 font-site-default"
        initial={{ x: -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.1 }}
      >
        About Me
      </motion.h2>
      <div
        className={cn(
          layout.grid.cols3,
          "xl:grid-rows-6",
          spacing.grid.gap,
          "h-full",
          "px-4 sm:px-6 md:px-8",
        )}
      >
        {/* First Grid Item */}
        <motion.div
          className="col-span-1 md:col-span-1 xl:row-span-3 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideIn}
          transition={{ delay: 0.3 }}
        >
          {/* Background Container */}
          <div className={cn("w-full md:w-4/5 mx-auto", softCardClass)}>
            {/* Marquee Container */}
            <div className="absolute inset-0 w-full h-full">
              <div className={cn(spacing.section.paddingY, "mt-52 pt-24")}>
                <div className="relative flex overflow-x-hidden overflow-y-hidden">
                  <div
                    className={cn(
                      "animate-profile-scroll-1 whitespace-nowrap",
                      layout.flex.center,
                    )}
                  >
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                  </div>
                  <div
                    className={cn(
                      "absolute top-0 animate-profile-scroll-2 whitespace-nowrap",
                      layout.flex.center,
                    )}
                  >
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-[#8d9189]",
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300",
                      )}
                    >
                      Vedant Khare
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Container */}
            <div className={cn("relative z-10 profile-container")}>
              <img
                src="image/WhatsApp Image 2025-04-29 at 16.36.35_6c693daa.jpg"
                alt="grid-1"
                className="w-full sm:h-[276px] h-fit object-cover"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/6 to-transparent"></div>
              <div className="relative">
                <p
                  className={cn(
                    "profile-heading font-site-default text-[#2c2f2a]",
                    spacing.section.marginTop,
                  )}
                >
                  Hi, I'm Vedant Khare
                </p>
                <p className="profile-description text-[#5a5f58]">
                  With experience in web development, I have honed my skills in
                  both frontend and backend technologies, including HTML, CSS,
                  JavaScript, React, Next.js, Node.js, and MongoDB. I've
                  completed over 20 projects, creating dynamic and responsive
                  web applications tailored to user needs.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Second Grid Item - Tech Stack */}
        <motion.div
          className="col-span-1 md:col-span-1 xl:row-span-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideIn}
          transition={{ delay: 0.6 }}
        >
          <div
            className={cn(
              "group",
              fixedSizeCardClass,
              softCardClass,
              "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(121,126,112,0.16)]",
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#f7efe6]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src="/newimages/cherry.png"
              alt="grid-3"
              className="object-contain opacity-90 transition-all duration-300"
            />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#f5ecdf] rounded-lg border border-[#e6d5b8]">
                  <Code2 className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="font-site-default text-2xl text-[#2c2f2a] group-hover:text-[#8f6a2d] transition-colors duration-300">
                  Tech Stack
                </h3>
              </div>
              <p className="text-[0.98rem] leading-relaxed text-[#5a5f58]">
                I specialize in a variety of languages, frameworks, and tools,
                including HTML, CSS, JavaScript, React, Redux, Vue, Next.js,
                Node.js, Express, MongoDB, MySQL, GraphQL, Apollo Client, and
                Tailwind CSS, enabling me to build robust and scalable
                applications.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Third Grid Item - Globe */}
        <motion.div
          className="col-span-1 md:col-span-1 xl:row-span-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideIn}
          transition={{ delay: 0.9 }}
        >
          <div
            className={cn(
              "group",
              fixedSizeCardClass,
              softCardClass,
              "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(121,126,112,0.16)]",
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br  duration-300" />
            <div
              className="rounded-3xl w-full sm:h-[326px] h-fit flex justify-center items-center bg-black
            "
            >
              <Globe
                height={isMobile ? 200 : 326}
                width={isMobile ? 200 : 326}
                backgroundColor="rgba(246, 247, 241, 0)"
                backgroundImageOpacity={0.95}
                showAtmosphere={!isMobile}
                showGraticules={!isMobile}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl={
                  isMobile
                    ? undefined
                    : "//unpkg.com/three-globe/example/img/earth-topology.png"
                }
                cameraPosition={{ x: 1.5, y: 0, z: 0 }}
                cameraRotation={{ x: 0, y: -Math.PI / 2, z: 0 }}
                autoRotate={false}
                pointOfView={[{ lat: 20, lng: 78, altitude: 0.6 }]}
                htmlElementsData={[
                  {
                    lat: 55.7558,
                    lng: 37.6173,
                    size: 8,
                    color: "#c17a57",
                    isChennai: false,
                  },
                  {
                    lat: 45.4215,
                    lng: -75.6972,
                    size: 8,
                    color: "#c17a57",
                    isChennai: false,
                  },
                  {
                    lat: 39.9042,
                    lng: 116.4074,
                    size: 8,
                    color: "#c17a57",
                    isChennai: false,
                  },
                  {
                    lat: 38.8977,
                    lng: -77.0365,
                    size: 8,
                    color: "#c17a57",
                    isChennai: false,
                  },
                  {
                    lat: -15.7975,
                    lng: -47.8919,
                    size: 8,
                    color: "#c17a57",
                    isChennai: false,
                  },
                  {
                    lat: -35.2809,
                    lng: 149.13,
                    size: 8,
                    color: "#c17a57",
                    isChennai: false,
                  },
                  {
                    lat: 28.6139,
                    lng: 77.209,
                    size: 8,
                    color: "#c17a57",
                    isChennai: false,
                  },
                  {
                    lat: -34.6037,
                    lng: -58.3816,
                    size: 8,
                    color: "#c17a57",
                    isChennai: false,
                  },
                  {
                    lat: 51.1694,
                    lng: 71.4491,
                    size: 8,
                    color: "#c17a57",
                    isChennai: false,
                  },
                  {
                    lat: 36.7538,
                    lng: 3.0588,
                    size: 8,
                    color: "#c17a57",
                    isChennai: false,
                  },
                  {
                    lat: 13.0827,
                    lng: 80.2707,
                    size: 10,
                    text: "Chennai, India",
                    color: "#5a4a3d",
                    isChennai: true,
                  },
                ]}
                htmlElement={(d) => {
                  const el = document.createElement("div");
                  el.innerHTML = `
            <div style="
              transform: translate(-50%, -50%);
              display: flex;
              flex-direction: column;
              align-items: center;
              position: relative;
            ">
              <svg 
                height="${d.size * 2}"
                width="${d.size * 2}"
                viewBox="0 0 24 24"
                fill="${d.color}"
                style="transform: translateY(50%);"
              >
                <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z"/>
              </svg>
              ${
                d.isChennai
                  ? `
                <div style="
                  color: ${d.color};
                  font-size: ${d.size * 0.8}px;
                  margin-top: ${d.size * 0.3}px;
                  text-shadow: 2px 2px 3px rgba(0,0,0,0.9);
                  white-space: nowrap;
                  pointer-events: none;
                ">${d.text}</div>
              `
                  : ""
              }
            </div>
          `;
                  return el;
                }}
                htmlAltitude={0.1}
              />
            </div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#e9f0f7] rounded-lg border border-[#cadef0]">
                  <Globe2 className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-site-default text-[1.35rem] leading-snug text-[#2c2f2a]">
                  I'm very flexible with time zone communications & locations
                </h3>
              </div>
              <p className="mb-6 text-[0.98rem] text-[#5a5f58]">
                I&apos;m based in Chennai, India and open to remote work
                worldwide.
              </p>
              <a href="#contact">
                <Button
                  name="Contact Me"
                  isBeam
                  containerClass={cn("w-full")}
                />
              </a>
              <div className="mt-4 flex justify-center">
                <Sunflower className="w-[100px] h-[100px] md:w-[340px] md:h-[340px] mt-7" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fourth Grid Item - Passion */}
        <motion.div
          className="col-span-1 md:col-span-2 xl:col-span-2 xl:row-span-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideIn}
          transition={{ delay: 1.2 }}
        >
          <div
            className={cn(
              "group",
              fixedSizeCardClass,
              softCardClass,
              "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(121,126,112,0.16)]",
              transitions.default,
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#f0e8f6]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src="/newimages/coast.png"
              alt="grid-3"
              className="object-contain opacity-90 transition-all duration-300"
            />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-2 bg-[#eee7f8] rounded-lg border border-[#d8c9f2]"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Heart
                    className="w-6 h-6 text-purple-500"
                    fill="currentColor"
                  />
                </motion.div>
                <h3 className="font-site-default text-2xl text-[#2c2f2a] group-hover:text-purple-600 transition-colors duration-300">
                  My Passion for Coding
                </h3>
              </div>
              <p className="mb-6 leading-relaxed text-[0.98rem] text-[#5a5f58]">
                I love solving problems and building things through code.
                Programming isn&apos;t just my profession—it&apos;s my passion.
                I enjoy exploring new technologies, and enhancing my skills.
              </p>
              <TechMarquee />
            </div>
          </div>
        </motion.div>

        {/* Fifth Grid Item - Contact */}
        <motion.div
          className="col-span-1 md:col-span-1 xl:col-span-1 xl:row-span-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideIn}
          transition={{ delay: 1.5 }}
        >
          <div
            className={cn(
              "group",
              fixedSizeCardClass,
              softCardClass,
              "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(121,126,112,0.16)]",
              transitions.default,
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#e9f4ea]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src="/newimages/rooftop.png"
              alt="grid-4"
              className="w-full md:h-[250px] sm:h-[276px] h-fit object-cover object-center opacity-90 transition-all duration-300"
            />
            <div className={cn("space-y-4 relative p-6")}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-green-500" />
                <p className="text-center font-semibold text-[#2c2f2a]">
                  Contact me
                </p>
              </div>
              <motion.div
                className={cn(
                  "copy-container cursor-pointer flex items-center justify-center gap-3 p-4 bg-[#f0f3ea] rounded-xl border border-[#cfd8c4] hover:border-green-500/40",
                  transitions.default,
                )}
                onClick={handleCopy}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={hasCopied ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {hasCopied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-[#6e746a] group-hover:text-green-500 transition-colors" />
                  )}
                </motion.div>
                <p
                  className={cn(
                    "text-sm md:text-base lg:text-lg font-medium hover:scale-105",
                    transitions.default,
                    hasCopied
                      ? "text-green-600"
                      : "text-[#5d645a] group-hover:text-[#2f3d2f]",
                  )}
                >
                  kharevedant05@gmail.com
                </p>
              </motion.div>
              {hasCopied && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-green-600 text-sm"
                >
                  Email copied to clipboard!
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
