"use client";

import { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { ArrowUpRight, Cpu, Hash } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

// Plugin Register (Safe Check)
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// --- DATA ---
const projects = [
  {
    id: 1,
    title: "Verbalize",
    category: "AI SaaS Platform",
    tech: "Next.js 14 • OpenAI",
    description: "Building the brain of language processing.",
    src: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633424/verbalize_ctrdaa.webp",
    link: "https://verbalizelt-website-by-using-next-j.vercel.app/",
  },
  {
    id: 2,
    title: "Relevance",
    category: "Design Agency",
    tech: "Framer Motion • React",
    description: "A digital playground for visual interaction.",
    src: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633424/relevance_z3b835.webp",
    link: "https://relevance-studio-website-ange.vercel.app/",
  },
  {
    id: 3,
    title: "Clean Co.",
    category: "E-Commerce",
    tech: "Shopify Headless • GSAP",
    description: "High-performance headless commerce architecture.",
    src: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633423/clean_i3m4rj.webp",
    link: "https://clean-collected-website.vercel.app/",
  },
  {
    id: 4,
    title: "NY Dentistry",
    category: "Medical 3D",
    tech: "Three.js • React Fiber",
    description: "Interactive 3D anatomical visualization.",
    src: "https://res.cloudinary.com/dpmejirju/image/upload/v1769633423/dentistry_gnee8u.webp",
    link: "https://ny-dentistry-website.vercel.app/",
  }
];

// --- DESKTOP CARD (Performance Tuned) ---
const MasterCard = ({ project, index }: { project: any, index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    // Physics thora soft kiya taake GPU spike na aye
    const mouseX = useSpring(x, { stiffness: 120, damping: 25 });
    const mouseY = useSpring(y, { stiffness: 120, damping: 25 });

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        x.set(clientX - left);
        y.set(clientY - top);
    }

    const spotlight = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 80%)`;

    return (
        <div 
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className="group relative w-[90vw] md:w-[85vw] lg:w-[80vw] max-w-[1400px] h-[60vh] md:h-[70vh] lg:h-[80vh] rounded-[2rem] md:rounded-[2.5rem] bg-[#050505] border border-white/5 overflow-hidden shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)] will-change-transform"
        >
            {/* 1. IMAGE LAYER */}
            <div className="absolute inset-0 z-0 bg-black overflow-hidden">
                <Image 
                    fill 
                    sizes="(max-width: 1400px) 90vw, 1400px"
                    src={project.src} 
                    alt={project.title} 
                    priority={index === 0}
                    // Blur scale ko thora kam kiya performance ke liye
                    className="object-cover opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-[1.2s] ease-out grayscale group-hover:grayscale-0 will-change-transform"
                />
            </div>

            {/* 2. GRADIENT OVERLAY */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 pointer-events-none" />

            {/* 3. SPOTLIGHT (Mouse Tracking) */}
            <motion.div 
                className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay" 
                style={{ background: spotlight }} 
            />

            {/* --- TOP BAR --- */}
            <div className="absolute top-6 left-6 right-6 md:top-10 md:left-10 md:right-10 z-30 flex justify-between items-start">
                <div className="flex items-center gap-3">
                      <span className="text-[10px] md:text-xs font-mono text-white/30 tracking-widest flex items-center gap-2">
                          <Hash className="w-3 h-3"/> 0{index + 1}
                      </span>
                      <span className="px-3 py-1.5 rounded-full border border-white/10 bg-black/50 text-[10px] md:text-xs text-white/80 font-bold uppercase tracking-widest backdrop-blur-md">
                          {project.category}
                      </span>
                </div>
                
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-black/50 backdrop-blur-md">
                    <Cpu className="w-3 h-3 text-white/40" />
                    <span className="text-[10px] text-white/50 font-mono">{project.tech}</span>
                </div>
            </div>

            {/* --- BOTTOM CONTENT --- */}
            <div className="absolute bottom-0 w-full p-6 md:p-12 lg:p-16 z-30">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div className="relative">
                        {/* Glowing Line */}
                        <div className="absolute -left-6 md:-left-12 top-0 bottom-0 w-1 bg-[#E50914] scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom" />
                        
                        <h3 className="text-[clamp(2.5rem,5vw,6rem)] font-black text-white uppercase leading-[0.85] mb-4 md:mb-6 tracking-tight drop-shadow-2xl">
                            {project.title}
                        </h3>
                        <div className="h-[1px] w-0 group-hover:w-full bg-white/30 transition-all duration-700 ease-out" />
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-4 text-left md:text-right w-full md:w-auto">
                        <p className="text-white/60 text-sm md:text-base max-w-sm font-light leading-relaxed hidden md:block">
                            {project.description}
                        </p>
                        <a href={project.link} target="_blank" className="relative overflow-hidden flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-white transition-colors group/link px-6 py-3 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm hover:border-[#E50914] cursor-pointer">
                            <div className="absolute inset-0 bg-[#E50914] translate-y-[100%] group-hover/link:translate-y-0 transition-transform duration-300 ease-out z-0" />
                            <span className="relative z-10">View Project</span>
                            <ArrowUpRight className="relative z-10 w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WebDevelopment() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  
  useLayoutEffect(() => {
    // ⚡ LAZY LOAD FIX: Refresh ScrollTrigger after a tiny delay to ensure height is correct
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 500);

    const mm = gsap.matchMedia();
    
    // --- SMART ANIMATION: Only on Desktop (Performance Saver) ---
    mm.add("(min-width: 1024px)", () => {
        const cards = cardsRef.current;
        if (!cards.length) return;
        
        // Initial State
        gsap.set(cards, { position: "absolute", top: "50%", left: "50%", xPercent: -50, yPercent: -50 });
        gsap.set(cards.slice(1), { yPercent: 150 }); 

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top", 
                end: `+=${cards.length * 100}%`,
                pin: true,          
                pinSpacing: true,   
                scrub: 1, 
                anticipatePin: 1,
            }
        });

        cards.forEach((card, i) => {
            if (i > 0) {
                // Card Slide Up
                tl.to(card, { 
                    yPercent: -50, 
                    duration: 1, 
                    ease: "power2.out" // Thora smooth kiya 'none' se
                });
                
                // Previous Card Fade & Scale
                tl.to(cards[i - 1], { 
                    scale: 0.92, 
                    opacity: 0, 
                    // ⚡ PERFORMANCE FIX: Heavy Blur removed. Opacity is enough for depth.
                    // filter: "blur(10px)", // Removed to save GPU
                    duration: 1 
                }, "<"); 
            }
        });
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="bg-[#020202] relative z-30 font-sans min-h-screen flex flex-col">
      
      {/* HEADER SECTION */}
      <div className="pt-24 pb-8 md:pt-32 md:pb-12 text-center px-4 relative z-20">
        <div className="relative z-10 flex flex-col items-center gap-4 md:gap-6">
             <span className="px-4 py-1.5 rounded-full border border-white/5 bg-[#0a0a0a] text-[9px] md:text-[10px] text-white/50 font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full animate-pulse"/>
                Selected Work
            </span>
            <h2 className="text-[clamp(3.5rem,12vw,9rem)] font-black text-white uppercase leading-[0.85] tracking-tighter">
                The <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent">Flagship</span>
            </h2>
        </div>
      </div>

      {/* --- DESKTOP VIEW (STACKING CARDS) --- */}
      {/* ⚡ Added will-change-transform for smooth pinning */}
      <div ref={containerRef} className="hidden lg:block h-screen w-full relative perspective-[2000px] will-change-transform">
        {projects.map((project, i) => (
          <div
            key={project.id}
            ref={(el) => { if (el) cardsRef.current[i] = el; }}
            className="w-full h-full flex items-center justify-center will-change-transform z-10"
            style={{ zIndex: i + 1 }}
          >
             <MasterCard project={project} index={i} />
          </div>
        ))}
      </div>

      {/* --- MOBILE/TABLET VIEW (SNAP SCROLL) --- */}
      <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory px-4 md:px-8 pb-12 pt-4 gap-4 md:gap-6 w-full items-center min-h-[70vh] no-scrollbar">
        {projects.map((project, i) => (
            <div key={i} className="min-w-[85vw] md:min-w-[60vw] snap-center">
                <div className="relative w-full h-[55vh] md:h-[60vh] rounded-[1.5rem] md:rounded-[2rem] bg-[#050505] border border-white/10 overflow-hidden shadow-2xl active:scale-[0.98] transition-transform duration-200 group">
                    
                    {/* Mobile Header */}
                    <div className="absolute top-5 left-5 right-5 z-30 flex justify-between items-center">
                          <span className="text-[10px] font-mono text-white/40 font-bold">0{i + 1}</span>
                          <span className="px-2 py-1 rounded-md bg-black/60 border border-white/10 text-[9px] text-white/80 font-bold uppercase tracking-wider backdrop-blur-md">
                             {project.category}
                          </span>
                    </div>

                    {/* Mobile Image */}
                    <div className="absolute inset-0 bg-black z-0">
                          <Image 
                            fill 
                            src={project.src} 
                            alt={project.title} 
                            sizes="(max-width: 768px) 85vw, 60vw"
                            className="object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" 
                        />
                    </div>

                    {/* Gradient Floor */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-20 pointer-events-none" />
                    
                    {/* Mobile Content */}
                    <div className="absolute bottom-0 w-full p-6 md:p-8 z-30 flex flex-col gap-3">
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase leading-none drop-shadow-lg">
                            {project.title}
                        </h3>
                        <p className="text-white/60 text-xs md:text-sm line-clamp-2 font-light">
                            {project.description}
                        </p>
                        
                        <div className="mt-2 flex items-center gap-2">
                             <a href={project.link} target="_blank" className="px-4 py-3 md:py-4 w-full text-center rounded-full bg-white text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-[#E50914] hover:text-white transition-colors">
                                View Case Study
                             </a>
                        </div>
                    </div>
                </div>
            </div>
        ))}
        {/* Spacer for scroll padding */}
        <div className="min-w-[4vw] shrink-0" />
      </div>

    </section>
  );
}