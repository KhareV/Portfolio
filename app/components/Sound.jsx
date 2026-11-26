"use client";

import { useEffect, useRef, useState } from "react";

const TRACK = "/y2mate.com - Lil Peep  XXXTENTACION  Falling Down (1).mp3";

// Optional music, started only by an explicit press (no delayed prompt, no
// autoplay). The file is not requested until then. Play rejection is reported
// and the control returns to its off state.
export default function Sound() {
  const audioRef = useRef(null);
  const [state, setState] = useState("off"); // off | loading | on | blocked

  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = async () => {
    if (!audioRef.current) {
      const a = new Audio();
      a.loop = true;
      a.preload = "none";
      a.src = encodeURI(TRACK);
      a.addEventListener("pause", () => setState((s) => (s === "on" ? "off" : s)));
      audioRef.current = a;
    }
    const audio = audioRef.current;
    if (state === "on") {
      audio.pause();
      setState("off");
      return;
    }
    setState("loading");
    try {
      await audio.play();
      setState("on");
    } catch {
      setState("blocked");
    }
  };

  const label =
    state === "on" ? "Pause music" : state === "loading" ? "Starting music…" : state === "blocked" ? "Music was blocked — press to retry" : "Play music";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={state === "on"}
      aria-label="Background music"
      aria-describedby="music-status"
      title={label}
      className="js-only grid h-10 w-10 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white"
    >
      <span aria-hidden="true" className="text-base leading-none">
        {state === "on" ? "❚❚" : state === "blocked" ? "!" : "♪"}
      </span>
      <span id="music-status" role="status" className="sr-only">
        {state === "blocked" ? "Your browser blocked playback. Press again to retry." : state === "on" ? "Music playing." : ""}
      </span>
    </button>
  );
}
