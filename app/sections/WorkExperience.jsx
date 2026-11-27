"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";

import { workExperiences } from "../constants/index.jsx";
import {
  spacing,
  layout,
  responsive,
  transitions,
  cn,
} from "../styles/spacing.jsx";
import useDeviceDetection from "../hooks/useDeviceDetection.jsx";
import SceneBoundary from "../components/SceneBoundary.jsx";
import { WORK_ICON_IMAGE } from "../lib/imagePresets.js";

const WorkExperienceScene = dynamic(
  () => import("../components/WorkExperienceScene.jsx"),
  {
    ssr: false,
    loading: () => (
      <div className="work-canvas grid place-items-center text-slate-500 text-sm font-medium">
        Loading 3D preview...
      </div>
    ),
  },
);

const IDLE_ANIMATION_DELAY_MS = 180;
const FALLBACK_ANIMATION = "idle";
const SUPPORTED_ANIMATIONS = new Set([
  "idle",
  "salute",
  "clapping",
  "victory",
  "dance",
  "kick",
  "swing",
]);

const normalizeAnimationName = (animationName) => {
  const normalizedName = String(
    animationName || FALLBACK_ANIMATION,
  ).toLowerCase();
  return SUPPORTED_ANIMATIONS.has(normalizedName)
    ? normalizedName
    : FALLBACK_ANIMATION;
};

const rowKeyOf = (item) => String(item.id ?? item.name);
const ANIMATION_BY_ROW = new Map(
  workExperiences.map((item) => [rowKeyOf(item), item.animation]),
);

