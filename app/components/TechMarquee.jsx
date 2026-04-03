"use client";

import React, { memo } from "react";

const MARQUEE_ROWS = [
  {
    primaryAnimation: "animate-marquee",
    duplicateAnimation: "animate-marquee2",
    items: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Node.js",
      "Express",
      "MongoDB",
      "GitHub",
      "Docker",
    ],
  },
  {
    primaryAnimation: "animate-marquee-reverse",
    duplicateAnimation: "animate-marquee2-reverse",
    items: [
      "TypeScript",
      "Vue.js",
      "Angular",
      "Firebase",
      "GraphQL",
      "Redux",
      "SASS",
      "Webpack",
      "Babel",
      "Git",
      "PostgreSQL",
    ],
  },
  {
    primaryAnimation: "animate-marquee",
    duplicateAnimation: "animate-marquee2",
    items: [
      "Python",
      "Django",
      "Flask",
      "MySQL",
      "Redis",
      "Kubernetes",
      "Jenkins",
      "AWS",
      "Azure",
      "GCP",
    ],
  },
];

const MarqueeTextRow = ({ items, animationClass, keyPrefix }) => (
  <div className={`${animationClass} whitespace-nowrap flex items-center`}>
    {items.map((item, index) => (
      <span className="mx-4 text-lg" key={`${keyPrefix}-${index}`}>
        {item}
      </span>
    ))}
  </div>
);

const TechMarquee = () => {
  return (
    <div className="w-4/5 mx-auto my-8 rounded-2xl border border-[#d4d7cf] bg-[#eef1e6] py-8 text-[#596056] overflow-hidden">
      <div className="flex flex-col gap-8">
        {MARQUEE_ROWS.map((row, rowIndex) => (
          <div className="relative flex overflow-x-hidden" key={rowIndex}>
            <MarqueeTextRow
              items={row.items}
              animationClass={row.primaryAnimation}
              keyPrefix={`row-${rowIndex}-primary`}
            />
            <div className="absolute top-0">
              <MarqueeTextRow
                items={row.items}
                animationClass={row.duplicateAnimation}
                keyPrefix={`row-${rowIndex}-duplicate`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(TechMarquee);
