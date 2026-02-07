"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, Copy, Home, Layers, Briefcase, Mail, X, Command as CommandIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function CommandMenu() {
  const [open, setOpen] = useState(false);

  // 1. Toggle Logic (CMD+K or CTRL+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 2. Scroll Lock Logic (Prevent background scrolling)
  useEffect(() => {
      if (open) {
          document.body.style.overflow = "hidden";
      } else {
          document.body.style.overflow = "unset";
      }
      return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  // 3. Navigation Helper
  const handleNavigation = (id: string) => {
    setOpen(false);
    const element = document.getElementById(id);
    if (element) {
      // Timeout ensures menu closes before smooth scroll starts (performance)
      setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 4. Copy Email Action
  const copyEmail = () => {
    navigator.clipboard.writeText("hellodigitalpixora@gmail.com");
    setOpen(false);
    toast.success("Email Copied to Clipboard", {
        style: { 
            background: "rgba(5, 5, 5, 0.9)", 
            color: "#fff", 
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)"
        },
        icon: "📋"
    });
  };

  const menuItems = [
    { id: "home", icon: <Home className="w-4 h-4" />, label: "Home", action: () => handleNavigation("home") },
    { id: "services", icon: <Layers className="w-4 h-4" />, label: "Services", action: () => handleNavigation("services") },
    { id: "work", icon: <Briefcase className="w-4 h-4" />, label: "Selected Work", action: () => handleNavigation("work") },
    { id: "contact", icon: <Mail className="w-4 h-4" />, label: "Contact HQ", action: () => handleNavigation("contact") },
    { id: "copy", icon: <Copy className="w-4 h-4" />, label: "Copy Email Address", action: copyEmail },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh] px-4 font-sans">
          
          {/* Backdrop (Click to close) */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Search Header */}
            <div className="flex items-center px-4 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-[#E50914] mr-3" />
              <input 
                type="text" 
                placeholder="Where do you want to go?" 
                className="w-full bg-transparent text-white placeholder-white/30 focus:outline-none text-base font-medium"
                autoFocus
              />
              <button 
                onClick={() => setOpen(false)} 
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <span className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                  Quick Actions
              </span>
              {menuItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/5 hover:text-[#E50914] text-white/70 group transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#E50914]/10 group-hover:text-[#E50914] transition-colors">
                        {item.icon}
                    </div>
                    <span className="text-sm font-medium group-hover:translate-x-1 transition-transform">
                        {item.label}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#E50914]" />
                </button>
              ))}
            </div>

            {/* Footer Hints */}
            <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-white/20 font-mono flex items-center gap-1">
                    <CommandIcon className="w-3 h-3" /> Digital Pixora v1.0
                </span>
                <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">TAB</span>
                        <span className="text-[9px] text-white/20">Next</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">ESC</span>
                        <span className="text-[9px] text-white/20">Close</span>
                    </div>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}