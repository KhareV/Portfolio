"use client";

import { memo, useCallback, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "../styles/spacing.jsx";

const navItems = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const NOOP = () => {};

const NavItems = memo(function NavItems({ onClick = NOOP }) {
  return (
    <ul className="flex items-center gap-1">
      {navItems.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            className="relative block px-4 py-2 text-[0.95rem] text-white/70 font-site-default tracking-wide transition-all duration-300 rounded-full hover:text-white hover:bg-white/10 active:scale-95"
            onClick={onClick}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
});

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  return (
    <header className="fixed inset-x-0 top-5 z-50">
      <div className="mx-auto max-w-7xl px-4 relative">
        {/* MAIN NAVBAR PILL */}
        <div
          className={cn(
            "mx-auto flex w-fit items-center gap-2 p-1.5 transform-gpu [will-change:transform]",
            "rounded-full",
            "bg-slate-950/60 backdrop-blur-xl",
            "border border-white/10",
            "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]",
          )}
        >
          {/* LOGO */}
          <a
            href="#hero"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <span className="font-hero-script text-[0.95rem] tracking-wider">
              VK
            </span>
          </a>

          {/* DESKTOP NAV */}
          <nav className="hidden sm:flex px-1">
            <NavItems />
          </nav>

          {/* SEPARATOR (Desktop) */}
          <div className="hidden sm:block w-px h-5 bg-white/15 mx-1" />

          {/* DESKTOP CTA */}
          <a
            href="https://github.com/kharev"
            target="_blank"
            rel="noopener noreferrer"
            className="group hidden sm:flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-white text-slate-950 text-[0.9rem] font-medium transition-all duration-300 hover:bg-neutral-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            Github
            <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-950/10 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={14} />
            </span>
          </a>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="sm:hidden grid h-10 w-10 place-items-center rounded-full text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* MOBILE DROPDOWN */}
        <div
          className={cn(
            "sm:hidden absolute top-[calc(100%+1rem)] left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-[340px] transform-gpu overflow-hidden",
            "rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10",
            "shadow-[0_16px_40px_-10px_rgba(0,0,0,0.5)]",
            "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top",
            isOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-4 pointer-events-none",
          )}
        >
          <div className="flex flex-col p-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="block px-4 py-3 text-white/80 text-sm font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-[0.98]"
              >
                {item.label}
              </a>
            ))}

            <div className="my-2 h-px w-full bg-white/10" />

            <a
              href="https://github.com/kharev"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="group flex items-center justify-between px-4 py-3 rounded-xl bg-white text-slate-950 text-sm font-medium transition-all duration-200 hover:bg-neutral-200 active:scale-[0.98]"
            >
              Github
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Navbar);
