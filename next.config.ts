import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  outputFileTracingIncludes: {
    "/pieces/[id]/opengraph-image/[__metadata_id__]": ["./src/assets/og/**"],
    "/pieces/[id]/twitter-image/[__metadata_id__]": ["./src/assets/og/**"],
  },
};

export default nextConfig;
