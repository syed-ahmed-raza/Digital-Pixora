"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";
import { Send, Globe, Signal, Copy, Terminal, AlertCircle, CheckCircle2, XCircle, Clock, Wifi, WifiOff } from "lucide-react";
import { sendEmail } from "@/actions/email"; 
import toast from "react-hot-toast";

// --- CUSTOM PARTS ---
import PixoraBot from "./contact/PixoraBot";
import SmartInput from "./contact/SmartInput";
import HoldSubmitBtn from "./contact/HoldSubmitBtn";

// --- 1. PREMIUM TOAST (Optimized) ---
const showPremiumToast = (message: string, type: "success" | "error" | "copy") => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`flex items-center gap-4 px-6 py-4 rounded-xl border backdrop-blur-2xl z-[9999] min-w-[340px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] 
      ${type === "success" ? "bg-[#050505]/95 border-green-500/20" : type === "error" ? "bg-[#050505]/95 border-red-500/20" : "bg-[#050505]/95 border-white/10"}`}
    >
      <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border ${type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : type === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/10 border-white/20 text-white"}`}>
         {type === "success" ? <CheckCircle2 className="w-5 h-5"/> : type === "error" ? <XCircle className="w-5 h-5"/> : <Copy className="w-5 h-5"/>}
      </div>
      <div className="flex flex-col">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${type === "success" ? "text-green-500" : type === "error" ? "text-red-500" : "text-white/60"}`}>{type === "success" ? "System Confirmed" : "System Alert"}</h4>
        <p className="text-white/90 text-xs font-medium">{message}</p>
      </div>
    </motion.div>
  ), { duration: 4000, position: "bottom-center" });
};

// --- 2. SPOTLIGHT CARD (GPU Optimized) ---
const SpotlightCard = ({ children, className = "", onClick }: any) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div 
            onClick={onClick} 
            className={`group relative border border-white/10 bg-[#0A0A0A] overflow-hidden ${className}`} 
            onMouseMove={handleMouseMove}
        >
            <motion.div 
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 will-change-[opacity]" 
                style={{ background: useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(229, 9, 20, 0.1), transparent 80%)` }} 
            />
            <div className="relative h-full z-10">{children}</div>
        </div>
    );
};

// --- 3. TERMINAL SUCCESS (Hydration Safe) ---
const TerminalSuccess = ({ onReset }: { onReset: () => void }) => {
    const [ticketId, setTicketId] = useState("GENERATING...");
    
    useEffect(() => {
        setTicketId(`DPX-${Math.floor(1000 + Math.random() * 9000)}`);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full bg-[#080808] border border-white/10 rounded-[2rem] p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
        >
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

            {/* The Digital Ticket */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
            >
                {/* Top Green Bar */}
                <div className="h-1 w-full bg-green-500" />
                
                <div className="p-6 md:p-8 space-y-6">
                    {/* Status Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Transmission Complete</h3>
                                <p className="text-white/40 text-[10px] uppercase tracking-wider">Secure Uplink v2.4</p>
                            </div>
                        </div>
                        <Signal className="w-4 h-4 text-green-500 animate-pulse" />
                    </div>

                    <div className="h-px w-full bg-white/10" />

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                        <div>
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Ticket ID</p>
                            <p className="text-[#E50914] font-bold text-sm">{ticketId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Status</p>
                            <p className="text-green-500 font-bold">RECEIVED</p>
                        </div>
                         <div>
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Sector</p>
                            <p className="text-white font-bold">HQ DATABASE</p> 
                        </div>
                         <div className="text-right">
                            <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Encryption</p>
                            <p className="text-white font-bold">AES-256</p>
                        </div>
                    </div>

                    {/* Animated Barcode */}
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col items-center gap-2">
                         <div className="flex justify-between items-end gap-[3px] h-6 w-full opacity-50">
                             {[...Array(25)].map((_, i) => (
                                 <motion.div 
                                    key={i} 
                                    initial={{ height: "20%" }} 
                                    animate={{ height: ["20%", "100%", "20%"] }} 
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
                                    className="w-1 bg-white" 
                                 />
                             ))}
                         </div>
                         <p className="text-[9px] font-mono text-white/30 tracking-[0.5em]">{ticketId.replace('DPX-', '')}</p>
                    </div>
                </div>
            </motion.div>

            {/* Reset Button */}
            <button onClick={onReset} className="mt-8 text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group">
                <Terminal className="w-3 h-3 group-hover:text-[#E50914] transition-colors" />
                Initialize New Session
            </button>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---
export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", brief: "" });
  const [errors, setErrors] = useState<any>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "listening">("idle");
  const [mood, setMood] = useState<"neutral" | "happy" | "angry" | "focused">("neutral");
  const [copied, setCopied] = useState(false);
  
  // Hydration Safe States
  const [userLocation, setUserLocation] = useState("SCANNING...");
  const [time, setTime] = useState("--:--");
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // 1. LIVE ENVIRONMENT FETCH
  useEffect(() => {
    setIsMounted(true);
    
    // Initial Network Check (Client Side Only)
    if (typeof navigator !== "undefined") {
        setIsOnline(navigator.onLine);
    }

    // Time Logic
    const timer = setInterval(() => {
        setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    // Network Logic
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Location Logic
    fetch("/api/location")
        .then(res => res.json())
        .then(data => {
            if(data.city) setUserLocation(data.city.toUpperCase());
            else throw new Error("IP Failed");
        })
        .catch(() => {
            setUserLocation("UNKNOWN SECTOR");
        });

    return () => {
        clearInterval(timer);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. CHECK FORM VALIDITY
  const isFormValid = 
      formData.name.trim().length > 0 && 
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && 
      formData.brief.trim().length >= 5;

  const handleChange = useCallback((e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setMood("focused"); 
    const timeout = setTimeout(() => setMood("neutral"), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const handleBlur = useCallback((e: any) => {
      const { name, value } = e.target;
      if (name === "email") {
          const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          if (!isValid && value.length > 0) {
              setErrors((prev: any) => ({ ...prev, email: "Invalid Syntax" }));
              setMood("angry");
              showPremiumToast("Invalid Coordinates Detected", "error");
          } else {
              setErrors((prev: any) => ({ ...prev, email: null }));
              setMood("happy");
          }
      }
  }, []);

  const handleVoiceInput = useCallback((text: string) => {
      setStatus("listening");
      setTimeout(() => setStatus("idle"), 1500);
      setFormData((prev: any) => ({ ...prev, brief: prev.brief + " " + text }));
  }, []);

  const handleHoldSubmit = async () => {
      if (!isFormValid) {
          setMood("angry");
          showPremiumToast("Access Denied: Invalid Data", "error");
          return;
      }
      
      setStatus("loading");
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("message", formData.brief);

      try {
          const res = await sendEmail({ success: false, message: "" }, data);
          if (res.success) {
              setStatus("success");
              setMood("happy");
              showPremiumToast("Packet Uploaded Successfully", "success");
          } else {
              setStatus("error");
              setMood("angry");
              showPremiumToast(res.message, "error");
          }
      } catch (err) {
          setStatus("error");
          setMood("angry");
          showPremiumToast("Network Failure", "error");
      }
  };

  const handleCopyEmail = () => {
      navigator.clipboard.writeText("hellodigitalpixora@gmail.com");
      setCopied(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50); // Haptic
      showPremiumToast("Coordinates Copied", "copy");
      setTimeout(() => setCopied(false), 2000);
  };

  // Prevent Hydration Flash
  if (!isMounted) return null;

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-[#050505] text-white overflow-hidden">
      
      {/* 3D Grid Floor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-12 relative z-10">
        
        {/* HEADER */}
        <div className="mb-20 flex flex-col items-start relative">
             <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em]">Secure Channel: 443</span>
             </motion.div>
             <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                Initialize <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] via-white to-white/20">Protocol.</span>
             </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-start">
            
            {/* LEFT: FORM */}
            <div className="md:col-span-7 w-full relative">
                
                {/* 🤖 ROBOT */}
                <div className="absolute -top-18 right-0 md:-top-28 md:-right-4 z-30 pointer-events-none">
                     <PixoraBot status={status} mood={mood} />
                </div>

                <AnimatePresence mode="wait">
                    {status === "success" ? (
                        <TerminalSuccess key="success" onReset={() => { setStatus("idle"); setFormData({name:"",email:"",brief:""}) }} />
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[2rem] backdrop-blur-sm relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div onBlur={handleBlur}><SmartInput name="name" label="Identity / Name" value={formData.name} onChange={handleChange} error={errors.name} /></div>
                                <div onBlur={handleBlur}><SmartInput name="email" label="Digital Coordinates (Email)" value={formData.email} onChange={handleChange} error={errors.email} /></div>
                            </div>
                            <div onBlur={handleBlur}>
                                <SmartInput type="textarea" name="brief" label="Mission Brief (Or use Voice)" value={formData.brief} onChange={handleChange} error={errors.brief} enableVoice={true} onVoiceResult={handleVoiceInput} />
                            </div>
                            
                            {/* 🔥 HOLD BUTTON */}
                            <HoldSubmitBtn 
                                onClick={handleHoldSubmit} 
                                loading={status === "loading"} 
                                disabled={!isFormValid} 
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* RIGHT: INFO DASHBOARD */}
            <div className="md:col-span-5 flex flex-col gap-6 w-full">
                
                {/* Email Card */}
                <SpotlightCard onClick={handleCopyEmail} className="rounded-[2rem] p-8 cursor-pointer group active:scale-[0.98] transition-transform">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                         <div className="flex justify-between items-start mb-12">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white group-hover:bg-[#E50914] group-hover:border-[#E50914] transition-colors duration-500"><Send className="w-6 h-6" /></div>
                            <div className={`px-3 py-1 border rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${copied ? "bg-green-500 border-green-500 text-black" : "bg-white/5 border-white/10 text-white/50"}`}>{copied ? "COPIED" : "TAP TO COPY"}</div>
                         </div>
                         <div><span className="text-[#E50914] text-[10px] font-black uppercase tracking-widest mb-2 block">Direct Frequency</span><h3 className="text-xl md:text-3xl font-bold text-white break-words">hellodigitalpixora<br/>@gmail.com</h3></div>
                    </div>
                </SpotlightCard>

                <div className="grid grid-cols-2 gap-4">
                    {/* 🌍 REAL LOCATION CARD */}
                    <SpotlightCard className="rounded-3xl p-6 min-h-[160px]">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Globe className="w-6 h-6 text-white/30" />
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-full border border-white/10">
                                    <Clock className="w-3 h-3 text-[#E50914]" />
                                    <span className="text-[9px] font-mono text-white/70">{time}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Your Sector</span>
                                <span className="text-white font-bold">{userLocation}</span>
                            </div>
                        </div>
                    </SpotlightCard>

                    {/* 📶 NETWORK STATUS CARD */}
                    <SpotlightCard className="rounded-3xl p-6 min-h-[160px]">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            {isOnline ? <Wifi className="w-6 h-6 text-green-500 animate-pulse" /> : <WifiOff className="w-6 h-6 text-red-500" />}
                            <div>
                                <span className="block text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Network</span>
                                <span className={`font-bold ${isOnline ? "text-white" : "text-red-500"}`}>{isOnline ? "Operational" : "Offline"}</span>
                            </div>
                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}