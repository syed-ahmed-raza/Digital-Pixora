"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useScroll, useTransform, motion, useSpring, useMotionValue, AnimatePresence, useInView } from "framer-motion";
import { Terminal, Cpu, X, Minus, Plus, RefreshCcw, Loader2, Maximize2, Sparkles, Fingerprint, ScanLine } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// --- DATA ---
const aiImages = [
  { 
    id: 1, 
    title: "Culinary Hyper-Realism", 
    prompt: "/imagine prompt: artisanal pastries, cinnamon rolls, cinematic lighting, 8k --v 6.0", 
    src: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633402/ai-1_uszcf0.webp", 
    height: "h-[50vh] md:h-[70vh]", 
    tag: "Midjourney v6",
    seed: "392841",
  },
  { 
    id: 2, 
    title: "Organic Macro Details", 
    prompt: "/imagine prompt: sliced kiwi and figs, cross-section, macro photography, sharp focus", 
    src: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633403/ai-2_q8vdbp.webp", 
    height: "h-[45vh] md:h-[55vh]",
    tag: "Macro Lens",
    seed: "882109",
  },
  { 
    id: 3, 
    title: "Fluid Dynamics", 
    prompt: "/imagine prompt: splashing smoothies, iced coffee, high speed capture, advertising shot", 
    src: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633402/ai-3_sbgior.webp", 
    height: "h-[50vh] md:h-[60vh]",
    tag: "High Speed",
    seed: "102938",
  },
  { 
    id: 4, 
    title: "Savory Commercial", 
    prompt: "/imagine prompt: gourmet burger, steam rising, dark background, michelin style --ar 4:5", 
    src: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633402/ai-4_inz1vd.webp", 
    height: "h-[55vh] md:h-[75vh]",
    tag: "Commercial",
    seed: "556123",
  },
];

