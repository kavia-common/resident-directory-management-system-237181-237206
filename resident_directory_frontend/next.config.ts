import type { NextConfig } from "next";

/**
 * Next.js configuration for Resident Directory Management System.
 *
 * Key integration points:
 * - API rewrites: proxies /api/backend/* → FastAPI backend (avoids CORS in SSR contexts)
 * - Backend URL: resolved from NEXT_PUBLIC_API_BASE (platform) or NEXT_PUBLIC_API_URL (local dev)
 * - Images: unoptimized for compatibility with static-asset hosting
 */

const backendUrl =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Rewrite /api/backend/* → backend service so server-side fetch calls
  // can use a relative path without CORS issues.
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
