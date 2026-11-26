// Explicit time-zone strategy: every day-phase and clock value is computed for
// Asia/Kolkata (IST), never the visitor's local zone and never at build time.
// The server HTML carries no time-dependent markup; a tiny inline script sets
// <html data-phase> before first paint and CSS selects the matching art.

export const TIME_ZONE = "Asia/Kolkata";
export const PHASES = ["morning", "afternoon", "evening", "night"];
export const DEFAULT_PHASE = "afternoon"; // used when JS is unavailable

export function istHour(date = new Date()) {
  const h = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "2-digit", hourCycle: "h23" }).format(date),
  );
  return h === 24 ? 0 : h; // some engines report midnight as 24 with h23/h24 quirks
}

// 05:00–11:59 morning · 12:00–16:59 afternoon · 17:00–20:59 evening · else night
export function phaseForHour(hour) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export const phaseAt = (date = new Date()) => phaseForHour(istHour(date));

export function istClock(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h12",
  }).format(date);
}

// Runs in <head> before the body parses. Must stay dependency-free and tiny.
// Sets: html.js (JS available), html[data-phase], and preloads the matching
// hero plate so the LCP image is requested at high priority immediately.
export const PHASE_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;d.classList.add('js');var h=Number(new Intl.DateTimeFormat('en-US',{timeZone:'${TIME_ZONE}',hour:'2-digit',hourCycle:'h23'}).format(new Date()));if(h===24)h=0;var p=h>=5&&h<12?'morning':h>=12&&h<17?'afternoon':h>=17&&h<21?'evening':'night';d.setAttribute('data-phase',p);var w=window.matchMedia('(max-width: 600px)').matches?720:1200;var l=document.createElement('link');l.rel='preload';l.as='image';l.type='image/avif';l.href='/media/hero/'+p+'-'+w+'.avif';l.setAttribute('fetchpriority','high');document.head.appendChild(l);}catch(e){}})();`;
