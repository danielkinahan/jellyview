import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    JF_URL: process.env.JF_URL,
    API_KEY: process.env.API_KEY,
  },
};

export default nextConfig;
