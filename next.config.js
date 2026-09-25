/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permet les images depuis des domaines externes (Plant.id, etc.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.plant.id' },
      { protocol: 'https', hostname: '**.plantnet.org' },
    ],
  },
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
