import { useState, useEffect } from "react";
import { navLinks } from "../constants/index.js";

const NavItems = ({ onClick = () => {} }) => (
  <ul className="nav-ul">
    {navLinks.map((item) => (
      <li key={item.id} className="nav-li">
        <a href={item.href} className="nav-li_a" onClick={onClick}>
          {item.name}
        </a>
      </li>
    ))}
  </ul>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayText, setDisplayText] = useState("V");

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const text = "Vedant Khare";
    let index = 1; // Start at 1 since we want to keep 'V'
    let isDeleting = false;
    let pauseCounter = 0;
    const pauseDuration = 10;

    const type = () => {
      if (!isDeleting && index < text.length) {
        // Typing forward
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else if (!isDeleting && index >= text.length) {
        // At the end of the text, wait before deleting
        if (pauseCounter < pauseDuration) {
          pauseCounter++;
        } else {
          isDeleting = true;
          pauseCounter = 0;
        }
      } else if (isDeleting && index > 2) {
        // Change from 1 to 2 to stop at 'V'
        // Backspacing
        index--;
        setDisplayText(text.slice(0, index));
      } else if (isDeleting && index <= 2) {
        // Add this condition
        // When we reach 'V', start typing again
        isDeleting = false;
        index = 1; // Keep at 1 to maintain 'V'
      }
    };

    const typingInterval = setInterval(type, 200);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-5 mx-auto c-space">
          <a
            href="/"
            className="text-neutral-400 font-bold text-xl hover:text-white transition-colors typing-text"
          >
            {displayText}
          </a>

          <button
            onClick={toggleMenu}
            className="text-neutral-400 hover:text-white focus:outline-none sm:hidden flex"
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
        <nav className="p-5">
          <NavItems onClick={closeMenu} />
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
