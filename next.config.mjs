// @ts-check
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve HMR and development experience
  experimental: {
    // Better error handling in development
    optimizePackageImports: ['@clerk/nextjs', 'framer-motion'],
  },
  // Better caching strategy
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig); 