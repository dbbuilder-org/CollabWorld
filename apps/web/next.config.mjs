/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@collabworld/ui", "@collabworld/db", "@collabworld/types", "@collabworld/email"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.mux.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
};

export default nextConfig;
