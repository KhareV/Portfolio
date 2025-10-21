import React from "react";
import ItemLayout from "../components/ItemLayout";
import { spacing, layout, borders, cn } from "../styles/spacing.js";

const Github = () => {
  const GITHUB_STATS_URL = import.meta.env.VITE_GITHUB_STATS_URL;
  const GITHUB_STREAK_STATS_URL = import.meta.env.VITE_GITHUB_STREAK_STATS_URL;
  const USERNAME = "KhareV";

  const commonProps = {
    theme: "transparent",
    hide_border: "true",
    title_color: "FEFE5B",
    text_color: "FFFFFF",
    icon_color: "FEFE5B",
    text_bold: "false",
  };

  const skills = [
    "appwrite",
    "aws",
    "babel",
    "bootstrap",
    "cloudflare",
    "css",
    "d3",
    "docker",
    "figma",
    "firebase",
    "gatsby",
    "git",
    "github",
    "graphql",
    "html",
    "ipfs",
    "js",
    "jquery",
    "kubernetes",
    "linux",
    "mongodb",
    "mysql",
    "netlify",
    "nextjs",
    "nodejs",
    "npm",
    "postgres",
    "react",
    "redux",
    "replit",
    "sass",
    "supabase",
    "tailwind",
    "threejs",
    "vercel",
    "vite",
    "vscode",
    "yarn",
  ];

  return (
    <div className={cn("w-full", layout.flex.center, "bg-transparent")}>
      <div
        className={cn(
          "w-full",
          layout.maxWidth["7xl"],
          layout.centered.x,
          spacing.container.paddingX
        )}
      >
        <div className={cn(layout.flex.col, spacing.card.gap)}>
          {/* Top Row - Language and Stats Cards */}
          <div
            className={cn(
              layout.flex.col,
              "md:flex-row w-full",
              spacing.card.gap
            )}
          >
            {/* Top Languages Card */}
            <ItemLayout
              className={cn(
                "flex-1 min-w-0",
                layout.flex.center,
                spacing.interactive.padding,
                borders.default,
                borders.rounded.lg,
                "shadow-lg"
              )}
            >
              <img
                className="w-full h-auto"
                src={`https://github-readme-stats.vercel.app/api/top-langs?username=${USERNAME}&${new URLSearchParams(
                  commonProps
                )}`}
                alt="Most Used Programming Languages"
                loading="lazy"
              />
            </ItemLayout>

            {/* GitHub Stats Card */}
            <ItemLayout
              className={cn(
                "flex-1 min-w-0",
                layout.flex.center,
                spacing.interactive.padding,
                borders.default,
                borders.rounded.lg,
                "shadow-lg"
              )}
            >
              <img
                className="w-full h-auto"
                src={`https://github-readme-stats.vercel.app/api?username=${USERNAME}&${new URLSearchParams(
                  commonProps
                )}`}
                alt="GitHub Statistics"
                loading="lazy"
              />
            </ItemLayout>
          </div>

          {/* Skills Icons - Full Width */}
          <ItemLayout
            className={cn(
              "w-full",
              layout.flex.center,
              spacing.interactive.padding,
              borders.default,
              borders.rounded.lg,
              "shadow-lg"
            )}
          >
            <img
              className="w-full h-auto"
              src={`https://skillicons.dev/icons?i=${skills.join(",")}`}
              alt="Technical Skills and Tools"
              loading="lazy"
            />
          </ItemLayout>

          {/* Bottom Row - Streak and Pinned Repo */}
          <div
            className={cn(
              layout.flex.col,
              "md:flex-row w-full",
              spacing.card.gap
            )}
          >
            {/* GitHub Streak Stats */}
            <ItemLayout
              className={cn(
                "flex-1 min-w-0",
                layout.flex.center,
                spacing.interactive.padding,
                borders.default,
                borders.rounded.lg,
                "shadow-lg"
              )}
            >
              <img
                className="w-full h-auto"
                src={`https://github-readme-streak-stats.herokuapp.com?user=${USERNAME}&theme=dark&hide_border=true&type=svg&background=EB545400&ring=FEFE5B&currStreakLabel=FEFE5B`}
                alt="GitHub Contribution Streak"
                loading="lazy"
              />
            </ItemLayout>

            {/* Pinned Repository */}
            <ItemLayout
              className={cn(
                "flex-1 min-w-0",
                layout.flex.center,
                spacing.interactive.padding,
                borders.default,
                borders.rounded.lg,
                "shadow-lg"
              )}
            >
              <a
                href={`https://github.com/${USERNAME}/Nextjs-contentlayer-blog`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <img
                  className="w-full h-auto"
                  src={`https://github-readme-stats.vercel.app/api/pin/?username=${USERNAME}&repo=Property-Dhundo-Property-Buying-and-Selling
&${new URLSearchParams({
                    ...commonProps,
                    description_lines_count: "2",
                  })}`}
                  alt="Featured Repository: Next.js Contentlayer Blog"
                  loading="lazy"
                />
              </a>
            </ItemLayout>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Github;
