"use client";

import dynamic from "next/dynamic";

// ✅ GREAT MOVE: First section DIRECT import for perfect Sticky Calculation
import WebDevelopment from "@/components/work/WebDevelopment";

// --- LAZY LOAD REST (Performance Optimization) ---
// Loading state mein 'min-h-screen' rakha hai taake layout shift na ho
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
    // 🔥 FIX: 'overflow-visible' is crucial for Sticky Cards.
    // 'max-w-[100vw]' ensures no horizontal scrolling on mobile if animations fly out.
    <section 
        id="work" 
        className="relative w-full max-w-[100vw] z-10 overflow-visible bg-[#050505]"
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