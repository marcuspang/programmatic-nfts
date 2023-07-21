/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AIRSTACK_API_KEY: process.env.AIRSTACK_API_KEY,
    WEB3AUTH_CLIENT_ID: process.env.WEB3AUTH_CLIENT_ID,
    INFURA_KEY: process.env.INFURA_KEY,
  }
}

module.exports = nextConfig
