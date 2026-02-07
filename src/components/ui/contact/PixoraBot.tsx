"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BotProps {
  status: "idle" | "listening" | "loading" | "success" | "error";
  mood: "neutral" | "happy" | "angry" | "focused";
  focusedField?: string | null;
}

export default function PixoraBot({ status, mood, focusedField }: BotProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // --- 1. CUTE TRACKING LOGIC (Curiosity Engine) ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (focusedField) return;

      // Soft range limit (Bot shouldn't strain its neck)
      const x = (e.clientX / window.innerWidth - 0.5) * 15; 
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      setMousePosition({ x, y });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [focusedField]);

  // --- 2. INPUT READING MODE (Concentration) ---
  useEffect(() => {
    if (focusedField) {
        // Look down at the form like it's reading
        const targetY = focusedField === "brief" ? 10 : 5;
        setMousePosition({ x: 0, y: targetY }); 
    } else {
        setMousePosition({ x: 0, y: 0 }); 
    }
  }, [focusedField]);

  // --- 3. LIFELIKE BLINKING (Random Intervals) ---
  useEffect(() => {
    const blinkLoop = () => {
        const nextBlink = Math.random() * 3000 + 2000; // Blinks every 2-5s
        setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
            blinkLoop();
        }, nextBlink);
    };
    blinkLoop();
  }, []);

  // --- 4. EMOTION PALETTE ---
  const getColor = () => {
    if (status === "error" || mood === "angry") return "#ff4d4d"; // Red
    if (status === "success" || mood === "happy") return "#2ecc71"; // Green
    if (status === "listening") return "#3498db"; // Blue
    if (status === "loading") return "#f1c40f"; // Yellow
    if (mood === "focused") return "#9b59b6"; // Purple
    return "#E50914"; // Pixora Red (Default)
  };

  // --- 5. EYE EXPRESSIONS (The Soul) ---
  const getEyeHeight = () => {
      if (isBlinking) return 2; // Closed
      if (mood === "happy" || status === "success") return 35; // Wide Happy Eyes ^_^
      if (mood === "focused") return 25; // Squinting to read
      if (status === "error") return 12; // Sad squint >_<
      if (status === "listening") return 32; // Listening attentively
      return 34; // Normal cute round eye
  };

  const getEyeWidth = () => {
      if (mood === "happy" || status === "success") return 40; 
      if (status === "error") return 32;
      return 34;
  };

  // Calculate Head Tilt based on mouse X (Curiosity Tilt)
  const headTilt = mousePosition.x * 0.5;

  return (
    <div className="relative z-50 flex flex-col items-center pointer-events-none select-none">
      
      {/* --- CUTE AURORA GLOW (Behind) --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[80px] h-[80px] bg-white opacity-20 blur-[50px] -z-10 transition-all duration-500" 
           style={{ backgroundColor: getColor() }} />

      {/* --- THE HEAD (Body) --- */}
      <motion.div
        className="relative w-24 h-24 rounded-[2.5rem] bg-[#050505] border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center backdrop-blur-2xl"
        animate={{
            y: [0, -6, 0], // Gentle floating breath
            rotate: headTilt, // Curiosity Tilt
            borderColor: status === "error" ? "rgba(255, 77, 77, 0.4)" : "rgba(255, 255, 255, 0.1)",
            scale: status === "success" ? [1, 1.1, 1] : 1, // Victory Bounce!
        }}
        transition={{ 
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { type: "spring", stiffness: 100, damping: 15 },
            scale: { duration: 0.4, ease: "backOut" }
        }}
      >
        {/* --- CHEEKS (Blush Effect) --- */}
        {(mood === "happy" || status === "success" || status === "listening") && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="absolute bottom-6 left-4 w-3 h-2 bg-[#ff9ea8] blur-[4px] rounded-full z-20" />
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="absolute bottom-6 right-4 w-3 h-2 bg-[#ff9ea8] blur-[4px] rounded-full z-20" />
            </>
        )}

        {/* --- MAIN SCREEN (Face) --- */}
        <motion.div
          className="relative w-16 h-14 rounded-[1.5rem] bg-black shadow-inner overflow-hidden flex items-center justify-center border border-white/5"
        >
            {/* The Eye (Pupil) */}
            <motion.div
                className="relative rounded-full z-10 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                style={{ x: mousePosition.x, y: mousePosition.y }} 
                animate={{
                    backgroundColor: getColor(),
                    height: getEyeHeight(),
                    width: getEyeWidth(),
                    // Squishy physics for cuteness
                    borderRadius: isBlinking ? "20px" : "50%", 
                }}
                transition={{ 
                    type: "spring", stiffness: 300, damping: 20, 
                    layout: { duration: 0.15 } 
                }}
            >
                {/* Sparkle in Eye (Anime Style) */}
                {!isBlinking && (
                    <div className="absolute top-1.5 right-2 w-2 h-1 bg-white rounded-full opacity-80 blur-[0.5px]" />
                )}
                
                {/* Voice Animation (Wiggle when listening) */}
                {status === "listening" && (
                    <motion.div 
                        className="absolute inset-0 bg-white/20 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                    />
                )}
            </motion.div>

            {/* Glass Glint (Shiny Face) */}
            <div className="absolute top-2 left-3 w-10 h-6 bg-gradient-to-b from-white/10 to-transparent rounded-full -rotate-12 pointer-events-none" />
        </motion.div>

        {/* --- EARS (Antennae) --- */}
        <motion.div 
            className="absolute -left-1 top-8 w-2 h-6 bg-[#1a1a1a] rounded-l-full border-l border-white/10" 
            animate={{ height: status === "listening" ? [6, 12, 6] : 6 }} // Ears perk up!
            transition={{ repeat: Infinity, duration: 0.5 }}
        />
        <motion.div 
            className="absolute -right-1 top-8 w-2 h-6 bg-[#1a1a1a] rounded-r-full border-r border-white/10" 
            animate={{ height: status === "listening" ? [6, 12, 6] : 6 }} 
            transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
        />

      </motion.div>

      {/* --- CUTE STATUS BUBBLE --- */}
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.8, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 10 }}
        className="absolute -bottom-10 bg-[#0A0A0A]/90 border border-white/10 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 backdrop-blur-md"
      >
        <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: getColor() }}></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: getColor() }}></span>
        </span>
        
        <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest font-mono" style={{ color: getColor() }}>
            {status === "error" ? "ERROR..." :
             status === "success" ? "SENT!" :
             status === "listening" ? "LISTENING..." :
             status === "loading" ? "SENDING..." :
             mood === "focused" ? "TYPING..." :
             "ONLINE"}
        </span>
      </motion.div>
    </div>
  );
}