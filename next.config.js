/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public', // The folder where the service worker will be generated
});

const nextConfig = withPWA({
  // Add any additional Next.js configuration options here if needed
});

module.exports = nextConfig;
