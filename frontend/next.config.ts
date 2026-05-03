import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // ✅ Add these rewrites
  async rewrites() {
    return [
      {
        source: '/(.*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;