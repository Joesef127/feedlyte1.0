import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Ensure widget.js is never served stale from Vercel's CDN edge cache.
        // Without this, old versions of the file survive redeployment.
        source: "/widget.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
