import { useState } from "react";
import { motion } from "framer-motion";
import Globe from "react-globe.gl";
import Button from "../components/Button.jsx";

const About = () => {
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
    <section className="c-space my-20" id="about">
      <div className="grid xl:grid-cols-3 xl:grid-rows-6 md:grid-cols-2 grid-cols-1 gap-5 h-full">
        {/* First Grid Item */}
        <motion.div
          className="col-span-1 xl:row-span-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideIn}
          transition={{ delay: 0.3 }}
        >
          <div className="grid-container hover:transform-card hover:bg-tertiary relative">
            <img
              src="assets/grid1.png"
              alt="grid-1"
              className="w-full sm:h-[276px] h-fit object-contain filter brightness-50"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30"></div>
            <div className="relative">
              <p className="grid-headtext">Hi, I’m Vedant Khare</p>
              <p className="grid-subtext">
                With experience in web development, I have honed my skills in
                both frontend and backend technologies, including HTML, CSS,
                JavaScript, React, Next.js, Node.js, and MongoDB. I've completed
                over 20 projects, creating dynamic and responsive web
                applications tailored to user needs.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Second Grid Item */}
        <motion.div
          className="col-span-1 xl:row-span-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideIn}
          transition={{ delay: 0.6 }}
        >
          <div className="grid-container hover:transform-card hover:bg-tertiary relative">
            <img
              src="assets/grid2.png"
              alt="grid-2"
              className="w-full sm:h-[276px] h-fit object-contain filter brightness-50"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30"></div>
            <div className="relative">
              <p className="grid-headtext">Tech Stack</p>
              <p className="grid-subtext">
                I specialize in a variety of languages, frameworks, and tools,
                including HTML, CSS, JavaScript, React, Redux, Vue, Next.js,
                Node.js, Express, MongoDB, MySQL, GraphQL, Apollo Client, and
                Tailwind CSS, enabling me to build robust and scalable
                applications.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Third Grid Item */}
        <motion.div
          className="col-span-1 xl:row-span-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideIn}
          transition={{ delay: 0.9 }}
        >
          <div className="grid-container hover:transform-card hover:bg-tertiary relative">
            <div className="rounded-3xl w-full sm:h-[326px] h-fit flex justify-center items-center">
              <Globe
                height={326}
                width={326}
                backgroundColor="rgba(3, 3, 4, 2)"
                backgroundImageOpacity={0.5}
                showAtmosphere
                showGraticules
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                labelsData={[
                  {
                    lat: 19.076,
                    lng: 72.8777,
                    text: "Mumbai, India",
                    color: "white",
                    size: 15,
                  },
                ]}
              />
            </div>
            <div className="relative">
              <p className="grid-headtext">
                I’m very flexible with time zone communications & locations
              </p>
              <p className="grid-subtext">
                I&apos;m based in Chennai, India and open to remote work
                worldwide.
              </p>
              <a href="#contact">
                <Button
                  name="Contact Me"
                  isBeam
                  containerClass="w-full mt-10"
                />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Fourth Grid Item */}
        <motion.div
          className="xl:col-span-2 xl:row-span-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideIn}
          transition={{ delay: 1.2 }}
        >
          <div className="grid-container hover:transform-card hover:bg-tertiary relative">
            <img
              src="assets/grid3.png"
              alt="grid-3"
              className="w-full sm:h-[266px] h-fit object-contain filter brightness-50"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30"></div>
            <div className="relative">
              <p className="grid-headtext">My Passion for Coding</p>
              <p className="grid-subtext">
                I love solving problems and building things through code.
                Programming isn&apos;t just my profession—it&apos;s my passion.
                I enjoy exploring new technologies, and enhancing my skills.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Fifth Grid Item */}
        <motion.div
          className="xl:col-span-1 xl:row-span-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideIn}
          transition={{ delay: 1.5 }}
        >
          <div className="grid-container hover:transform-card hover:bg-tertiary relative">
            <img
              src="assets/grid4.png"
              alt="grid-4"
              className="w-full md:h-[126px] sm:h-[276px] h-fit object-cover sm:object-top filter brightness-50"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30"></div>
            <div className="space-y-2 relative">
              <p className="grid-subtext text-center">Contact me</p>
              <div
                className="copy-container transition-all duration-300 ease-in-out cursor-pointer hover:scale-105"
                onClick={handleCopy}
              >
                <img
                  src={hasCopied ? "assets/tick.svg" : "assets/copy.svg"}
                  alt="copy"
                  className="transition-transform duration-300 ease-in-out hover:scale-125"
                />
                <p
                  className={`lg:text-2xl md:text-xl font-medium text-white transition-transform duration-300 ease-in-out ${
                    hasCopied ? "text-green-400" : "text-gray-400"
                  } hover:scale-105`}
                >
                  kharevedant05@gmail.com
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
