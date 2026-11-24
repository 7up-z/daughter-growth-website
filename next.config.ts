import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/api/:collection(birthday|comments|family|media|memory|messages|photos|travel|upload|user)/:path*",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
