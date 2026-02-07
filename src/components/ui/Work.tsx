"use client";

import dynamic from "next/dynamic";

// ✅ GREAT MOVE: First section DIRECT import for perfect Sticky Calculation
import WebDevelopment from "@/components/work/WebDevelopment";

// --- REUSABLE LOADING SKELETON (Premium Feel) ---
const SectionLoader = () => (
  <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center">
    <div className="w-full h-full animate-pulse opacity-10 bg-white/5" />
  </div>
);

// --- LAZY LOAD REST (Performance Optimization) ---
const VisualDesign = dynamic(() => import("@/components/work/VisualDesign"), { 
  ssr: true,
  loading: () => <SectionLoader /> 
});

const MotionDesign = dynamic(() => import("@/components/work/MotionDesign"), { 
  ssr: true,
  loading: () => <SectionLoader />
});

const AiEngineering = dynamic(() => import("@/components/work/AiEngineering"), { 
  ssr: true,
  loading: () => <SectionLoader />
});

export default function Work() {
  return (
    // 🔥 BOSS LEVEL FIX: 
    // 1. 'overflow-x-clip' (or hidden) prevents horizontal scrollbars from flying animations
    // 2. 'overflow-y-visible' allows Sticky Position to work perfectly
    <section 
        id="work" 
        className="relative w-full max-w-full z-10 bg-[#050505] overflow-x-hidden overflow-y-visible"
    >
      
      {/* 1. WEB DEV (Sticky Stack - Loaded Instantly) */}
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