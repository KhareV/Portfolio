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
  // RGBE .hdr is served as application/octet-stream, which neither `next start`
  // nor Vercel compresses. The bytes are unchanged; a compressible type lets the
  // server gzip/brotli it on the wire (~1.64 MB -> ~1.3 MB). The loader reads it
  // as an ArrayBuffer, so the declared type does not affect decoding.
  async headers() {
    return [
      {
        source: "/hdri/:file*",
        headers: [{ key: "Content-Type", value: "text/plain" }],
      },
    ];
  },
};

export default nextConfig;
