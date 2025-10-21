import React, { Suspense, lazy } from "react";
import SectionLoader from "./components/SectionLoader";
import LoadingSpinner from "./components/LoadingSpinner"; // Import directly, don't lazy load
import { LoadingProvider, useLoadingContext } from "./contexts/LoadingContext";
const Navbar = lazy(() => import("./sections/Navbar"));
const Hero = lazy(() => import("./sections/Hero"));
const About = lazy(() => import("./sections/About"));
const Projects = lazy(() => import("./sections/Projects"));
const Contact = lazy(() => import("./sections/Contact"));
const Footer = lazy(() => import("./sections/Footer"));
const WorkExperience = lazy(() => import("./sections/WorkExperience"));
const LogoAnimation = lazy(() => import("./components/LogoAnimation"));
const CustomCursor = lazy(() => import("./components/CustomCursor"));
const EarthCanvas = lazy(() => import("./components/Earth"));
const StarsCanvas = lazy(() => import("./components/Stars"));
const Github = lazy(() => import("./sections/Github"));
const Sound = lazy(() => import("./components/Sound"));
const MobileConstructionPage = lazy(() =>
  import("./components/MobileConstructionPage")
);
const MobileConstructionPageFallback = lazy(() =>
  import("./components/MobileConstructionPageFallback")
);
const DeviceDebugInfo = lazy(() => import("./components/DeviceDebugInfo"));
import useDeviceDetection from "./hooks/useDeviceDetection";
import usePreloadResources from "./hooks/usePreloadResources";

const AppContent = () => {
  const isResourcesReady = usePreloadResources();
  const { isAppReady } = useLoadingContext();
  const { isMobile, isTablet, isDesktop, screenWidth, touchSupport } =
    useDeviceDetection();

  // App is fully loaded when BOTH resources are preloaded AND Hero is ready
  const isFullyLoaded = isResourcesReady && isAppReady;

  console.log("App loading status:", {
    isResourcesReady,
    isAppReady,
    isFullyLoaded,
  });

  // Enhanced mobile detection logic - ONLY show construction page for actual phones
  const isMobileDevice = () => {
    // Only redirect if screen is actually small (phone-sized)
    const isPhoneSize = screenWidth > 0 && screenWidth < 768;

    if (!isPhoneSize) {
      return false; // Desktop/laptop/tablet - show full site
    }

    // Additional check: User Agent must indicate mobile device
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileUA =
      /android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile/i.test(
        userAgent
      );

    // Exclude iPads and tablets (they should see full site)
    const isTablet = /ipad|tablet/i.test(userAgent);

    // Only show construction page if it's a phone-sized screen AND mobile user agent
    // AND not a tablet
    return isPhoneSize && mobileUA && !isTablet;
  };

  // Show construction page for mobile devices (but allow tablets)
  if (isMobileDevice()) {
    try {
      return (
        <Suspense fallback={<SectionLoader message="Loading mobile page..." />}>
          <MobileConstructionPage />
        </Suspense>
      );
    } catch (error) {
      console.warn(
        "Failed to load animated construction page, using fallback:",
        error
      );
      return (
        <Suspense fallback={<SectionLoader message="Loading fallback..." />}>
          <MobileConstructionPageFallback />
        </Suspense>
      );
    }
  }

  return (
    <>
      {/* Always show loading spinner when not fully loaded */}
      <LoadingSpinner shouldHide={isFullyLoaded} onLoadComplete={() => {}} />

      {/* Debug info - remove in production */}
      <Suspense fallback={null}>
        <DeviceDebugInfo show={false} />
      </Suspense>

      {/* Render content immediately so it can load in background while LoadingSpinner is visible */}
      <div
        className="overflow-x-hidden"
        style={{ visibility: isFullyLoaded ? "visible" : "hidden" }}
      >
        <Suspense fallback={null}>
          <StarsCanvas />
        </Suspense>
        <Suspense fallback={null}>
          <CustomCursor />
        </Suspense>
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <Suspense fallback={null}>
          <Hero />
        </Suspense>
        <Suspense fallback={null}>
          <About />
        </Suspense>
        <Suspense fallback={null}>
          <Github />
        </Suspense>
        <Suspense fallback={null}>
          <LogoAnimation />
        </Suspense>
        <Suspense fallback={null}>
          <Projects />
        </Suspense>
        <Suspense fallback={null}>
          <Contact />
        </Suspense>
        <Suspense fallback={null}>
          <WorkExperience />
        </Suspense>
        <Suspense fallback={null}>
          <EarthCanvas />
        </Suspense>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
        <Suspense fallback={null}>
          <Sound />
        </Suspense>
      </div>
      {/* Modal container moved outside main content */}
      <div id="my-modal" />
    </>
  );
};

const App = () => {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
};

export default App;
