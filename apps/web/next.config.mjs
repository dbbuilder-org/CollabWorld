/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@collabworld/ui", "@collabworld/db", "@collabworld/types", "@collabworld/email"],
};

export default nextConfig;
