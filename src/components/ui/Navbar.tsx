"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- 1. MOUNT & RESIZE LOGIC ---
  useEffect(() => {
    setMounted(true);
    const checkScreen = () => {
      // 1024px is safer for tablets (iPad Mini/Air)
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false); // Close mobile menu if resized to desktop
      }
    };
    
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // --- 2. INTELLIGENT SCROLL ---
  useEffect(() => {
    const handleScroll = () => {
       setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- 3. BODY LOCK (Menu Open Scroll Fix) ---
  useEffect(() => {
    if (isOpen) {
        // Strict overflow hidden for all devices
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden"; // Extra safety for iOS
    } else {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
    }
    return () => { 
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Services", href: "#services" },
    { name: "Work", href: "#work" },
    { name: "About", href: "#about" },
  ];

  // Logic: Show full nav
  const showFullNav = !mounted || isMobile || !isScrolled || isHovered || isOpen;

  // --- ANIMATION VARIANTS ---
  const mobileMenuVars: Variants = {
    initial: { opacity: 0, clipPath: "circle(0% at 100% 0%)" },
    animate: { 
        opacity: 1, 
        clipPath: "circle(150% at 100% 0%)",
        transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] } // Premium 'Out Expo'
    },
    exit: { 
        opacity: 0, 
        clipPath: "circle(0% at 100% 0%)",
        transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] } 
    },
  };

  const navLinkVars: Variants = {
    initial: { y: 40, opacity: 0 },
    open: { 
        y: 0, 
        opacity: 1,
        transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] } 
    },
  };

  const containerVars: Variants = {
    initial: { transition: { staggerChildren: 0.05 } },
    open: { transition: { delayChildren: 0.2, staggerChildren: 0.1 } },
  };

  if (!mounted) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        // 🔥 FIX: 'pt-safe' is critical for notched phones
        className="fixed top-0 left-0 w-full z-[100] flex justify-center pt-safe mt-4 md:mt-6 pointer-events-none px-4"
      >
        {/* --- DYNAMIC ISLAND CONTAINER --- */}
        <motion.div 
            layout 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                pointer-events-auto relative flex items-center overflow-hidden
                ${isScrolled || isOpen
                  ? "bg-[#050505]/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" 
                  : "bg-transparent border-transparent"
                }
                ${!showFullNav ? "justify-center" : "justify-between"} 
                transform-gpu backdrop-blur-xl
            `}
            initial={false}
            animate={{
                width: isMobile 
                    ? "100%" // Mobile: Always Full Width for safety
                    : (showFullNav ? "100%" : "64px"), 
                height: "64px",
                borderRadius: "50px",
                padding: showFullNav 
                    ? (isMobile ? "0px 20px" : "0px 24px") 
                    : "0px",
                maxWidth: showFullNav ? "1400px" : "64px",
            }}
            transition={{ 
                type: "spring", 
                stiffness: 220, 
                damping: 30, 
                mass: 0.8 
            }}
        >
          {/* --- LOGO AREA --- */}
          {/* Added onClick to close menu if logo is clicked */}
          <Link href="/" className="relative z-50 group shrink-0 flex items-center justify-center cursor-pointer" onClick={() => setIsOpen(false)}>
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
                    className="hidden lg:flex items-center gap-8 ml-auto pl-8 h-full"
                >
                    <div className="flex items-center gap-8 whitespace-nowrap">
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

          {/* --- MOBILE HAMBURGER --- */}
          <div className="lg:hidden ml-auto flex items-center">
            <button 
                className={`
                    relative z-[110] w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300
                    ${isOpen ? "bg-white/10" : "bg-transparent"}
                    active:scale-95 touch-manipulation
                `}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Menu"
            >
                <div className="flex flex-col gap-1.5 items-end p-2 pointer-events-none">
                    <span className={`h-[2px] rounded-full bg-white transition-all duration-300 ease-out-expo ${isOpen ? "w-5 rotate-45 translate-y-2 bg-[#E50914]" : "w-6"}`} />
                    <span className={`h-[2px] rounded-full bg-white transition-all duration-300 ease-out-expo ${isOpen ? "opacity-0 w-0" : "w-4"}`} />
                    <span className={`h-[2px] rounded-full bg-white transition-all duration-300 ease-out-expo ${isOpen ? "w-5 -rotate-45 -translate-y-2 bg-[#E50914]" : "w-6"}`} />
                </div>
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVars}
            initial="initial"
            animate="animate"
            exit="exit"
            // 🔥 FIX: h-[100dvh] ensures it fits mobile viewport perfectly including address bar
            className="fixed inset-0 z-[90] bg-[#050505] flex flex-col justify-center px-6 h-[100dvh] w-screen touch-none"
            // Prevent scroll pass-through
            style={{ touchAction: "none" }}
          >
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-[#E50914] opacity-[0.05] rounded-full pointer-events-none blur-[100px] translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col h-full justify-between pt-32 pb-10 safe-area-bottom">
                <motion.div
                    variants={containerVars}
                    initial="initial"
                    animate="open"
                    exit="initial"
                    className="flex flex-col gap-2"
                >
                    {navLinks.map((link) => (
                    <div key={link.name} className="overflow-hidden">
                        <motion.div variants={navLinkVars}>
                            <Link 
                                href={link.href} 
                                className="block w-full py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                {/* 🔥 GOLD TIER FIX: Clamp font size ensures no break on small/large mobiles */}
                                <span 
                                    className="block font-black text-white uppercase tracking-tighter leading-[0.9] active:text-[#E50914] transition-colors"
                                    style={{ fontSize: "clamp(3rem, 12vw, 5.5rem)" }} 
                                >
                                    {link.name}
                                </span>
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
                    
                    {/* Social/Email for Mobile footer */}
                    <div className="flex justify-between items-center text-white/40 text-sm font-medium pt-4 pb-safe">
                        <span>hyd, sindh</span>
                        <a href="mailto:hello@digitalpixora.com" className="hover:text-white transition-colors">hello@digitalpixora.com</a>
                    </div>
                </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}