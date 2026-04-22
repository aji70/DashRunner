/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@rainbow-me/rainbowkit"],
  reactStrictMode: true,
  typescript: {
    // Allow builds even with TypeScript errors
    ignoreBuildErrors: false,
  },
  /** MetaMask SDK pulls a React Native dep; it is not used in the web bundle. */
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
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
