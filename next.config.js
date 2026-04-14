/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Allow builds even with TypeScript errors
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
