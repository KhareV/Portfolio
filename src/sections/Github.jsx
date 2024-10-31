import React from "react";
import ItemLayout from "../components/ItemLayout";

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
    <div className="w-full flex items-center justify-center bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-6">
          {/* Top Row - Language and Stats Cards */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* Top Languages Card */}
            <ItemLayout className="flex-1 min-w-0 flex items-center justify-center p-4 border rounded-lg shadow-lg">
              <img
                className="w-full h-auto"
                src={`${GITHUB_STATS_URL}/api/top-langs?username=${USERNAME}&${new URLSearchParams(
                  commonProps
                )}`}
                alt="Most Used Programming Languages"
                loading="lazy"
              />
            </ItemLayout>

            {/* GitHub Stats Card */}
            <ItemLayout className="flex-1 min-w-0 flex items-center justify-center p-4 border rounded-lg shadow-lg">
              <img
                className="w-full h-auto"
                src={`${GITHUB_STATS_URL}/api?username=${USERNAME}&${new URLSearchParams(
                  commonProps
                )}`}
                alt="GitHub Statistics"
                loading="lazy"
              />
            </ItemLayout>
          </div>

          {/* Skills Icons - Full Width */}
          <ItemLayout className="w-full flex items-center justify-center p-4 border rounded-lg shadow-lg">
            <img
              className="w-full h-auto"
              src={`https://skillicons.dev/icons?i=${skills.join(",")}`}
              alt="Technical Skills and Tools"
              loading="lazy"
            />
          </ItemLayout>

          {/* Bottom Row - Streak and Pinned Repo */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            {/* GitHub Streak Stats */}
            <ItemLayout className="flex-1 min-w-0 flex items-center justify-center p-4 border rounded-lg shadow-lg">
              <img
                className="w-full h-auto"
                src={`${GITHUB_STREAK_STATS_URL}?user=${USERNAME}&theme=dark&hide_border=true&type=svg&background=EB545400&ring=FEFE5B&currStreakLabel=FEFE5B`}
                alt="GitHub Contribution Streak"
                loading="lazy"
              />
            </ItemLayout>

            {/* Pinned Repository */}
            <ItemLayout className="flex-1 min-w-0 flex items-center justify-center p-4 border rounded-lg shadow-lg">
              <a
                href={`https://github.com/${USERNAME}/Nextjs-contentlayer-blog`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <img
                  className="w-full h-auto"
                  src={`${GITHUB_STATS_URL}/api/pin/?username=${USERNAME}&repo=Property-Dhundo-Property-Buying-and-Selling
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
