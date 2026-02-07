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

// --- 🛠️ UTILITY: Wrap Function ---
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
  
  // 🚀 VELOCITY FACTOR
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  // Loop logic: -25% wrap ensures seamless loop for 4 copies
  const x = useTransform(baseX, (v) => `${wrap(0, -25, v)}%`);

  const directionFactor = useRef<number>(1);
  
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // 🏎️ Scroll Acceleration
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden flex flex-nowrap whitespace-nowrap relative z-20 w-full">
      <motion.div 
        className="flex flex-nowrap gap-0 px-0 will-change-transform" // Optimized for GPU
        style={{ x }}
      >
        {/* 4 Copies for Safety on Ultra-Wide Screens */}
        <div className="flex flex-nowrap">{children}</div>
        <div className="flex flex-nowrap">{children}</div>
        <div className="flex flex-nowrap">{children}</div>
        <div className="flex flex-nowrap">{children}</div>
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="relative py-12 md:py-24 overflow-hidden z-10 bg-[#050505] border-y border-white/5 flex flex-col justify-center">
      
      {/* 1. SOFT FADE EDGES (Vignette) */}
      <div className="absolute top-0 left-0 w-12 md:w-32 h-full bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-12 md:w-32 h-full bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4 md:gap-12 select-none cursor-default">
        
        {/* ROW 1: Moves Left */}
        <div className="relative opacity-70 hover:opacity-100 transition-opacity duration-500">
            <ParallaxText baseVelocity={-2}> 
                <div className="flex items-center gap-0">
                    {content.map((item, i) => (
                        <div key={i} className="flex items-center">
                             <span 
                                className={`
                                    text-[12vw] sm:text-[8vw] md:text-[5rem] lg:text-[6rem] font-medium tracking-tight whitespace-nowrap px-4 md:px-8
                                    ${item.type === 'primary' ? 'text-white' : ''}
                                    ${item.type === 'secondary' ? 'text-white/40 font-serif italic' : ''}
                                    ${item.type === 'separator' ? 'text-[#E50914] text-[6vw] md:text-[3rem]' : ''}
                                `}
                            >
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </ParallaxText>
        </div>

        {/* ROW 2: Moves Right */}
        <div className="relative opacity-50 hover:opacity-100 transition-opacity duration-500"> 
            <ParallaxText baseVelocity={2}>
                <div className="flex items-center gap-0">
                    {content.map((item, i) => (
                        <div key={i + "_rev"} className="flex items-center">
                             <span 
                                className={`
                                    text-[12vw] sm:text-[8vw] md:text-[5rem] lg:text-[6rem] font-medium tracking-tight whitespace-nowrap px-4 md:px-8
                                    ${item.type === 'primary' ? 'text-white' : ''}
                                    ${item.type === 'secondary' ? 'text-white/40 font-serif italic' : ''}
                                    ${item.type === 'separator' ? 'text-[#E50914] text-[6vw] md:text-[3rem]' : ''}
                                `}
                            >
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </ParallaxText>
        </div>

      </div>
    </section>
  );
}