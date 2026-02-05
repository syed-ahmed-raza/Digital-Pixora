"use client";

import { useRef, useEffect, useState } from "react";
import { 
  motion, 
  useMotionValue, 
  useAnimationFrame, 
  useTransform 
} from "framer-motion";
import { wrap } from "@motionone/utils";

const content = [
  { text: "Digital Alchemy", type: "primary" },
  { text: "•", type: "separator" },
  { text: "System Architecture", type: "secondary" },
  { text: "•", type: "separator" },
  { text: "Pixel Perfection", type: "primary" },
  { text: "•", type: "separator" },
  { text: "User Obsession", type: "secondary" },
  { text: "•", type: "separator" },
  { text: "Next.js Native", type: "primary" },
  { text: "•", type: "separator" },
  { text: "Future Ready", type: "secondary" },
  { text: "•", type: "separator" },
];

interface ParallaxProps {
  children: React.ReactNode;
  baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
  const baseX = useMotionValue(0);
  
  // Logic: -25% se -50% ka wrap loop (kisi bhi screen size par nahi tootega)
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);

  const directionFactor = useRef<number>(1);
  
  useAnimationFrame((t, delta) => {
    // ⚡ Lag-proofing for high refresh rate monitors
    const safeDelta = Math.min(delta, 20); 
    let moveBy = directionFactor.current * baseVelocity * (safeDelta / 1000);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden flex flex-nowrap whitespace-nowrap relative z-20">
      <motion.div 
        className="flex flex-nowrap gap-0 px-0"
        style={{ x }}
      >
        {/* 4 Copies for truly infinite feel */}
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden z-10 bg-[#050505] border-y border-white/5 flex flex-col justify-center">
      
      {/* 1. SOFT FADE EDGES */}
      <div className="absolute top-0 left-0 w-20 md:w-40 h-full bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-20 md:w-40 h-full bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />

      {/* Note: Noise removed because global noise is active in ClientLayout */}

      <div className="relative z-10 flex flex-col gap-6 md:gap-12 select-none">
        
        {/* ROW 1: Moves Left */}
        <div className="relative opacity-90 hover:opacity-100 transition-opacity duration-500">
            <ParallaxText baseVelocity={-2}> 
                <div className="flex items-center gap-0">
                    {content.map((item, i) => (
                        <span 
                            key={i}
                            className={`
                                text-[10vw] md:text-[6rem] font-medium tracking-tight whitespace-nowrap px-4 md:px-8
                                ${item.type === 'primary' ? 'text-white' : ''}
                                ${item.type === 'secondary' ? 'text-white/40 font-serif italic' : ''}
                                ${item.type === 'separator' ? 'text-[#E50914] text-[6vw] md:text-[3rem]' : ''}
                            `}
                        >
                            {item.text}
                        </span>
                    ))}
                </div>
            </ParallaxText>
        </div>

        {/* ROW 2: Moves Right */}
        <div className="relative opacity-50 hover:opacity-100 transition-opacity duration-500"> 
            <ParallaxText baseVelocity={2}>
                <div className="flex items-center gap-0">
                    {content.map((item, i) => (
                        <span 
                            key={i + "_rev"}
                            className={`
                                text-[10vw] md:text-[6rem] font-medium tracking-tight whitespace-nowrap px-4 md:px-8
                                ${item.type === 'primary' ? 'text-white' : ''}
                                ${item.type === 'secondary' ? 'text-white/40 font-serif italic' : ''}
                                ${item.type === 'separator' ? 'text-[#E50914] text-[6vw] md:text-[3rem]' : ''}
                            `}
                        >
                            {item.text}
                        </span>
                    ))}
                </div>
            </ParallaxText>
        </div>

      </div>
    </section>
  );
}