import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
  outputFileTracingIncludes: {
    '/api/extract-text': [
      './node_modules/pdf-parse/dist/worker/**/*',
      './node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs',
      './node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs',
      './node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
      './node_modules/@napi-rs/canvas*/**/*',
    ],
  },
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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
