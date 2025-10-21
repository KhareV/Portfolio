import { useState, useEffect } from "react";

const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    userAgent: "",
    screenWidth: 0,
    screenHeight: 0,
    touchSupport: false,
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const touchSupport =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // Mobile device patterns
      const mobilePatterns = [
        /android/,
        /webos/,
        /iphone/,
        /ipad/,
        /ipod/,
        /blackberry/,
        /iemobile/,
        /opera mini/,
        /mobile/,
      ];

      // Tablet specific patterns
      const tabletPatterns = [/ipad/, /android(?!.*mobile)/, /tablet/];

      const isMobileUA = mobilePatterns.some((pattern) =>
        pattern.test(userAgent)
      );
      const isTabletUA = tabletPatterns.some((pattern) =>
        pattern.test(userAgent)
      );

      // Screen size based detection
      const isMobileScreen = screenWidth <= 768;
      const isTabletScreen = screenWidth > 768 && screenWidth <= 1024;
      const isDesktopScreen = screenWidth > 1024;

      // Combine user agent and screen size detection
      const isMobile =
        (isMobileUA && !isTabletUA) || (isMobileScreen && touchSupport);
      const isTablet =
        isTabletUA || (isTabletScreen && touchSupport && !isMobileUA);
      const isDesktop = !isMobile && !isTablet && isDesktopScreen;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        userAgent,
        screenWidth,
        screenHeight,
        touchSupport,
      });
    };

    // Initial detection
    detectDevice();

    // Listen for resize events
    const handleResize = () => {
      detectDevice();
    };

    window.addEventListener("resize", handleResize);

    // Listen for orientation change (mobile specific)
    const handleOrientationChange = () => {
      setTimeout(detectDevice, 100); // Small delay to get accurate dimensions
    };

    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceDetection;
