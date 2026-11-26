/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable to reduce double-rendering in dev mode
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Next 16 default made explicit: the only quality the app requests.
    qualities: [75],
  },
};

export default nextConfig;
