"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowUpRight, Copy, Home, Layers, Briefcase, Mail, X, Command as CommandIcon, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // --- DATA SOURCE ---
  const menuItems = useMemo(() => [
    { id: "home", icon: <Home className="w-4 h-4" />, label: "Home", action: () => handleNavigation("home") },
    { id: "services", icon: <Layers className="w-4 h-4" />, label: "Services", action: () => handleNavigation("services") },
    { id: "work", icon: <Briefcase className="w-4 h-4" />, label: "Selected Work", action: () => handleNavigation("work") },
    { id: "contact", icon: <Mail className="w-4 h-4" />, label: "Contact HQ", action: () => handleNavigation("contact") },
    { id: "copy", icon: <Copy className="w-4 h-4" />, label: "Copy Email Address", action: () => copyEmail() },
  ], []);

  // --- FILTER LOGIC ---
  const filteredItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  // 1. Toggle Logic & Keyboard Nav
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
      
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action();
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, filteredItems, selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
      setSelectedIndex(0);
  }, [query]);

  // 2. Scroll Lock Logic
  useEffect(() => {
      if (open) {
          document.body.style.overflow = "hidden";
      } else {
          document.body.style.overflow = "unset";
          setQuery(""); // Reset search on close
      }
      return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  // 3. Navigation Helper
  const handleNavigation = (id: string) => {
    setOpen(false);
    const element = document.getElementById(id);
    if (element) {
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[15vh] px-4 font-sans">
          
          {/* Backdrop */}
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
            className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[60vh]"
          >
            {/* Search Header */}
            <div className="flex items-center px-4 py-4 border-b border-white/5 shrink-0">
              <Search className="w-5 h-5 text-[#E50914] mr-3" />
              <input 
                type="text" 
                placeholder="Where do you want to go?" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-white/30 focus:outline-none text-base font-medium"
                autoFocus
              />
              <div className="flex items-center gap-2">
                  <span className="hidden md:block text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/30 font-mono">ESC</span>
                  <button 
                    onClick={() => setOpen(false)} 
                    className="p-1 hover:bg-white/10 rounded-md transition-colors md:hidden"
                  >
                    <X className="w-4 h-4 text-white/40" />
                  </button>
              </div>
            </div>

            {/* Menu Items (Scrollable) */}
            <div className="p-2 overflow-y-auto custom-scrollbar">
              <span className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest block">
                  {filteredItems.length > 0 ? "Quick Actions" : "No Results"}
              </span>
              
              {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <button 
                      key={item.id} 
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg group transition-all duration-200
                        ${index === selectedIndex ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-[#E50914]'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                            ${index === selectedIndex ? 'bg-[#E50914] text-white shadow-[0_0_15px_#E50914]' : 'bg-white/5 group-hover:bg-[#E50914]/10 group-hover:text-[#E50914]'}
                        `}>
                            {item.icon}
                        </div>
                        <span className="text-sm font-medium group-hover:translate-x-1 transition-transform">
                            {item.label}
                        </span>
                      </div>
                      <ArrowUpRight className={`w-4 h-4 transition-all
                          ${index === selectedIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}
                      `} />
                    </button>
                  ))
              ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-white/20">
                      <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm">No commands found for "{query}"</span>
                  </div>
              )}
            </div>

            {/* Footer Hints */}
            <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center shrink-0 hidden md:flex">
                <span className="text-[10px] text-white/20 font-mono flex items-center gap-1">
                    <CommandIcon className="w-3 h-3" /> Digital Pixora v1.0
                </span>
                <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">↑↓</span>
                        <span className="text-[9px] text-white/20">Navigate</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 font-mono">ENTER</span>
                        <span className="text-[9px] text-white/20">Select</span>
                    </div>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}