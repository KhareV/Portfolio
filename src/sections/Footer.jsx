import { spacing, layout, transitions, cn } from "../styles/spacing.js";

const Footer = () => {
  return (
    <footer
      className={cn(
        spacing.section.marginTop,
        "c-space border-t border-gray-500 bg-gray-900",
        spacing.section.paddingY,
        layout.flex.col,
        "md:flex-row justify-between items-center text-center md:text-left",
        spacing.card.gap
      )}
      id="footer"
    >
      <div className={cn("text-white-500", layout.flex.row, spacing.card.gap)}>
        <a
          href="https://github.com/KhareV"
          target="_blank"
          rel="noopener noreferrer"
          className={cn("social-icon hover:scale-110", transitions.default)}
        >
          <img src="/assets/github.svg" alt="GitHub" className="w-6 h-6" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className={cn("social-icon hover:scale-110", transitions.default)}
        >
          <img src="/assets/twitter.svg" alt="Twitter" className="w-6 h-6" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className={cn("social-icon hover:scale-110", transitions.default)}
        >
          <img
            src="/assets/instagram.svg"
            alt="Instagram"
            className="w-6 h-6"
          />
        </a>
      </div>

      <p className="text-white-500 mt-4 md:mt-0">
        © 2024 Vedant Khare. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
