"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { ReactLenis } from 'lenis/react';
import { Toaster } from "react-hot-toast";
import 'lenis/dist/lenis.css';

// ✅ CORE IMPORTS
import Preloader from "@/components/ui/Preloader"; 
import ChatWidget from "@/components/ui/chat/ChatWidget"; 

// --- LAZY LOAD ASSETS (Performance Boosters) ---
const Cursor = dynamic(() => import("@/components/ui/Cursor"), { 
  ssr: false,
  loading: () => null 
});


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true); 
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // 🖥️ DEVICE DETECTION
    const checkScreen = () => setIsDesktop(window.innerWidth > 1024);
    checkScreen();
    
    // Resize Listener
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(checkScreen, 100);
    };
    
    window.addEventListener("resize", handleResize);

    // 📜 SCROLL RESET
    if (typeof window !== "undefined" && 'scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔒 LOCK BODY SCROLL DURING LOADING
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      window.scrollTo(0, 0); 
    }
  }, [isLoading]);

  return (
    // ⚡ LENIS SETTINGS: "Makkhan" Feel (Lerp 0.05 is the sweet spot)
    <ReactLenis root options={{ 
        lerp: isDesktop ? 0.05 : 0.1, 
        duration: 1.2, 
        smoothWheel: true,
        touchMultiplier: 1.5, 
        wheelMultiplier: 1.2, 
    }}>
      
      {/* --- LAYER 1: CINEMATIC GRAIN --- */}
      <div 
        className="fixed inset-0 z-[50] opacity-[0.035] pointer-events-none mix-blend-overlay select-none"
        style={{
             backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`, 
             backgroundRepeat: 'repeat',
        }}
      />

      {/* --- LAYER 2: PRELOADER --- */}
      <div className="relative z-[99999]">
        <Preloader onComplete={() => setIsLoading(false)} />
      </div>

      {/* --- LAYER 3: DYNAMIC UI --- */}
      {!isLoading && (
        <>
            {isDesktop && <Cursor />}
            <div className="relative z-[9999]">
               <ChatWidget />
            </div>
        </>
      )}

      {/* --- LAYER 4: MAIN CONTENT --- */}
      <main className="relative z-10 w-full min-h-screen bg-transparent">
        {children}
      </main>

      {/* --- LAYER 5: TOASTER --- */}
      <Toaster 
        position="bottom-center" 
        toastOptions={{
            className: 'backdrop-blur-md border border-white/10',
            style: {
                background: 'rgba(5, 5, 5, 0.85)',
                color: '#fff',
                fontSize: '12px',
                borderRadius: '50px',
                padding: '8px 16px',
            },
            success: {
                iconTheme: { primary: '#22c55e', secondary: 'black' },
            },
            error: {
                iconTheme: { primary: '#E50914', secondary: 'white' },
            },
        }} 
      />

    </ReactLenis>
  );
}