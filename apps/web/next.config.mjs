import createNextIntlPlugin from "next-intl/plugin";


const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle for the VPS (same as apps/admin).
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Single-vendor: the marketplace listing pages are gone. Old links land on
  // the menu (nearest branch) instead of a 404; partner sign-up goes home.
  async redirects() {
    const toMenu = [
      '/restaurants',
      '/store',
      '/store/:slug/:id',
      '/category/:slug',
      '/search/:slug',
      '/see-all/:slug',
      '/mapview/:slug',
    ];
    return [
      ...toMenu.map((source) => ({ source, destination: '/discovery', permanent: false })),
      { source: '/restaurantInfo', destination: '/', permanent: false },
      { source: '/profile/customerTicket', destination: '/profile/getHelp', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'upgrade-insecure-requests; media-src \'self\' https://res.cloudinary.com https://*.amazonaws.com https://*.s3.amazonaws.com data: blob:'
          },
          // Optional: Add other security headers
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  images: {
    // domains: ["storage.googleapis.com"],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      // Dummy
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
      //////////
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "enatega.com",
      },
      {
        protocol: "https",
        hostname: "www.lifcobooks.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        hostname: "example.com",
        protocol: "https",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "t4.ftcdn.net",
      },
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol:'https',
        hostname:"images.deliveryhero.io"
      },
       {
        protocol: 'https',
        hostname: 'enatega-backend.s3.eu-north-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
    ], // Add placehold.co as an allowed domain
  },
};
export default withNextIntl(nextConfig);