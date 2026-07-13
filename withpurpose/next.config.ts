import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // firebase-admin's auth module pulls in jwks-rsa -> an ESM-only build of
  // jose. Bundling any link in that chain breaks the require() with
  // ERR_REQUIRE_ESM in production. Marking only "firebase-admin" external
  // isn't enough under Turbopack, which still tries to process the nested
  // requires — so we mark the whole transitive chain (and firebase-admin's
  // other native/optional deps) external. Node then resolves them natively
  // from node_modules with the correct CommonJS export conditions.
  serverExternalPackages: [
    "firebase-admin",
    "jose",
    "jwks-rsa",
    "google-auth-library",
    "google-gax",
    "@google-cloud/firestore",
    "@google-cloud/storage",
    "@grpc/grpc-js",
    "@grpc/proto-loader",
    "farmhash-modern",
    "gcp-metadata",
    "teeny-request",
  ],
};

export default nextConfig;
