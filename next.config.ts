import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io", // UploadThing
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh", // UploadThing
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // ADD THIS
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // ADD THIS for avatars
      },
    ],
    formats: ["image/avif", "image/webp"], // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Responsive sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Next 16 builds with Turbopack. The old webpack block (ws optional native
  // deps as externals, fs/net/tls fallbacks) is handled by Turbopack directly,
  // and a webpack config it never reads is worse than none.
  turbopack: {},

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },

};

export default nextConfig;