/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Configure for monorepo setup
  transpilePackages: ['survey-components', '@nesolagus/config', '@nesolagus/dashboard-widgets'],

  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'Nesolagus Studio',
    NEXT_PUBLIC_APP_VERSION: '0.3.0',
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fix for "Cannot find module" errors with existing pipeline code
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },
};

module.exports = nextConfig;
