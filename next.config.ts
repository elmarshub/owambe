import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/pieces/[id]/opengraph-image/[__metadata_id__]": ["./src/assets/og/**"],
    "/pieces/[id]/twitter-image/[__metadata_id__]": ["./src/assets/og/**"],
  },
};

export default nextConfig;
