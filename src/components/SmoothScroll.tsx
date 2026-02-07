"use client";

import { ReactLenis } from 'lenis/react';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    // --- 1. SYNC GSAP SCROLLTRIGGER ---
    // Jab Lenis scroll kare, ScrollTrigger ko update karo.
    // Yeh Sticky Cards ke liye CRITICAL hai.
    lenis.on('scroll', ScrollTrigger.update);

    // --- 2. SYNC WITH GSAP TICKER ---
    // High-performance rendering loop (120Hz capable)
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);

    // Disable GSAP's internal lag smoothing to allow Lenis to take full control
    gsap.ticker.lagSmoothing(0);

    // --- 3. RESIZE HANDLING (Mobile Orientation Fix) ---
    const handleResize = () => {
        lenis.resize();
        ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener('resize', handleResize);
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, []);

  return (
    <ReactLenis 
      ref={lenisRef}
      root 
      autoRaf={false} // Manual ticker control via GSAP
      options={{ 
        // 💎 GOLD TIER SMOOTHNESS
        lerp: 0.07,           // 0.07 = Perfect balance of weight and snappiness
        duration: 1.2,        // Momentum duration
        smoothWheel: true,    
        wheelMultiplier: 1,   
        
        // 🔥 MOBILE OPTIMIZATION
        touchMultiplier: 1.5, // 2 was too fast, 1.5 is natural feeling
        infinite: false,
        syncTouch: true,      // Ensures touch scrolling feels 1:1 tied to finger
      }}
    >
      {children}
    </ReactLenis>
  );
}