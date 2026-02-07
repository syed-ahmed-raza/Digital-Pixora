import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚡ Gold Tier Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    
    // 🔥 FIX: Device Sizes define karne se images har screen par perfect resize hongi
    // Yeh images ko kabhi bhi blur nahi hone dega
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], 
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Agar aapke paas koi aur domain hai jahan se images aa rahi hain, usey yahan add karein
    ],
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Clean console on live site
  },
  
  // Experimental Features for Speed
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'gsap'],
    // scrollRestoration: true, // Let Lenis handle this in ClientLayout
  },
};

export default nextConfig;