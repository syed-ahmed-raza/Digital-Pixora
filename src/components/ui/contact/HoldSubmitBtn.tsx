"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Fingerprint, Lock, Zap } from "lucide-react";
import toast from "react-hot-toast";

export default function HoldSubmitBtn({ onClick, loading, disabled }: { onClick: () => void; loading: boolean; disabled: boolean }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isComplete = progress >= 100;

  // Safe Vibrate Function
  const triggerVibrate = (pattern: number | number[]) => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
              navigator.vibrate(pattern);
          } catch (e) {
              // Ignore vibration errors on unsupported devices
          }
      }
  };

  // Reset Logic
  useEffect(() => {
    if (!loading && progress === 100) {
       const timeout = setTimeout(() => setProgress(0), 2000);
       return () => clearTimeout(timeout);
    }
  }, [loading, progress]);

  // Clean up interval on unmount
  useEffect(() => {
      return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
      };
  }, []);

  // 1. START FILLING LOGIC
  const startFilling = () => {
    // 🔥 DISABLE LOGIC: Hazard Alert
    if (disabled) {
        toast.error("Complete mandatory fields first!", {
            style: { background: "#0A0A0A", color: "#fff", border: "1px solid #9a2626" },
            icon: "🚫"
        });
        triggerVibrate([50, 50, 50]);
        return;
    }

    if (loading || isComplete) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          triggerVibrate(200); // Heavy success vibe
          return 100;
        }
        // Non-linear speed (starts slow, gets faster)
        return prev + (prev > 70 ? 3 : 1.5); 
      });
    }, 10);
  };

  const stopFilling = () => {
    if (isComplete) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(0);
  };

  // Trigger Action
  useEffect(() => {
    if (progress === 100) onClick();
  }, [progress, onClick]);

  return (
    <div className="relative w-full h-24 mt-8 select-none touch-none">
      
      {/* Button Container */}
      <motion.button
        type="button"
        onMouseDown={startFilling}
        onMouseUp={stopFilling}
        onMouseLeave={stopFilling}
        onTouchStart={startFilling}
        onTouchEnd={stopFilling}
        onTouchCancel={stopFilling} // Added for safety
        onContextMenu={(e) => e.preventDefault()} 
        whileTap={!disabled && !isComplete ? { scale: 0.98 } : {}}
        animate={progress > 70 && !isComplete ? { x: [-2, 2, -2, 2, 0] } : {}} // ⚡ SHAKE EFFECT
        transition={{ duration: 0.2 }}
        className={`group relative w-full h-full bg-[#0A0A0A] border rounded-2xl overflow-hidden transition-all duration-300
        ${disabled 
            ? 'cursor-not-allowed border-white/5 opacity-60' 
            : 'cursor-pointer border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]'
        }`}
      >
        
        {/* 1. PROGRESS FILL (The Liquid Power) */}
        <motion.div
          className="absolute inset-0 bg-[#E50913]"
          style={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0 }}
        />

        {/* 2. DISABLED PATTERN (Stripes) */}
        {disabled && (
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ffffff_10px,#ffffff_20px)]" />
        )}

        {/* 3. BIOMETRIC SCANNER LINE */}
        {!disabled && !isComplete && progress > 0 && (
            <motion.div 
                className="absolute top-0 bottom-0 w-[2px] bg-white z-20 box-shadow-[0_0_20px_white]"
                style={{ left: `${progress}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>
        )}

        {/* 4. CONTENT LAYER (Mix Blend Mode for Contrast) */}
        <div className="relative z-30 flex items-center justify-center gap-3 w-full h-full mix-blend-difference">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-sm font-black uppercase tracking-[0.2em] animate-pulse">ESTABLISHING UPLINK...</span>
            </div>
          ) : isComplete ? (
            <motion.div 
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-3"
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
              <span className="text-white text-lg font-black uppercase tracking-[0.2em]">ACCESS GRANTED</span>
            </motion.div>
          ) : (
            <>
              {disabled ? <Lock className="w-6 h-6 text-white/50" /> : <Fingerprint className={`w-8 h-8 text-white transition-opacity ${progress > 0 ? "animate-pulse" : "opacity-50"}`} />}
              
              <div className="flex flex-col items-start">
                  <span className="text-white text-sm md:text-base font-black uppercase tracking-[0.2em]">
                    {disabled ? "INPUTS REQUIRED" : (progress > 0 ? "VERIFYING IDENTITY..." : "HOLD TO TRANSMIT")}
                  </span>
                  {!disabled && (
                      <span className="text-[9px] text-white/60 font-mono tracking-widest hidden md:block">
                          {progress > 0 ? `NEURAL SYNC: ${Math.floor(progress)}%` : "SECURE CONNECTION READY"}
                      </span>
                  )}
              </div>
            </>
          )}
        </div>
        
        {/* Background Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      </motion.button>
      
      {/* FOOTER STATUS */}
      <div className="flex justify-between mt-3 px-2">
        <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${disabled ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">
                {disabled ? "LOCKDOWN MODE" : "SYSTEM ARMED"}
            </span>
        </div>
        <div className="flex items-center gap-1 text-[#E50914]">
            <Zap className="w-3 h-3" />
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold">
                {Math.floor(progress)}% CHARGED
            </span>
        </div>
      </div>
    </div>
  );
}