"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const BackgroundBeams = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    
    const isMobile = w < 768;
    const particleCount = isMobile ? 40 : 80; 
    const connectionDistance = 140; 
    const mouseDistance = isMobile ? 130 : 200; 
    const particles: Particle[] = [];

    const mouse = { x: -1000, y: -1000 };

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number;
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.2; 
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 1.5 + 1; // Slightly larger dots
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // 🔥 Increased Dot Opacity
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)"; 
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p, index) => {
        p.update(); p.draw();
        for (let j = index; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            ctx.beginPath();
            // 🔥 Increased Line Opacity (from 0.04 to 0.1)
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / connectionDistance) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          }
        }
        const mDx = p.x - mouse.x;
        const mDy = p.y - mouse.y;
        const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
        if (mDist < mouseDistance) {
            ctx.beginPath();
            // 🔥 Stronger Red Mouse Connection
            ctx.strokeStyle = `rgba(229, 9, 20, ${(1 - mDist / mouseDistance) * 0.4})`; 
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      });
      requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => { 
        w = canvas.width = window.innerWidth; 
        h = canvas.height = window.innerHeight; 
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; 
      mouse.y = e.clientY - rect.top;
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
        }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-auto" />
      
      {/* Dynamic Data Beam */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-30">
         <motion.div
            initial={{ top: "-10%", left: "30%", opacity: 0 }}
            animate={{ top: "120%", left: "55%", opacity: [0, 1, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-[1.5px] h-[180px] bg-gradient-to-b from-transparent via-[#E50914] to-transparent transform -rotate-12"
         />
      </div>
    </div>
  );
};