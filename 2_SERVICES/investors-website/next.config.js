/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable static exports for deployment to CDN
  output: 'export',
  trailingSlash: true,
  
  // Image optimization
  images: {
    unoptimized: true, // Required for static export
    domains: [
      'images.ctfassets.net', // Contentful
      'cdn.contentful.com',   // Contentful
      'images.unsplash.com',  // Unsplash
      'res.cloudinary.com',   // Cloudinary
      'avatars.githubusercontent.com', // GitHub avatars
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables
  env: {
    SITE_URL: process.env.SITE_URL || 'https://investors.iworkz.com',
    CONTENTFUL_SPACE_ID: process.env.CONTENTFUL_SPACE_ID,
    CONTENTFUL_ACCESS_TOKEN: process.env.CONTENTFUL_ACCESS_TOKEN,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'investors@iworkz.com',
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          }
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          }
        ]
      }
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/ir',
        destination: '/',
        permanent: true,
      },
      {
        source: '/investor-relations',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };

    // Add bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')();
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },

  // Experimental features
  experimental: {
    // Enable modern JavaScript features
    esmExternals: true,
    // Optimize CSS
    optimizeCss: true,
  },

  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Asset prefix for CDN
  assetPrefix: process.env.CDN_URL || '',

  // Custom webpack loaders
  sassOptions: {
    includePaths: ['./src/styles'],
  },
};

module.exports = nextConfig;