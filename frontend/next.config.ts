import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  // Do NOT include any 'eslint' key here - it's no longer supported
};

export default nextConfig;