//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@trpc/server', '@trpc/client', '@trpc/react-query', '@tanstack/react-query'],
  experimental: {
    // Remove serverActions since it's now default
  }
}

module.exports = nextConfig
