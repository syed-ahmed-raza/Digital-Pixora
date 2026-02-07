"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import { Terminal, Palette, Film, Bot, Plus, Activity, ArrowRight } from "lucide-react";

// --- DATA ---
const services = [
  {
    id: 1,
    number: "01",
    title: "Web Engineering",
    shortTitle: "Web Dev",
    description: "Architecting high-performance digital ecosystems with Next.js 14. We build scalable, SEO-dominant systems that power ambitious brands.",
    icon: <Terminal className="w-5 h-5 md:w-6 md:h-6" />,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&auto=format&fit=crop", 
  },
  {
    id: 2,
    number: "02",
    title: "Visual Identity",
    shortTitle: "Branding",
    description: "Crafting the visual soul of your brand. From logos to comprehensive design systems, we ensure you are unforgettable.",
    icon: <Palette className="w-5 h-5 md:w-6 md:h-6" />,
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    number: "03",
    title: "Motion Design",
    shortTitle: "Motion",
    description: "Cinematic storytelling that stops the scroll. We blend 3D, VFX, and fluid animation to captivate audiences instantly.",
    icon: <Film className="w-5 h-5 md:w-6 md:h-6" />,
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&auto=format&fit=crop",
  },
  {
    id: 4,
    number: "04",
    title: "Neural Systems",
    shortTitle: "AI Gen",
    description: "Leveraging custom AI models to generate assets and automate creative workflows that were previously impossible.",
    icon: <Bot className="w-5 h-5 md:w-6 md:h-6" />,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&auto=format&fit=crop",
  },
];

