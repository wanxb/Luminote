import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8787"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8787"
      },
      {
        protocol: "https",
        hostname: "luminote-api.bbing.xyz"
      },
      {
        protocol: "http",
        hostname: "luminote-api.bbing.xyz"
      }
    ]
  }
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  void Function('return import("@opennextjs/cloudflare")')().then((module: any) => {
    module.initOpenNextCloudflareForDev();
  });
}
