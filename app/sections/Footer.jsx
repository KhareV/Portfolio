"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";
import { cn, transitions } from "../styles/spacing.js";

const FOOTER_IMAGE = "/newimages/morningfoot.png";
const EASING_POWER = 3.2;
const PROGRESS_EPSILON = 0.002;
const MAX_PARALLAX_OFFSET = 40;
const REVEAL_RANGE_MULTIPLIER = 1.1;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const Footer = () => {
  const footerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    let rafId = null;

    const update = () => {
      const footerElement = footerRef.current;
      if (!footerElement) {
        ticking = false;
        return;
      }

      const viewportHeight = window.innerHeight || 1;
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const documentHeight = document.documentElement.scrollHeight;
      const remainingToBottom = Math.max(
        0,
        documentHeight - viewportHeight - scrollTop,
      );
      const revealRange = viewportHeight * REVEAL_RANGE_MULTIPLIER;

      const rawProgress = 1 - remainingToBottom / revealRange;
      const clampedProgress = clamp(rawProgress, 0, 1);
      const easedProgress = 1 - Math.pow(1 - clampedProgress, EASING_POWER);

      setProgress((currentProgress) =>
        Math.abs(currentProgress - easedProgress) > PROGRESS_EPSILON
          ? easedProgress
          : currentProgress,
      );
      ticking = false;
    };

    const requestUpdate = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (rafId != null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const parallaxY = (1 - progress) * MAX_PARALLAX_OFFSET;
  const overlayOpacity = clamp(0.6 - progress * 0.5, 0.08, 0.6);

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="fixed bottom-0 left-0 h-screen w-full overflow-hidden z-0"
    >
      <div
        className="relative h-full w-full will-change-transform"
        style={{ transform: `translateY(${parallaxY}px) scale(1.05)` }}
      >
        <NextImage
          src={FOOTER_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>

      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{
          opacity: overlayOpacity,
          transition: "opacity 0.15s linear",
        }}
      />

      <div className="absolute bottom-0 w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-12 pb-8 text-white gap-4">
        <div className="flex gap-4 mb-2 md:mb-0">
          <a
            href="https://github.com/KhareV"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("hover:scale-110", transitions.default)}
            aria-label="Visit GitHub profile"
          >
            <FaGithub className="h-6 w-6" />
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("hover:scale-110", transitions.default)}
            aria-label="Visit Twitter profile"
          >
            <FaTwitter className="h-6 w-6" />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("hover:scale-110", transitions.default)}
            aria-label="Visit Instagram profile"
          >
            <FaInstagram className="h-6 w-6" />
          </a>
        </div>

        <p className="text-sm text-gray-300 text-center md:text-left">
          © 2026 Vedant Khare. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
