/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Caching strategies for different types of resources
  runtimeCaching: [
    {
      urlPattern: /^\/$/,  // Cache the root URL (start URL)
      handler: 'NetworkFirst',
      options: {
        cacheName: 'start-url',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24 * 7,  // Cache for 7 days
        },
      },
    },
    {
      urlPattern: /^\/_next\/static\/.*/,  // Cache Next.js static files (JS, CSS)
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,  // Cache for 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(gstatic|googleapis)\.com\/.*/i,  // Cache Google Fonts
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,  // Cache for 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/i,  // Cache images
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 30,  // Cache for 30 days
        },
      },
    },
    {
      urlPattern: /^\/.*/i,  // Cache HTML files and fallback to NetworkFirst strategy
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 7,  // Cache for 7 days
        },
      },
    },
  ],
});

const nextConfig = withPWA({
  // Additional configurations if needed
});

module.exports = nextConfig;