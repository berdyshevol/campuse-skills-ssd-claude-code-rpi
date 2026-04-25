import type { NextConfig } from "next";

/**
 * INTERNAL_API_URL points at the Django backend. Used in two places:
 *   1. The /api/* rewrite below — the browser calls /api/* on this same
 *      Next.js origin, which avoids cross-subdomain cookie issues.
 *   2. lib/server-api.ts when Server Components need to call Django directly.
 *
 * Defaults to local dev so `npm run dev` works with no env setup.
 */
const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // Django requires trailing slashes on all API routes (DRF's default).
  // Without this Next strips the trailing slash before forwarding the
  // rewrite, Django 301s back, and we deadlock.
  trailingSlash: true,
  async rewrites() {
    return [
      // Match trailing-slash form first (Django's canonical form). The
      // explicit slash in source/destination keeps Next from dropping it
      // during path-to-regexp matching.
      {
        source: "/api/:path*/",
        destination: `${INTERNAL_API_URL}/api/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${INTERNAL_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
