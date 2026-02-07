"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, type Variants } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { BackgroundBeams } from "./BackgroundBeams";

// --- ANIMATION VARIANTS (Optimized for Snappiness) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2, 
      staggerChildren: 0.12 // Faster stagger for premium feel
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 40, opacity: 0, filter: "blur(10px)" }, // Added blur for cinematic entry
  visible: { 
    y: 0, 
    opacity: 1, 
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] } // "Out Expo" easing
  }
};

// --- 1. SCRAMBLE TEXT (Hydration & Performance Safe) ---
const ScrambleText = ({ text }: { text: string }) => {
    const [display, setDisplay] = useState(text);
    const [mounted, setMounted] = useState(false); 
    const chars = "!@#$%^&*()_+~`|{}[]:;?><,./-=";

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        let iteration = 0;
        let interval: NodeJS.Timeout;

        // Detect mobile for speed adjustment
        const isMobile = window.innerWidth < 768; 
        const speed = isMobile ? 50 : 30; 

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

        return () => clearInterval(interval);
    }, [text, mounted]);

    // Return static text on server to prevent mismatch
    if (!mounted) return <span>{text}</span>;

    return <span>{display}</span>;
};

// --- 2. MAGNETIC BUTTON (Desktop Only Logic) ---
const MagneticButton = ({ children, onClick, className }: any) => {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouse = (e: React.MouseEvent) => {
        // Strict Mobile Check: Don't calculate physics on phones
        if (typeof window !== "undefined" && window.innerWidth < 1024) return; 

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
            whileTap={{ scale: 0.95 }} // Visual feedback on touch
        >
            {children}
        </motion.button>
    );
};

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(true);
  const [mounted, setMounted] = useState(false);

  // --- DEVICE DETECTION ---
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    
    // Debounced resize listener for performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(checkMobile, 100);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(timeoutId);
    };
  }, []);

  // --- 3D TILT LOGIC (Desktop Only) ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return; 
    
    const { clientX, clientY } = e;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const x = (clientX / width) - 0.5;
    const y = (clientY / height) - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY, isMobile]);

  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);
  
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [5, -5]); 
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-5, 5]);
  const textX = useTransform(xSpring, [-0.5, 0.5], [-15, 15]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
        // Offset for sticky header
        const y = element.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section 
        id="home"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        // 🔥 FIX: min-h-[100dvh] solves the mobile address bar issue
        className="relative min-h-[100dvh] flex flex-col justify-center items-center px-4 sm:px-6 md:px-10 pt-20 pb-10 overflow-hidden bg-transparent perspective-container"
        style={{ perspective: isMobile ? "none" : "1200px" }}
    >
      <BackgroundBeams/>
   
      {/* --- BACKGROUND ATMOSPHERE --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div 
             className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] 
                md:opacity-[0.18] opacity-[0.12]
                rounded-full pointer-events-none 
                will-change-transform
                ${isMobile ? "blur-[60px]" : "blur-[90px] animate-blob"} 
             `} 
          />
          {/* Noise is subtle, performant */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        // z-index 20 ensures it's above background but below Navbar (z-100)
        className="relative z-20 flex flex-col items-center justify-center w-full max-w-7xl mx-auto flex-grow"
      >

          {/* STATUS BADGE */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8 md:mb-10">
            <div className={`
                px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border border-white/10 flex items-center gap-3
                ${isMobile ? "bg-[#111]" : "bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(229,9,20,0.15)]"}
            `}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/80 whitespace-nowrap">
                    System Online
                </span>
            </div>
          </motion.div>

          {/* MAIN TITLE - Fluid scaling */}
          <motion.div 
            variants={itemVariants}
            style={isMobile ? undefined : { rotateX, rotateY, x: textX }} 
            className={`text-center flex flex-col items-center mb-6 sm:mb-8 md:mb-10 ${!isMobile ? "transform-style-3d will-change-transform" : ""}`}
          >
            {/* 🔥 FIX: Clamp ensures text never breaks awkwardly on Galaxy Fold or iPhone SE */}
            <h1 className="text-[clamp(2.5rem,11vw,8.5rem)] font-black leading-[0.9] tracking-tighter uppercase text-white select-none mix-blend-difference drop-shadow-2xl">
                Digital
            </h1>
            <h1 className="relative text-[clamp(2.5rem,11vw,8.5rem)] font-black leading-[0.9] tracking-tighter uppercase select-none pb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5722] via-[#E50914] to-[#8a040b] bg-[length:200%_auto] animate-gradient">
                    <ScrambleText text="REALITY" />
                </span>
                {/* Clone for Glow Effect (Desktop Only) */}
                {!isMobile && mounted && (
                    <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent blur-sm opacity-50 pointer-events-none translate-y-1">
                        REALITY
                    </span>
                )}
            </h1>
          </motion.div>

          {/* SUBTEXT - Responsive width & Balance */}
          <motion.p 
              variants={itemVariants} 
              className="text-white/60 text-sm sm:text-base md:text-xl max-w-[90%] sm:max-w-lg md:max-w-2xl text-center leading-relaxed font-light tracking-wide mb-10 sm:mb-12 md:mb-16 text-pretty"
          >
              We engineer digital experiences where <span className="text-white font-semibold">Precision</span> meets <span className="text-white font-semibold">Chaos</span>. 
              Full-stack mastery for the bold.
          </motion.p>

          {/* BUTTONS - Stack on mobile, Row on desktop */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6 sm:px-0">
              
              <MagneticButton 
                  onClick={() => scrollToSection('work')}
                  className="w-full sm:w-auto group relative px-8 py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-[11px] sm:text-xs overflow-hidden transition-transform active:scale-95"
              >
                  <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-[#E50914] transition-colors duration-300">
                      View Our Work <ArrowUpRight className="w-4 h-4" />
                  </span>
                  {!isMobile && (
                      <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                  )}
                  {!isMobile && (
                      <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                          View Our Work <ArrowUpRight className="w-4 h-4" />
                      </span>
                  )}
              </MagneticButton>

              <MagneticButton 
                  onClick={() => scrollToSection('contact')}
                  className={`
                    w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white font-black uppercase tracking-widest text-[11px] sm:text-xs transition-all flex items-center justify-center gap-2 group active:scale-95
                    ${isMobile ? "bg-black/40 backdrop-blur-md" : "bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50"}
                  `}
              >
                  Start a Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>

          </motion.div>

      </motion.div>
      
      {/* SCROLL INDICATOR - Properly Spaced & Hidden on Short Screens */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-safe left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity mb-4 sm:mb-8"
        onClick={() => scrollToSection('services')}
      >
         <div className="w-[26px] h-[42px] sm:w-[30px] sm:h-[50px] rounded-full border-2 border-white/20 flex justify-center pt-2 bg-transparent shadow-lg shadow-black/20">
             <motion.div 
               animate={{ y: [0, 8, 0] }} 
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#E50914]"
             />
         </div>
      </motion.div>

      {/* Global CSS Logic */}
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s ease infinite;
        }
        @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(15px, -20px) scale(1.02); }
            66% { transform: translate(-10px, 10px) scale(0.98); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
            animation: blob 15s infinite ease-in-out;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        /* Fix for balance text */
        .text-pretty {
            text-wrap: pretty;
        }
        /* Safe area handling for iPhone Home Bar */
        .bottom-safe {
            bottom: env(safe-area-inset-bottom, 24px);
        }
      `}</style>
    </section>
  );
}