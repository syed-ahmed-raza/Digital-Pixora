"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView, useSpring, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Globe, Cpu, CheckCircle2, ArrowRight, Layers, Zap, Activity, Code2, Server } from "lucide-react";

// --- 1. HYPER-TEXT DECRYPTION (Optimized) ---
const HyperText = ({ text, trigger }: { text: string, trigger: boolean }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"; 

  useEffect(() => {
    if (!trigger) return;
    
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(text
        .split("")
        .map((letter, index) => {
          if (letter === " ") return " ";
          if (index < iterations) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("")
      );

      if (iterations >= text.length) clearInterval(interval);
      iterations += 1 / 3; 
    }, 30);

    return () => clearInterval(interval);
  }, [trigger, text]);

  return (
    <span className="relative inline-block overflow-hidden">
      <span className="opacity-0">{text}</span>
      <span className="absolute top-0 left-0 w-full h-full">{displayText}</span>
    </span>
  );
};

// --- 2. ANIMATED COUNTER (Spring Physics) ---
const Counter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });
  const springValue = useSpring(0, { stiffness: 60, damping: 20 }); 
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) springValue.set(value);
  }, [isInView, value, springValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => setDisplay(Math.floor(latest)));
  }, [springValue]);

  return <span ref={ref} className="tabular-nums">{display}{suffix}</span>;
};

