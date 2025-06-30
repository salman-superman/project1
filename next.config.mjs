import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: false
  },
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true
  }
};

export default withPWA(nextConfig);
