import { useState } from "react";
import { navLinks } from "../constants/index.js";
import {
  spacing,
  layout,
  responsive,
  transitions,
  cn,
} from "../styles/spacing.js";

const NavItems = ({ onClick = () => {} }) => (
  <ul className="nav-ul">
    {navLinks.map((item) => (
      <li key={item.id} className="nav-li button">
        <a href={item.href} className="nav-li_a" onClick={onClick}>
          {item.name}
        </a>
      </li>
    ))}
  </ul>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md">
      <div className={cn(layout.maxWidth["7xl"], layout.centered.x, "pr-12")}>
        <div
          className={cn(
            layout.flex.between,
            spacing.container.paddingY,
            "c-space"
          )}
        >
          <a
            href="/"
            className={cn(
              "font-bold text-white hover:text-yellow-500",
              responsive.text.lg,
              transitions.default
            )}
          >
            Vedant Khare
          </a>

          <button
            onClick={toggleMenu}
            className={cn(
              "text-neutral-400 hover:text-white focus:outline-none sm:hidden",
              layout.flex.center
            )}
            aria-label="Toggle menu"
          >
            <img
              src={isOpen ? "assets/close.svg" : "assets/menu.svg"}
              alt="toggle"
              className="w-6 h-6"
            />
          </button>

          <nav className="sm:flex hidden">
            <NavItems />
          </nav>
        </div>
      </div>

      <div className={`nav-sidebar ${isOpen ? "max-h-screen" : "max-h-0"}`}>
        <nav className={spacing.card.padding}>
          <NavItems onClick={closeMenu} />
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