const WorkExperience = ({ disableHeavyVisuals = false }) => {
  const { isMobile } = useDeviceDetection();
  const sectionRef = useRef(null);
  const developerHandleRef = useRef(null);
  const idleAnimationTimerRef = useRef(null);
  const desiredAnimationRef = useRef(FALLBACK_ANIMATION);
  // Which row drives the avatar. Pointer hover wins, then a row pinned by a
  // click/tap/Enter (kept until the pointer leaves it or it blurs), then a row
  // with keyboard focus; otherwise idle. Keys are row ids, not clip names.
  const hoveredRowRef = useRef(null);
  const pinnedRowRef = useRef(null);
  const keyboardRowRef = useRef(null);
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

  const resolveAnimation = useCallback(() => {
    clearIdleAnimationTimer();
    const rowKey =
      hoveredRowRef.current ?? pinnedRowRef.current ?? keyboardRowRef.current;
    const next = normalizeAnimationName(ANIMATION_BY_ROW.get(rowKey));
    desiredAnimationRef.current = next;
    // Developer ignores a request for the clip it is already playing.
    developerHandleRef.current?.playAnimation?.(next);
  }, [clearIdleAnimationTimer]);

  // Leaving a row waits briefly, so moving straight onto the next row does not
  // flash idle in between (the next enter cancels this timer).
  const resolveAnimationSoon = useCallback(() => {
    clearIdleAnimationTimer();
    idleAnimationTimerRef.current = window.setTimeout(() => {
      idleAnimationTimerRef.current = null;
      resolveAnimation();
    }, IDLE_ANIMATION_DELAY_MS);
  }, [clearIdleAnimationTimer, resolveAnimation]);

  // Callback ref for the avatar's imperative handle: when it attaches (the model
  // and clips finished loading) it immediately gets the current selection.
  const attachDeveloper = useCallback((handle) => {
    developerHandleRef.current = handle;
    handle?.playAnimation?.(desiredAnimationRef.current);
  }, []);

  const handleRowPointerEnter = useCallback(
    (rowKey) => {
      hoveredRowRef.current = rowKey;
      resolveAnimation();
    },
    [resolveAnimation],
  );

  const handleRowPointerLeave = useCallback(
    (rowKey) => {
      if (hoveredRowRef.current === rowKey) hoveredRowRef.current = null;
      if (pinnedRowRef.current === rowKey) pinnedRowRef.current = null;
      resolveAnimationSoon();
    },
    [resolveAnimationSoon],
  );

  const handleRowSelect = useCallback(
    (rowKey) => {
      pinnedRowRef.current = rowKey;
      resolveAnimation();
    },
    [resolveAnimation],
  );

  const handleRowFocus = useCallback(
    (event, rowKey) => {
      // Mouse/touch focus is already covered by hover/click; only keyboard
      // focus (:focus-visible) keeps the clip after the pointer goes away.
      let isKeyboardFocus = false;
      try {
        isKeyboardFocus = event.currentTarget.matches(":focus-visible");
      } catch {
        isKeyboardFocus = false;
      }
      if (isKeyboardFocus) keyboardRowRef.current = rowKey;
      resolveAnimation();
    },
    [resolveAnimation],
  );

  const handleRowBlur = useCallback(
    (rowKey) => {
      if (keyboardRowRef.current === rowKey) keyboardRowRef.current = null;
      if (pinnedRowRef.current === rowKey) pinnedRowRef.current = null;
      resolveAnimationSoon();
    },
    [resolveAnimationSoon],
  );

  const handleItemKeyDown = useCallback(
    (event, rowKey) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleRowSelect(rowKey);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        hoveredRowRef.current = null;
        pinnedRowRef.current = null;
        keyboardRowRef.current = null;
        resolveAnimationSoon();
      }
    },
    [handleRowSelect, resolveAnimationSoon],
  );

  useEffect(() => {
    return () => {
      clearIdleAnimationTimer();
    };
  }, [clearIdleAnimationTimer]);

  const shouldUseScene = !isMobile && !disableHeavyVisuals;
  const shouldMountScene = shouldUseScene && hasEnteredView;
  const isSceneActive = shouldUseScene && isInView;

  // When the section scrolls out of view, drop hover/tap state that no longer
  // matches what is under the pointer (some browsers send no pointerleave until
  // the mouse moves), so the avatar is idle when the visitor comes back.
  useEffect(() => {
    if (isSceneActive) {
      return;
    }
    const stillHovered = sectionRef.current?.querySelector(
      '[role="button"]:hover',
    );
    if (!stillHovered) {
      hoveredRowRef.current = null;
      pinnedRowRef.current = null;
    }
    resolveAnimation();
  }, [isSceneActive, resolveAnimation]);

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
          {shouldUseScene && shouldMountScene && (
            <SceneBoundary
              name="WorkExperienceScene"
              fallback={
                <div className="work-canvas grid place-items-center text-slate-500 text-sm font-medium">
                  3D preview unavailable.
                </div>
              }
            >
              <WorkExperienceScene
                developerRef={attachDeveloper}
                isActive={isSceneActive}
              />
            </SceneBoundary>
          )}

          {shouldUseScene && !shouldMountScene && (
            <div className="work-canvas grid place-items-center text-slate-500 text-sm font-medium">
              3D preview loads on view.
            </div>
          )}

          <motion.div
            className={cn("work-content", !shouldUseScene && "lg:col-span-5")}
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className={cn(spacing.section.paddingY, spacing.card.padding)}>
              {workExperiences.map((item, index) => (
                <motion.div
                  key={rowKeyOf(item)}
                  onClick={() => handleRowSelect(rowKeyOf(item))}
                  onPointerEnter={() => handleRowPointerEnter(rowKeyOf(item))}
                  onPointerLeave={() => handleRowPointerLeave(rowKeyOf(item))}
                  onFocus={(event) => handleRowFocus(event, rowKeyOf(item))}
                  onBlur={() => handleRowBlur(rowKeyOf(item))}
                  onKeyDown={(event) =>
                    handleItemKeyDown(event, rowKeyOf(item))
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
                        {...WORK_ICON_IMAGE}
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

export default memo(WorkExperience);
