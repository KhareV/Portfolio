import React, { useState } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import WorkExperience from "./sections/WorkExperience";
import LogoAnimation from "./components/LogoAnimation";
import CustomCursor from "./components/CustomCursor";
import EarthCanvas from "./components/Earth";
import StarsCanvas from "./components/Stars";
import LoadingSpinner from "./components/LoadingSpinner";
import Github from "./sections/Github";
import Sound from "./components/Sound";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner onLoadComplete={handleLoadComplete} />
      ) : (
        <div className="overflow-x-hidden">
          <StarsCanvas />
          <main className="max-w-7xl mx-auto">
            <CustomCursor />
            <Navbar />
            <Hero />
            <About />
            <Github />
            <LogoAnimation />
            <Projects />
            <Contact />
            <WorkExperience />
            <EarthCanvas />
            <Footer />
            <Sound />
          </main>
        </div>
      )}
      {/* Modal container moved outside main content */}
      <div id="my-modal" />
    </>
  );
};

export default App;
