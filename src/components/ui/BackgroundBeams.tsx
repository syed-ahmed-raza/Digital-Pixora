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

    let w = canvas.width;
    let h = canvas.height;
    let particles: Particle[] = [];
    
    // Mouse state
    const mouse = { x: -9999, y: -9999 };

    // ⚡ HIGH-DPI SETUP (Retina Fix)
    const init = () => {
        const dpr = window.devicePixelRatio || 1;
        // Set display size (css pixels)
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        // Set actual size in memory (scaled to account for extra pixel density)
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        
        // Normalize coordinate system to use css pixels
        ctx.scale(dpr, dpr);

        w = window.innerWidth;
        h = window.innerHeight;

        createParticles();
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      pulse: number;

      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.3; // Slower, more elegant
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.1; // Random starting opacity
        this.pulse = Math.random() * 0.02 + 0.005; // Twinkle speed
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        // Twinkle Effect
        this.alpha += this.pulse;
        if (this.alpha > 0.6 || this.alpha < 0.1) this.pulse *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }
    }

    const createParticles = () => {
        const isMobile = window.innerWidth < 768;
        const count = isMobile ? 35 : 70; // Fewer particles on mobile for FPS
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      const connectionDistance = 130;
      const mouseDistance = 180;

      particles.forEach((p, index) => {
        p.update();
        p.draw();

        // Connect particles
        for (let j = index; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            const opacity = 1 - dist / connectionDistance;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.12})`; // Subtle web
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connect to mouse
        const mDx = p.x - mouse.x;
        const mDy = p.y - mouse.y;
        const mDist = Math.sqrt(mDx * mDx + mDy * mDy);

        if (mDist < mouseDistance) {
          ctx.beginPath();
          const opacity = 1 - mDist / mouseDistance;
          // 🔥 Brand Color Interaction
          ctx.strokeStyle = `rgba(229, 9, 20, ${opacity * 0.6})`; 
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      });

      requestAnimationFrame(animate);
    };

    // Event Listeners
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

    const handleResize = () => {
        init();
    };

    // Initialize
    init();
    animate();

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
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      
      {/* 🚀 Dynamic Data Beam (The Scanning Laser) */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-20 mix-blend-overlay">
         <motion.div
            initial={{ top: "-10%", left: "20%", opacity: 0, rotate: -15 }}
            animate={{ top: "120%", left: "60%", opacity: [0, 1, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute w-[2px] h-[300px] bg-gradient-to-b from-transparent via-[#E50914] to-transparent blur-[1px]"
         />
         <motion.div
            initial={{ top: "-10%", left: "80%", opacity: 0, rotate: -15 }}
            animate={{ top: "120%", left: "40%", opacity: [0, 0.5, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 4 }}
            className="absolute w-[1px] h-[200px] bg-gradient-to-b from-transparent via-white to-transparent blur-[1px]"
         />
      </div>
    </div>
  );
};