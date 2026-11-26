"use client";

import { useCallback, useEffect, useRef } from "react";
import { nav, profile } from "../content/site";
import Sound from "../components/Sound";

// Mobile menu is a native <details>: it opens/closes without JavaScript, its
// closed links are not focusable, and browsers expose its expanded state.
// JS only adds: close on selection, Escape to close (focus returns to the
// toggle), and close on outside click.
export default function Navbar() {
  const detailsRef = useRef(null);
  const summaryRef = useRef(null);

  const close = useCallback((returnFocus) => {
    const d = detailsRef.current;
    if (!d?.open) return;
    d.open = false;
    if (returnFocus) summaryRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && detailsRef.current?.open) {
        e.preventDefault();
        close(true);
      }
    };
    const onPointer = (e) => {
      if (detailsRef.current?.open && !detailsRef.current.contains(e.target)) close(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [close]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav aria-label="Primary" className="relative mx-auto flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/70 p-1.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <a
          href="#hero"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white"
          aria-label={`${profile.name} — back to top`}
        >
          <span className="font-site-default text-sm font-semibold tracking-wide" aria-hidden="true">
            VK
          </span>
        </a>

        <ul className="hidden items-center gap-0.5 px-1 sm:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block rounded-full px-4 py-2 text-[0.95rem] tracking-wide text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-full bg-white py-2 pl-4 pr-4 text-[0.9rem] font-medium text-slate-950 transition-colors hover:bg-neutral-200 sm:flex"
        >
          GitHub
          <span className="sr-only">(opens in a new tab)</span>
        </a>

        <Sound />

        <details ref={detailsRef} className="group sm:hidden">
          <summary
            ref={summaryRef}
            className="grid h-10 cursor-pointer list-none place-items-center rounded-full px-4 text-sm font-medium text-white/90 hover:bg-white/10 [&::-webkit-details-marker]:hidden"
            aria-label="Menu"
          >
            <span aria-hidden="true" className="group-open:hidden">
              Menu
            </span>
            <span aria-hidden="true" className="hidden group-open:inline">
              Close
            </span>
          </summary>
          <div className="absolute left-1/2 top-[calc(100%+0.75rem)] w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <ul className="flex flex-col">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => close(false)}
                    className="block rounded-xl px-4 py-3 text-base text-white/90 hover:bg-white/10"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 border-t border-white/10 pt-2">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => close(false)}
                  className="block rounded-xl bg-white px-4 py-3 text-base font-medium text-slate-950"
                >
                  GitHub <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </details>
      </nav>
    </header>
  );
}
