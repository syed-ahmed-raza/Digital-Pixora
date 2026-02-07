import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // 🛠️ FIX 1: ULTRA-RESPONSIVE CONTAINER
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",   // Mobile (16px) - Safe distance from edges
        xs: "1.25rem",     // Large Phones
        sm: "1.5rem",      // Tablets
        md: "2rem",        // iPad Pro / Small Laptops
        lg: "3rem",        // Laptops
        xl: "4rem",        // Desktops
        "2xl": "5rem",     // Large Screens
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 🛠️ FIX 2: GOD TIER BREAKPOINTS (Har screen size cover)
      screens: {
        'xs': '475px',     // 🔥 Extra Small devices (older iPhones/Androids)
        '3xl': '1600px',   // 🔥 MacBook Pro 16" & Large Monitors
        '4xl': '2000px',   // 🔥 Ultra-Wide Monitors (Gaming setups)
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          DEFAULT: "hsl(var(--brand-primary))", // #E50914
          glow: "#ff1f2c",
          dark: "#b0060f",
        },
        glass: {
          border: "rgba(255, 255, 255, 0.08)",
          surface: "rgba(255, 255, 255, 0.03)",
          highlight: "rgba(255, 255, 255, 0.1)",
        }
      },
      
      fontFamily: {
        sans: ["var(--font-space)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },

      boxShadow: {
        'brand-glow': '0 0 20px rgba(229, 9, 20, 0.3)',
        'brand-glow-heavy': '0 0 40px rgba(229, 9, 20, 0.5)',
      },

      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'out-circ': 'cubic-bezier(0.075, 0.82, 0.165, 1)',
      },

      animation: {
        "spin-slow": "spin 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards",
        "pulse-fast": "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        }
      },
      
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

export default config;