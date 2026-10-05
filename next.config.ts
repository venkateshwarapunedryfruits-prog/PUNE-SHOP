import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/d8mvq75f/image/upload/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // product photos are resized in the browser before upload; this leaves headroom
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
