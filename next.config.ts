import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is required for Railway / Docker deployments.
  // It bundles the server and all required files into .next/standalone.
  output: "standalone",

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
  },

  // Suppress warnings about packages that use Node.js APIs
  serverExternalPackages: ["pg", "bcryptjs", "jsonwebtoken"],
};

export default nextConfig;
