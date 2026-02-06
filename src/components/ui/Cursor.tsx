"use client";

import { useEffect, useState } from "react";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform, 
  AnimatePresence 
} from "framer-motion";

export default function Cursor() {
  const [isMobile, setIsMobile] = useState(true);
  const [cursorState, setCursorState] = useState<"default" | "hover" | "hidden">("hidden");
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState("");

  // --- PHYSICS ENGINE (Optimized for fluid feel) ---
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth Spring for the Ring (Thoda peeche chalega)
  const springConfig = { damping: 30, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // --- DEVICE DETECTION ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => window.matchMedia("(pointer: coarse)").matches;
      setIsMobile(checkMobile());
      // Desktop hai toh cursor dikhao
      if (!checkMobile()) setCursorState("default");
    }
  }, []);

  // --- EVENT LISTENERS ---
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Raw Mouse Position update
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      const target = e.target as HTMLElement;
      
      // Check Elements
      const isLink = target.closest("a, button, .clickable, [role='button'], input[type='submit'], input[type='button']");
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable || target.tagName === "SELECT";
      const customCursorData = target.closest("[data-cursor]");

      // --- LOGIC ---
      if (isInput) {
         setCursorState("hidden"); // Typing karte waqt tang na kare
         setCursorText("");
      } else if (customCursorData) {
         setCursorState("hover");
         setCursorText(customCursorData.getAttribute("data-cursor") || "");
      } else if (isLink) {
         setCursorState("hover");
         setCursorText("");
      } else {
         setCursorState("default");
         setCursorText("");
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    
    // Window leave detection
    const handleMouseLeave = () => setCursorState("hidden");
    const handleMouseEnter = () => setCursorState("default");

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isMobile, mouseX, mouseY]);

  // --- ANIMATION VARIANTS ---
  const variants = {
    default: {
      height: 12,
      width: 12,
      backgroundColor: "#E50914", // Brand Red
      x: "-50%",
      y: "-50%",
      opacity: 1,
      mixBlendMode: "normal" as const,
      scale: isClicking ? 0.8 : 1, // Click feedback
    },
    hover: {
      height: 60,
      width: 60,
      backgroundColor: "#ffffff",
      x: "-50%",
      y: "-50%",
      opacity: 1,
      mixBlendMode: "difference" as const, // Cool Invert Effect
      scale: isClicking ? 0.9 : 1,
    },
    hidden: {
      height: 0,
      width: 0,
      opacity: 0,
      scale: 0,
      x: "-50%",
      y: "-50%",
    }
  };

  if (isMobile) return null;

  return (
    <>
      {/* 1. THE SMOOTH RING (Follower) */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center rounded-full overflow-hidden"
        style={{
          x: smoothX,
          y: smoothY,
        }}
        variants={variants}
        animate={cursorState}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        <AnimatePresence>
            {cursorText && (
                <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-[10px] font-black text-black tracking-widest uppercase text-center leading-none px-2"
                >
                    {cursorText}
                </motion.span>
            )}
        </AnimatePresence>
      </motion.div>

      {/* 2. THE TINY DOT (Instant Tracker) */}
      {/* Yeh hamesha mouse ke exact neeche rahega bina lag ke */}
      <motion.div 
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full z-[10000] pointer-events-none mix-blend-difference"
        style={{ 
            x: mouseX, 
            y: mouseY, 
            translateX: "-50%", 
            translateY: "-50%",
        }} 
        animate={{ 
            opacity: cursorState === 'hidden' ? 0 : 1,
            scale: cursorState === 'hover' ? 0 : 1 // Hover par dot gayab taake text clear dikhe
        }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}