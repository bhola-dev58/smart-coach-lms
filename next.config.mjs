import dns from 'dns';

// Force DNS lookup IPv4 preference globally to prevent ETIMEDOUT during Google OAuth callback
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['20.101.23.184'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  turbopack: {
    // Explicitly set workspace root to silence the multiple lockfiles warning
    root: '/home/bhola-dev58/colledge project/coaching center/meetme-center',
  },
};

export default nextConfig;
