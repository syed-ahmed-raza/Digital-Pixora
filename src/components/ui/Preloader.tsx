"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

const words = ["HELLO", "BONJOUR", "CIAO", "OLÀ", "やあ", "HALLO", "NAMASTE", "DIGITAL PIXORA"];

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // --- 1. SCREEN DIMENSIONS & MOBILE CHECK ---
  useEffect(() => {
    const resize = () => {
        setDimension({ width: window.innerWidth, height: window.innerHeight });
        setIsMobile(window.innerWidth < 768);
    }
    
    // Initial Call
    resize();
    
    window.addEventListener("resize", resize, { passive: true });
    return () => window.removeEventListener("resize", resize);
  }, []);

  // --- 2. WORD CYCLER ---
  useEffect(() => {
    if (index == words.length - 1) return;
    
    const timeout = setTimeout(() => {
      setIndex(index + 1);
    }, index === 0 ? 1000 : 150);

    return () => clearTimeout(timeout);
  }, [index]);

  // --- 3. EXIT TRIGGER & SCROLL LOCK ---
  useEffect(() => {
    // Lock scroll during load
    document.body.style.overflow = "hidden";
    document.body.style.cursor = "wait";

    if (index === words.length - 1) {
      // Last word stays for a bit longer
      const timeout = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [index]);

  // --- 4. CURVE LOGIC (Desktop Only - The "Liquid" Effect) ---
  // Initial: Curve bows downwards slightly
  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height}  L0 0`;
  
  // Target: Curve snaps flat upwards
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`;

  const curve: Variants = {
    initial: { 
        d: initialPath, 
        transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } 
    },
    exit: { 
        d: targetPath, 
        transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 } 
    },
  };

  // --- 5. SLIDE UP LOGIC ---
  const slideUp: Variants = {
    initial: { top: 0 },
    exit: { 
        top: "-100vh", 
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 } 
    }
  };

  return (
    <AnimatePresence 
        mode="wait"
        onExitComplete={() => {
            document.body.style.overflow = ""; // Unlock Scroll
            document.body.style.cursor = "default";
            onComplete(); 
        }}
    >
      {isLoading && (
        <motion.div
          key="preloader"
          variants={slideUp}
          initial="initial"
          exit="exit"
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#050505] text-white"
        >
          {/* --- CONTENT CENTER --- */}
          <div className="relative z-10 flex items-center justify-center">
              {/* RED GLOW SPOT (Hidden on mobile to save GPU) */}
              {!isMobile && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.5 }}
                    className="absolute w-[300px] h-[300px] bg-[#E50914] rounded-full blur-[150px] opacity-20 pointer-events-none"
                  />
              )}
              
              {/* FLASHING WORDS */}
              <motion.p 
                key={index}
                // Mobile: No Blur (Sharp & Fast), Desktop: Blur (Cinematic)
                initial={{ opacity: 0, y: 15, filter: isMobile ? "blur(0px)" : "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: isMobile ? "blur(0px)" : "blur(10px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-4xl md:text-7xl font-black mix-blend-difference z-20 tracking-tighter"
              >
                {words[index]}
                {index === words.length - 1 && <span className="text-[#E50914]">.</span>}
              </motion.p>
          </div>

          {/* --- SVG CURVE CURTAIN (DESKTOP ONLY) --- */}
          {/* This SVG creates the "Liquid Pull" effect at the bottom when sliding up */}
          {!isMobile && dimension.width > 0 && (
            <svg className="absolute top-0 w-full h-[calc(100%+300px)] pointer-events-none fill-[#050505] z-0">
                <motion.path 
                    variants={curve} 
                    initial="initial" 
                    exit="exit" 
                />
            </svg>
          )}
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}