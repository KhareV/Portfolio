import React from "react";
import {
  SiReact,
  SiTailwindcss,
  SiNextdotjs,
  SiMongodb,
  SiGraphql,
  SiExpress,
  SiNodedotjs,
} from "react-icons/si";
import { Brain } from "lucide-react";

const TechIcon = ({ icon, className = "w-4 h-4" }) => {
  const iconMap = {
    react: <SiReact className={className} />,
    tailwind: <SiTailwindcss className={className} />,
    nextjs: <SiNextdotjs className={className} />,
    mongodb: <SiMongodb className={className} />,
    graphql: <SiGraphql className={className} />,
    express: <SiExpress className={className} />,
    nodejs: <SiNodedotjs className={className} />,
    openai: <Brain className={className} />,
  };

  return iconMap[icon] || null;
};

export default TechIcon;
