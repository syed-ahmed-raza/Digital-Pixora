"use client";

import { ReactLenis } from 'lenis/react';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{ 
        // 💎 LUXURY SMOOTHNESS SETTINGS
        lerp: 0.06,           // 0.05 - 0.08: Yehi wo "Luxury" feel deta hai
        duration: 1.2,        // Scroll slide hone ka waqt
        smoothWheel: true,    
        wheelMultiplier: 1,   
        touchMultiplier: 2,   // Mobile par smooth scroll behtar karega
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}