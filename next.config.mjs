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
};

export default nextConfig;
