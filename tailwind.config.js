/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        generalsans: ["General Sans", "sans-serif"],
      },
      colors: {
        black: {
          100: "#010103",
          200: "#0E0E10",
          300: "#1C1C21",
          500: "#3A3A49",
          600: "#1A1A1A",
          DEFAULT: "#000",
        },
        white: {
          500: "#62646C",
          600: "#AFB0B6",
          700: "#D6D9E9",
          800: "#E4E4E6",
          DEFAULT: "#FFFFFF",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        tertiary: "#151030",
        "black-100": "#100d25",
        "black-200": "#090325",
        "white-100": "#f3f3f3",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      backgroundImage: {
        terminal: "url('/assets/terminal.png')",
        "hero-pattern": "url('/img/hero-pattern.svg')",
        "footer-texture": "url('/img/footer-texture.png')",
      },
      boxShadow: {
        card: "0px 35px 120px -15px #211e35",
        "glass-inset": "inset 0 17px 5px -9px rgba(254,254,91, 0.05)",
        "glass-sm": "5px 5px 20px 0px rgba(254,254,91, 0.3)",
        dock: "0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 10px rgba(255, 208, 0, 0.15)",
      },
      screens: {
        xs: "450px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      animation: {
        marquee: "marquee 25s linear infinite",
        marquee2: "marquee2 25s linear infinite",
        "marquee-reverse": "marquee-reverse 25s linear infinite",
        "marquee2-reverse": "marquee2-reverse 25s linear infinite",
        "profile-scroll-1": "profileScrollLeft 25s linear infinite",
        "profile-scroll-2": "profileScrollRight 25s linear infinite",
        "spin-slow": "spin 40s linear infinite",
        "spin-slow-reverse": "spin-reverse 40s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
        marquee2: {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(0%)",
          },
        },
        "marquee-reverse": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(0%)",
          },
        },
        "marquee2-reverse": {
          "0%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        profileScrollLeft: {
          "0%": {
            transform: "translateX(0%)",
          },
          "100%": {
            transform: "translateX(-100%)",
          },
        },
        profileScrollRight: {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(0%)",
          },
        },
        "spin-reverse": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(-360deg)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
    function ({ addComponents }) {
      addComponents({
        ".profile-container": {
          transition: "all 0.3s ease-in-out",
          padding: "1.5rem",
        },
        ".profile-transform": {
          transform: "scale(1.02)",
        },
        ".profile-heading": {
          fontSize: "1.875rem",
          lineHeight: "2.25rem",
          fontWeight: "700",
          color: "#ffffff",
          marginBottom: "1rem",
        },
        ".profile-description": {
          fontSize: "1rem",
          lineHeight: "1.5rem",
          color: "#d1d5db",
          marginBottom: "1rem",
        },
      });
    },
  ],
};
