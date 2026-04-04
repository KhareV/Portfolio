"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  lazy,
} from "react";
import { motion } from "framer-motion";
import NextImage from "next/image";

const ChatBox = lazy(() => import("../components/Chatbox.jsx"));
import { MessageProvider } from "../contexts/MessageContext.jsx";
import { cn } from "../styles/spacing.jsx";
import { useLoadingContext } from "../contexts/LoadingContext";
import Sunflower from "../components/Sunflower.jsx";

const APP_TIMEZONE = "Asia/Kolkata";

const HERO_BACKGROUNDS = {
  morning: "/newimages/cofounder-bg.avif",
  afternoon: "/newimages/hero-1.avif",
  evening: "/newimages/vegas_night_hero.avif",
  night: "/newimages/niag_night_hero.avif",
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
const HERO_TYPING_INTERVAL_MS = 55;
const HERO_TYPING_START_DELAY_MS = 500;
const HERO_OBSERVER_THRESHOLD = 0.3;
const HERO_BACKGROUND_FADE_MS = 1400;
const CHAT_WIDGET_DEFER_MS = 5200;

class HeroChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("ChatBox failed to render:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid h-full place-items-center rounded-[20px] bg-[#2b2120] text-[#ffe9d9]">
          Chat is temporarily unavailable.
        </div>
      );
    }

    return this.props.children;
  }
}

