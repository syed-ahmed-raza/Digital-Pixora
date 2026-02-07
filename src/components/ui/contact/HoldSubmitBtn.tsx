"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { CheckCircle2, Fingerprint, Lock, Zap, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

// --- 🔊 SONIC ENGINE (Fail-Safe) ---
const playHoldSound = (type: 'charge' | 'release' | 'success') => {
    if (typeof window === 'undefined') return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'charge') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 1.5); // Rising pitch
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 1.5);
            osc.start(now);
            osc.stop(now + 1.5); // Stops if held too long
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    } catch(e) {}
};

export default function HoldSubmitBtn({ onClick, loading, disabled }: { onClick: () => void; loading: boolean; disabled: boolean }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  
  // Refs for animation loop (No Re-renders)
  const progressRef = useRef(0);
  const reqIdRef = useRef<number | null>(null);
  const controls = useAnimation();

  // Reset Logic
  useEffect(() => {
    if (!loading && isComplete) {
       const timeout = setTimeout(() => {
           setProgress(0);
           progressRef.current = 0;
           setIsComplete(false);
       }, 2000);
       return () => clearTimeout(timeout);
    }
  }, [loading, isComplete]);

  // Clean up
  useEffect(() => {
      return () => {
          if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      };
  }, []);

  // --- HAPTIC ENGINE ---
  const triggerHaptic = useCallback((pattern: number | number[]) => {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
          try { navigator.vibrate(pattern); } catch (e) {}
      }
  }, []);

  // --- PHYSICS ENGINE ---
  const updateProgress = () => {
    // Speed increases as you get closer (Exponential Ramping)
    const speed = 0.5 + (progressRef.current * 0.04); 
    
    progressRef.current += speed;

    if (progressRef.current >= 100) {
        progressRef.current = 100;
        setProgress(100);
        setIsComplete(true);
        triggerHaptic([50, 50, 200]); // Success Vibe
        playHoldSound('success');
        onClick(); // Trigger Action
    } else {
        setProgress(progressRef.current);
        // Micro vibrations during hold (High-end feel)
        if (Math.floor(progressRef.current) % 15 === 0) triggerHaptic(5);
        reqIdRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const startFilling = (e: React.MouseEvent | React.TouchEvent) => {
    // 🔥 ERROR HANDLING: Disabled State
    if (disabled) {
        controls.start({ x: [-5, 5, -5, 5, 0], transition: { duration: 0.3 } });
        toast.error("Access Denied: Complete Mandatory Fields", {
            style: { background: "#0A0A0A", color: "#fff", border: "1px solid #ef4444" },
            icon: "🔒"
        });
        triggerHaptic([50, 50, 50]);
        return;
    }

    if (loading || isComplete) return;

    setIsHolding(true);
    triggerHaptic(20); 
    playHoldSound('charge'); // 🔊 CHARGE SOUND
    reqIdRef.current = requestAnimationFrame(updateProgress);
  };

  const stopFilling = () => {
    if (isComplete) return;
    
    setIsHolding(false);
    if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    
    // Rapid Decay (Drop down fast instead of instant 0)
    const decay = () => {
        if (progressRef.current > 0) {
            progressRef.current -= 8; // Fallback speed
            if (progressRef.current < 0) progressRef.current = 0;
            setProgress(progressRef.current);
            reqIdRef.current = requestAnimationFrame(decay);
        }
    };
    decay();
  };

  return (
    <div className="relative w-full h-20 md:h-24 mt-8 select-none touch-none">
      
      {/* Button Container */}
      <motion.button
        type="button"
        onMouseDown={startFilling}
        onMouseUp={stopFilling}
        onMouseLeave={stopFilling}
        onTouchStart={startFilling}
        onTouchEnd={stopFilling}
        onTouchCancel={stopFilling}
        onContextMenu={(e) => e.preventDefault()} // No right click
        whileTap={!disabled && !isComplete ? { scale: 0.98 } : {}}
        animate={controls} // Shake Animation
        className={`group relative w-full h-full bg-[#0A0A0A] border rounded-2xl overflow-hidden transition-all duration-300
        ${disabled 
            ? 'cursor-not-allowed border-white/5 opacity-60' 
            : 'cursor-pointer border-white/10 hover:border-white/30 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]'
        } ${isHolding && !isComplete ? 'border-[#E50914]/50' : ''}`}
      >
        
        {/* 1. PROGRESS FILL (The Liquid Power) */}
        <motion.div
          className="absolute inset-0 bg-[#E50914]"
          style={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0 }} // Zero duration for frame-perfect updates
        />

        {/* 2. DISABLED PATTERN (Stripes) */}
        {disabled && (
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ffffff_10px,#ffffff_20px)]" />
        )}

        {/* 3. BIOMETRIC SCANNER LINE */}
        {!disabled && !isComplete && progress > 0 && (
            <div 
                className="absolute top-0 bottom-0 w-[2px] bg-white z-20 shadow-[0_0_20px_white] mix-blend-overlay"
                style={{ left: `${progress}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-md" />
            </div>
        )}

        {/* 4. CONTENT LAYER (Mix Blend Mode for Contrast) */}
        <div className="relative z-30 flex items-center justify-center gap-3 md:gap-4 w-full h-full mix-blend-difference text-white px-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] animate-pulse">ESTABLISHING UPLINK...</span>
            </div>
          ) : isComplete ? (
            <motion.div 
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-3"
            >
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-base md:text-lg font-black uppercase tracking-[0.2em]">ACCESS GRANTED</span>
            </motion.div>
          ) : (
            <>
              {disabled ? <Lock className="w-5 h-5 md:w-6 md:h-6 opacity-50" /> : <Fingerprint className={`w-6 h-6 md:w-8 md:h-8 transition-all ${isHolding ? "scale-110 animate-pulse" : "opacity-50"}`} />}
              
              <div className="flex flex-col items-start">
                  <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.15em] md:tracking-[0.2em] flex items-center gap-2">
                    {disabled ? "INPUTS REQUIRED" : (progress > 0 ? "VERIFYING IDENTITY..." : "HOLD TO TRANSMIT")}
                    {!disabled && progress === 0 && <ChevronRight className="w-4 h-4 animate-bounce-x" />}
                  </span>
                  {!disabled && (
                      <span className="text-[9px] font-mono tracking-widest hidden sm:block opacity-60">
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
            <Zap className={`w-3 h-3 ${isHolding ? 'fill-current' : ''}`} />
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold">
                {Math.floor(progress)}% CHARGED
            </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-x {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(3px); }
        }
        .animate-bounce-x {
            animation: bounce-x 1s infinite;
        }
      `}</style>
    </div>
  );
}