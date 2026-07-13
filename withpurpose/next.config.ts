import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // firebase-admin's auth module pulls in jwks-rsa -> an ESM-only build of
  // jose. Bundling it (the default) breaks that require chain in production
  // with ERR_REQUIRE_ESM. Leaving it external makes Node load it natively
  // from node_modules instead, which resolves it correctly.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
