"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence, useVelocity, useTransform } from "framer-motion";

export default function Cursor() {
  // --- 1. STATES & HOOKS (Always call these first) ---
  const [cursorText, setCursorText] = useState("");
  const [cursorVariant, setCursorVariant] = useState("default");
  const [isMobile, setIsMobile] = useState(true);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // --- 2. PHYSICS ---
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const xVelocity = useVelocity(smoothX);
  const scale = useTransform(xVelocity, [-1500, 0, 1500], [1.25, 1, 1.25]); 
  const rotate = useTransform(xVelocity, [-1500, 1500], [-45, 45]);

  // 🚨 FIX: Hook ko JSX se nikal kar yahan define kiya
  const scaleY = useTransform(scale, [1.25, 1], [0.8, 1]); 

  // --- 3. MOBILE CHECK ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = window.matchMedia("(pointer: coarse)").matches;
      setIsMobile(checkMobile);
    }
  }, []);

  // --- 4. EVENT LISTENERS ---
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const isLink = target.closest("a, button, .clickable, input, textarea, [role='button']");
      const isProject = target.closest(".project-card") || target.closest("[data-cursor='project']");

      if (isProject) {
        setCursorVariant("project");
        setCursorText("VIEW");
      } else if (isLink) {
        setCursorVariant("hover");
        setCursorText("");
      } else {
        setCursorVariant("default");
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isMobile, mouseX, mouseY]);

  // --- 5. VISUAL VARIANTS ---
  const variants = {
    default: {
      height: 16, 
      width: 16, 
      backgroundColor: "rgba(229, 9, 20, 0.5)", 
      border: "1px solid rgba(255, 255, 255, 0.2)", 
      mixBlendMode: "normal" as const,
    },
    hover: {
      height: 64, 
      width: 64, 
      backgroundColor: "rgba(255, 255, 255, 0.9)", 
      border: "none",
      mixBlendMode: "difference" as const, 
    },
    project: {
      height: 100, 
      width: 100, 
      backgroundColor: "#E50914", 
      border: "none",
      mixBlendMode: "normal" as const,
      scale: 1.1
    }
  };

  // 🚀 OPTIMIZATION: Early return AFTER all hooks are called
  if (isMobile) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      <motion.div
        className="fixed top-0 left-0 flex items-center justify-center rounded-full backdrop-blur-[2px]"
        style={{ 
            x: smoothX, 
            y: smoothY, 
            translateX: "-50%", 
            translateY: "-50%", 
            scaleX: scale, 
            // 🚨 FIX: Variable use kiya, direct hook nahi
            scaleY: scaleY, 
            rotate: rotate,
        }}
        animate={cursorVariant}
        variants={variants}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {cursorText && (
            <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-[12px] font-black tracking-[0.2em] text-white whitespace-nowrap"
            >
                {cursorText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      
      <motion.div 
        className="fixed top-0 left-0 w-1 h-1 bg-white rounded-full z-[10000]"
        style={{ 
            x: mouseX, 
            y: mouseY, 
            translateX: "-50%", 
            translateY: "-50%",
            opacity: cursorVariant === 'default' ? 1 : 0
        }} 
      />
    </div>
  );
}