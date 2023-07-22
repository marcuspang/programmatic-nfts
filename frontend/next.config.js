/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AIRSTACK_API_KEY: process.env.AIRSTACK_API_KEY,
    WEB3AUTH_CLIENT_ID: process.env.WEB3AUTH_CLIENT_ID,
    INFURA_KEY: process.env.INFURA_KEY,
    POLYGON_TESTNET_ALCHEMY_API_KEY:
      process.env.POLYGON_TESTNET_ALCHEMY_API_KEY,
    POLYGON_ALCHEMY_API_KEY: process.env.POLYGON_ALCHEMY_API_KEY,
    WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID,
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;
