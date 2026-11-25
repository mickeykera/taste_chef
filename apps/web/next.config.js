/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  publicExcludes: ['!downloads/**/*'],
});

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tastechef/shared'],
};

module.exports = withPWA(nextConfig);
