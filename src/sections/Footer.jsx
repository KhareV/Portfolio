const Footer = () => {
  return (
    <footer className="mt-10 c-space pt-8 pb-5 border-t border-gray-500 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6 md:gap-8 bg-gray-900">
      <div className="text-white-500 flex gap-4">
        <p className="hover:text-white transition-colors cursor-pointer">
          Terms & Conditions
        </p>
        <p>|</p>
        <p className="hover:text-white transition-colors cursor-pointer">
          Privacy Policy
        </p>
      </div>

      <div className="flex gap-5">
        <a
          href="https://github.com/KhareV"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon hover:scale-110 transition-transform"
        >
          <img src="/assets/github.svg" alt="GitHub" className="w-6 h-6" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon hover:scale-110 transition-transform"
        >
          <img src="/assets/twitter.svg" alt="Twitter" className="w-6 h-6" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon hover:scale-110 transition-transform"
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
