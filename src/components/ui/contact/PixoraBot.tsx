"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence} from "framer-motion";
import { useEffect, useState } from "react";

interface BotProps {
  status: "idle" | "listening" | "loading" | "success" | "error";
  mood: "neutral" | "happy" | "angry" | "focused";
  focusedField?: string | null;
}

export default function PixoraBot({ status, mood, focusedField }: BotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // --- 1. PHYSICS BASED MOTION VALUES (No Re-renders) ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Add spring physics for organic eye movement
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  // Limit eye movement range so pupil doesn't leave the eye
  const pupilX = useTransform(springX, [-1, 1], [-8, 8]);
  const pupilY = useTransform(springY, [-1, 1], [-6, 6]);

  // Head tilt follows mouse slightly
  const headRotate = useTransform(springX, [-1, 1], [-10, 10]);

  // --- 2. DEVICE DETECTION ---
  useEffect(() => {
      setIsMobile(window.innerWidth < 1024);
  }, []);

  // --- 3. INTELLIGENT TRACKING ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    // A. Focus Mode (Priority 1)
    if (focusedField) {
        // Look down towards inputs
        mouseX.set(0); 
        mouseY.set(0.8); 
        return;
    }

    // B. Mobile/Idle Mode (Random Gaze)
    if (isMobile) {
        const interval = setInterval(() => {
            const randomX = Math.random() * 1 - 0.5;
            const randomY = Math.random() * 0.5 - 0.25;
            mouseX.set(randomX);
            mouseY.set(randomY);
        }, 2000);
        return () => clearInterval(interval);
    }

    // C. Desktop Mouse Tracking
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized position (-1 to 1) relative to window center
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [focusedField, isMobile, mouseX, mouseY]);

  // --- 4. LIFELIKE BLINKING ---
  useEffect(() => {
    const blinkLoop = () => {
        const nextBlink = Math.random() * 3000 + 2000;
        setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 150);
            blinkLoop();
        }, nextBlink);
    };
    blinkLoop();
  }, []);

  // --- 5. DYNAMIC STYLING ---
  const getColor = () => {
    if (status === "error" || mood === "angry") return "#ef4444"; // Red
    if (status === "success" || mood === "happy") return "#22c55e"; // Green
    if (status === "listening") return "#3b82f6"; // Blue
    if (status === "loading") return "#eab308"; // Yellow
    if (mood === "focused") return "#a855f7"; // Purple
    return "#E50914"; // Brand Red
  };

  const getEyeHeight = () => {
      if (isBlinking) return 2;
      if (mood === "happy" || status === "success") return 35; // Happy arch
      if (mood === "focused") return 22; // Squint
      if (status === "error") return 12; // Sad
      return 34; // Normal
  };

  return (
    <div className="relative z-50 flex flex-col items-center pointer-events-none select-none">
      
      {/* --- GLOW AURA --- */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] opacity-20 blur-[60px] -z-10 transition-colors duration-500" 
        style={{ backgroundColor: getColor() }} 
      />

      {/* --- HEAD CHASSIS --- */}
      <motion.div
        className="relative w-24 h-24 rounded-[2.5rem] bg-[#080808] border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] flex items-center justify-center backdrop-blur-3xl"
        style={{ rotate: headRotate }}
        animate={{
            y: [0, -8, 0], // Floating Effect
            borderColor: status === "error" ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 255, 255, 0.1)",
            scale: status === "success" ? [1, 1.15, 1] : 1,
        }}
        transition={{ 
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 0.4, ease: "backOut" }
        }}
      >
        {/* --- BLUSH CHEEKS --- */}
        <AnimatePresence>
            {(mood === "happy" || status === "success") && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="absolute bottom-6 left-4 w-2 h-1.5 bg-[#ff9ea8] blur-[4px] rounded-full z-20" />
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="absolute bottom-6 right-4 w-2 h-1.5 bg-[#ff9ea8] blur-[4px] rounded-full z-20" />
                </>
            )}
        </AnimatePresence>

        {/* --- FACE SCREEN --- */}
        <div className="relative w-16 h-14 rounded-[1.5rem] bg-black shadow-inner overflow-hidden flex items-center justify-center border border-white/5">
            
            {/* The Pupil */}
            <motion.div
                className="relative rounded-full z-10 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                style={{ x: pupilX, y: pupilY }} 
                animate={{
                    backgroundColor: getColor(),
                    height: getEyeHeight(),
                    width: (mood === "happy" || status === "success") ? 40 : 34,
                    borderRadius: isBlinking ? "20px" : "50%", 
                }}
                transition={{ 
                    type: "spring", stiffness: 300, damping: 20, 
                    layout: { duration: 0.2 } 
                }}
            >
                {/* Anime Sparkle */}
                {!isBlinking && (
                    <div className="absolute top-1.5 right-2 w-2 h-1.5 bg-white rounded-full opacity-90 blur-[0.5px]" />
                )}
                
                {/* Listening Wiggle */}
                {status === "listening" && (
                    <motion.div 
                        className="absolute inset-0 bg-white/30 rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                    />
                )}
            </motion.div>

            {/* Screen Glare */}
            <div className="absolute top-1 left-2 w-8 h-4 bg-gradient-to-b from-white/10 to-transparent rounded-full -rotate-12 pointer-events-none" />
        </div>

        {/* --- ROBOT EARS --- */}
        <motion.div 
            className="absolute -left-1.5 top-8 w-2.5 h-6 bg-[#151515] rounded-l-full border-l border-white/10" 
            animate={{ height: status === "listening" ? [6, 14, 6] : 6 }} 
            transition={{ repeat: Infinity, duration: 0.4 }}
        />
        <motion.div 
            className="absolute -right-1.5 top-8 w-2.5 h-6 bg-[#151515] rounded-r-full border-r border-white/10" 
            animate={{ height: status === "listening" ? [6, 14, 6] : 6 }} 
            transition={{ repeat: Infinity, duration: 0.4, delay: 0.1 }}
        />

      </motion.div>

      {/* --- STATUS BADGE --- */}
      <motion.div 
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 10 }}
        className="absolute -bottom-9 bg-[#0A0A0A]/80 border border-white/10 px-3 py-1 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md"
      >
        <div className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: getColor() }}></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: getColor() }}></span>
        </div>
        
        <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest font-mono" style={{ color: getColor() }}>
            {status === "error" ? "ERROR" :
             status === "success" ? "SENT" :
             status === "listening" ? "LISTENING" :
             status === "loading" ? "UPLOADING" :
             mood === "focused" ? "TYPING" :
             "ONLINE"}
        </span>
      </motion.div>
    </div>
  );
}