/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 only serves listed qualities; anything else is a 400. Keep the
    // list explicit so manual URLs and <Image quality> stay in agreement.
    qualities: [75],
  },
  async headers() {
    const day = "public, max-age=86400, stale-while-revalidate=604800";
    return [
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: day }] },
      { source: "/draco/:path*", headers: [{ key: "Cache-Control", value: day }] },
      { source: "/models/:path*", headers: [{ key: "Cache-Control", value: day }] },
      { source: "/planet/:path*", headers: [{ key: "Cache-Control", value: day }] },
      { source: "/textures/:path*", headers: [{ key: "Cache-Control", value: day }] },
    ];
  },
};

export default nextConfig;
