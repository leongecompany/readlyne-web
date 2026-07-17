import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/readlyne-web',
  assetPrefix: '/readlyne-web/',
  images: { unoptimized: true },
};

export default nextConfig;
