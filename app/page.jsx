import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import Projects from "./sections/Projects";
import Experience from "./sections/Experience";
import About from "./sections/About";
import Github from "./sections/Github";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import EarthBlock from "./components/EarthBlock";
import AnchorManager from "./components/AnchorManager";

// Every section and anchor target is in the server HTML, in document order,
// with its space reserved. Client code only enhances.
export default function Page() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="relative outline-none">
        <Hero />
        <div aria-hidden="true" className="time-bands h-12 w-full border-y border-[#d8dad5]/35 sm:h-[54px]" />
        <Projects />
        <Experience />
        <About />
        <Github />
        <EarthBlock />
        <Contact />
      </main>
      <Footer />
      <AnchorManager />
    </>
  );
}
