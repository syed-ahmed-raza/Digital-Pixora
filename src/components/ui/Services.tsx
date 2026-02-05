"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; 
import { Terminal, Palette, Film, Bot, ArrowUpRight, Plus } from "lucide-react";

// --- TYPESCRIPT INTERFACE ---
interface ServiceItem {
  id: number;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}

const services: ServiceItem[] = [
  {
    id: 1,
    number: "01",
    title: "Web Engineering",
    shortTitle: "Web Dev",
    description: "High-performance digital engines using Next.js 14. We build scalable systems that power ambitious brands.",
    icon: <Terminal className="w-5 h-5 md:w-6 md:h-6" />,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&auto=format&fit=crop", 
  },
  {
    id: 2,
    number: "02",
    title: "Visual Identity",
    shortTitle: "Branding",
    description: "Crafting the visual soul of your brand. From logos to design systems, we ensure you're unforgettable.",
    icon: <Palette className="w-5 h-5 md:w-6 md:h-6" />,
    image: "https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    number: "03",
    title: "Motion Design",
    shortTitle: "Motion",
    description: "Cinematic storytelling that stops the scroll. We blend 3D, VFX, and fluid animation to captivate audiences.",
    icon: <Film className="w-5 h-5 md:w-6 md:h-6" />,
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&auto=format&fit=crop",
  },
  {
    id: 4,
    number: "04",
    title: "Neural Systems",
    shortTitle: "AI Gen",
    description: "Leveraging custom AI models to generate assets and automate workflows that were previously impossible.",
    icon: <Bot className="w-5 h-5 md:w-6 md:h-6" />,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&auto=format&fit=crop",
  },
];

export default function Services() {
  const [activeId, setActiveId] = useState<number>(1); 
  const [isMobile, setIsMobile] = useState(false); // Default to false to prevent hydration mismatch

  useEffect(() => {
    // ⚡ SAFE RESIZE LISTENER
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    
    // Initial check after mount
    checkMobile();
    
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section id="services" className="relative py-16 md:py-32 px-4 md:px-8 z-10 font-sans bg-[#050505] min-h-screen flex flex-col justify-center overflow-hidden">
      
      {/* --- BACKGROUND NOISE (Desktop Only) --- */}
      <div className="hidden md:block absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-[1400px] w-full mx-auto space-y-8 md:space-y-16">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-12 border-b border-white/10 pb-6 md:pb-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <span className="text-[#E50914] text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-[#E50914] rounded-full animate-pulse"/>
                    Capabilities
                </span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                    Digital <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5722] via-[#E50914] to-[#8a040b]">
                        Arsenal.
                    </span>
                </h2>
            </motion.div>
            
            <motion.p 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white/50 text-sm md:text-base max-w-md leading-relaxed text-balance pb-2"
            >
                We don't just build websites; we engineer digital ecosystems. Select a domain to explore our technical weaponry.
            </motion.p>
        </div>

        {/* --- ELASTIC ACCORDION --- */}
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4 w-full h-auto lg:h-[600px]">
            {services.map((service) => {
                const isActive = activeId === service.id;
                
                return (
                    <motion.div
                        key={service.id}
                        // Fix: Always animate layout for smoothness, but tune duration
                        layout 
                        onClick={() => setActiveId(service.id)}
                        onMouseEnter={() => !isMobile && setActiveId(service.id)}
                        transition={{
                            layout: {
                                duration: isMobile ? 0.4 : 0.6, // Faster on mobile
                                ease: isMobile ? "easeOut" : [0.25, 1, 0.5, 1]
                            }
                        }}
                        className={`
                            relative overflow-hidden rounded-xl md:rounded-[2rem] border cursor-pointer group 
                            /* GPU Acceleration Hint */
                            transform-gpu will-change-[flex-grow]
                            ${isActive 
                                ? "lg:flex-[3.5] bg-transparent border-[#E50914] md:shadow-[0_0_20px_-5px_rgba(229,9,20,0.3)]" 
                                : "lg:flex-[0.5] bg-white/5 border-white/5 hover:border-white/20" 
                            }
                            ${isActive 
                                ? "h-[500px] lg:h-auto w-full" // Increased mobile height for better visibility
                                : "h-[80px] sm:h-[100px] lg:h-auto w-full" 
                            }
                        `}
                    >
                        {/* BACKGROUND IMAGE */}
                        <div className="absolute inset-0 bg-[#050505] z-0" />
                        <AnimatePresence mode="popLayout">
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 1.1 }} 
                                    animate={{ opacity: 0.4, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.8 }} 
                                    className="absolute inset-0 bg-cover bg-center pointer-events-none grayscale mix-blend-luminosity"
                                    style={{ 
                                        backgroundImage: `url(${service.image}&w=${isMobile ? 600 : 1200})`, 
                                        willChange: "opacity, transform" 
                                    }}
                                />
                            )}
                        </AnimatePresence>
                        
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black z-10 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`} />

                        {/* --- CONTENT CONTAINER --- */}
                        <AnimatePresence>
                        {isActive && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }} 
                                className="absolute inset-0 z-20 p-5 md:p-10 flex flex-col justify-between"
                            >
                                {/* Top: Number & Status */}
                                <div className="flex justify-between items-start">
                                    <div className={`
                                        flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 
                                        ${isMobile ? "bg-[#111]" : "bg-white/5 backdrop-blur-md"}
                                    `}>
                                        <div className="w-1.5 h-1.5 bg-[#E50914] rounded-full animate-pulse" />
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-white font-bold">Online</span>
                                    </div>
                                    <h2 className="text-[60px] md:text-[100px] xl:text-[120px] font-black text-white/[0.03] leading-none select-none tracking-tighter">
                                        {service.number}
                                    </h2>
                                </div>

                                {/* Bottom: Info Block */}
                                <div className="flex flex-col gap-4 md:gap-8 relative">
                                    <div className={`
                                        w-10 h-10 md:w-16 md:h-16 rounded-2xl bg-[#E50914] text-white flex items-center justify-center 
                                        ${!isMobile && "shadow-[0_0_30px_rgba(229,9,20,0.5)]"} 
                                    `}>
                                        {service.icon}
                                    </div>

                                    <div>
                                        <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase text-white leading-[0.9] mb-2 md:mb-4">
                                            {service.title}
                                        </h3>
                                        <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-lg font-light leading-relaxed text-balance">
                                            {service.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 group/btn w-fit pt-2">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-all duration-300">
                                            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/50 group-hover/btn:text-white transition-colors">Explore</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>

                        {/* 2. INACTIVE STRIP (Collapsed) */}
                        <AnimatePresence>
                            {!isActive && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex lg:flex-col items-center lg:justify-center justify-between px-6 lg:px-0 z-20"
                                >
                                    <div className="flex items-center gap-4 lg:hidden">
                                        <span className="text-white/30 font-bold font-mono text-sm">{service.number}</span>
                                        <span className="text-white font-bold uppercase tracking-wider text-sm">{service.shortTitle}</span>
                                    </div>
                                    
                                    <h3 className="hidden lg:block text-xl font-bold text-white/40 uppercase tracking-widest lg:-rotate-90 whitespace-nowrap group-hover:text-white transition-colors">
                                        {service.shortTitle}
                                    </h3>

                                    <div className="lg:hidden text-white/40 p-2 bg-white/5 rounded-full border border-white/5">
                                        <Plus className="w-5 h-5" />
                                    </div>

                                    <span className="absolute bottom-10 text-sm font-bold text-white/20 hidden lg:block font-mono">
                                        {service.number}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </motion.div>
                );
            })}
        </div>

      </div>
    </section>
  );
}