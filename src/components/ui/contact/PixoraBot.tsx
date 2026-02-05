"use client";

import { motion, TargetAndTransition } from "framer-motion";
import { useEffect, useState } from "react";

interface BotProps {
  status: "idle" | "listening" | "loading" | "success" | "error";
  mood: "neutral" | "happy" | "angry" | "focused";
}

export default function PixoraBot({ status, mood }: BotProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 1. ADVANCED EYE TRACKING
  useEffect(() => {
    // SSR Check
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      // Limit movement range to keep it looking realistic
      const x = (e.clientX / window.innerWidth - 0.5) * 20; 
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 2. COLOR LOGIC
  const getColor = () => {
    if (mood === "angry") return "#ef4444"; // Red
    if (mood === "happy") return "#22c55e"; // Green
    if (mood === "focused") return "#8b5cf6"; // Purple
    if (status === "listening") return "#3b82f6"; // Blue
    if (status === "loading") return "#eab308"; // Yellow
    if (status === "error") return "#ef4444"; 
    return "#E50914"; // Default Pixora Red
  };

  // 3. ANIMATION LOGIC
  const getHeadAnimations = (): TargetAndTransition => {
    const baseStyle = {
      borderColor: mood === "focused" ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.1)",
      scale: mood === "focused" ? 1.05 : 1,
    };

    if (mood === "angry") {
        return { ...baseStyle, x: [0, -3, 3, -3, 3, 0], transition: { duration: 0.3 } }; 
    }
    if (mood === "happy") {
        return { ...baseStyle, y: [0, -5, 0], transition: { duration: 0.4, repeat: 1 } }; 
    }
    
    // IDLE STATE (Floating)
    return { 
        ...baseStyle, 
        y: [0, -8, 0], 
        transition: { 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut"
        } 
    }; 
  };

  return (
    <div className="relative z-50 flex flex-col items-center pointer-events-none select-none">
      
      {/* --- HOLOGRAPHIC SCANNER BEAM --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[120px] h-[200px] bg-gradient-to-b from-white/5 to-transparent blur-xl -z-10 opacity-60 pointer-events-none" 
           style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }} />

      {/* --- THE DRONE HEAD --- */}
      <motion.div
        className="relative w-28 h-28 rounded-full bg-[#0a0a0a] border border-white/10 shadow-[0_0_60px_-10px_rgba(0,0,0,0.8)] flex items-center justify-center backdrop-blur-xl"
        animate={getHeadAnimations()}
      >
        {/* Glow Ring */}
        <motion.div 
            className="absolute inset-0 rounded-full opacity-20 blur-lg" 
            animate={{ backgroundColor: getColor() }} 
        />
        
        {/* Tech Detail: Rotating Ring */}
        <svg className="absolute inset-0 w-full h-full rotate-[-90deg] opacity-30" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke={getColor()} strokeWidth="1" strokeDasharray="4 6" className="animate-[spin_10s_linear_infinite]" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
        </svg>

        {/* --- THE EYE (PUPIL) --- */}
        <motion.div
          className="relative w-12 h-12 rounded-full bg-white shadow-[0_0_25px_rgba(255,255,255,0.5)] z-10 overflow-hidden flex items-center justify-center"
          style={{ x: mousePosition.x, y: mousePosition.y }}
          animate={{
            backgroundColor: getColor(),
            height: mood === "angry" ? 6 : (mood === "focused" ? 14 : 48), // Squint logic
            width: 48,
            borderRadius: mood === "angry" ? "4px" : "50%",
          }}
          transition={{ type: "spring", stiffness: 250, damping: 25 }}
        >
            {/* The Lens Reflection */}
            <div className="absolute top-2 right-3 w-3 h-2 bg-white rounded-full opacity-90 blur-[1px]" />
            
            {/* Pupil Center */}
            <div className="w-4 h-4 bg-black rounded-full border border-white/20 opacity-90" />
            
            {/* Scanning Line (Idle Animation) */}
            {status === "idle" && mood === "neutral" && (
                <motion.div 
                    className="absolute top-0 w-full h-[2px] bg-white/50 blur-[1px]"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
            )}
        </motion.div>
      </motion.div>

      {/* --- STATUS BADGE --- */}
      <motion.div 
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 15 }}
        className="absolute -bottom-10 bg-[#0A0A0A]/90 border border-white/10 px-4 py-2 rounded-full shadow-xl flex items-center gap-3 backdrop-blur-md"
      >
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: getColor() }}></span>
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: getColor() }}></span>
        </span>
        <span className="text-[10px] font-bold text-white/90 uppercase tracking-[0.2em] whitespace-nowrap font-mono">
            {mood === "angry" ? "INVALID INPUT" :
             mood === "happy" ? "DATA VERIFIED" :
             mood === "focused" ? "ANALYZING..." :
             status === "listening" ? "VOICE UPLINK..." :
             status === "loading" ? "ENCRYPTING..." : "SENTINEL ONLINE"}
        </span>
      </motion.div>
    </div>
  );
}