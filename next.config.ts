import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || undefined,
};

export default nextConfig;
