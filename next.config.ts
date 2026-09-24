import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a verification build write somewhere else, so compiling never pulls
  // the directory out from under a server someone is testing on.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",

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
    // Access-Control-Allow-Origin: "*" together with Allow-Credentials: true is
    // both invalid (browsers ignore the pair) and a standing invitation on the
    // webhook routes. Nothing here is a public cross-origin API, so CORS is
    // simply not advertised; same-origin requests never needed it.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // The app legitimately uses camera, microphone and screen capture
            // for streaming, so those stay enabled for our own origin.
            value:
              "camera=(self), microphone=(self), display-capture=(self), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

};

export default nextConfig;