import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

module.exports = {
  async rewrites() {
    return [
      {
        source: "/metrics",
        destination: "http://localhost:8080/metrics",
      },
      {
        source: "/record",
        destination: "http://localhost:8080/record",
      },
    ];
  },
};