import "./globals.css";

export const metadata = {
  title: "Vedant's Portfolio | Full-Stack Developer & Blockchain Enthusiast",
  description:
    "Portfolio of Vedant - Full-Stack Developer, Hackathon Finalist, Blockchain Developer, and AI/ML Enthusiast. Explore my projects including MedWE, SkillBridge, Voyageur, and PropertyDhundo.",
  keywords:
    "Full-Stack Developer, Blockchain, AI/ML, React, Next.js, Portfolio, Vedant, Web Development, Three.js",
  authors: [{ name: "Vedant" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Vedant's Portfolio",
    description: "Full-Stack Developer & Blockchain Enthusiast",
    type: "website",
    images: [
      {
        url: "/image/logo.png",
        width: 1200,
        height: 630,
        alt: "Vedant's Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedant's Portfolio",
    description: "Full-Stack Developer & Blockchain Enthusiast",
    images: ["/image/logo.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 0.67,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/image/logo.png" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
