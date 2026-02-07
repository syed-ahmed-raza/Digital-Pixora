"use client";

import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Minus, Plus, RefreshCcw, Loader2, Scan, Sparkles } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useSpring, AnimatePresence, useTransform } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// Safe Register
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- DATA ---
const items = [
  { id: 1, title: "Apex Identity", category: "Corporate Branding", image: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633413/logo-design-1_nvlp3l.webp", color: "#3B82F6" },
  { id: 2, title: "Aethel Luxury", category: "High-End Retail", image: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633412/logo-design-2_z3rrad.webp", color: "#F59E0B" },
  { id: 3, title: "Orbit Visuals", category: "Tech Ecosystem", image: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633412/logo-design-3_kyqjp0.webp", color: "#10B981" },
  { id: 4, title: "Neo-Tokyo", category: "Art Direction", image: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633412/poster-1_qz2gkk.webp", color: "#F97316" },
  { id: 5, title: "Sonic Event", category: "Visual Experience", image: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633414/poster-2_lbr1ft.webp", color: "#EF4444" },
  { id: 6, title: "Chroma Key", category: "Digital Advertising", image: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633414/poster-3_er7tkn.webp", color: "#8B5CF6" },
];

// --- 1. THE PRISM CARD (Performance Optimized) ---
const VaultCard = ({ item, onClick, index }: { item: any, onClick: () => void, index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    
    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

    // Rotate Physics
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        // ⚡ OPTIMIZATION: Mobile par calculation block
        if (window.innerWidth < 1024 || !cardRef.current) return;
        
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        x.set((e.clientX - centerX) / width);
        y.set((e.clientY - centerY) / height);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    // Dynamic Glow
    const glowX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const glowY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
    const spotlight = useMotionTemplate`radial-gradient(400px circle at ${glowX} ${glowY}, ${item.color}30, transparent 80%)`;

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
                rotateX, 
                rotateY, 
                transformStyle: "preserve-3d" 
            }}
            className="group relative flex-shrink-0 cursor-pointer snap-center rounded-[2rem] bg-[#0a0a0a] border border-white/5 w-[85vw] sm:w-[60vw] md:w-[35vw] lg:w-[28vw] aspect-[4/5] md:aspect-[3/4] lg:aspect-square overflow-hidden perspective-1000 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] will-change-transform active:scale-[0.98] transition-all"
        >
            {/* 🌟 1. BACKGROUND GLOW */}
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${item.color}20, transparent 70%)` }}
            />

            {/* 🌟 2. MOUSE SPOTLIGHT (Desktop Only) */}
            <motion.div 
                className="hidden lg:block absolute inset-0 z-20 pointer-events-none mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: spotlight }}
            />

            {/* 🌟 3. SCANLINE EFFECT (Optimized) */}
            <div className="absolute inset-0 z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay" />

            {/* 🖼️ IMAGE CANVAS */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-[2rem] p-8 md:p-12 flex items-center justify-center transform-style-3d">
                 <div className="relative w-full h-full flex items-center justify-center">
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        sizes="(max-width: 768px) 85vw, 33vw"
                        className="transition-all duration-700 ease-[0.23,1,0.32,1] 
                                   opacity-80 group-hover:opacity-100 
                                   object-contain drop-shadow-2xl 
                                   grayscale group-hover:grayscale-0 
                                   group-hover:scale-[1.1] z-10 select-none"
                        style={{ transform: "translateZ(20px)" }} 
                        draggable={false}
                      />
                 </div>
            </div>

            {/* 👇 INFO OVERLAY */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center justify-between shadow-2xl">
                    <div>
                        <p className="text-[10px] font-mono font-bold tracking-widest uppercase mb-1" style={{ color: item.color }}>
                            {item.category}
                        </p>
                        <h3 className="text-lg font-bold text-white leading-none">{item.title}</h3>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#E50914] group-hover:border-[#E50914] transition-colors">
                        <Scan className="w-4 h-4" />
                    </div>
                 </div>
            </div>
        </motion.div>
    );
};

// --- 2. LIGHTBOX (Portal) ---
const AdvancedLightbox = ({ item, onClose }: { item: any, onClose: () => void }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [currentScale, setCurrentScale] = useState(1);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = "hidden";
        return () => { 
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [onClose]);

    // Check if document exists (SSR Safety)
    if (typeof document === 'undefined') return null;

    return createPortal(
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-[#050505]/95 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden"
            onClick={onClose}
        >
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-6 md:p-8 z-50 flex justify-between items-center pointer-events-none">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-1.5 h-8" style={{ backgroundColor: item.color }} />
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">{item.title}</h3>
                        <p className="text-white/50 text-xs font-mono uppercase tracking-widest">{item.category}</p>
                    </div>
                </motion.div>

                <button 
                    onClick={(e) => { e.stopPropagation(); onClose(); }} 
                    className="pointer-events-auto group w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rotate-90"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* ZOOM AREA */}
            <div className="relative w-full h-full flex items-center justify-center z-10 p-4" onClick={(e) => e.stopPropagation()}>
                {!imgLoaded && <Loader2 className="absolute w-12 h-12 text-white/20 animate-spin" />}
                
                <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={3} // Scale increased for better zoom
                    centerOnInit={true}
                    onTransformed={(e) => setCurrentScale(e.state.scale)}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="relative w-full h-full flex items-center justify-center p-4"
                                >
                                    <Image 
                                        src={item.image} 
                                        alt={item.title} 
                                        width={1800}
                                        height={1800}
                                        className={`w-auto h-auto max-w-full max-h-[80vh] object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] ${imgLoaded ? 'opacity-100' : 'opacity-0'} select-none`}
                                        onLoad={() => setImgLoaded(true)}
                                        unoptimized // 🔥 High Quality for Zoom
                                        priority
                                        draggable={false} // Prevent Ghost Dragging
                                    />
                                </motion.div>
                            </TransformComponent>

                            {/* HUD CONTROLS */}
                            <motion.div 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="absolute bottom-10 z-50 flex items-center gap-4 px-6 py-3 rounded-full bg-[#111]/80 backdrop-blur-md border border-white/10 shadow-2xl"
                            >
                                <button onClick={() => zoomOut(0.4)} className="p-2 text-white/50 hover:text-white transition-colors"><Minus className="w-5 h-5" /></button>
                                <span className="text-sm font-mono text-white w-12 text-center">{Math.round(currentScale * 100)}%</span>
                                <button onClick={() => zoomIn(0.4)} className="p-2 text-white/50 hover:text-white transition-colors"><Plus className="w-5 h-5" /></button>
                                <div className="w-px h-4 bg-white/10" />
                                <button onClick={() => resetTransform()} className="p-2 text-white/50 hover:text-[#E50914] transition-colors"><RefreshCcw className="w-4 h-4" /></button>
                            </motion.div>
                        </>
                    )}
                </TransformWrapper>
            </div>
        </motion.div>,
        document.body
    );
};

export default function VisualDesign() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null); 
  
  useLayoutEffect(() => {
    // ⚡ Safe Refresh
    const ctx = gsap.context(() => {
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 1000);
    });

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const totalWidth = sectionRef.current?.scrollWidth;
      const windowWidth = window.innerWidth;
      
      // Safety Check
      if (!totalWidth || !triggerRef.current) return;
      
      const xMove = -(totalWidth - windowWidth + 100); 
      
      gsap.to(sectionRef.current, {
        x: xMove,
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          pin: true,
          scrub: 1, 
          start: "top top",
          end: () => "+=" + Math.abs(xMove), 
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    });

    return () => {
        ctx.revert();
        mm.revert();
    };
  }, []);

  return (
    <section className="bg-[#050505] text-white relative z-20 overflow-hidden border-t border-white/5">
      
      {/* Background Noise (Hidden on Mobile for FPS) */}
      <div className="hidden md:block absolute inset-0 pointer-events-none opacity-[0.04] z-0 overflow-hidden mix-blend-overlay">
         <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <AnimatePresence>
        {selectedItem && <AdvancedLightbox item={selectedItem} onClose={() => setSelectedItem(null)} />}
      </AnimatePresence>

      <div ref={triggerRef} className="h-auto lg:h-screen flex flex-col justify-center py-20 lg:py-0 relative z-20">
        
        {/* MOBILE HEADER */}
        <div className="lg:hidden px-6 mb-12 relative z-20">
             <div className="flex items-center gap-3 mb-4 opacity-70">
                 <div className="h-[1px] w-8 bg-[#E50914]" />
                 <span className="text-[#E50914] font-mono tracking-[0.2em] text-[10px] uppercase">The Vault</span>
             </div>
             <h2 className="text-[clamp(3.5rem,14vw,6rem)] font-black uppercase tracking-tighter leading-[0.85] text-white">
                Graphic
            </h2>
            <h2 className="text-[clamp(3.5rem,14vw,6rem)] font-black uppercase tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white/40 to-white/5" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>
                System.
            </h2>
        </div>

        {/* CARDS CONTAINER (Draggable/Scrollable) */}
        {/* ⚡ Added will-change-transform for smooth horizontal scroll */}
        {/* 🛠️ FIX: Mobile Snap Physics - overscroll-x-contain prevents page navigation gestures */}
        <div 
          ref={sectionRef} 
          className="flex flex-row items-center gap-6 md:gap-10 px-6 lg:pl-[10vw] overflow-x-auto lg:overflow-visible pb-12 lg:pb-0 snap-x snap-mandatory lg:snap-none no-scrollbar will-change-transform overscroll-x-contain"
        >
          {/* DESKTOP HEADER (Scrolls with cards) */}
          <div className="hidden lg:flex flex-col justify-center min-w-[30vw] flex-shrink-0 mr-16 z-20 self-center">
              <div className="flex items-center gap-4 mb-8">
                 <div className="h-[2px] w-12 bg-[#E50914]" />
                 <div className="flex items-center gap-2">
                     <Sparkles className="w-4 h-4 text-[#E50914] animate-pulse" />
                     <span className="text-[#E50914] font-mono tracking-[0.2em] text-xs uppercase">Premium Work</span>
                 </div>
              </div>
              
              <h2 className="text-[8vw] font-black uppercase tracking-tighter leading-[0.8] text-white">
                Graphic
              </h2>
              <h2 className="text-[8vw] font-black uppercase tracking-tighter leading-[0.8] text-[#111]" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                System.
              </h2>
              <p className="mt-10 text-white/50 max-w-sm text-sm font-light leading-relaxed border-l border-white/10 pl-6">
                  A curated collection of visual identities. Hover to reveal the brand aura. Click to inspect details.
              </p>
          </div>

          {items.map((item, index) => (
             <VaultCard 
                key={item.id} 
                item={item} 
                index={index}
                onClick={() => setSelectedItem(item)} 
             />
          ))}
          
          <div className="min-w-[5vw] lg:min-w-[10vw] flex-shrink-0" />
        </div>
      </div>
    </section>
  );
}