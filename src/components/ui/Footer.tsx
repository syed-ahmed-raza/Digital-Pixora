"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useVelocity, 
  useAnimationFrame 
} from "framer-motion";
import { wrap } from "@motionone/utils";
import { ArrowUp, ArrowUpRight, Instagram, Linkedin, Twitter, Radio, Clock, Command } from "lucide-react";

// ✅ IMPORT COMMAND MENU (Assuming this handles the actual menu UI)
import CommandMenu from "@/components/ui/CommandMenu";

// --- 1. LIVE CLOCK COMPONENT (Hydration Safe) ---
const LiveClock = () => {
    const [time, setTime] = useState<string>("--:--:--");
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
        const updateTime = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = { 
                timeZone: 'Asia/Karachi', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            };
            setTime(now.toLocaleTimeString('en-US', options));
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Prevent Server/Client Mismatch
    if (!mounted) return <span className="font-mono tabular-nums opacity-50">--:--:--</span>;
    return <span className="font-mono tabular-nums">{time}</span>;
};

// --- 2. VELOCITY MARQUEE ---
interface ParallaxProps {
  children: React.ReactNode;
  baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  // Wrap range optimized for smoother loop
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap border-y border-white/5 bg-[#050505] py-6 relative z-20 select-none pointer-events-none">
      <motion.div className="flex whitespace-nowrap gap-16 px-8 will-change-transform" style={{ x }}>
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// --- 3. MAGNETIC SOCIAL BUTTON (Safe & Optimized) ---
const MagneticSocial = ({ children, href }: { children: React.ReactNode, href: string }) => {
    const ref = useRef<HTMLAnchorElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        // Magnetic Strength: 0.5 (Strong but controlled)
        setPosition({ x: (clientX - (left + width / 2)) * 0.5, y: (clientY - (top + height / 2)) * 0.5 });
    };

    return (
        <motion.a
            ref={ref}
            href={href}
            target="_blank"
            rel="noopener noreferrer" // Security best practice
            onMouseMove={handleMouse}
            onMouseLeave={() => setPosition({ x: 0, y: 0 })}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="relative w-14 h-14 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-[#E50914] hover:bg-[#E50914] transition-all duration-300 group cursor-pointer"
        >
            <div className="relative z-10 group-hover:scale-110 transition-transform duration-300">{children}</div>
        </motion.a>
    );
};

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
      setYear(new Date().getFullYear());
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const triggerCommandMenu = () => {
      // Simulate CMD+K event to trigger the Command Menu component
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }));
  };

  return (
    <footer className="relative bg-[#020202] w-full flex flex-col justify-end overflow-hidden pt-20">
      
      {/* COMMAND MENU COMPONENT */}
      <CommandMenu />

      {/* --- BACKGROUND SINGULARITY --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
          <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-[#E50914]/10 blur-[150px] rounded-full opacity-40 animate-pulse" />
      </div>

      {/* --- VELOCITY MARQUEE --- */}
      <div className="w-full z-20 mb-20">
          <ParallaxText baseVelocity={2}>
              <span className="text-sm md:text-base font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-16">
                  Strategy <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full shadow-[0_0_10px_#E50914]" />
                  Design <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full shadow-[0_0_10px_#E50914]" />
                  Engineering <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full shadow-[0_0_10px_#E50914]" />
                  Scale <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full shadow-[0_0_10px_#E50914]" />
                  Dominance <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full shadow-[0_0_10px_#E50914]" />
              </span>
          </ParallaxText>
      </div>

      <div className="relative z-10 max-w-[1600px] w-full mx-auto px-6 md:px-12 pb-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 border-b border-white/10 pb-16">
              
              {/* COL 1: BRAND & TIME */}
              <div className="md:col-span-5 flex flex-col justify-between h-full">
                  <div>
                      <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 bg-[#E50914]/10 border border-[#E50914]/20 rounded-full">
                         <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E50914] opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E50914]"></span>
                         </span>
                         <span className="text-[#E50914] text-[10px] font-black uppercase tracking-widest">System Online</span>
                      </div>
                      
                      <h2 className="text-[clamp(4rem,10vw,6rem)] font-black text-white uppercase tracking-tighter leading-[0.8]">
                          Digital <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">
                            Pixora.
                          </span>
                      </h2>
                  </div>
                  
                  <div className="mt-12 md:mt-0">
                      <p className="text-white/40 text-sm max-w-sm leading-relaxed font-mono mb-6">
                          // We architect digital dominance. <br/>
                          Forging brands into industry icons through code & design.
                      </p>
                      
                      <div className="flex items-center gap-4 text-white/60 text-xs font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#E50914]" />
                              <LiveClock />
                          </div>
                          <span className="w-px h-3 bg-white/20" />
                          <span>PKT (HQ)</span>
                      </div>
                  </div>
              </div>

              {/* COL 2: GIANT NAVIGATION */}
              <div className="md:col-span-4 flex flex-col justify-end">
                  <ul className="space-y-2">
                      {['home', 'services', 'work', 'about', 'contact'].map((id) => (
                          <li key={id} className="group">
                              <button 
                                  onClick={() => scrollToSection(id)}
                                  className="w-full flex items-center justify-between py-4 border-b border-white/5 group-hover:border-[#E50914] transition-colors"
                              >
                                  <span className="text-2xl md:text-4xl font-bold text-white/40 group-hover:text-white uppercase tracking-tighter transition-colors group-hover:translate-x-4 duration-300">
                                      {id === 'contact' ? 'Start Project' : id}
                                  </span>
                                  <div className="relative overflow-hidden w-6 h-6">
                                      <ArrowUpRight className="absolute inset-0 w-6 h-6 text-[#E50914] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                      <ArrowUpRight className="absolute inset-0 w-6 h-6 text-white/20 group-hover:-translate-y-full transition-transform duration-300" />
                                  </div>
                              </button>
                          </li>
                      ))}
                  </ul>
              </div>

              {/* COL 3: SOCIALS & LOCATION */}
              <div className="md:col-span-3 flex flex-col justify-between h-full">
                  <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 relative overflow-hidden group">
                        {/* Spinning Border Effect */}
                        <div className="absolute inset-0 rounded-full border border-white/5 w-[200%] h-[200%] -top-[50%] -left-[50%] animate-[spin_10s_linear_infinite] opacity-0 group-hover:opacity-20 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(229,9,20,0.5)_360deg)] pointer-events-none will-change-transform" />
                        
                        <div className="relative z-10">
                            <span className="text-[#E50914] text-[10px] font-black uppercase tracking-widest block mb-4">Base of Operations</span>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-white font-bold text-2xl">Hyderabad</h3>
                                <Radio className="w-5 h-5 text-[#E50914] animate-pulse" />
                            </div>
                            <p className="text-white/40 text-xs">Pakistan • Digital Ops Center</p>
                        </div>
                  </div>
                  
                  <div className="flex gap-4 mt-8 md:mt-0">
                      <MagneticSocial href="#"><Instagram className="w-5 h-5" /></MagneticSocial>
                      <MagneticSocial href="#"><Linkedin className="w-5 h-5" /></MagneticSocial>
                      <MagneticSocial href="#"><Twitter className="w-5 h-5" /></MagneticSocial>
                  </div>
              </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 pt-12">
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
                © {year || "----"} Digital Pixora. All Rights Reserved.
              </p>
              
              <div className="flex items-center gap-8">
                  <button onClick={scrollToTop} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-[#E50914] transition-colors group">
                      Back to Top <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                  </button>
                  
                  {/* CLICKABLE COMMAND BUTTON */}
                  <button 
                    onClick={triggerCommandMenu}
                    className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 active:scale-95 transition-all select-none group"
                  >
                      <Command className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
                      <span className="text-[10px] font-mono text-white/40 group-hover:text-white transition-colors">CMD+K</span>
                  </button>
              </div>
          </div>
      </div>
    </footer>
  );
}