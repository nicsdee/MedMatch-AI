import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  // ✅ This is the CORRECT way for Next.js 16
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;