// --- 3. 3D TILT CONTAINER (Desktop Only Optimization) ---
const TiltContainer = ({ children }: { children: React.ReactNode }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [5, -5]); 
    const rotateY = useTransform(x, [-100, 100], [-5, 5]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    return (
        <motion.div 
            style={{ rotateX, rotateY, perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            className="w-full aspect-square max-w-[90vw] md:max-w-[500px] relative transition-all ease-out duration-200 group mx-auto will-change-transform"
        >
            {/* Glowing Border Gradient */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-[#E50914]/40 to-transparent rounded-[2.1rem] blur opacity-20 group-hover:opacity-50 transition-opacity duration-500" />
            
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-[#080808]">
                {children}
                {/* Screen Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-50 mix-blend-overlay" />
            </div>
        </motion.div>
    );
};

// --- 4. HOLOGRAPHIC VISUALS (GPU Optimized) ---

// A. INTELLIGENCE (The Brain)
const VisualBrain = () => (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-grid-white/[0.02]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[#E50914] opacity-[0.15] blur-[80px]" />
        
        {/* Spinning Core - GPU Optimized */}
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative z-10 w-48 h-48 flex items-center justify-center will-change-transform"
        >
            {/* Outer Rings */}
            <div className="absolute inset-0 border border-[#E50914]/20 rounded-full border-t-transparent animate-[spin_4s_linear_infinite]" />
            <div className="absolute inset-4 border border-[#E50914]/40 rounded-full border-b-transparent animate-[spin_6s_linear_infinite_reverse]" />
            <div className="absolute inset-10 border border-dashed border-[#E50914]/60 rounded-full animate-[spin_10s_linear_infinite]" />
            
            {/* Core */}
            <div className="w-20 h-20 bg-[#E50914] rounded-full blur-2xl animate-pulse opacity-40 absolute" />
            <div className="w-16 h-16 bg-gradient-to-br from-[#E50914] to-black rounded-full border border-[#E50914]/50 flex items-center justify-center relative z-20 shadow-[0_0_30px_#E50914]">
                <Cpu className="w-8 h-8 text-white animate-pulse" />
            </div>
        </motion.div>

        {/* HUD Data */}
        <div className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md flex items-center gap-4 shadow-lg w-[80%] justify-between">
            <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-[#E50914] animate-pulse" />
                <div className="flex flex-col">
                    <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Neural Load</span>
                    <span className="text-xs font-bold text-white font-mono">OPTIMAL</span>
                </div>
            </div>
            <div className="text-right">
                 <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Core</span>
                 <span className="block text-xs font-bold text-[#E50914] font-mono">v4.0.2</span>
            </div>
        </div>
    </div>
)

// B. ENGINEERING (The Code)
const VisualCode = () => (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#E50914]/10 via-transparent to-transparent" />
        
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-sm bg-[#0F0F0F] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative z-10"
        >
            {/* Window Bar */}
            <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E50914]" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-auto text-[9px] font-mono text-white/30 flex items-center gap-1">
                    <Server className="w-3 h-3" /> deploy.tsx
                </span>
            </div>

            {/* Code Body */}
            <div className="p-6 space-y-3 font-mono text-xs relative">
                <div className="flex gap-3 text-white/40"><span>01</span> <span className="text-purple-400">import</span> <span className="text-white">Future</span> <span className="text-purple-400">from</span> <span className="text-yellow-300">'@pixora/core'</span>;</div>
                <div className="flex gap-3 text-white/40"><span>02</span></div>
                <div className="flex gap-3 text-white/40"><span>03</span> <span className="text-blue-400">const</span> <span className="text-blue-300">stack</span> = <span className="text-yellow-300">"Next.js 15"</span>;</div>
                <div className="flex gap-3 text-white/40"><span>04</span> <span className="text-blue-400">await</span> <span className="text-blue-300">deploy</span>(<span className="text-white">Universe</span>);</div>
                
                {/* Compilation Bar - OPTIMIZED: Uses scaleX instead of width to prevent reflows */}
                <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-green-400 mb-2">
                        <span className="flex items-center gap-1"><Code2 className="w-3 h-3" /> Compiling</span> 
                        <span>100%</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ scaleX: 0 }} 
                            animate={{ scaleX: 1 }} 
                            style={{ originX: 0 }}
                            transition={{ duration: 2, ease: "circOut", repeat: Infinity, repeatDelay: 3 }} 
                            className="h-full w-full bg-green-500 shadow-[0_0_10px_#22c55e] will-change-transform" 
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
)

// C. IMPACT (The Radar)
const VisualGlobe = () => (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-black">
        {/* Radar Sweep - GPU Optimized */}
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_300deg,rgba(229,9,20,0.2)_360deg)] animate-[spin_4s_linear_infinite] will-change-transform" />
        
        {/* Grid Floor */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 flex flex-col items-center">
            <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-36 h-36 flex items-center justify-center border border-white/10 rounded-full bg-[#050505] shadow-[0_0_50px_-10px_rgba(229,9,20,0.3)] will-change-transform"
            >
                <Globe className="w-16 h-16 text-white/90" />
                
                {/* Orbiting Dots */}
                <div className="absolute w-full h-full rounded-full border border-dashed border-[#E50914]/40 animate-[spin_10s_linear_infinite]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-3 h-3 bg-[#E50914] rounded-full shadow-[0_0_15px_#E50914]" />
            </motion.div>

            <div className="mt-8 flex gap-8">
                 <div className="text-center">
                     <span className="block text-2xl font-bold text-white tabular-nums">50ms</span>
                     <span className="text-[9px] uppercase tracking-widest text-white/40">Global Latency</span>
                 </div>
                 <div className="w-[1px] h-full bg-white/10" />
                 <div className="text-center">
                     <span className="block text-2xl font-bold text-white tabular-nums">12+</span>
                     <span className="text-[9px] uppercase tracking-widest text-white/40">Edge Regions</span>
                 </div>
            </div>
        </div>
    </div>
)

const content = [
  { id: "01", tag: "Intelligence", title: "Think First. Code Later.", desc: "We don't guess. We architect. Our AI-driven planning phase cuts development risks by 40% before a single line of code is written.", visual: <VisualBrain /> },
  { id: "02", tag: "Engineering", title: "Built for Scale.", desc: "Spaghetti code kills startups. We build modular, scalable, and self-documenting systems using Next.js & Rust. Ready for millions of users.", visual: <VisualCode /> },
  { id: "03", tag: "Impact", title: "Global Reach.", desc: "Deployed on the Edge. Whether your user is in New York, London, or Dubai, your app loads in <100ms. We build borderless digital empires.", visual: <VisualGlobe /> }
];

// --- 5. TEXT CARD COMPONENT ---
const TextCard = ({ item, index, setActiveIndex }: any) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-45% 0px -45% 0px" });

    useEffect(() => {
        if (isInView) setActiveIndex(index);
    }, [isInView, index, setActiveIndex]);

    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: isInView ? 1 : 0.2 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center min-h-[auto] md:min-h-[80vh] py-16 md:py-20"
        >
            <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent stroke-white" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>
                    0{index + 1}
                </span>
                <span className="px-3 py-1 rounded-full border border-[#E50914]/30 bg-[#E50914]/10 text-[10px] font-bold uppercase tracking-widest text-[#E50914]">
                    {item.tag}
                </span>
            </div>
            
            {/* Heading Container */}
            <div className="min-h-[4rem] md:min-h-[6rem] flex items-center">
                <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                    <HyperText text={item.title} trigger={isInView} />
                </h3>
            </div>
            
            <p className="text-white/60 text-base md:text-xl leading-relaxed max-w-lg mb-8 mt-4">
                {item.desc}
            </p>

            {/* Mobile Visual (Visible only on mobile/tablet) */}
            <div className="lg:hidden w-full aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-lg mt-4">
                {item.visual}
            </div>
        </motion.div>
    )
}

// --- 6. MAIN COMPONENT ---
export default function About() {
  const container = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0); 
  
  return (
    <section 
        ref={container} 
        id="about"
        style={{ overflowX: 'clip' }} 
        className="relative bg-[#050505] pt-20 pb-20 md:pt-32 md:pb-40 border-t border-white/5 z-20"
    >
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* HEADER */}
        <div className="mb-16 md:mb-32 max-w-4xl">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                <span className="w-2 h-2 bg-[#E50914] rounded-full animate-pulse"/>
                <span className="text-[10px] md:text-xs font-mono font-bold text-white/60 uppercase tracking-widest">System Manifesto</span>
            </div>
            <h2 className="text-[clamp(3rem,8vw,6rem)] font-black text-white uppercase tracking-tighter leading-[0.9]">
                We Engineer <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">The Future.</span>
            </h2>
        </div>

        {/* SCROLLYTELLING LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start relative">
            
            {/* STICKY VISUALS (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 sticky top-20 h-[80vh] items-center justify-center">
                <TiltContainer>
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeIndex}
                            initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 1.05, y: -20, filter: "blur(10px)" }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full h-full"
                        >
                            {content[activeIndex].visual}
                        </motion.div>
                    </AnimatePresence>
                </TiltContainer>
            </div>

            {/* SCROLLING TEXT */}
            <div className="w-full lg:w-1/2 flex flex-col pt-0 lg:pt-20">
                {content.map((item, i) => (
                    <TextCard key={i} item={item} index={i} setActiveIndex={setActiveIndex} isActive={activeIndex === i} />
                ))}
                
                <div className="h-[20vh] flex flex-col justify-center items-start mt-12 md:mt-0">
                    <button className="group flex items-center gap-4 text-2xl md:text-5xl font-black text-white hover:text-[#E50914] transition-colors">
                        Start Project <ArrowRight className="w-6 h-6 md:w-12 md:h-12 group-hover:translate-x-4 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </div>
        
        {/* STATS */}
        <div className="mt-20 md:mt-32 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
                { label: "Projects Shipped", val: 150, suffix: "+", icon: <Layers className="w-4 h-4 text-[#E50914]"/> },
                { label: "System Uptime", val: 99, suffix: "%", icon: <Zap className="w-4 h-4 text-[#E50914]"/> },
                { label: "Global Partners", val: 12, suffix: "+", icon: <Globe className="w-4 h-4 text-[#E50914]"/> },
                { label: "Client Retention", val: 98, suffix: "%", icon: <CheckCircle2 className="w-4 h-4 text-[#E50914]"/> }
            ].map((stat, i) => (
                <div key={i} className="flex flex-col group cursor-default">
                    <div className="mb-3 opacity-50 group-hover:opacity-100 transition-opacity">{stat.icon}</div>
                    <h4 className="text-3xl md:text-5xl font-bold text-white mb-2 tabular-nums tracking-tight">
                        <Counter value={stat.val} suffix={stat.suffix} />
                    </h4>
                    <p className="text-[10px] md:text-xs uppercase tracking-widest text-white/40 border-l border-[#E50914] pl-3">
                        {stat.label}
                    </p>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}