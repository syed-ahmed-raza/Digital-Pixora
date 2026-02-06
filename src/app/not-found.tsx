"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Terminal, AlertTriangle } from "lucide-react";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // --- MOUSE PARALLAX SETUP ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    // Calculate normalized mouse position (-0.5 to 0.5)
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const springConfig = { stiffness: 100, damping: 30 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);

  // Parallax for the giant 404 text
  const textX = useTransform(xSpring, [-0.5, 0.5], [40, -40]);
  const textY = useTransform(ySpring, [-0.5, 0.5], [40, -40]);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        
        className="h-[100dvh] w-full bg-[#020202] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden cursor-default selection:bg-[#E50914] selection:text-white"
    >
      <style jsx global>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
        .scanline-404 {
          width: 100%; height: 100px;
          background: linear-gradient(to bottom, transparent, rgba(229, 9, 20, 0.1), transparent);
          animation: scanline 8s ease-in-out infinite;
          position: absolute;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 20;
        }
      `}</style>

      {/* --- 1. ATMOSPHERE LAYERS --- */}
      <div className="scanline-404" />
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-30 mix-blend-overlay"></div>
      
      {/* Red Glow Spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#E50914] opacity-[0.04] blur-[100px] md:blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* --- 2. GIANT PARALLAX 404 (Background Layer) --- */}
      <motion.h1 
        style={{ x: textX, y: textY }}
        // Clamp ensures text scales but never breaks layout
        className="text-[clamp(12rem,30vw,35rem)] font-black text-white/[0.02] leading-none select-none absolute z-0 tracking-tighter pointer-events-none"
      >
        404
      </motion.h1>
      
      {/* --- 3. MAIN CONTENT (Foreground) --- */}
      <div className="relative z-40 flex flex-col items-center max-w-[90%] md:max-w-2xl">
        
        {/* Status Badge */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex items-center gap-2 px-3 py-1 bg-[#E50914]/10 border border-[#E50914]/20 rounded-lg backdrop-blur-md"
        >
            <AlertTriangle className="w-3 h-3 text-[#E50914]" />
            <span className="text-[#E50914] text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
                Error Protocol: 0x404
            </span>
        </motion.div>

        {/* Glitching Title */}
        <motion.h2 
            animate={{ 
                x: [-1, 2, -1, 0],
                textShadow: [
                    "2px 0px 0px rgba(229,9,20,0.5), -2px 0px 0px rgba(0,255,255,0.3)",
                    "0px 0px 0px rgba(229,9,20,0.5), 0px 0px 0px rgba(0,255,255,0.3)"
                ]
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6"
        >
            System <br/> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent">Failure.</span>
        </motion.h2>

        <p className="text-white/50 text-sm md:text-lg max-w-md mx-auto mb-12 leading-relaxed font-light text-balance">
            The digital coordinates you requested do not exist in this sector. The data packet has been lost in the void.
            <br/> 
            <span className="text-white/20 font-mono text-xs mt-4 block uppercase tracking-widest">
                /// REASON: OBJECT_NOT_FOUND
            </span>
        </p>
        
        {/* --- PREMIUM BUTTON (Return to Base) --- */}
        <Link href="/" onClick={triggerHaptic}>
            <button className="group relative px-10 py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-[11px] overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#E50914] transition-colors duration-300">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Return to Base
                </span>
                {/* Sheen Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            </button>
        </Link>
      </div>

      {/* --- 4. TERMINAL FOOTER DECORATION --- */}
      {/* Hidden on small mobile to avoid clutter */}
      <div className="absolute bottom-8 w-full px-8 hidden md:flex justify-between items-end opacity-30 pointer-events-none z-30">
          <div className="flex items-center gap-4 text-[10px] font-mono text-white tracking-widest uppercase">
              <Terminal className="w-3 h-3" />
              <span>Initializing Reboot Sequence...</span>
          </div>
          <div className="flex flex-col items-end gap-1">
              <div className="h-[1px] w-24 bg-white/50 mb-2" />
              <div className="text-[10px] font-mono text-white tracking-[0.2em] uppercase">
                  Sys_Status: Critical
              </div>
          </div>
      </div>

    </div>
  );
}