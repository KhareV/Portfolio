import React, { memo } from "react";
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

const ICON_COMPONENTS = {
  react: SiReact,
  tailwind: SiTailwindcss,
  nextjs: SiNextdotjs,
  mongodb: SiMongodb,
  graphql: SiGraphql,
  express: SiExpress,
  nodejs: SiNodedotjs,
  openai: Brain,
};

const TechIcon = ({ icon, className = "w-4 h-4" }) => {
  const IconComponent = ICON_COMPONENTS[icon];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export default memo(TechIcon);
