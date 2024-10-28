import React, { useState } from "react"; // Import useState
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
            <LogoAnimation />
            <Projects />
            <Contact />
            <WorkExperience />
            <EarthCanvas />
            <Footer />
          </main>
        </div>
      )}
    </>
  );
};

export default App;
