import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.20.10.3', '172.20.10.*'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/shop/:slug',
        destination: '/product/:slug',
        permanent: true,
      },
      {
        source: '/products/:slug',
        destination: '/product/:slug',
        permanent: true,
      },
      {
        source: '/our-story',
        destination: '/the-craft',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
