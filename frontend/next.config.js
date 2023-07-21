/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AIRSTACK_API_KEY: process.env.AIRSTACK_API_KEY,
  }
}

module.exports = nextConfig
