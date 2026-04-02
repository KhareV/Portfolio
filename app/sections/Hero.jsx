"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  lazy,
} from "react";
import { motion } from "framer-motion";

const ChatBox = lazy(() => import("../components/Chatbox.jsx"));
import { MessageProvider } from "../contexts/MessageContext.jsx";
import { cn } from "../styles/spacing";
import { useLoadingContext } from "../contexts/LoadingContext";
import Sunflower from "../components/Sunflower.jsx";

const APP_TIMEZONE = "Asia/Kolkata";

const HERO_BACKGROUNDS = {
  morning: "/newimages/cofounder-bg.avif",
  afternoon: "/newimages/hero-2.avif",
  evening: "/newimages/hero-3.avif",
  night: "/newimages/hero-4.avif",
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

const getLocalClock = () => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
};

const getDayPhase = (hour) => {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

const HERO_INTRO_TEXT = "Hello,\nI'm Vedant Khare.";
const HERO_SCRIPT_WORD = "Hello";

const preloadAndDecodeImage = (src) => {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    image.onload = finish;
    image.onerror = finish;
    image.src = src;

    if (typeof image.decode === "function") {
      image
        .decode()
        .then(finish)
        .catch(() => {});
    }
  });
};

const Hero = () => {
  const [dayPhase, setDayPhase] = useState(() => getDayPhase(getLocalHour()));
  const [localClock, setLocalClock] = useState(() => getLocalClock());
  const [areBackgroundsReady, setAreBackgroundsReady] = useState(false);
  const [typedIntro, setTypedIntro] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [shouldStartTyping, setShouldStartTyping] = useState(false);
  const headingRef = useRef(null);
  const { setHeroReady, setModelsReady } = useLoadingContext();

  const backgrounds = useMemo(() => Object.entries(HERO_BACKGROUNDS), []);

  useEffect(() => {
    let mounted = true;

    const warmBackgrounds = async () => {
      await Promise.allSettled(
        backgrounds.map(([, src]) => preloadAndDecodeImage(src)),
      );

      if (mounted) {
        setAreBackgroundsReady(true);
      }
    };

    warmBackgrounds();

    return () => {
      mounted = false;
    };
  }, [backgrounds]);

  useEffect(() => {
    if (!areBackgroundsReady) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setHeroReady(true);
      });
    });
  }, [areBackgroundsReady, setHeroReady]);

  useEffect(() => {
    if (setModelsReady) {
      requestAnimationFrame(() => {
        setModelsReady(true);
      });
    }
  }, [setModelsReady]);

  useEffect(() => {
    let timerId;

    const syncLocalState = () => {
      const hour = getLocalHour();
      const nextPhase = getDayPhase(hour);

      setDayPhase((prev) => (prev === nextPhase ? prev : nextPhase));
      setLocalClock(getLocalClock());

      const msUntilNextMinute = 60000 - (Date.now() % 60000) + 20;
      timerId = window.setTimeout(syncLocalState, msUntilNextMinute);
    };

    syncLocalState();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const hour = getLocalHour();
        setDayPhase(getDayPhase(hour));
        setLocalClock(getLocalClock());
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const target = headingRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldStartTyping(true);
        observer.disconnect();
      },
      {
        threshold: 0.55,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldStartTyping) return;

    let intervalId;
    setTypedIntro("");
    setIsTypingDone(false);

    const startDelay = window.setTimeout(() => {
      let cursor = 0;

      intervalId = window.setInterval(() => {
        cursor += 1;
        setTypedIntro(HERO_INTRO_TEXT.slice(0, cursor));

        if (cursor >= HERO_INTRO_TEXT.length) {
          window.clearInterval(intervalId);
          setIsTypingDone(true);
        }
      }, 55);
    }, 2000);

    return () => {
      window.clearTimeout(startDelay);
      window.clearInterval(intervalId);
    };
  }, [shouldStartTyping]);

  const typedLines = useMemo(() => typedIntro.split("\n"), [typedIntro]);

  const renderTypedLine = (line, index) => {
    if (index !== 0 || !line) {
      return line;
    }

    const scriptLength = Math.min(line.length, HERO_SCRIPT_WORD.length);
    const scriptPart = line.slice(0, scriptLength);
    const defaultPart = line.slice(scriptLength);

    return (
      <>
        <span className="font-hero-script">{scriptPart}</span>
        {defaultPart}
      </>
    );
  };

  return (
    <section
      id="hero"
      className={cn(
        "relative w-screen min-h-[200vh] overflow-hidden text-white",
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        {backgrounds.map(([phase, src]) => (
          <img
            key={phase}
            src={src}
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1400ms] ease-out",
              dayPhase === phase ? "opacity-100" : "opacity-0",
            )}
            loading="eager"
            fetchPriority={dayPhase === phase ? "high" : "auto"}
            decoding="async"
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[200vh] w-full max-w-[1480px] flex-col items-center px-5 pb-0 pt-32 sm:px-8 md:px-12 md:pt-40">
        <motion.h1
          ref={headingRef}
          className="font-hero-display -mt-4 md:-mt-8 mx-auto max-w-[860px] text-center text-[clamp(1.95rem,3.45vw,3.6rem)] leading-[1.15] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {typedLines.map((line, idx) => (
            <React.Fragment key={idx}>
              {renderTypedLine(line, idx)}
              {idx < typedLines.length - 1 ? <br /> : null}
            </React.Fragment>
          ))}
          {!isTypingDone ? (
            <span className="ml-1 inline-block h-[0.95em] w-[2px] translate-y-[2px] animate-pulse bg-white/90 align-middle" />
          ) : null}
        </motion.h1>

        <div className="mt-[3vh] grid w-full grid-cols-1 gap-12 md:mt-[12vh] md:grid-cols-[minmax(0,620px)_1fr] md:items-end">
          <motion.article
            className="-mt-[15px] max-w-[620px] rounded-[26px] border border-[#e8c8b3]/35 bg-[#8c5b52]/43 p-8 shadow-[0_24px_70px_rgba(25,12,12,0.3)] backdrop-blur-[12px] sm:p-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.85, ease: "easeOut" }}
          >
            <h2 className="font-hero-serif text-[clamp(2.15rem,4.5vw,3.9rem)] leading-[1.03] text-[#fff7f1]">
              Articulate, Poised, Pricipled, Vision-Driven
            </h2>
            <p className="mt-4 max-w-[560px] font-hero-serif text-[clamp(0.9rem,1.2vw,1.08rem)] leading-[1.6] text-[#fff1e8]">
              B.Tech. CSE student at VIT Chennai with 40+ projects and multiple
              hackathon wins. Specializing in full-stack development, blockchain
              solutions, and AI integration.
            </p>

            <div className="mt-6 h-[560px]">
              <MessageProvider>
                <Suspense
                  fallback={
                    <div className="grid h-full place-items-center rounded-[20px] bg-[#2b2120] text-[#ffe9d9]">
                      Loading chat...
                    </div>
                  }
                >
                  <ChatBox />
                </Suspense>
              </MessageProvider>
            </div>
          </motion.article>
        </div>

        <div className="mt-8 self-end rounded-full border border-[#f5d2bc]/40 bg-[#7d514a]/40 px-4 py-2 font-hero-serif text-sm text-[#ffe5d5] md:hidden">
          {localClock} IST
        </div>
      </div>
    </section>
  );
};

export default Hero;
