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
        <IconHome className="h-full w-full text-neutral-500 dark:text-yellow-400" />
      ),
      link: "#",
    },
    {
      label: "About",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-yellow-400" />
      ),
      link: "#about",
    },
    {
      label: "Work",
      icon: (
        <IconPalette className="h-full w-full text-neutral-500 dark:text-yellow-400" />
      ),
      link: "#work",
    },
    {
      label: "Contact",
      icon: (
        <IconPhone className="h-full w-full text-neutral-500 dark:text-yellow-400" />
      ),
      link: "#contact",
    },
    {
      label: "LinkedIn",
      icon: (
        <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-yellow-400" />
      ),
      link: "https://linkedin.com/in/vedant-khare-6b31ba250",
    },
    {
      label: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-yellow-400" />
      ),
      link: "https://github.com/KhareV",
    },
  ];

  return (
    <div className="w-auto">
      <FloatingDock
        navigationItems={navigationItems}
        desktopClassName="backdrop-blur-md bg-opacity-80 border border-yellow-500/20 shadow-xl"
        mobileClassName="backdrop-blur-md"
      />
    </div>
  );
};

export default FloatingNavigation;
