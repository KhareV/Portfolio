"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";
import { transitions, cn } from "../styles/spacing.js";

const APP_TIMEZONE = "Asia/Kolkata";
const FOOTER_BACKGROUND_FADE_MS = 1200;
const DAY_PHASE_ORDER = ["morning", "afternoon", "evening", "night"];

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

const getNextPhase = (phase) => {
  const index = DAY_PHASE_ORDER.indexOf(phase);
  if (index === -1) {
    return DAY_PHASE_ORDER[0];
  }

  return DAY_PHASE_ORDER[(index + 1) % DAY_PHASE_ORDER.length];
};

const runWhenIdle = (task, timeout = 2200) => {
  if (typeof window === "undefined") {
    return null;
  }

  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(task, { timeout });
  }

  return window.setTimeout(task, 220);
};

const cancelIdleTask = (id) => {
  if (typeof window === "undefined" || id == null) {
    return;
  }

  if ("cancelIdleCallback" in window) {
    window.cancelIdleCallback(id);
    return;
  }

  window.clearTimeout(id);
};

const preloadAndDecodeImage = (src) => {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      resolve();
    };

    image.onload = finish;
    image.onerror = finish;
    image.src = src;

    if (typeof image.decode === "function") {
      image.decode().then(finish).catch(finish);
    }
  });
};

const Footer = () => {
  const [dayPhase, setDayPhase] = useState(() => getDayPhase(getLocalHour()));
  const [previousPhase, setPreviousPhase] = useState(null);
  const latestPhaseRef = useRef(dayPhase);

  useEffect(() => {
    const activeBackground = FOOTER_BACKGROUNDS[dayPhase];
    const nextBackground = FOOTER_BACKGROUNDS[getNextPhase(dayPhase)];

    preloadAndDecodeImage(activeBackground);

    const idleTaskId = runWhenIdle(() => {
      preloadAndDecodeImage(nextBackground);
    });

    return () => {
      cancelIdleTask(idleTaskId);
    };
  }, [dayPhase]);

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

  useEffect(() => {
    if (dayPhase === latestPhaseRef.current) {
      return;
    }

    const outgoingPhase = latestPhaseRef.current;
    latestPhaseRef.current = dayPhase;
    setPreviousPhase(outgoingPhase);

    const clearPreviousTimer = window.setTimeout(() => {
      setPreviousPhase((current) =>
        current === outgoingPhase ? null : current,
      );
    }, FOOTER_BACKGROUND_FADE_MS);

    return () => {
      window.clearTimeout(clearPreviousTimer);
    };
  }, [dayPhase]);

  const visibleBackgroundPhases =
    previousPhase && previousPhase !== dayPhase
      ? [dayPhase, previousPhase]
      : [dayPhase];

  return (
    <footer id="footer" className="relative w-full overflow-hidden">
      <div className="relative mx-auto w-full aspect-[60/20] min-h-[340px] sm:min-h-[400px] md:min-h-[530px]">
        {visibleBackgroundPhases.map((phase) => (
          <NextImage
            key={phase}
            src={FOOTER_BACKGROUNDS[phase]}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            quality={68}
            priority={phase === dayPhase}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-out",
              phase === previousPhase ? "opacity-0" : "opacity-100",
            )}
            style={{ transitionDuration: `${FOOTER_BACKGROUND_FADE_MS}ms` }}
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
            © 2024 Vedant Khare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
