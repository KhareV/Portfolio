// NavButton.jsx
import {
  Github,
  Home,
  Linkedin,
  NotebookText,
  Palette,
  Phone,
  Twitter,
  User,
} from "lucide-react";
import React from "react";
import ResponsiveComponent from "../ResponsiveComponent";
import clsx from "clsx";
import { motion } from "framer-motion";

const getIcon = (icon) => {
  switch (icon) {
    case "Home":
      return <Home className="w-full h-auto" strokeWidth={1.5} />;
    case "About":
      return <User className="w-full h-auto" strokeWidth={1.5} />;
    case "Work":
      return <Palette className="w-full h-auto" strokeWidth={1.5} />;
    case "Contact":
      return <Phone className="w-full h-auto" strokeWidth={1.5} />;
    default:
      return <Home className="w-full h-auto" strokeWidth={1.5} />;
  }
};

const item = {
  hidden: { scale: 0 },
  show: { scale: 1 },
};

const NavButton = ({ x, y, name, href, icon, labelDirection = "right" }) => {
  return (
    <ResponsiveComponent>
      {({ size }) => {
        return size && size >= 480 ? (
          <div
            className="absolute cursor-pointer z-50"
            style={{ transform: `translate(${x}, ${y})` }}
          >
            <motion.a
              variants={item}
              href={href}
              className="text-foreground rounded-full flex items-center justify-center custom-bg"
              aria-name={name}
              name={name}
              prefetch="false"
              scroll="false"
            >
              {/* Rotate only the icon inside */}
              <span
                className="relative w-14 h-14 p-4 animate-spin-slow group-hover:pause hover:text-accent"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                {getIcon(icon)}
                <span className="peer bg-transparent absolute top-0 left-0 w-full h-full" />
                <span className="absolute hidden peer-hover:block px-2 py-1 left-full mx-2 top-1/2 -translate-y-1/2 bg-background text-foreground text-sm rounded-md shadow-lg whitespace-nowrap">
                  {name}
                </span>
              </span>
            </motion.a>
          </div>
        ) : (
          <div className="w-fit cursor-pointer z-50">
            <motion.a
              variants={item}
              href={href}
              className="text-foreground rounded-full flex items-center justify-center custom-bg"
              aria-name={name}
              name={name}
              prefetch="false"
              scroll="false"
            >
              <span
                className="relative w-10 h-10 xs:w-14 xs:h-14 p-2.5 xs:p-4 hover:text-accent"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                {getIcon(icon)}
                <span className="peer bg-transparent absolute top-0 left-0 w-full h-full" />
                <span
                  className={clsx(
                    "absolute hidden peer-hover:block px-2 py-1 left-full mx-2 top-1/2 -translate-y-1/2 bg-background text-foreground text-sm rounded-md shadow-lg whitespace-nowrap",
                    labelDirection === "left" ? "right-full left-auto" : ""
                  )}
                >
                  {name}
                </span>
              </span>
            </motion.a>
          </div>
        );
      }}
    </ResponsiveComponent>
  );
};

export default NavButton;
