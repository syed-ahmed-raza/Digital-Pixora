"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, Variants } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";

// --- ANIMATION VARIANTS (Optimized for 60FPS) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};



const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.5, ease: "easeOut" } // Faster duration for snappier feel
  }
};

// --- 1. SCRAMBLE TEXT (Resource Saver) ---
const ScrambleText = ({ text }: { text: string }) => {
    const [display, setDisplay] = useState(text);
    const chars = "!@#$%^&*()_+~`|{}[]:;?><,./-=";

    useEffect(() => {
        let iteration = 0;
        let interval: NodeJS.Timeout;

        // Mobile check directly inside effect
        const isMobile = window.innerWidth < 768;
        // Desktop: 30ms (Fast), Mobile: 60ms (Battery Saver)
        const speed = isMobile ? 60 : 30; 

        const startScramble = setTimeout(() => {
            interval = setInterval(() => {
                setDisplay(
                    text.split("")
                        .map((letter, index) => {
                            if (index < iteration) return text[index];
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join("")
                );

                if (iteration >= text.length) clearInterval(interval);
                iteration += 1 / 3;
            }, speed);
        }, 500);

        return () => {
            clearTimeout(startScramble);
            clearInterval(interval);
        };
    }, [text]);

    return <span>{display}</span>;
};

// --- 2. MAGNETIC BUTTON (Smart Logic) ---
const MagneticButton = ({ children, onClick, className }: any) => {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouse = (e: React.MouseEvent) => {
        // ⚠️ CRITICAL OPTIMIZATION: Mobile par calculation block kar di
        if (window.innerWidth < 1024) return; 

        const { clientX, clientY } = e;
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            const middleX = clientX - (rect.left + rect.width / 2);
            const middleY = clientY - (rect.top + rect.height / 2);
            x.set(middleX * 0.2);
            y.set(middleY * 0.2);
        }
    };

    const reset = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            style={{ x: xSpring, y: ySpring }}
            className={className}
        >
            {children}
        </motion.button>
    );
};

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);

  // --- SAFE RESIZE LISTENER ---
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    
    // Initial Check
    checkMobile();
    
    // Passive listener for performance
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- OPTIMIZED PARALLAX (Only Active on Desktop) ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return; // Stop execution on laptops/tablets/mobiles
    
    const { clientX, clientY } = e;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const x = (clientX / width) - 0.5;
    const y = (clientY / height) - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);
  
  // Transform ranges
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [7, -7]); 
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-7, 7]);
  const textX = useTransform(xSpring, [-0.5, 0.5], [-20, 20]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section 
        id="home"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[100dvh] flex flex-col justify-center items-center px-4 md:px-6 z-10 pt-24 pb-24 overflow-hidden bg-transparent"
        style={{ perspective: isMobile ? "none" : "1000px" }}
    >
      
      {/* --- BACKGROUND ATMOSPHERE (CSS GPU Animation) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Desktop: Animated Blob
            Mobile: Static Gradient (Zero Lag)
           */}
          <div 
             className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                w-[80vw] h-[80vw] md:w-[45vw] md:h-[45vw] 
                bg-gradient-to-tr from-[#682a2d] to-purple-900 
                opacity-[0.2] 
                rounded-full pointer-events-none 
                will-change-transform
                ${isMobile ? "blur-[50px]" : "blur-[90px] animate-blob"} 
             `} 
          />
          
          {/* Noise Texture (Only if needed, extremely light) */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 flex flex-col items-center w-full max-w-[1400px]"
      >

          {/* STATUS BADGE */}
          <motion.div variants={itemVariants} className="mb-6 md:mb-10">
            <div className={`
                px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-white/10 flex items-center gap-3 
                ${isMobile ? "bg-[#111]" : "bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(229,9,20,0.15)]"}
            `}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                    System Online
                </span>
            </div>
          </motion.div>

          {/* MAIN TITLE (3D only on High-End Desktop) */}
          <motion.div 
            variants={itemVariants}
            style={isMobile ? undefined : { rotateX, rotateY, x: textX }} 
            className={`text-center flex flex-col items-center mb-6 md:mb-10 ${!isMobile ? "transform-style-3d will-change-transform" : ""}`}
          >
            <h1 className="text-[clamp(3.5rem,11vw,9rem)] font-black leading-[0.9] tracking-tighter uppercase text-white select-none mix-blend-difference drop-shadow-2xl">
                Digital
            </h1>
            <h1 className="relative text-[clamp(3.5rem,11vw,9rem)] font-black leading-[0.9] tracking-tighter uppercase select-none">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5722] via-[#E50914] to-[#8a040b] bg-[length:200%_auto] animate-gradient">
                    <ScrambleText text="REALITY" />
                </span>
                
                {/* Reflection effect - Disabled on Mobile */}
                {!isMobile && (
                    <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent blur-sm opacity-50 pointer-events-none">
                        REALITY
                    </span>
                )}
            </h1>
          </motion.div>

          {/* SUBTEXT */}
          <motion.p 
              variants={itemVariants} 
              className="text-white/60 text-sm md:text-lg max-w-[90%] md:max-w-xl text-center leading-relaxed font-light text-balance tracking-wide mb-10 md:mb-12"
          >
              We engineer digital experiences where <span className="text-white font-bold">Precision</span> meets <span className="text-white font-bold">Chaos</span>. 
              Full-stack mastery for the bold.
          </motion.p>

          {/* BUTTONS */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-8 sm:px-0 mb-16">
              
              <MagneticButton 
                  onClick={() => scrollToSection('work')}
                  className="w-full sm:w-auto group relative px-8 py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-[11px] overflow-hidden transition-transform active:scale-95"
              >
                  <span className="relative z-10 flex items-center justify-center gap-3 group-hover:text-[#E50914] transition-colors duration-300">
                      View Our Work <ArrowUpRight className="w-4 h-4" />
                  </span>
                  {/* Hover effect removed for mobile touch targets */}
                  {!isMobile && (
                      <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                  )}
                  {!isMobile && (
                      <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 text-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                          View Our Work <ArrowUpRight className="w-4 h-4" />
                      </span>
                  )}
              </MagneticButton>

              <MagneticButton 
                  onClick={() => scrollToSection('contact')}
                  className={`
                    w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 group active:scale-95
                    ${isMobile ? "bg-black" : "bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50"}
                  `}
              >
                  Start a Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>

          </motion.div>

          {/* SCROLL INDICATOR (Only visible if space permits) */}
          <motion.div 
            variants={itemVariants}
            className="hidden md:flex flex-col items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => scrollToSection('services')}
          >
             <div className="w-[30px] h-[50px] rounded-full border-2 border-white/20 flex justify-center pt-2 bg-transparent">
                 <motion.div 
                   animate={{ y: [0, 12, 0] }} 
                   transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                   className="w-1.5 h-1.5 rounded-full bg-[#E50914]"
                 />
             </div>
          </motion.div>

      </motion.div>
      
      {/* CSS Styles for GPU Performance */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s ease infinite;
          will-change: background-position; /* GPU Hint */
        }
        
        /* Simple transform animation - 
           Much lighter than changing top/left/width/height 
        */
        @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(20px, -30px) scale(1.05); }
            66% { transform: translate(-10px, 10px) scale(0.95); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
            animation: blob 15s infinite ease-in-out;
        }
      `}</style>
    </section>
  );
}