const Hero = () => {
  const [dayPhase, setDayPhase] = useState(() => getDayPhase(getLocalHour()));
  const [localClock, setLocalClock] = useState(() => getLocalClock());
  const [previousPhase, setPreviousPhase] = useState(null);
  const [typedIntro, setTypedIntro] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [shouldStartTyping, setShouldStartTyping] = useState(false);
  const [shouldMountChat, setShouldMountChat] = useState(false);
  const headingRef = useRef(null);
  const latestPhaseRef = useRef(dayPhase);
  const { setHeroReady, setModelsReady } = useLoadingContext();

  useEffect(() => {
    let mounted = true;
    const readyTimerId = window.setTimeout(() => {
      requestAnimationFrame(() => {
        if (!mounted) {
          return;
        }

        requestAnimationFrame(() => {
          if (mounted) {
            setHeroReady(true);
          }
        });
      });
    }, 140);

    return () => {
      mounted = false;
      window.clearTimeout(readyTimerId);
    };
  }, [setHeroReady]);

  useEffect(() => {
    let mounted = true;
    const interactionEvents = ["pointerdown", "touchstart", "keydown"];

    const activateChat = () => {
      if (!mounted) {
        return;
      }

      setShouldMountChat(true);
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, activateChat);
      });
    };

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, activateChat, {
        passive: true,
        once: true,
      });
    });

    const fallbackTimerId = window.setTimeout(() => {
      activateChat();
    }, CHAT_WIDGET_DEFER_MS);

    return () => {
      mounted = false;
      window.clearTimeout(fallbackTimerId);
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, activateChat);
      });
    };
  }, []);

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
    }, HERO_BACKGROUND_FADE_MS);

    return () => {
      window.clearTimeout(clearPreviousTimer);
    };
  }, [dayPhase]);

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
        threshold: HERO_OBSERVER_THRESHOLD,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldStartTyping) return;

    let rafId = null;
    let cursor = 0;
    let lastStepAt = 0;

    setTypedIntro("");
    setIsTypingDone(false);

    const startDelay = window.setTimeout(() => {
      const step = (timestamp) => {
        if (lastStepAt === 0) {
          lastStepAt = timestamp;
        }

        const elapsed = timestamp - lastStepAt;

        if (elapsed >= HERO_TYPING_INTERVAL_MS) {
          const stepCount = Math.floor(elapsed / HERO_TYPING_INTERVAL_MS);
          cursor = Math.min(HERO_INTRO_TEXT.length, cursor + stepCount);
          setTypedIntro(HERO_INTRO_TEXT.slice(0, cursor));
          lastStepAt = timestamp;

          if (cursor >= HERO_INTRO_TEXT.length) {
            setIsTypingDone(true);
            return;
          }
        }

        rafId = window.requestAnimationFrame(step);
      };

      rafId = window.requestAnimationFrame(step);
    }, HERO_TYPING_START_DELAY_MS);

    return () => {
      window.clearTimeout(startDelay);

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [shouldStartTyping]);

  const typedLines = useMemo(() => typedIntro.split("\n"), [typedIntro]);
  const visibleBackgroundPhases = useMemo(
    () =>
      previousPhase && previousPhase !== dayPhase
        ? [dayPhase, previousPhase]
        : [dayPhase],
    [dayPhase, previousPhase],
  );

  const renderTypedLine = useCallback((line, index) => {
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
  }, []);

  return (
    <section
      id="hero"
      className={cn(
        "relative w-screen min-h-[180vh] md:min-h-[200vh] overflow-hidden text-white",
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        {visibleBackgroundPhases.map((phase) => (
          <NextImage
            key={phase}
            src={HERO_BACKGROUNDS[phase]}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            quality={58}
            priority={dayPhase === phase}
            fetchPriority={dayPhase === phase ? "high" : "auto"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-out",
              phase === previousPhase ? "opacity-0" : "opacity-100",
            )}
            style={{ transitionDuration: `${HERO_BACKGROUND_FADE_MS}ms` }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[180vh] md:min-h-[200vh] w-full max-w-[1480px] flex-col items-center px-4 pb-0 pt-24 sm:px-8 md:px-12 md:pt-40">
        <motion.h1
          ref={headingRef}
          className="font-hero-display -mt-2 sm:-mt-4 md:-mt-8 mx-auto max-w-[860px] text-center text-[clamp(1.65rem,3.1vw,3.6rem)] leading-[1.15] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          aria-live="polite"
          aria-atomic="true"
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

        <div className="mt-[3vh] grid w-full grid-cols-1 gap-8 sm:gap-12 md:mt-[12vh] md:grid-cols-[minmax(0,620px)_1fr] md:items-end">
          <motion.article
            className="-mt-[15px] w-full max-w-[620px] rounded-[26px] border border-[#e8c8b3]/35 bg-[#8c5b52]/43 p-5 shadow-[0_24px_70px_rgba(25,12,12,0.3)] backdrop-blur-[12px] sm:p-8 md:p-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.85, ease: "easeOut" }}
          >
            <h2 className="font-hero-serif text-[clamp(2.15rem,4.5vw,3.9rem)] leading-[1.03] text-[#fff7f1]">
              Articulate, Poised, Principled, Vision-Driven
            </h2>
            <p className="mt-4 max-w-[560px] font-hero-serif text-[clamp(0.9rem,1.2vw,1.08rem)] leading-[1.6] text-[#fff1e8]">
              B.Tech. CSE student at VIT Chennai with 40+ projects and multiple
              hackathon wins. Specializing in full-stack development, blockchain
              solutions, and AI integration.
            </p>

            <div className="mt-6 h-[320px] sm:h-[420px] md:h-[560px]">
              <MessageProvider>
                <HeroChatErrorBoundary>
                  {shouldMountChat ? (
                    <Suspense
                      fallback={
                        <div className="grid h-full place-items-center rounded-[20px] bg-[#2b2120] text-[#ffe9d9]">
                          Loading chat...
                        </div>
                      }
                    >
                      <ChatBox />
                    </Suspense>
                  ) : (
                    <div className="grid h-full place-items-center rounded-[20px] border border-white/15 bg-[#2b2120]/70 p-6 text-center">
                      <div>
                        <p className="font-hero-serif text-[#ffe9d9]">
                          Chat assistant loads on interaction to keep startup
                          fast.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShouldMountChat(true)}
                          className="mt-4 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
                          aria-label="Open chat assistant"
                        >
                          Open Chat
                        </button>
                      </div>
                    </div>
                  )}
                </HeroChatErrorBoundary>
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

export default memo(Hero);
