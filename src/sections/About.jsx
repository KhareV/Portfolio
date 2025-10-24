import { useState } from "react";
import { motion } from "framer-motion";
import Globe from "react-globe.gl";
import { Mail, Copy, Check, Code2, Globe2, Heart } from "lucide-react";
import Button from "../components/Button.jsx";
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
        spacing.section.marginTop,
        spacing.section.paddingY
      )}
      id="about"
    >
      <div
        className={cn(
          layout.grid.cols3,
          "xl:grid-rows-6",
          spacing.grid.gap,
          "h-full",
          "px-4 sm:px-6 md:px-8"
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
          <div className="w-full md:w-4/5 mx-auto bg-gray-920 rounded-lg relative">
            {/* Marquee Container */}
            <div className="absolute inset-0 w-full h-full">
              <div className={cn(spacing.section.paddingY, "mt-52 pt-24")}>
                <div className="relative flex overflow-x-hidden overflow-y-hidden">
                  <div
                    className={cn(
                      "animate-profile-scroll-1 whitespace-nowrap",
                      layout.flex.center
                    )}
                  >
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                  </div>
                  <div
                    className={cn(
                      "absolute top-0 animate-profile-scroll-2 whitespace-nowrap",
                      layout.flex.center
                    )}
                  >
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                    <span
                      className={cn(
                        "mx-4",
                        responsive.text["3xl"],
                        "text-gray-300"
                      )}
                    >
                      Vedant Khare
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Container */}
            <div
              className={cn(
                "relative z-10 profile-container hover:profile-transform hover:bg-tertiary"
              )}
            >
              <img
                src="image/WhatsApp Image 2025-04-29 at 16.36.35_6c693daa.jpg"
                alt="grid-1"
                className="w-full sm:h-[276px] h-fit object-contain"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-black/30"></div>
              <div className="relative">
                <p className={cn("profile-heading", spacing.section.marginTop)}>
                  Hi, I'm Vedant Khare
                </p>
                <p className="profile-description">
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
          <div className="grid-container group hover:transform-card relative bg-gradient-to-br from-black-200/90 to-black-300/90 backdrop-blur-sm border border-black-300 hover:border-yellow-500/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src="assets/grid2.png"
              alt="grid-2"
              className="w-full sm:h-[276px] h-fit object-contain filter brightness-40 group-hover:brightness-50 transition-all duration-300"
            />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <Code2 className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="grid-headtext text-2xl group-hover:text-yellow-500 transition-colors duration-300">
                  Tech Stack
                </h3>
              </div>
              <p className="grid-subtext leading-relaxed">
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
          <div className="grid-container group hover:transform-card relative bg-gradient-to-br from-black-200/90 to-black-300/90 backdrop-blur-sm border border-black-300 hover:border-blue-500/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="rounded-3xl w-full sm:h-[326px] h-fit flex justify-center items-center bg-black/20">
              <Globe
                height={isMobile ? 250 : 326}
                width={isMobile ? 250 : 326}
                backgroundColor="rgba(3, 3, 4, 2)"
                backgroundImageOpacity={0.5}
                showAtmosphere={!isMobile}
                showGraticules={!isMobile}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
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
                    color: "#FF5733",
                    isChennai: false,
                  },
                  {
                    lat: 45.4215,
                    lng: -75.6972,
                    size: 8,
                    color: "#FF5733",
                    isChennai: false,
                  },
                  {
                    lat: 39.9042,
                    lng: 116.4074,
                    size: 8,
                    color: "#FF5733",
                    isChennai: false,
                  },
                  {
                    lat: 38.8977,
                    lng: -77.0365,
                    size: 8,
                    color: "#FF5733",
                    isChennai: false,
                  },
                  {
                    lat: -15.7975,
                    lng: -47.8919,
                    size: 8,
                    color: "#FF5733",
                    isChennai: false,
                  },
                  {
                    lat: -35.2809,
                    lng: 149.13,
                    size: 8,
                    color: "#FF5733",
                    isChennai: false,
                  },
                  {
                    lat: 28.6139,
                    lng: 77.209,
                    size: 8,
                    color: "#FF5733",
                    isChennai: false,
                  },
                  {
                    lat: -34.6037,
                    lng: -58.3816,
                    size: 8,
                    color: "#FF5733",
                    isChennai: false,
                  },
                  {
                    lat: 51.1694,
                    lng: 71.4491,
                    size: 8,
                    color: "#FF5733",
                    isChennai: false,
                  },
                  {
                    lat: 36.7538,
                    lng: 3.0588,
                    size: 8,
                    color: "#FF5733",
                    isChennai: false,
                  },
                  {
                    lat: 13.0827,
                    lng: 80.2707,
                    size: 10,
                    text: "Chennai, India",
                    color: "#FFFFFF",
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
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Globe2 className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="grid-headtext text-xl">
                  I'm very flexible with time zone communications & locations
                </h3>
              </div>
              <p className="grid-subtext mb-6">
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
              "grid-container group hover:transform-card relative bg-gradient-to-br from-black-200/90 to-black-300/90 backdrop-blur-sm border border-black-300 hover:border-purple-500/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-purple-500/10",
              transitions.default
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src="assets/grid3.png"
              alt="grid-3"
              className="w-full sm:h-[266px] h-fit object-contain filter brightness-40 group-hover:brightness-50 transition-all duration-300"
            />
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Heart
                    className="w-6 h-6 text-purple-500"
                    fill="currentColor"
                  />
                </motion.div>
                <h3 className="grid-headtext text-2xl group-hover:text-purple-500 transition-colors duration-300">
                  My Passion for Coding
                </h3>
              </div>
              <p className="grid-subtext mb-6 leading-relaxed">
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
              "grid-container group hover:transform-card relative bg-gradient-to-br from-black-200/90 to-black-300/90 backdrop-blur-sm border border-black-300 hover:border-green-500/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-green-500/10",
              transitions.default
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src="assets/grid4.png"
              alt="grid-4"
              className="w-full md:h-[126px] sm:h-[276px] h-fit object-cover sm:object-top filter brightness-40 group-hover:brightness-50 transition-all duration-300"
            />
            <div className={cn("space-y-4 relative p-6")}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-green-500" />
                <p className="grid-subtext text-center font-semibold text-white">
                  Contact me
                </p>
              </div>
              <motion.div
                className={cn(
                  "copy-container cursor-pointer flex items-center justify-center gap-3 p-4 bg-black-300/50 rounded-xl border border-black-300 hover:border-green-500/50",
                  transitions.default
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
                    <Copy className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                  )}
                </motion.div>
                <p
                  className={cn(
                    "text-sm md:text-base lg:text-lg font-medium hover:scale-105",
                    transitions.default,
                    hasCopied
                      ? "text-green-400"
                      : "text-gray-400 group-hover:text-white"
                  )}
                >
                  kharevedant05@gmail.com
                </p>
              </motion.div>
              {hasCopied && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-green-400 text-sm"
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
