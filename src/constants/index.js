export const navLinks = [
  {
    id: 1,
    name: "Home",
    href: "",
    icon: "Home",
  },
  {
    id: 2,
    name: "About",
    href: "#about",
    icon: "About",
  },
  {
    id: 3,
    name: "Work",
    href: "#work",
    icon: "Work",
  },
  {
    id: 4,
    name: "Contact",
    href: "#contact",
    icon: "Contact",
  },
];

export const myProjects = [
  {
    title: "PropertyDhundo-Your Own Broker",
    desc: "Property platform connecting buyers and sellers directly, eliminating traditional brokers with tools for informed decisions.",
    href: "https://github.com/KhareV/Property-Dhundo-Property-Buying-and-Selling",
    texture: "/textures/project/project1.mp4",
    logo: "/image/logo.png",
    logoStyle: {
      backgroundColor: "#2A1816",
      border: "0.2px solid #36201D",
      boxShadow: "0px 0px 60px 0px #AA3C304D",
    },
    spotlight: "/assets/spotlight1.png",
    tags: [
      {
        id: 1,
        name: "React.js",
        path: "/assets/react.svg",
      },
      {
        id: 2,
        name: "TailwindCSS",
        path: "assets/tailwindcss.png",
      },
      {
        id: 3,
        name: "NextJS",
        path: "/assets/next.webp",
      },
      {
        id: 4,
        name: "MongoDB",
        path: "/textures/project/mongodb.png",
      },
    ],
  },
  {
    title: "MedWe - Your One-Stop Pharmacy",
    desc: "All-in-one pharmacy solution offering medications, health products, and expert healthcare advice.",
    href: "https://github.com/KhareV/SIH-MedWE-Pharmacy-Website",
    texture: "/textures/project/project2.mp4",
    logo: "/image/logo2.png",
    logoStyle: {
      backgroundColor: "#13202F",
      border: "0.2px solid #17293E",
      boxShadow: "0px 0px 60px 0px #2F6DB54D",
    },
    spotlight: "/assets/spotlight2.png",
    tags: [
      {
        id: 1,
        name: "React.js",
        path: "/assets/react.svg",
      },
      {
        id: 2,
        name: "TailwindCSS",
        path: "assets/tailwindcss.png",
      },
      {
        id: 3,
        name: "NextJS",
        path: "/assets/next.webp",
      },
      {
        id: 4,
        name: "MongoDB",
        path: "/textures/project/mongodb.png",
      },
    ],
  },
  {
    title: "ChatApp",
    desc: "Real-time messaging platform with instant messaging and group chat functionality.",
    href: "https://github.com/KhareV/ChatApp",
    texture: "/textures/project/project3.mp4",
    logo: "/assets/project-logo3.png",
    logoStyle: {
      backgroundColor: "#60f5a1",
      background:
        "linear-gradient(0deg, #60F5A150, #60F5A150), linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(208, 213, 221, 0.8) 100%)",
      border: "0.2px solid rgba(208, 213, 221, 1)",
      boxShadow: "0px 0px 60px 0px rgba(35, 131, 96, 0.3)",
    },
    spotlight: "/assets/spotlight3.png",
    tags: [
      {
        id: 1,
        name: "React.js",
        path: "/assets/react.svg",
      },
      {
        id: 2,
        name: "TailwindCSS",
        path: "assets/tailwindcss.png",
      },
      {
        id: 3,
        name: "GraphQL",
        path: "/assets/graphql.png",
      },
    ],
  },
  {
    title: "Pixabay Gallery",
    desc: "Image gallery platform showcasing high-quality, royalty-free content from Pixabay.",
    href: "https://github.com/KhareV/Pixabay-Gallery",
    texture: "/textures/project/project4.mp4",
    logo: "/assets/project-logo4.png",
    logoStyle: {
      backgroundColor: "#0E1F38",
      border: "0.2px solid #0E2D58",
      boxShadow: "0px 0px 60px 0px #2F67B64D",
    },
    spotlight: "/assets/spotlight4.png",
    tags: [
      {
        id: 1,
        name: "React.js",
        path: "/assets/react.svg",
      },
      {
        id: 2,
        name: "TailwindCSS",
        path: "assets/tailwindcss.png",
      },
      {
        id: 3,
        name: "ExpressJS",
        path: "/assets/express.png",
      },
    ],
  },
  {
    title: "Imaginify - AI Photo Manipulation App",
    desc: "AI-powered SaaS application for photo editing with credits-based system and payment integration.",
    href: "https://github.com/KhareV/Nodejs-OpenAI-Image-Generator",
    texture: "/textures/project/project5.mp4",
    logo: "/assets/project-logo5.png",
    logoStyle: {
      backgroundColor: "#1C1A43",
      border: "0.2px solid #252262",
      boxShadow: "0px 0px 60px 0px #635BFF4D",
    },
    spotlight: "/assets/spotlight5.png",
    tags: [
      {
        id: 1,
        name: "React.js",
        path: "/assets/react.svg",
      },
      {
        id: 2,
        name: "TailwindCSS",
        path: "assets/tailwindcss.png",
      },
      {
        id: 3,
        name: "Nodejs",
        path: "/assets/nodejs.png",
      },
      {
        id: 4,
        name: "OpenAI",
        path: "/assets/openai.png",
      },
    ],
  },
];

export const calculateSizes = (isSmall, isMobile, isTablet) => {
  return {
    deskScale: isSmall ? 0.04 : isMobile ? 0.05 : isTablet ? 0.06 : 0.065,
    deskPosition: isSmall
      ? [0.5, -4, 0]
      : isMobile
      ? [0.5, -4.5, 0]
      : isTablet
      ? [0.3, -5, 0]
      : [0.25, -5.5, 0],
    cubePosition: isSmall
      ? [3, -4.5, 0]
      : isMobile
      ? [4, -5, 0]
      : isTablet
      ? [5, -5, 0]
      : [9, -5.5, 0],
    reactLogoPosition: isSmall
      ? [2.5, 3.5, 0]
      : isMobile
      ? [3, 4, 0]
      : isTablet
      ? [5, 4, 0]
      : [12, 3, 0],
    ringPosition: isSmall
      ? [-4, 6, 0]
      : isMobile
      ? [-5, 7, 0]
      : isTablet
      ? [-10, 10, 0]
      : [-24, 10, 0],
    targetPosition: isSmall
      ? [-4, -8, -8]
      : isMobile
      ? [-5, -10, -10]
      : isTablet
      ? [-9, -7, -10]
      : [-13, -13, -10],
  };
};

export const workExperiences = [
  {
    id: 1,
    name: "Framer",
    pos: "Lead Web Developer",
    duration: "2022 - Present",
    title:
      "Framer serves as my go-to tool for creating interactive prototypes. I use it to bring designs to  life, allowing stakeholders to experience the user flow and interactions before development.",
    icon: "/assets/framer.svg",
    animation: "victory",
  },
  {
    id: 2,
    name: "Figma",
    pos: "Web Developer",
    duration: "2020 - 2022",
    title:
      "Figma is my collaborative design platform of choice. I utilize it to work seamlessly with team members and clients, facilitating real-time feedback and design iterations. Its cloud-based.",
    icon: "/assets/figma.svg",
    animation: "clapping",
  },
  {
    id: 3,
    name: "Notion",
    pos: "Junior Web Developer",
    duration: "2019 - 2020",
    title:
      "Notion helps me keep my projects organized. I use it for project management, task tracking, and as a central hub for documentation, ensuring that everything from design notes to.",
    icon: "/assets/notion.svg",
    animation: "salute",
  },
];
