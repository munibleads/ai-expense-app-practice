const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Add production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic', // Enable long term caching
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            mui: {
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              name: 'mui',
              chunks: 'all',
              priority: 10,
              enforce: true,
              reuseExistingChunk: true,
            },
            common: {
              test: /[\\/]components[\\/]expense[\\/]/,
              name: 'expense-components',
              chunks: 'all',
              priority: 5,
              enforce: true,
              reuseExistingChunk: true,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: -10,
              reuseExistingChunk: true,
            },
          },
        },
        runtimeChunk: 'single',
      };
    }

    // Speed up build time in development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };

      // Add watch options to ignore unnecessary files
      config.watchOptions = {
        ignored: ['**/node_modules', '**/.next'],
      };
    }

    // Add cache configuration
    config.cache = {
      type: 'filesystem',
      version: '1',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
      compression: 'gzip',
    };

    return config;
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Enable SWC minification for faster builds
  swcMinify: true,
  // Optimize images
  images: {
    domains: ['ai-receipts-app.s3.us-east-1.amazonaws.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  experimental: {
    turbotrace: {
      contextDirectory: __dirname,
    },
  },
  // Reduce the number of pages being compiled in development
  pageExtensions: ['tsx', 'ts'],
  poweredByHeader: false,
};

module.exports = nextConfig;
