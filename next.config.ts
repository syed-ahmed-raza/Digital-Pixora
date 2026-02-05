/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚡ SWC Minification (Tez loading ke liye)
  swcMinify: true,
  
  images: {
    formats: ['image/avif', 'image/webp'], // Browser support ke hisab se best formats
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  // 🛡️ PRODUCTION POLISH: Console logs remove kar do production build mein
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;