"use client";

import { useEffect, useMemo, useState } from "react";
import { FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";
import { transitions, cn } from "../styles/spacing.js";

const APP_TIMEZONE = "Asia/Kolkata";

const FOOTER_BACKGROUNDS = {
  morning: "/newimages/morningfoot.png",
  afternoon: "/newimages/afternoonfoot.png",
  evening: "/newimages/nightfoot.png",
  night: "/newimages/footer-4.png",
};

const getLocalHour = () => {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: APP_TIMEZONE,
      hour: "2-digit",
      hour12: false,
    }).format(new Date()),
  );
};

const getDayPhase = (hour) => {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

const Footer = () => {
  const [dayPhase, setDayPhase] = useState(() => getDayPhase(getLocalHour()));
  const backgrounds = useMemo(() => Object.entries(FOOTER_BACKGROUNDS), []);

  useEffect(() => {
    backgrounds.forEach(([, src]) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
    });
  }, [backgrounds]);

  useEffect(() => {
    let timerId;

    const syncLocalPhase = () => {
      const hour = getLocalHour();
      const nextPhase = getDayPhase(hour);

      setDayPhase((prev) => (prev === nextPhase ? prev : nextPhase));

      const msUntilNextMinute = 60000 - (Date.now() % 60000) + 20;
      timerId = window.setTimeout(syncLocalPhase, msUntilNextMinute);
    };

    syncLocalPhase();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setDayPhase(getDayPhase(getLocalHour()));
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <footer id="footer" className="relative w-full overflow-hidden">
      <div className="relative mx-auto w-full aspect-[60/17] min-h-[320px] sm:min-h-[360px] md:min-h-[430px]">
        {backgrounds.map(([phase, src]) => (
          <img
            key={phase}
            src={src}
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1200ms] ease-out",
              dayPhase === phase ? "opacity-100" : "opacity-0",
            )}
            loading={dayPhase === phase ? "eager" : "lazy"}
            decoding="async"
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/8 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-between gap-5 px-6 pb-8 pt-16 text-center text-[#f8f0e7] md:flex-row md:items-end md:px-12 md:text-left">
          <div className="flex items-center gap-4 text-white">
            <a
              href="https://github.com/KhareV"
              target="_blank"
              rel="noopener noreferrer"
              className={cn("social-icon hover:scale-110", transitions.default)}
            >
              <FaGithub className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn("social-icon hover:scale-110", transitions.default)}
            >
              <FaTwitter className="h-6 w-6" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={cn("social-icon hover:scale-110", transitions.default)}
            >
              <FaInstagram className="h-6 w-6" />
            </a>
          </div>

          <p className="font-site-default text-sm text-[#f4e8dc] md:text-base">
            © 2026 Vedant Khare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
