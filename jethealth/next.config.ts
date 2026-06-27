import type { NextConfig } from "next";

// Internal Supabase URL used to proxy browser calls same-origin (avoids CORS
// and lets a single public tunnel serve both the app and Supabase in dev).
const SUPABASE_INTERNAL_URL =
  process.env.SUPABASE_INTERNAL_URL || "http://127.0.0.1:54321";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow Next dev assets/HMR to be served when the app is reached through a
  // tunnel (cross-origin) during local development.
  allowedDevOrigins: ["*.trycloudflare.com"],
  async rewrites() {
    return [
      {
        source: "/sb/:path*",
        destination: `${SUPABASE_INTERNAL_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
