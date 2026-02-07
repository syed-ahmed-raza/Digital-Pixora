import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚡ Gold Tier Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    
    // 🔥 FIX 1: Device Sizes (Ultra Sharp Images)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], 
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // 🔥 FIX 2: Qualities Whitelist (Error Fix)
    // Ab aap 75, 80, 85, 90, 100 quality use kar sakte ho bina warning ke.
    qualities: [75, 80, 85, 90, 100], 
    
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Clean console on live site
  },
  
  // Experimental Features for Speed
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'gsap'],
  },
};

export default nextConfig;