// Centralized spacing system for consistent layout across the application
// Use these utilities instead of hard-coded Tailwind spacing classes

export const spacing = {
  // Container padding - responsive padding for main containers
  container: {
    padding: "px-4 sm:px-6 lg:px-8",
    paddingX: "px-4 sm:px-6 lg:px-8",
    paddingY: "py-4 sm:py-6 lg:py-8",
  },

  // Section spacing - for main sections
  section: {
    padding: "p-6 sm:p-8 lg:p-12",
    paddingX: "px-6 sm:px-8 lg:px-12",
    paddingY: "py-12 sm:py-16 lg:py-24",
    margin: "m-6 sm:m-8 lg:m-12",
    marginY: "my-12 sm:my-16 lg:my-24",
    marginTop: "mt-12 sm:mt-16 lg:mt-24",
    marginBottom: "mb-12 sm:mb-16 lg:mb-24",
  },

  // Card/Component spacing
  card: {
    padding: "p-4 sm:p-5 lg:p-6",
    gap: "gap-3 sm:gap-4 lg:gap-5",
  },

  // Text spacing
  text: {
    marginTop: "mt-2 sm:mt-3 lg:mt-4",
    marginBottom: "mb-2 sm:mb-3 lg:mb-4",
    gap: "gap-1.5 sm:gap-2",
    paddingX: "px-2 sm:px-4",
  },

  // Button/Interactive elements
  interactive: {
    padding: "px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3",
    gap: "gap-2 sm:gap-3",
  },

  // Form elements
  form: {
    padding: "px-3 py-2 sm:px-4 sm:py-2.5",
    gap: "gap-3 sm:gap-4",
    marginY: "my-3 sm:my-4",
  },

  // Grid/Flexbox gaps
  grid: {
    gap: "gap-4 sm:gap-5 lg:gap-6",
    gapSmall: "gap-2 sm:gap-3 lg:gap-4",
    gapLarge: "gap-6 sm:gap-8 lg:gap-10",
    gapLg: "gap-6 sm:gap-8 md:gap-12",
  },

  // Chat/Modal specific
  chat: {
    padding: "p-3 sm:p-4",
    message: "px-4 py-3",
    gap: "gap-3 sm:gap-4",
  },
};

// Layout utilities
export const layout = {
  // Max widths
  maxWidth: {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
    screen: "max-w-screen-2xl",
  },

  // Container with centered content
  centered: {
    x: "mx-auto",
    y: "my-auto",
    both: "m-auto",
  },

  // Flex utilities
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-start justify-start",
    end: "flex items-end justify-end",
    col: "flex flex-col",
    colCenter: "flex flex-col items-center justify-center",
    row: "flex flex-row",
    wrap: "flex flex-wrap",
  },

  // Grid utilities
  grid: {
    cols1: "grid grid-cols-1",
    cols2: "grid grid-cols-1 sm:grid-cols-2",
    cols3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    cols4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    auto: "grid grid-cols-[auto_1fr]",
  },
};

// Responsive utilities
export const responsive = {
  // Hide/show on different screens
  hideOnMobile: "hidden sm:block",
  hideOnDesktop: "block sm:hidden",
  showOnMobile: "block sm:hidden",
  showOnDesktop: "hidden sm:block",

  // Text sizes
  text: {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl lg:text-2xl",
    xl: "text-xl sm:text-2xl lg:text-3xl",
    "2xl": "text-2xl sm:text-3xl lg:text-4xl",
    "3xl": "text-3xl sm:text-4xl lg:text-5xl",
    "4xl": "text-4xl sm:text-5xl lg:text-6xl xl:text-7xl",
  },
};

// Animation/transition classes
export const transitions = {
  default: "transition-all duration-300 ease-in-out",
  fast: "transition-all duration-150 ease-in-out",
  slow: "transition-all duration-500 ease-in-out",
  hover: "hover:duration-300",
};

// Border utilities
export const borders = {
  default: "border border-gray-800",
  accent: "border border-accent/30",
  rounded: {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  },
};

// Helper function to combine classes
export const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export default {
  spacing,
  layout,
  responsive,
  transitions,
  borders,
  cn,
};
