"use client";

import React from "react";
import { FloatingDock } from "./FloatingDock";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconHome,
  IconUser,
  IconPalette,
  IconPhone,
} from "@tabler/icons-react";

const FloatingNavigation = () => {
  const navigationItems = [
    {
      label: "Home",
      icon: (
        <IconHome className="h-full w-full text-slate-300 transition-colors duration-200 group-hover:text-yellow-300" />
      ),
      link: "#",
    },
    {
      label: "About",
      icon: (
        <IconUser className="h-full w-full text-slate-300 transition-colors duration-200 group-hover:text-yellow-300" />
      ),
      link: "#about",
    },
    {
      label: "Work",
      icon: (
        <IconPalette className="h-full w-full text-slate-300 transition-colors duration-200 group-hover:text-yellow-300" />
      ),
      link: "#work",
    },
    {
      label: "Contact",
      icon: (
        <IconPhone className="h-full w-full text-slate-300 transition-colors duration-200 group-hover:text-yellow-300" />
      ),
      link: "#contact",
    },
    {
      label: "LinkedIn",
      icon: (
        <IconBrandLinkedin className="h-full w-full text-slate-300 transition-colors duration-200 group-hover:text-yellow-300" />
      ),
      link: "https://linkedin.com/in/vedant-khare-6b31ba250",
    },
    {
      label: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-slate-300 transition-colors duration-200 group-hover:text-yellow-300" />
      ),
      link: "https://github.com/KhareV",
    },
  ];

  return (
    <div className="w-auto">
      <FloatingDock
        navigationItems={navigationItems}
        desktopClassName="bg-slate-950/70 border border-violet-400/25 shadow-[0_12px_40px_rgba(99,102,241,0.25)] backdrop-blur-xl"
        mobileClassName="bg-slate-950/75 border border-violet-400/30 backdrop-blur-xl"
      />
    </div>
  );
};

export default FloatingNavigation;
