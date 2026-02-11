import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Docker deployment
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default withPayload(nextConfig);
