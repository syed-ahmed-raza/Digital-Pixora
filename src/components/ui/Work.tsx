"use client";

import dynamic from "next/dynamic";

// ✅ FIX: WebDevelopment ko DIRECT import kiya hai.
// Kyunke isme "Sticky Cards" hain. Agar ye lazy load hoga to ScrollTrigger height 
// sahi calculate nahi kar payega aur cards atak jayenge.
import WebDevelopment from "@/components/work/WebDevelopment";

// --- OTHERS CAN REMAIN DYNAMIC (Performance ke liye) ---
// Inko lazy load rakha hai kyunke ye scroll ke baad aaty hain.
const VisualDesign = dynamic(() => import("@/components/work/VisualDesign"), { 
  ssr: true,
  loading: () => <div className="min-h-screen w-full bg-[#050505]" /> 
});

const MotionDesign = dynamic(() => import("@/components/work/MotionDesign"), { 
  ssr: true,
  loading: () => <div className="min-h-screen w-full bg-[#050505]" />
});

const AiEngineering = dynamic(() => import("@/components/work/AiEngineering"), { 
  ssr: true,
  loading: () => <div className="min-h-screen w-full bg-[#050505]" />
});

export default function Work() {
  return (
    // overflow-visible zaroori hai taake sticky elements scroll ko rok sakein
    <section id="work" className="relative w-full z-10 overflow-visible bg-[#050505]">
      
      {/* 1. WEB DEV (The Flagship Stacking Section - Loaded Instantly) */}
      <WebDevelopment />
      
      {/* 2. VISUAL DESIGN */}
      <VisualDesign />

      {/* 3. MOTION DESIGN */}
      <MotionDesign/>

      {/* 4. AI ENGINEERING */}
      <AiEngineering/>

    </section>
  );
}