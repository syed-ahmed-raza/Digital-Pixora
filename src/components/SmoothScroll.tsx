"use client";

import { ReactLenis } from 'lenis/react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // 1. UPDATE SCROLLTRIGGER ON SCROLL
    // Jab bhi Lenis scroll kare, GSAP ko batao ke "Update ho jao"
    // Yeh Sticky elements ke liye bohot zaroori hai.
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    // 2. SYNC WITH GSAP TICKER
    // GSAP ki clock aur Lenis ki clock ko ek kar diya.
    // Result: Zero Lag, 120Hz Smoothness.
    gsap.ticker.add(update);

    // Disable GSAP's native lag smoothing (conflict prevent karne ke liye)
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <ReactLenis 
      ref={lenisRef}
      root 
      autoRaf={false} // 🔥 CRITICAL: Hum GSAP ke ticker se drive kar rahe hain, isliye auto off kiya.
      options={{ 
        // 💎 LUXURY SMOOTHNESS SETTINGS
        lerp: 0.06,           // 0.06 = Creamy Smooth
        duration: 1.2,        
        smoothWheel: true,    
        wheelMultiplier: 1,   
        touchMultiplier: 2,   // Mobile Swipe thoda responsive
        infinite: false,
        syncTouch: true,      // Mobile par native feel maintain rakhta hai
      }}
    >
      {children}
    </ReactLenis>
  );
}