// --- 1. LIGHTBOX (Optimized) ---
const AiLightbox = ({ item, onClose }: { item: any, onClose: () => void }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [currentScale, setCurrentScale] = useState(1);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = "hidden"; 
        // 🔥 FIX: Prevent scroll bleed on mobile
        document.body.style.touchAction = "none";
        
        return () => { 
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = "auto";
            document.body.style.touchAction = "auto";
        };
    }, [onClose]);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            // 🔥 FIX: z-[999999] ensures it's above everything (Navbar, Cursor)
            className="fixed inset-0 z-[999999] bg-[#050505]/98 backdrop-blur-3xl flex flex-col items-center justify-center overflow-hidden touch-none"
            onClick={onClose}
        >
            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-6 md:p-10 z-50 flex justify-between items-start pointer-events-none">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.1 }}
                    className="flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                             <Sparkles className="w-3 h-3 text-[#E50914]" /> RAW_ASSET
                        </span>
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-white tracking-tight">{item.title}</h3>
                </motion.div>

                <button 
                    onClick={(e) => { e.stopPropagation(); onClose(); }} 
                    className="pointer-events-auto group w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-105 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* WORKSPACE */}
            <div 
                className="relative w-full h-full flex items-center justify-center z-10 p-4 md:p-8"
                onClick={(e) => e.stopPropagation()} 
            >
                {!imgLoaded && <Loader2 className="absolute z-0 w-12 h-12 text-white/20 animate-spin" />}
                
                <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={2.5} 
                    centerOnInit={true}
                    wheel={{ step: 0.1 }} 
                    onTransformed={(e) => setCurrentScale(e.state.scale)}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                <div className="relative w-full h-full flex items-center justify-center transition-all duration-300 ease-out">
                                    <Image 
                                        src={item.src} 
                                        alt={item.title} 
                                        width={1600}
                                        height={2000}
                                        className={`w-auto h-auto max-w-full max-h-[85vh] object-contain drop-shadow-2xl ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => setImgLoaded(true)}
                                        unoptimized
                                        priority
                                    />
                                </div>
                            </TransformComponent>

                            {/* HUD CONTROLS */}
                            <motion.div 
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="absolute bottom-10 z-50 flex items-center gap-4 px-6 py-3 rounded-full bg-[#111]/80 backdrop-blur-xl border border-white/10 shadow-2xl left-1/2 -translate-x-1/2"
                            >
                                <button onClick={() => zoomOut(0.4)} className="p-2 text-white/60 hover:text-white transition-colors active:scale-95"><Minus className="w-5 h-5" /></button>
                                <span className="text-sm font-mono text-white w-14 text-center select-none tracking-widest">{Math.round(currentScale * 100)}%</span>
                                <button onClick={() => zoomIn(0.4)} className="p-2 text-white/60 hover:text-white transition-colors active:scale-95"><Plus className="w-5 h-5" /></button>
                                <div className="w-px h-5 bg-white/10" />
                                <button onClick={() => resetTransform()} className="p-2 text-white/60 hover:text-[#E50914] transition-colors active:scale-95"><RefreshCcw className="w-5 h-5" /></button>
                            </motion.div>
                        </>
                    )}
                </TransformWrapper>
            </div>
        </motion.div>,
        document.body
    );
};

// --- 2. THE PREMIUM CARD (God Mode) ---
const AiCard = ({ item, isMobile = false, onClick }: { item: any, isMobile?: boolean, onClick: () => void }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [displayedPrompt, setDisplayedPrompt] = useState("");
    const [isHovered, setIsHovered] = useState(false);
    const typingInterval = useRef<NodeJS.Timeout | null>(null);
    
    // ⚡ PERFORMANCE: Only run animation when in view
    const isInView = useInView(cardRef, { once: false, amount: 0.3 });

    // Physics for 3D Tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
    
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["3deg", "-3deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-3deg", "3deg"]);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        if (isMobile) return;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set((clientX - left) / width - 0.5);
        y.set((clientY - top) / height - 0.5);
    }

    // Dynamic Scanline Glow
    const scanlineY = useSpring(0, { stiffness: 50, damping: 20 });

    useEffect(() => {
        if (isHovered) {
            scanlineY.set(100);
        } else {
            scanlineY.set(0);
        }
    }, [isHovered, scanlineY]);

    // ⚡ OPTIMIZED TYPEWRITER: Only types when visible
    useEffect(() => {
        const shouldType = isMobile ? isInView : isHovered;

        if (shouldType) {
            let currentIndex = 0;
            if (!displayedPrompt) setDisplayedPrompt("");
            
            if (typingInterval.current) clearInterval(typingInterval.current);
            
            typingInterval.current = setInterval(() => {
                if (currentIndex < item.prompt.length) {
                    setDisplayedPrompt((prev) => {
                        if (prev.length >= item.prompt.length) return prev;
                        return prev + item.prompt[currentIndex];
                    });
                    currentIndex++;
                } else {
                    if (typingInterval.current) clearInterval(typingInterval.current);
                }
            }, 15);
        } else {
            if (!isMobile) {
                if (typingInterval.current) clearInterval(typingInterval.current);
                setDisplayedPrompt(""); 
            }
        }
        return () => { if (typingInterval.current) clearInterval(typingInterval.current); };
    }, [isHovered, item.prompt, isMobile, isInView]);

    return (
        <motion.div
            ref={cardRef}
            style={{ rotateX: isMobile ? 0 : rotateX, rotateY: isMobile ? 0 : rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); x.set(0); y.set(0); }}
            onClick={onClick}
            className={`relative w-full ${isMobile ? 'h-full' : item.height} rounded-[2rem] bg-[#0a0a0a] group cursor-zoom-in perspective-1000 border border-white/5 hover:border-white/20 transition-all duration-500 ease-out hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] will-change-transform transform-gpu`}
        >
            {/* Internal Container for Image Framing */}
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#050505] p-6 md:p-8 flex items-center justify-center transform-style-3d">
                
                {/* 🌟 NEURAL SCANLINE (Desktop Only for FPS) */}
                {!isMobile && (
                    <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_bottom,transparent,rgba(229,9,20,0.1),transparent)] animate-scan" />
                    </div>
                )}

                {/* Top Corner HUD */}
                <div className="absolute top-6 left-6 z-30 flex items-center gap-2 transform-style-3d translate-z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full transition-all group-hover:bg-white/10 group-hover:border-white/20">
                        <Sparkles className="w-3 h-3 text-[#E50914]" />
                        <span className="text-[9px] font-mono font-bold uppercase text-white/80 tracking-wider">{item.tag}</span>
                    </div>
                </div>

                {/* Bottom Corner Seed ID */}
                <div className="absolute bottom-6 right-6 z-30 opacity-60 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 text-[9px] font-mono text-white/50">
                        <Fingerprint className="w-3 h-3" /> {item.seed}
                    </div>
                </div>

                {/* Hover Expand Icon */}
                <div className="absolute top-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                        <Maximize2 className="w-4 h-4" />
                    </div>
                </div>

                {/* 🖼️ IMAGE - FIXED FIT & HOVER */}
                <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
                    <Image 
                        src={item.src} 
                        alt={item.title} 
                        fill 
                        sizes="(max-width: 768px) 85vw, 50vw"
                        unoptimized
                        className="object-contain transition-all duration-700 ease-[0.23,1,0.32,1] 
                                   opacity-80 md:opacity-70 grayscale-[0.3] md:grayscale-[0.5]
                                   group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-[1.03] 
                                   drop-shadow-2xl z-20"
                    />
                </div>
            </div>

            {/* ⌨️ PROMPT TERMINAL (Frosted Glass) */}
            <div className={`absolute bottom-0 left-0 w-full p-6 md:p-8 z-40 transition-all duration-500 ease-out pointer-events-none 
                ${isMobile ? (isInView ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0') : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}
            `}>
                <div className="relative p-4 rounded-xl bg-[#050505]/90 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                    {/* Matrix Noise Overlay inside terminal */}
                    <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
                    
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-white tracking-tight">{item.title}</h3>
                        <ScanLine className="w-3 h-3 text-[#E50914] animate-pulse" />
                    </div>
                    
                    <div className="flex gap-3 items-start relative z-10">
                        <Terminal className="w-3 h-3 text-[#E50914] mt-0.5 shrink-0" />
                        <p className="text-[10px] font-mono text-white/80 leading-relaxed break-all">
                            {displayedPrompt}
                            <span className="w-1.5 h-3 inline-block bg-[#E50914] ml-1 animate-pulse align-middle"/>
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
};

