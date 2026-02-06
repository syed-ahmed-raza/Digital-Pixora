"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, Copy, Home, Layers, Briefcase, Mail, X } from "lucide-react";
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
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 4. Copy Email Action
  const copyEmail = () => {
    navigator.clipboard.writeText("hellodigitalpixora@gmail.com");
    setOpen(false);
    toast.success("Email Copied to Clipboard", {
        style: { background: "#0A0A0A", color: "#fff", border: "1px solid #22c55e" },
        icon: "📋"
    });
  };

  const menuItems = [
    { icon: <Home className="w-4 h-4" />, label: "Home", action: () => handleNavigation("home") },
    { icon: <Layers className="w-4 h-4" />, label: "Services", action: () => handleNavigation("services") },
    { icon: <Briefcase className="w-4 h-4" />, label: "Selected Work", action: () => handleNavigation("work") },
    { icon: <Mail className="w-4 h-4" />, label: "Contact HQ", action: () => handleNavigation("contact") },
    { icon: <Copy className="w-4 h-4" />, label: "Copy Email Address", action: copyEmail },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 font-sans">
          
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
            className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search Header */}
            <div className="flex items-center px-4 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-white/40 mr-3" />
              <input 
                type="text" 
                placeholder="Type a command or search..." 
                className="w-full bg-transparent text-white placeholder-white/20 focus:outline-none text-sm font-medium"
                autoFocus
              />
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <span className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest block">Navigation</span>
              {menuItems.map((item, i) => (
                <button 
                  key={i} 
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-white/5 hover:text-[#E50914] text-white/70 group transition-all"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#E50914]" />
                </button>
              ))}
            </div>

            {/* Footer Hints */}
            <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-white/20 font-mono">Digital Pixora Command v1.0</span>
                <div className="flex gap-2">
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">ESC</span>
                    <span className="text-[10px] text-white/20">to close</span>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}