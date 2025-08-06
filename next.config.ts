import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
      serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
    },
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    },
  };

export default nextConfig;
