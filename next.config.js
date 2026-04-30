/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  transpilePackages: ['@splinetool/react-spline', '@splinetool/runtime'],
};

module.exports = nextConfig;
