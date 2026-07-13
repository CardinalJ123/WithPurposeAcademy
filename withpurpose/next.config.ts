import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Keep the native firebase-admin SDK out of the bundle; Node loads it from
  // node_modules at runtime. Note: firebase-admin/auth -> jwks-rsa -> jose@6
  // is ESM-only and consumed via require(), which needs Node 22.12+ (see the
  // "engines" field in package.json — Vercel must run Node 22.x, not 20).
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
