/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Caching strategies for different types of resources
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // Cache for 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/your-api-endpoint\/.*/i, // Replace with your API endpoint
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10, // Wait 10 seconds before using cache
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // Cache for 1 day
        },
      },
    },
    {
      urlPattern: /^\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
        },
      },
    },
  ],
});

const nextConfig = withPWA({
  // Other configurations can go here
});

module.exports = nextConfig;