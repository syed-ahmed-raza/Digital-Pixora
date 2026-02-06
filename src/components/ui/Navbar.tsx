"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // --- 1. INTELLIGENT SCROLL ---
  useEffect(() => {
    const handleScroll = () => {
       setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- 2. RESIZE LISTENER ---
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen(); // Initial check
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // --- 3. BODY LOCK (Menu Open Scroll Fix) ---
  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const navLinks = [
    { name: "Services", href: "#services" },
    { name: "Work", href: "#work" },
    { name: "About", href: "#about" },
  ];

  // Logic: Show full nav
  const showFullNav = isMobile || !isScrolled || isHovered || isOpen;

  // --- ANIMATION VARIANTS ---
  const mobileMenuVars: Variants = {
    initial: { opacity: 0, clipPath: "circle(0% at 100% 0%)" },
    animate: { 
        opacity: 1, 
        clipPath: "circle(150% at 100% 0%)",
        transition: { duration: 0.5, ease: [0.32, 0, 0.67, 0] } 
    },
    exit: { 
        opacity: 0, 
        clipPath: "circle(0% at 100% 0%)",
        transition: { duration: 0.3, ease: [0.32, 0, 0.67, 0] } 
    },
  };

  const navLinkVars: Variants = {
    initial: { y: 30, opacity: 0 },
    open: { 
        y: 0, 
        opacity: 1,
        transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } 
    },
  };

  const containerVars: Variants = {
    initial: { transition: { staggerChildren: 0.05 } },
    open: { transition: { delayChildren: 0.1, staggerChildren: 0.1 } },
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 w-full z-[100] flex justify-center pt-3 md:pt-6 pointer-events-none px-4"
      >
        {/* --- DYNAMIC ISLAND CONTAINER --- */}
        <motion.div 
            layout={!isMobile} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                pointer-events-auto relative flex items-center overflow-hidden
                ${isScrolled || isOpen
                  ? "bg-[#050505] border border-white/10 shadow-2xl shadow-black/50" 
                  : "bg-transparent border-transparent"
                }
                ${!showFullNav ? "justify-center" : "justify-between"} 
                /* 🚀 Performance Hack: Hardware Acceleration */
                transform-gpu
            `}
            initial={false}
            animate={{
                width: isMobile 
                    ? "100%" 
                    : (showFullNav ? "100%" : "64px"),
                height: "64px",
                borderRadius: "50px",
                padding: showFullNav 
                    ? (isMobile ? "0px 20px" : "0px 24px") 
                    : "0px",
                maxWidth: showFullNav ? "1400px" : "64px",
                // Glass effect only on Desktop when scrolled
                backdropFilter: (isScrolled && !isMobile) ? "blur(12px)" : "none",
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
        >
          {/* --- LOGO AREA --- */}
          <Link href="/" className="relative z-50 group shrink-0 flex items-center justify-center" onClick={() => setIsOpen(false)}>
             <motion.div layout="position" className="flex items-center justify-center h-full">
                <AnimatePresence mode="wait">
                    {showFullNav ? (
                        <motion.span 
                            key="full-logo"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-lg md:text-xl font-black tracking-tighter whitespace-nowrap text-white"
                        >
                            Digital Pixora
                        </motion.span>
                    ) : (
                        <motion.div 
                            key="short-logo"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="flex items-center justify-center"
                        >
                            <span className="text-xl font-black tracking-tighter text-white">DP</span>
                            {/* Red Dot Pulse */}
                            <div className="relative flex items-center justify-center ml-0.5 mt-1.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-[#E50914] opacity-75 animate-ping"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#E50914]"></span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
             </motion.div>
          </Link>

          {/* --- DESKTOP MENU --- */}
          <AnimatePresence>
            {showFullNav && !isMobile && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="hidden md:flex items-center gap-8 ml-auto pl-8 h-full"
                >
                    <div className="flex items-center gap-6 whitespace-nowrap">
                        {navLinks.map((link) => (
                        <Link key={link.name} href={link.href}>
                            <div className="relative overflow-hidden group py-2 cursor-pointer">
                                <span className="relative z-10 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">
                                    {link.name}
                                </span>
                               <span className="absolute bottom-1 left-0 w-full h-[1px] bg-[#E50914] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
                            </div>
                        </Link>
                        ))}
                    </div>

                    <div className="w-[1px] h-4 bg-white/10 shrink-0" />

                    <Link href="#contact" className="group flex items-center gap-2 whitespace-nowrap cursor-pointer">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white group-hover:text-[#E50914] transition-colors duration-300">
                            Let's Talk
                        </span>
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#E50914] group-hover:bg-[#E50914] transition-all duration-300">
                            <ArrowUpRight className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300" />
                        </div>
                    </Link>
                </motion.div>
            )}
          </AnimatePresence>

          {/* --- MOBILE HAMBURGER (Now Clickable) --- */}
          <div className="md:hidden ml-auto flex items-center">
            <button 
                className={`
                    relative z-[110] w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95
                    ${isOpen ? "bg-white/10" : "bg-transparent"}
                `}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Menu"
            >
                <div className="flex flex-col gap-1.5 items-end">
                    <span className={`h-[2px] rounded-full bg-white transition-all duration-300 ${isOpen ? "w-5 rotate-45 translate-y-2 bg-[#E50914]" : "w-6"}`} />
                    <span className={`h-[2px] rounded-full bg-white transition-all duration-300 ${isOpen ? "opacity-0 w-0" : "w-4"}`} />
                    <span className={`h-[2px] rounded-full bg-white transition-all duration-300 ${isOpen ? "w-5 -rotate-45 -translate-y-2 bg-[#E50914]" : "w-6"}`} />
                </div>
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* --- MOBILE MENU (Background) --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVars}
            initial="initial"
            animate="animate"
            exit="exit"
            // Z-Index 90 ensures it is BELOW the Navbar (Z-100) but ABOVE everything else
            className="fixed inset-0 z-[90] bg-[#050505] flex flex-col justify-center px-6 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] bg-[#E50914] opacity-[0.1] rounded-full pointer-events-none blur-[80px]" />
            <div className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] bg-blue-500 opacity-[0.05] rounded-full pointer-events-none blur-[60px]" />

            <div className="relative z-10 flex flex-col h-full justify-between py-24 pb-32">
                <motion.div
                    variants={containerVars}
                    initial="initial"
                    animate="open"
                    exit="initial"
                    className="flex flex-col gap-8"
                >
                    {navLinks.map((link) => (
                    <div key={link.name} className="overflow-hidden">
                        <motion.div variants={navLinkVars}>
                            <Link 
                                href={link.href} 
                                className="inline-block text-6xl font-black text-white uppercase tracking-tighter active:text-[#E50914] transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        </motion.div>
                    </div>
                    ))}
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
                    className="flex flex-col gap-4 border-t border-white/10 pt-8"
                >
                    <Link href="#contact" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center justify-between w-full text-white p-6 rounded-2xl border border-white/5 bg-white/5 active:bg-[#E50914] active:border-[#E50914] transition-all duration-200 group">
                            <span className="text-xl font-bold uppercase tracking-widest">Start Project</span>
                            <ArrowUpRight className="w-6 h-6 text-white group-hover:rotate-45 transition-transform" />
                        </div>
                    </Link>
                </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}