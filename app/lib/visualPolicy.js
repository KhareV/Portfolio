// One capability policy for every visitor and every tool. No user-agent or
// automation sniffing: the same inputs produce the same tier for a person and
// for Lighthouse/Playwright.
//
// Tiers
//   "static" – no WebGL, reduced motion, or Save-Data: posters + still art only.
//   "lite"   – touch/small screens, low memory/cores, slow network, or a
//              software rasteriser: posters, CSS motion, no WebGL scenes.
//   "full"   – hardware-accelerated WebGL on a fine pointer: 3D enhancements,
//              still mounted only near the viewport and paused when hidden.
//
// A visitor can force a tier with ?visuals=static|lite|full (kept for support
// and for reproducible testing; it does not change what is measured by default).

export function decideTier(input) {
  const {
    override,
    webgl, // { available: boolean, software: boolean }
    reducedMotion,
    saveData,
    effectiveType,
    deviceMemory,
    hardwareConcurrency,
    coarsePointer,
    viewportWidth,
  } = input;

  if (override === "static" || override === "lite" || override === "full") {
    if (override === "full" && !webgl?.available) return "static";
    return override;
  }
  if (!webgl?.available) return "static";
  if (reducedMotion) return "static";
  if (saveData) return "static";
  if (/(^|\b)(slow-2g|2g|3g)\b/.test(effectiveType || "")) return "lite";
  if (webgl.software) return "lite";
  if (coarsePointer || viewportWidth < 900) return "lite";
  if ((deviceMemory ?? 8) <= 4 || (hardwareConcurrency ?? 8) <= 4) return "lite";
  return "full";
}

let cachedWebgl = null;
export function probeWebgl() {
  if (cachedWebgl) return cachedWebgl;
  if (typeof document === "undefined") return { available: false, software: false };
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    if (!gl) {
      cachedWebgl = { available: false, software: false, renderer: "" };
      return cachedWebgl;
    }
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || "");
    const software = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    cachedWebgl = { available: true, software, renderer };
  } catch {
    cachedWebgl = { available: false, software: false, renderer: "" };
  }
  return cachedWebgl;
}

export function readTierInput() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let override = null;
  try {
    override = new URLSearchParams(window.location.search).get("visuals");
  } catch {}
  return {
    override,
    webgl: probeWebgl(),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: Boolean(conn?.saveData),
    effectiveType: conn?.effectiveType || "",
    deviceMemory: navigator.deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    viewportWidth: window.innerWidth,
  };
}
