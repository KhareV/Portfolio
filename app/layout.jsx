import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
export const metadata = {
  title: "Vedant's Portfolio | Full-Stack Developer & Blockchain Enthusiast",
  description:
    "Portfolio of Vedant - Full-Stack Developer, Hackathon Finalist, Blockchain Developer, and AI/ML Enthusiast. Explore my projects including MedWE, SkillBridge, Voyageur, and PropertyDhundo.",
  keywords:
    "Full-Stack Developer, Blockchain, AI/ML, React, Next.js, Portfolio, Vedant, Web Development, Three.js",
  authors: [{ name: "Vedant" }],
  // Without NEXT_PUBLIC_SITE_URL the OG/Twitter image pointed at
  // http://localhost:3000. Fall back to Vercel's production URL, then to the
  // live domain.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "https://kharevedant.is-a.dev"),
  ),
  openGraph: {
    title: "Vedant's Portfolio",
    description: "Full-Stack Developer & Blockchain Enthusiast",
    type: "website",
    images: [
      {
        url: "/snoopy.png",
        // actual file dimensions (was declared as 1200x630)
        width: 1000,
        height: 1000,
        alt: "Vedant's Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedant's Portfolio",
    description: "Full-Stack Developer & Blockchain Enthusiast",
    images: ["/snoopy.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* 96px copy of snoopy.png for the tab icon; the 1000px original stays the social preview */}
        <link rel="icon" type="image/png" sizes="96x96" href="/snoopy-icon.png" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <div className="app-scale">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
