"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { cn } from "../styles/spacing.jsx";

const APP_TIMEZONE = "Asia/Kolkata";

const BAND_COLORS = {
  morning: ["#0f3342", "#4e7f8c", "#8ea8a5", "#b9beb3", "#d6d7cf", "#b6beb8"],
  afternoon: ["#1d3f5b", "#4d748f", "#86a4b3", "#bcc4c2", "#dcded7", "#c4ccc8"],
  evening: ["#0f2b45", "#2a4b67", "#5f7386", "#98a1a5", "#c7c8c1", "#d9d9d3"],
  night: ["#08172c", "#20324b", "#4f5e6f", "#818890", "#b6b9b5", "#d0d1cd"],
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

const buildBandGradient = (colors) => {
  const bandCount = 10;
  const step = 100 / bandCount;
  const stops = [];

  for (let i = 0; i < bandCount; i += 1) {
    const color = colors[i % colors.length];
    const from = (i * step).toFixed(3);
    const to = ((i + 1) * step).toFixed(3);
    stops.push(`${color} ${from}%`, `${color} ${to}%`);
  }

  return `linear-gradient(to bottom, ${stops.join(", ")})`;
};

const TimeBands = ({ className = "" }) => {
  const [dayPhase, setDayPhase] = useState(() => getDayPhase(getLocalHour()));

  useEffect(() => {
    let timerId;

    const syncPhase = () => {
      const hour = getLocalHour();
      const nextPhase = getDayPhase(hour);

      setDayPhase((prev) => (prev === nextPhase ? prev : nextPhase));

      const msUntilNextMinute = 60000 - (Date.now() % 60000) + 20;
      timerId = window.setTimeout(syncPhase, msUntilNextMinute);
    };

    syncPhase();

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

  const gradient = useMemo(() => {
    const colors = BAND_COLORS[dayPhase] ?? BAND_COLORS.afternoon;
    return buildBandGradient(colors);
  }, [dayPhase]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative w-full h-[48px] sm:h-[54px] overflow-hidden border-y border-[#d8dad5]/35",
        className,
      )}
    >
      <div className="absolute inset-0" style={{ backgroundImage: gradient }} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1732]/30 via-transparent to-[#0b1732]/22" />
    </div>
  );
};

export default memo(TimeBands);
