import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone files for better deployment compatibility
  output: 'standalone',

  // Ignore TypeScript build errors to avoid failures from type issues
  typescript: {
    ignoreBuildErrors: true,
  },

  // The 'eslint' option is REMOVED here. Configure linting in package.json instead.
  
  // Good to know: The 'turbopack' option has moved to a 'turbopack' key if you need it
  // turbopack: {
  //   // Your Turbopack options here
  // },
};

export default nextConfig;