// --- 3. MAIN SECTION ---
export default function AiEngineering() {
  const container = useRef(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'end start']
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]); 
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const col1 = [aiImages[0], aiImages[2]]; 
  const col2 = [aiImages[1], aiImages[3]]; 

  return (
    <section ref={container} className="relative bg-[#050505] py-20 md:py-32 px-4 overflow-hidden border-t border-white/5 perspective-[2000px]">
      
      {/* Subtle Noise Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-overlay">
         <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <AnimatePresence>
        {selectedItem && <AiLightbox item={selectedItem} onClose={() => setSelectedItem(null)} />}
      </AnimatePresence>

      <div className="text-center mb-16 md:mb-40 relative z-10">
            <span className="text-[#E50914] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2 mb-4">
                <Cpu className="w-4 h-4" />
                Neural Networks
            </span>
            <h2 className="text-[clamp(3.5rem,13vw,8rem)] font-black text-white uppercase leading-[0.85] tracking-tighter">
                Prompt <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>
                    Engineering.
                </span>
            </h2>
            <p className="text-white/50 mt-8 max-w-md mx-auto text-sm leading-relaxed font-light px-4 border-l border-white/10">
                Bridging the gap between imagination and reality. We curate high-fidelity AI assets with precision control.
            </p>
      </div>

      {/* --- DESKTOP GRID --- */}
      <div className="hidden md:flex justify-center gap-8 lg:gap-12 min-h-[100vh] px-[2vw] lg:px-[8vw]">
        <motion.div style={{ y: y1 }} className="flex flex-col gap-12 w-1/2 will-change-transform">
            {col1.map((item, i) => <AiCard key={i} item={item} onClick={() => setSelectedItem(item)} />)}
        </motion.div>

        <motion.div style={{ y: y2 }} className="flex flex-col gap-12 w-1/2 mt-32 will-change-transform">
            {col2.map((item, i) => <AiCard key={i} item={item} onClick={() => setSelectedItem(item)} />)}
        </motion.div>
      </div>

      {/* --- MOBILE SWIPE --- */}
      {/* 🔥 FIX: 'overscroll-x-contain' prevents browser navigation gestures */}
      <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-12 px-4 no-scrollbar overscroll-x-contain">
         {aiImages.map((item, i) => (
             <div key={i} className="relative min-w-[85vw] h-[60vh] snap-center shrink-0">
                 <AiCard item={item} isMobile={true} onClick={() => setSelectedItem(item)} />
             </div>
         ))}
         <div className="min-w-[5vw] shrink-0" />
      </div>

      <style jsx global>{`
        @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        .animate-scan {
            animation: scan 2s linear infinite;
        }
      `}</style>
    </section>
  );
}