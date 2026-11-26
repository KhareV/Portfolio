// Single content model for the page, metadata, chat fallback and tests.
//
// Fields marked `confirm:` carry claims that appear in the existing copy but
// that the repair pass could not verify. They are kept verbatim (not upgraded,
// not removed) until the owner confirms them. See docs/repair/OUTSTANDING.md.

export const SITE_URL = "https://kharevedant.is-a.dev";

export const profile = {
  name: "Vedant Khare",
  role: "Full-stack developer",
  location: "Chennai, India",
  timeZone: "Asia/Kolkata",
  education: "B.Tech. Computer Science and Engineering, VIT Chennai",
  email: "kharevedant05@gmail.com",
  github: "https://github.com/KhareV",
  githubUser: "KhareV",
  linkedin: "https://www.linkedin.com/in/kharevedant05/",
  // Owner-confirmed 2026-11-26: 40+ projects.
  heroSummary:
    "B.Tech. CSE student at VIT Chennai with 40+ projects and multiple hackathon wins. Specializing in full-stack development, blockchain solutions, and AI integration.",
  // Owner-confirmed 2026-11-26: the Summer 2026 internship is completed.
  walmartRole: "Software Engineering Intern at Walmart Global Tech (Sparkplug program, Summer 2026)",
  aboutSummary:
    "With experience in web development, I have honed my skills in both frontend and backend technologies, including HTML, CSS, JavaScript, React, Next.js, Node.js, and MongoDB. I've completed 40+ projects, creating dynamic and responsive web applications tailored to user needs.",
};

