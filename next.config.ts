import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚡ Images Config
  images: {
    formats: ['image/avif', 'image/webp'],
    // 🔥 FIX: Yahan hum define kar rahe hain ke konsi qualities allowed hain
    qualities: [60, 75, 85, 90, 100], 
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Experimental (Optional: Agar build fast chahiye ho)
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;