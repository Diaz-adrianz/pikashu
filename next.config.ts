import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: ['winston', 'winston-daily-rotate-file'],
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
