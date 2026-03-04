import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export to support client-side navigation and API routes
  // output: "export" is not compatible with useRouter hooks used in auth flows
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
