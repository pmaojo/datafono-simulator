/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/v1/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
    ];
  },
  // Forzar HTTP
  experimental: {
    allowMiddlewareResponseBody: true,
  },
  // Deshabilitar SSL
  server: {
    https: false,
    http: true
  }
};

module.exports = nextConfig;
