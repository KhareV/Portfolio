"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

import WorkExperienceScene from "../components/WorkExperienceScene.jsx";
import { workExperiences } from "../constants/index.js";
import {
  spacing,
  layout,
  responsive,
  transitions,
  cn,
} from "../styles/spacing.js";
import useDeviceDetection from "../hooks/useDeviceDetection";

const IDLE_ANIMATION_DELAY_MS = 180;
const FALLBACK_ANIMATION = "idle";
const SUPPORTED_ANIMATIONS = new Set(["idle", "salute", "clapping", "victory"]);

const normalizeAnimationName = (animationName) => {
  const normalizedName = String(
    animationName || FALLBACK_ANIMATION,
  ).toLowerCase();
  return SUPPORTED_ANIMATIONS.has(normalizedName)
    ? normalizedName
    : FALLBACK_ANIMATION;
};

const WorkExperience = () => {
  const { isMobile } = useDeviceDetection();
  const sectionRef = useRef(null);
  const developerRef = useRef(null);
  const idleAnimationTimerRef = useRef(null);
  const activeAnimationRef = useRef(FALLBACK_ANIMATION);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const isInView = useInView(sectionRef, {
    amount: 0.18,
    margin: "0px 0px -10% 0px",
  });

  useEffect(() => {
    if (isInView) {
      setHasEnteredView(true);
    }
  }, [isInView]);

  const clearIdleAnimationTimer = useCallback(() => {
    if (idleAnimationTimerRef.current == null) {
      return;
    }

    window.clearTimeout(idleAnimationTimerRef.current);
    idleAnimationTimerRef.current = null;
  }, []);

  const playAnimation = useCallback(
    (animationName) => {
      const safeAnimationName = normalizeAnimationName(animationName);

      clearIdleAnimationTimer();

      if (activeAnimationRef.current === safeAnimationName) {
        return;
      }

      activeAnimationRef.current = safeAnimationName;
      developerRef.current?.playAnimation?.(safeAnimationName);
    },
    [clearIdleAnimationTimer],
  );

  const scheduleIdleAnimation = useCallback(() => {
    clearIdleAnimationTimer();

    idleAnimationTimerRef.current = window.setTimeout(() => {
      playAnimation(FALLBACK_ANIMATION);
      idleAnimationTimerRef.current = null;
    }, IDLE_ANIMATION_DELAY_MS);
  }, [clearIdleAnimationTimer, playAnimation]);

  const handleItemKeyDown = useCallback(
    (event, animationName) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        playAnimation(animationName);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        scheduleIdleAnimation();
      }
    },
    [playAnimation, scheduleIdleAnimation],
  );

  useEffect(() => {
    return () => {
      clearIdleAnimationTimer();
    };
  }, [clearIdleAnimationTimer]);

  const shouldMountScene = !isMobile && hasEnteredView;
  const isSceneActive = !isMobile && isInView;

  return (
    <motion.section
      ref={sectionRef}
      className={cn(
        "c-space",
        "font-site-default",
        spacing.section.marginY,
        "relative z-10",
      )}
      id="work"
      initial={{ opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="w-full text-slate-600">
        <motion.h2
          className="text-4xl md:text-6xl font-semibold tracking-tighter text-slate-900 mb-4"
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.1 }}
        >
          My Work Experience
        </motion.h2>

        <div className="work-container">
          {!isMobile && shouldMountScene && (
            <WorkExperienceScene
              developerRef={developerRef}
              isActive={isSceneActive}
            />
          )}

          {!isMobile && !shouldMountScene && (
            <div className="work-canvas grid place-items-center text-slate-500 text-sm font-medium">
              3D preview loads on view.
            </div>
          )}

          <motion.div
            className="work-content"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className={cn(spacing.section.paddingY, spacing.card.padding)}>
              {workExperiences.map((item, index) => (
                <motion.div
                  key={item.id ?? item.name}
                  onClick={() => playAnimation(item.animation)}
                  onPointerEnter={() => playAnimation(item.animation)}
                  onPointerLeave={scheduleIdleAnimation}
                  onFocus={() => playAnimation(item.animation)}
                  onBlur={scheduleIdleAnimation}
                  onKeyDown={(event) =>
                    handleItemKeyDown(event, item.animation)
                  }
                  role="button"
                  tabIndex={0}
                  aria-label={`${item.name} - ${item.pos}`}
                  className="work-content_container group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9aad87] focus-visible:ring-offset-2"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1 + 0.3,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true, amount: 0.1 }}
                >
                  <div
                    className={cn(
                      layout.flex.col,
                      "h-full justify-start items-center",
                      spacing.text.paddingX,
                    )}
                  >
                    <div className="work-content_logo">
                      <Image
                        className="w-full h-full object-contain"
                        src={item.icon}
                        alt={item.name}
                        width={40}
                        height={40}
                        sizes="40px"
                      />
                    </div>

                    <div className="work-content_bar" />
                  </div>

                  <div className={cn(spacing.card.padding)}>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p
                      className={cn(
                        responsive.text.sm,
                        "text-slate-600",
                        spacing.text.marginBottom,
                      )}
                    >
                      {item.pos} -- <span>{item.duration}</span>
                    </p>
                    <p
                      className={cn(
                        "text-slate-600 group-hover:text-slate-900",
                        transitions.default,
                      )}
                    >
                      {item.title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default WorkExperience;
