"use client";

import { useRef } from "react";
import { 
  motion, 
  useScroll, 
  useSpring, 
  useTransform, 
  useMotionValue, 
  useVelocity, 
  useAnimationFrame 
} from "framer-motion";

// --- 🛠️ UTILITY: Wrap Function (No extra dependency needed) ---
// Logic: Range ke andar value ko loop karta hai (0% -> -100% -> 0%)
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

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
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  
  // 🚀 VELOCITY FACTOR: Jab scroll karein, speed badh jaye
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  // Loop logic: -25% se -50% (assuming 4 copies)
  // Fix: Wrap 0% to -25% works better for seamless looping of 4 items
  const x = useTransform(baseX, (v) => `${wrap(0, -25, v)}%`);

  const directionFactor = useRef<number>(1);
  
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // 🏎️ Scroll karne par acceleration add karna
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden flex flex-nowrap whitespace-nowrap relative z-20">
      <motion.div 
        className="flex flex-nowrap gap-0 px-0"
        style={{ x }}
      >
        {/* 4 Copies required for seamless loop logic (0 to -25%) */}
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
    <section className="relative py-12 md:py-24 overflow-hidden z-10 bg-[#050505] border-y border-white/5 flex flex-col justify-center">
      
      {/* 1. SOFT FADE EDGES (Vignette) */}
      <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4 md:gap-10 select-none cursor-default">
        
        {/* ROW 1: Moves Left */}
        {/* Hover Effect: Thoda bright ho jaye jab mouse upar aye */}
        <div className="relative opacity-60 hover:opacity-100 transition-opacity duration-500 will-change-transform">
            <ParallaxText baseVelocity={-1.5}> 
                <div className="flex items-center gap-0">
                    {content.map((item, i) => (
                        <span 
                            key={i}
                            className={`
                                text-[10vw] md:text-[5rem] lg:text-[6rem] font-medium tracking-tight whitespace-nowrap px-3 md:px-6
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
        <div className="relative opacity-40 hover:opacity-100 transition-opacity duration-500 will-change-transform"> 
            <ParallaxText baseVelocity={1.5}>
                <div className="flex items-center gap-0">
                    {content.map((item, i) => (
                        <span 
                            key={i + "_rev"}
                            className={`
                                text-[10vw] md:text-[5rem] lg:text-[6rem] font-medium tracking-tight whitespace-nowrap px-3 md:px-6
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