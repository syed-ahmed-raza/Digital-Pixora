"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from 'next/dynamic';
import { ReactLenis } from 'lenis/react';
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import 'lenis/dist/lenis.css';

import Preloader from "@/components/ui/Preloader"; 
import ChatWidget from "@/components/ui/chat/ChatWidget"; 

// Lazy load Cursor (Desktop Only & Reduced Load)
const Cursor = dynamic(() => import("@/components/ui/Cursor"), { 
  ssr: false,
  loading: () => null 
});

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true); 
  const [isDesktop, setIsDesktop] = useState(false);
  const lenisRef = useRef<any>(null);

  // --- 1. ROBUST DEVICE DETECTION ---
  useEffect(() => {
    const checkScreen = () => {
        setIsDesktop(window.innerWidth > 1024);
    };
    checkScreen();
    
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(checkScreen, 200); 
    };
    
    window.addEventListener("resize", handleResize);
    
    // Prevent browser seeking to previous scroll position on reload
    if (typeof window !== "undefined" && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(resizeTimer);
    };
  }, []);

  // --- 2. GSAP + LENIS SYNC (THE GLUE) ---
  useEffect(() => {
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    // 🔥 CRITICAL: Sync ScrollTrigger with Lenis
    // Iske bina Sticky elements vibrate karenge.
    const syncScroll = () => ScrollTrigger.update();

    // Bind GSAP Ticker
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0); 

    // Bind ScrollTrigger Update
    // Hum wait karte hain lenis instance ready hone ka
    const interval = setInterval(() => {
        if (lenisRef.current?.lenis) {
            lenisRef.current.lenis.on('scroll', syncScroll);
            clearInterval(interval);
        }
    }, 100);

    return () => {
      gsap.ticker.remove(update);
      lenisRef.current?.lenis?.off('scroll', syncScroll);
      clearInterval(interval);
    };
  }, []);

  // --- 3. PRELOADER & SCROLL LOGIC ---
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
      if (lenisRef.current?.lenis) lenisRef.current.lenis.stop();
    } else {
      document.body.style.overflow = "";
      
      if (lenisRef.current?.lenis) {
          lenisRef.current.lenis.start();
          lenisRef.current.lenis.scrollTo(0, { immediate: true });
      }

      // Force Refresh after Layout Shift to ensure Sticky elements work
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 1000); 
    }
  }, [isLoading]);

  return (
    <ReactLenis 
      ref={lenisRef}
      root 
      autoRaf={false} // We drive via GSAP ticker
      options={{ 
        // 💎 GOLD TIER SCROLL SETTINGS
        lerp: 0.07, 
        duration: 1.5, 
        smoothWheel: true,
        wheelMultiplier: 0.9, 
        
        // 🔥 MOBILE FIX
        touchMultiplier: isDesktop ? 1 : 1.5, 
        syncTouch: true,
        infinite: false,
      }}
    >
      
      {/* Cinematic Noise Overlay */}
      <div 
        className="fixed inset-0 z-[50] opacity-[0.04] pointer-events-none mix-blend-overlay select-none"
        style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}
      />

      {/* Preloader */}
      <AnimatePresence mode="wait">
        {isLoading && (
            <div className="relative z-[99999]">
              <Preloader onComplete={() => setIsLoading(false)} />
            </div>
        )}
      </AnimatePresence>

      {/* Main Content Fade-In */}
      <div className={`relative w-full min-h-screen transition-opacity duration-1000 ease-out ${isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        
        {!isLoading && (
            <>
                {isDesktop && <Cursor />}
                
                {/* 🔥 CRITICAL FIX: data-lenis-prevent */}
                <div className="relative z-[9999]" data-lenis-prevent>
                    <ChatWidget />
                </div>
            </>
        )}

        <main className="relative z-10 w-full">
            {children}
        </main>

        {/* Global Notifications */}
        <Toaster 
            position="bottom-center" 
            containerStyle={{ 
                zIndex: 99999,
                bottom: '40px' 
            }} 
            toastOptions={{
                className: 'backdrop-blur-xl border border-white/10 shadow-2xl',
                style: {
                    background: 'rgba(5, 5, 5, 0.9)',
                    color: '#fff',
                    fontSize: '13px',
                    borderRadius: '50px',
                    padding: '10px 24px',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)'
                },
                success: { iconTheme: { primary: '#22c55e', secondary: 'black' } },
                error: { iconTheme: { primary: '#E50914', secondary: 'white' } },
            }} 
        />
      </div>

    </ReactLenis>
  );
}