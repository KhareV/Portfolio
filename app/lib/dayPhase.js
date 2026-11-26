// Single day-phase policy shared by Hero, TimeBands and Footer
// (unchanged semantics: Asia/Kolkata, 05–12 morning, 12–17 afternoon,
// 17–21 evening, otherwise night).
export const APP_TIMEZONE = "Asia/Kolkata";

export const getLocalHour = (date = new Date()) =>
  Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: APP_TIMEZONE,
      hour: "2-digit",
      hour12: false,
    }).format(date),
  );

export const getDayPhase = (hour) => {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

export const getCurrentDayPhase = () => getDayPhase(getLocalHour());

export const getLocalClock = (date = new Date()) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
