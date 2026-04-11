import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable x-powered-by header for security
  poweredByHeader: false,

  experimental: {
    // Keep design docs available in serverless build for /design route.
    outputFileTracingIncludes: {
      "/design/[[...slug]]": ["./.dev/design/**/*"],
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/**' },
      { protocol: 'https', hostname: 'icons.duckduckgo.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.google.com', pathname: '/**' },
    ],
  },
  
  async headers() {
    // CSP Header - allows Supabase, Vercel Analytics, Buug widget, and necessary inline scripts
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live https://*.vercel.live https://buug.io https://*.buug.io;
      script-src-elem 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live https://*.vercel.live https://buug.io https://*.buug.io;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https://*.supabase.co https://buug.io https://*.buug.io;
      font-src 'self';
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://vercel.live https://*.vercel.live https://buug.io https://*.buug.io;
      frame-src 'self' https://buug.io https://*.buug.io;
      frame-ancestors 'none';
      form-action 'self';
      base-uri 'self';
      upgrade-insecure-requests;
    `.replace(/\n/g, ' ').trim();
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
