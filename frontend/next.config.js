/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@rainbow-me/rainbowkit"],
  reactStrictMode: true,
  typescript: {
    // Allow builds even with TypeScript errors
    ignoreBuildErrors: false,
  },
  async redirects() {
    const id = process.env.FARCASTER_HOSTED_MANIFEST_ID?.trim();
    if (!id) return [];
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: `https://api.farcaster.xyz/miniapps/hosted-manifest/${id}`,
        permanent: false,
        statusCode: 307,
      },
    ];
  },
};

module.exports = nextConfig;
