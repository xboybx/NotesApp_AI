import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js to transpile BlockNote + Mantine packages (they ship as ESM)
  transpilePackages: [
    "@blocknote/core",
    "@blocknote/react",
    "@blocknote/mantine",
    "@mantine/core",
    "@mantine/hooks",
  ],

  // Empty turbopack config silences the webpack/turbopack conflict warning
  // (Next.js 16 uses Turbopack by default)
  turbopack: {},
};

export default nextConfig;
