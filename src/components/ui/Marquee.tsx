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
  
  // 🔥 TUNING: Higher smoothing for less jitter on mobile
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 300 // Slightly reduced stiffness for buttery smooth feel
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

    // 🏎️ Scroll Acceleration Logic
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden flex flex-nowrap whitespace-nowrap relative z-20 w-full select-none pointer-events-none">
      <motion.div 
        className="flex flex-nowrap gap-0 px-0 will-change-transform" 
        style={{ x }}
      >
        {/* 4 Copies for Safety on Ultra-Wide Screens */}
        <div className="flex flex-nowrap shrink-0">{children}</div>
        <div className="flex flex-nowrap shrink-0">{children}</div>
        <div className="flex flex-nowrap shrink-0">{children}</div>
        <div className="flex flex-nowrap shrink-0">{children}</div>
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="relative py-16 md:py-32 overflow-hidden z-10 bg-[#050505] border-y border-white/5 flex flex-col justify-center transform-gpu">
      
      {/* 1. SOFT FADE EDGES (Vignette) */}
      <div className="absolute top-0 left-0 w-20 md:w-48 h-full bg-gradient-to-r from-[#050505] to-transparent z-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-20 md:w-48 h-full bg-gradient-to-l from-[#050505] to-transparent z-30 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6 md:gap-16">
        
        {/* ROW 1: Moves Left */}
        <div className="relative opacity-80 hover:opacity-100 transition-opacity duration-500 mix-blend-lighten">
            <ParallaxText baseVelocity={-2}> 
                <div className="flex items-center gap-0">
                    {content.map((item, i) => (
                        <div key={i} className="flex items-center">
                             <span 
                                className={`
                                    font-bold tracking-tighter whitespace-nowrap px-6 md:px-12
                                    ${item.type === 'primary' ? 'text-white' : ''}
                                    /* 🔥 BOSS LEVEL: Hollow Text Effect for Secondary Items */
                                    ${item.type === 'secondary' ? 'text-transparent bg-clip-text stroke-white text-stroke-1 md:text-stroke-2 font-serif italic opacity-50' : ''}
                                    ${item.type === 'separator' ? 'text-[#E50914] text-[4vw] md:text-[3rem]' : ''}
                                `}
                                style={{ 
                                    fontSize: "clamp(3rem, 9vw, 8rem)", // Prevents tiny text on mobile, huge on desktop
                                    WebkitTextStroke: item.type === 'secondary' ? "1px rgba(255,255,255,0.3)" : "unset"
                                }}
                            >
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </ParallaxText>
        </div>

        {/* ROW 2: Moves Right */}
        <div className="relative opacity-60 hover:opacity-100 transition-opacity duration-500 mix-blend-lighten"> 
            <ParallaxText baseVelocity={2}>
                <div className="flex items-center gap-0">
                    {content.map((item, i) => (
                        <div key={i + "_rev"} className="flex items-center">
                             <span 
                                className={`
                                    font-bold tracking-tighter whitespace-nowrap px-6 md:px-12
                                    ${item.type === 'primary' ? 'text-white' : ''}
                                    ${item.type === 'secondary' ? 'text-transparent bg-clip-text font-serif italic opacity-50' : ''}
                                    ${item.type === 'separator' ? 'text-[#E50914] text-[4vw] md:text-[3rem]' : ''}
                                `}
                                style={{ 
                                    fontSize: "clamp(3rem, 9vw, 8rem)",
                                    WebkitTextStroke: item.type === 'secondary' ? "1px rgba(255,255,255,0.3)" : "unset"
                                }}
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