"use client";

import { memo, useCallback, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "../styles/spacing.js";

const navItems = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const NOOP = () => {};

const NavItems = memo(function NavItems({ onClick = NOOP }) {
  return (
    <ul className="flex items-center gap-6">
      {navItems.map((item) => (
        <li key={item.label}>
          <a
            href={item.href}
            className="text-white/85 text-[1.02rem] font-site-default tracking-wide transition-all duration-200 hover:text-white"
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
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <header className="fixed inset-x-0 top-5 z-50">
      <div className="mx-auto max-w-7xl px-4">
        {/* MAIN NAVBAR */}
        <div
          className={cn(
            "mx-auto flex w-fit items-center gap-3 px-3 py-2 transform-gpu [will-change:transform]",
            "rounded-full overflow-hidden",
            "bg-slate-950/70 backdrop-blur-sm",
            "border border-white/25",
            "shadow-[0_16px_34px_rgba(2,6,23,0.45)]",
          )}
        >
          {/* LOGO */}
          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/15 border border-white/25 text-white">
            <span className="font-hero-script text-[0.95rem] tracking-wider">
              VK
            </span>
          </div>

          {/* MOBILE LOGO */}
          <div className="sm:hidden h-9 w-9 grid place-items-center rounded-full bg-white/15 border border-white/25 text-white">
            <span className="font-hero-script text-[0.9rem] tracking-wider">
              VK
            </span>
          </div>

          {/* MENU BUTTON */}
          <button
            onClick={toggleMenu}
            className="sm:hidden h-9 w-9 grid place-items-center rounded-full bg-white/15 border border-white/25 text-white"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* DESKTOP NAV */}
          <nav className="hidden sm:flex px-2">
            <NavItems />
          </nav>

          {/* CTA */}
          <a
            href="https://github.com/kharev"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-white/80 text-slate-900 text-[0.95rem] hover:bg-slate-100 transition-all duration-200"
          >
            Github
            <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-900/10 border border-slate-300/90">
              <ArrowRight size={12} />
            </span>
          </a>
        </div>

        {/* MOBILE DROPDOWN */}
        <div
          className={cn(
            "sm:hidden mt-3 mx-auto max-w-[340px] p-4 space-y-4 transform-gpu [will-change:transform]",
            "rounded-2xl bg-slate-950/90 backdrop-blur-sm border border-white/20",
            "shadow-[0_16px_36px_rgba(2,6,23,0.5)]",
            isOpen ? "block" : "hidden",
          )}
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={closeMenu}
              className="block text-white/85 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}

          <a
            href="https://github.com/kharev"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="flex items-center justify-between px-4 py-2 rounded-full bg-white border border-white/80 text-slate-900"
          >
            Github
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </header>
  );
};

export default memo(Navbar);
