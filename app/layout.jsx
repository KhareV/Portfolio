import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { PHASE_BOOT_SCRIPT } from "./lib/time";
import { SITE_URL, profile } from "./content/site";

const description = `${profile.name} — ${profile.role.toLowerCase()} in ${profile.location}. Selected projects with source code, experience, and how to get in touch.`;

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL),
  title: `${profile.name} — ${profile.role}`,
  description,
  authors: [{ name: profile.name, url: SITE_URL }],
  alternates: { canonical: "/" },
  icons: { icon: "/snoopy.png" },
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description,
    url: "/",
    siteName: profile.name,
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${profile.name}, ${profile.role.toLowerCase()} in ${profile.location}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description,
    images: ["/og.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1120",
};

export default function RootLayout({ children }) {
  return (
    // html carries data-phase / .js set by the boot script before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PHASE_BOOT_SCRIPT }} />
        <link rel="preload" href="/newimages/fonts/default.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
