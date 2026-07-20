import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CV logos/photos are served straight from Vercel Blob or /public — no
  // optimisation pipeline needed, which keeps the app deployable anywhere.
  images: { unoptimized: true },
};

export default nextConfig;