export const nav = [
  { label: "Work", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// Old fragments that must keep working. `#work` used to be the experience list.
export const legacyAnchors = { work: "experience", home: "hero" };

export const projects = [
  {
    slug: "propertydhundo",
    title: "PropertyDhundo",
    subtitle: "Your own broker",
    desc: "Property platform connecting buyers and sellers directly, eliminating traditional brokers with tools for informed decisions.",
    source: "https://github.com/KhareV/Property-Dhundo-Property-Buying-and-Selling",
    demo: null,
    poster: "/media/projects/propertydhundo.webp",
    posterAlt: "PropertyDhundo home screen: 'Find The Perfect Rental' search with location and type filters.",
    video: "/textures/project/project1.mp4",
    logo: "/image/logo.png",
    tags: ["React.js", "TailwindCSS", "Next.js", "MongoDB"],
  },
  {
    slug: "medwe",
    title: "MedWe",
    subtitle: "Your one-stop pharmacy",
    desc: "All-in-one pharmacy solution offering medications, health products, and expert healthcare advice.",
    source: "https://github.com/KhareV/SIH-MedWE-Pharmacy-Website",
    demo: null,
    poster: "/media/projects/medwe.webp",
    posterAlt: "MedWe sign-in screen with admin and customer tabs beside the 'Your Health, Our Priority' brand panel.",
    video: "/textures/project/project2.mp4",
    logo: "/image/logo2.png",
    tags: ["React.js", "TailwindCSS", "Next.js", "MongoDB"],
  },
  {
    slug: "chatapp",
    title: "ChatApp",
    subtitle: "Real-time messaging",
    desc: "Real-time messaging platform with instant messaging and group chat functionality.",
    source: "https://github.com/KhareV/ChatApp",
    demo: null,
    poster: "/media/projects/chatapp.webp",
    posterAlt: "ChatApp conversation view with a contact list and a two-person message thread.",
    video: "/textures/project/project3.mp4",
    logo: "/assets/project-logo3.png",
    tags: ["React.js", "TailwindCSS", "GraphQL"],
  },
  {
    slug: "pixabay-gallery",
    title: "Pixabay Gallery",
    subtitle: "Image search",
    desc: "Image gallery platform showcasing high-quality, royalty-free content from Pixabay.",
    source: "https://github.com/KhareV/Pixabay-Gallery",
    demo: null,
    poster: "/media/projects/pixabay-gallery.webp",
    posterAlt: "Pixabay Gallery search results showing image cards with views, downloads and tags.",
    video: "/textures/project/project4.mp4",
    logo: "/assets/project-logo4.png",
    tags: ["React.js", "TailwindCSS", "Express.js"],
  },
  {
    slug: "openai-image-generator",
    // confirm: the card previously read "Imaginify - AI Photo Manipulation App"
    // (credits + payments SaaS), but the linked repository and the captured
    // video show a Node.js OpenAI image generator. Title kept, flagged.
    title: "Imaginify",
    subtitle: "AI photo manipulation app",
    desc: "AI-powered SaaS application for photo editing with credits-based system and payment integration.",
    source: "https://github.com/KhareV/Nodejs-OpenAI-Image-Generator",
    demo: null,
    poster: "/media/projects/openai-image-generator.webp",
    posterAlt: "Image generator form ('Describe An Image') with a generated illustration below it.",
    video: "/textures/project/project5.mp4",
    logo: "/assets/project-logo5.png",
    tags: ["React.js", "TailwindCSS", "Node.js", "OpenAI"],
  },
];

export const experience = [
  {
    id: "codechef",
    org: "CodeChef College Chapter, VIT Chennai",
    role: "Full-Stack Web Engineer",
    // confirm: dates kept verbatim
    dates: "Aug 2024 – Present",
    summary:
      "Engineered MailChef and CIMP platforms, optimizing algorithms and automating club management workflows.",
    icon: "/media/icons/codechef.webp",
    animation: "victory",
  },
  {
    id: "ispace",
    org: "iSpace College Club, VIT Chennai",
    role: "Full-Stack Web Engineer",
    dates: "Nov 2024 – Present",
    summary:
      "Built flagship 'CSS Battles' website using React, Node.js, MongoDB, handling 500+ registrations efficiently.",
    icon: "/media/icons/ispace.webp",
    animation: "clapping",
  },
  {
    id: "hackathons",
    org: "Hackathon Leadership – Spectrum, Devshouse & SIH",
    role: "Team Lead",
    dates: "Apr 2024 – Apr 2025",
    summary:
      "Led teams to build SkillBridge and MedWE, ranking top 3 nationally in Spectrum and achieving SIH Hackathon finalist status.",
    icon: "/media/icons/hackathons.webp",
    animation: "salute",
  },
  {
    id: "dandiya",
    org: "Dandiya Night Organizer",
    role: "Event Organizer",
    dates: "Nov 2022",
    summary:
      "Organized a legendary dandiya night, bringing sticks and spins to 500+ attendees with more energy than my coding marathons!",
    icon: "/media/icons/dandiya.webp",
    animation: "clapping",
  },
];

export const funFacts = [
  "Started out aiming for civil engineering, explored optometry, and eventually found my edge in full-stack development.",
  `Interned as a software engineer at Walmart Global Tech (Sparkplug, Summer 2026).`,
  "Secured 3rd place at the Spectrum National Level Hackathon.",
  "Smart India Hackathon Finalist with MedWE (healthcare + blockchain platform).",
  "Ranked 19th out of 2000+ teams in the Devshouse Hackathon.",
  "District-level football player with a competitive mindset.",
  "Plays the piano with Grade 3 Trinity College London certification.",
  "Builds full-stack + blockchain systems solving real-world problems.",
];

export const skills = {
  Languages: ["JavaScript", "TypeScript", "Python", "C++"],
  Frontend: ["React", "Next.js", "Tailwind CSS", "Three.js"],
  Backend: ["Node.js", "Express.js", "GraphQL", "REST APIs"],
  Data: ["MongoDB", "SQL"],
  "Tools & infra": ["Docker", "AWS", "Firebase", "Git"],
  Specialised: ["Solidity (Ethereum)", "TensorFlow"],
};

export const starterQuestions = [
  "tell me about yourself",
  "what projects have you built?",
  "what are your strongest skills?",
  "how can i contact you?",
];
