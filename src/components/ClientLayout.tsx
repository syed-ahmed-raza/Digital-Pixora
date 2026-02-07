"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { ReactLenis } from "lenis/react";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import Preloader from "@/components/ui/Preloader";
import ChatWidget from "@/components/ui/chat/ChatWidget";

// --- LAZY LOAD CURSOR (Desktop Only & Performance Saver) ---
const Cursor = dynamic(() => import("@/components/ui/Cursor"), {
  ssr: false,
  loading: () => null,
});

// Register GSAP Plugin Global
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const lenisRef = useRef<any>(null);

  // --- 1. ROBUST DEVICE DETECTION ---
  useEffect(() => {
    const checkScreen = () => {
      // 1024px is the safe breakpoint for tablets/desktops
      setIsDesktop(window.innerWidth > 1024);
    };

    checkScreen();
    
    // Optimized Resize Listener (Debounced)
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkScreen, 150);
    };
    window.addEventListener("resize", handleResize);

    // Prevent browser jumping to previous scroll position on reload
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // --- 2. GSAP + LENIS SYNC (The Heartbeat) ---
  useEffect(() => {
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    
    // GSAP drives the scroll loop for perfect sync
    gsap.ticker.add(update);
    
    // Disable GSAP lag smoothing to prevent jumpy animations during heavy loads
    gsap.ticker.lagSmoothing(0); 

    return () => gsap.ticker.remove(update);
  }, []);

  // --- 3. PRELOADER & SCROLL LOGIC ---
  useEffect(() => {
    if (isLoading) {
      // Lock scroll while loading
      document.body.style.overflow = "hidden";
      if (lenisRef.current?.lenis) lenisRef.current.lenis.stop();
    } else {
      // Unlock scroll
      document.body.style.overflow = "";
      if (lenisRef.current?.lenis) {
        lenisRef.current.lenis.start();
        lenisRef.current.lenis.scrollTo(0, { immediate: true });
      }

      // 🔥 CRITICAL: Refresh GSAP positions after preloader vanishes
      // This fixes the issue where ScrollTrigger animations fire at wrong positions
      setTimeout(() => {
        lenisRef.current?.lenis?.resize();
        ScrollTrigger.refresh();
      }, 500); 
    }
  }, [isLoading]);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      autoRaf={false} // We handle RAF manually via GSAP ticker
      options={{
        // 💎 BOSS LEVEL SCROLL SETTINGS
        
        // 1. Smoothness (Lower = Smoother/Heavier)
        // Desktop feels silky (0.07), Mobile feels responsive (0.1)
        lerp: isDesktop ? 0.07 : 0.1, 

        // 2. Momentum Duration
        duration: 1.5,

        // 3. Wheel Settings (Desktop Mouse)
        smoothWheel: true,
        wheelMultiplier: 0.9,

        // 4. 🔥 MOBILE FIX - The "App" Feel
        // touchMultiplier: 1.5 ensures swipes feel natural 1:1 with finger
        touchMultiplier: 1.5, 

        // 5. Force Mobile Smoothness
        syncTouch: true,

        // 6. Disable Infinite Scroll (Standard Site Behavior)
        infinite: false,
        
        // 7. Orientation Support
        orientation: "vertical",
        gestureOrientation: "vertical",
      }}
    >
      {/* Cinematic Noise Overlay (Global Texture) */}
      <div
        className="fixed inset-0 z-[50] opacity-[0.04] pointer-events-none mix-blend-overlay select-none"
        style={{
          backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
        }}
      />

      {/* Preloader Layer */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <div className="relative z-[99999]">
            <Preloader onComplete={() => setIsLoading(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Fade-In Wrapper */}
      <div
        className={`relative w-full min-h-screen transition-opacity duration-1000 ease-out ${
          isLoading ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {!isLoading && (
          <>
            {/* Show Cursor ONLY on Desktop to save Mobile Battery/Perf */}
            {isDesktop && <Cursor />}

            {/* ChatWidget wrapper with data-lenis-prevent to stop main scroll inside chat */}
            <div className="relative z-[9999]" data-lenis-prevent>
              <ChatWidget />
            </div>
          </>
        )}

        {/* Main Page Content */}
        <main className="relative z-10 w-full isolate">
          {children}
        </main>

        {/* Global Notifications (Toast) */}
        <Toaster
          position="bottom-center"
          containerStyle={{
            zIndex: 99999,
            bottom: "40px",
          }}
          toastOptions={{
            className: "backdrop-blur-xl border border-white/10 shadow-2xl",
            style: {
              background: "rgba(5, 5, 5, 0.9)",
              color: "#fff",
              fontSize: "13px",
              borderRadius: "50px",
              padding: "10px 24px",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "black" } },
            error: { iconTheme: { primary: "#E50914", secondary: "white" } },
          }}
        />
      </div>
    </ReactLenis>
  );
}