export default function Services() {
  const [activeId, setActiveId] = useState<number>(1); 
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- ⚡ SAFE RESIZE LISTENER ---
  useEffect(() => {
    setMounted(true);
    let timeoutId: NodeJS.Timeout;
    
    const checkScreen = () => setIsMobile(window.innerWidth < 1024);
    checkScreen();

    const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(checkScreen, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 🔥 AUTO-SCROLL LOGIC FOR MOBILE ---
  const handleCardClick = (id: number) => {
    setActiveId(id);
    
    // Only scroll on mobile to keep focus
    if (window.innerWidth < 1024) {
        setTimeout(() => {
            const element = document.getElementById(`service-card-${id}`);
            if (element) {
                const yOffset = -100; // Offset for header
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 300); // Delay allows layout animation to start first
    }
  };

  if (!mounted) return null; 

  return (
    <section id="services" className="relative py-20 md:py-32 px-4 md:px-8 bg-[#050505] overflow-hidden min-h-screen flex flex-col justify-center">
      
      {/* 🌌 Background Ambience */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#E50914]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto w-full space-y-12 md:space-y-16">
        
        {/* 🔥 HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 mb-3"
                >
                    <div className="h-[2px] w-8 bg-[#E50914]" />
                    <span className="text-[#E50914] text-xs font-black uppercase tracking-[0.25em]">Core Capabilities</span>
                </motion.div>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                    Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-orange-600">Arsenal</span>
                </h2>
            </div>
            <p className="text-white/40 text-sm md:text-lg max-w-sm leading-relaxed hidden md:block text-right">
                Select a domain to deploy our<br/>technical weaponry.
            </p>
        </div>

        {/* 🚀 ULTRA-FLUID ACCORDION */}
        <div className="flex flex-col lg:flex-row gap-4 w-full lg:h-[650px]">
            {services.map((service) => {
                const isActive = activeId === service.id;
                
                return (
                    <motion.div
                        key={service.id}
                        id={`service-card-${service.id}`} // Hook for auto-scroll
                        layout // Enables the smooth resizing
                        onClick={() => handleCardClick(service.id)}
                        onMouseEnter={() => !isMobile && setActiveId(service.id)}
                        transition={{ 
                            layout: { duration: 0.5, type: "spring", stiffness: 120, damping: 20 } 
                        }}
                        className={`
                            relative overflow-hidden rounded-2xl lg:rounded-[2.5rem] border cursor-pointer group 
                            transition-all duration-500
                            transform-gpu will-change-[flex-grow]

                            /* --- BOSS LEVEL RESPONSIVE FLEX --- */
                            ${isActive 
                                ? "flex-[10] lg:flex-[3.5] bg-[#0a0a0a] border-[#E50914] shadow-[0_0_50px_rgba(229,9,20,0.15)]" 
                                : "flex-[1] lg:flex-[0.5] bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]" 
                            }
                            
                            /* 🛠️ FIX: Mobile Height Logic 
                               - Active: 500px (Enough space for content)
                               - Inactive: 60px (Compact, just label visible)
                            */
                            ${isActive ? "min-h-[500px] lg:min-h-auto" : "min-h-[60px] lg:min-h-auto"}
                        `}
                    >
                        {/* 1. ACTIVE VISUALS (Background) */}
                        <AnimatePresence mode="popLayout">
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute inset-0 z-0"
                                >
                                    {/* Parallax Image Effect */}
                                    <motion.div 
                                        className="absolute inset-0 bg-cover bg-center grayscale opacity-30 mix-blend-luminosity"
                                        style={{ backgroundImage: `url(${service.image})` }}
                                        animate={{ scale: 1.1 }}
                                        transition={{ duration: 10, ease: "linear" }}
                                    />
                                    {/* Heavy Vignette for Text Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 to-transparent" />
                                    
                                    {/* Laser Scan Line */}
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#E50914] to-transparent opacity-60 animate-scan" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 2. ACTIVE CONTENT */}
                        <AnimatePresence>
                            {isActive && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                                    className="absolute inset-0 p-6 md:p-12 flex flex-col justify-between z-20"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-[0_0_15px_rgba(229,9,20,0.2)]">
                                            <Activity className="w-3 h-3 text-[#E50914] animate-pulse" />
                                            <span className="text-[10px] uppercase tracking-widest text-white font-bold">Online</span>
                                        </div>
                                        {/* Number: Responsive Clamp Font */}
                                        <h3 className="font-black text-white/[0.03] leading-none absolute top-4 right-4 lg:top-6 lg:right-10 select-none pointer-events-none"
                                            style={{ fontSize: "clamp(60px, 10vw, 140px)" }}
                                        >
                                            {service.number}
                                        </h3>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-[#E50914] rounded-2xl flex items-center justify-center mb-4 md:mb-8 shadow-[0_10px_30px_rgba(229,9,20,0.3)] group-hover:scale-110 transition-transform duration-500">
                                            {service.icon}
                                        </div>
                                        {/* Title: Responsive Clamp Font */}
                                        <h2 className="font-black uppercase text-white mb-4 leading-[0.9]"
                                            style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
                                        >
                                            {service.title}
                                        </h2>
                                        <p className="text-white/70 text-sm md:text-lg max-w-lg font-light leading-relaxed text-pretty mb-6 md:mb-0">
                                            {service.description}
                                        </p>

                                        {/* Mobile Only 'Explore' hint */}
                                        <div className="lg:hidden flex items-center gap-2 text-[#E50914] text-xs font-bold uppercase tracking-widest mt-6">
                                            Explore <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. INACTIVE STRIP (The Label) */}
                        <div className={`absolute inset-0 flex items-center px-6 transition-all duration-500 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'}`}>
                            
                            {/* Mobile Row */}
                            <div className="lg:hidden flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <span className="text-[#E50914] font-mono text-sm">{service.number}</span>
                                    <span className="text-white font-bold uppercase tracking-wider text-lg">{service.shortTitle}</span>
                                </div>
                                <div className="p-2 border border-white/10 rounded-full text-white/30 bg-white/5">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Desktop Vertical Column */}
                            <div className="hidden lg:flex flex-col items-center justify-center h-full w-full relative">
                                <span className="absolute top-8 text-white/20 font-mono text-sm">{service.number}</span>
                                <h3 className="text-xl font-bold text-white/40 uppercase tracking-[0.2em] -rotate-90 whitespace-nowrap group-hover:text-white transition-colors duration-300">
                                    {service.shortTitle}
                                </h3>
                                <div className="absolute bottom-8 w-1 h-1 bg-[#E50914] rounded-full opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_15px_#E50914] transition-all duration-300 scale-0 group-hover:scale-150" />
                            </div>
                        </div>

                    </motion.div>
                );
            })}
        </div>

      </div>

      <style jsx global>{`
        @keyframes scan {
            0% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-scan {
            animation: scan 4s ease-in-out infinite;
        }
        .text-pretty { text-wrap: pretty; }
      `}</style>
    </section>
  );
}