"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Signal,
  Copy,
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  MapPin
} from "lucide-react";
import { sendEmail } from "@/actions/email";
import toast from "react-hot-toast";

// --- CUSTOM PARTS (Assuming these exist in your project) ---
import PixoraBot from "./contact/PixoraBot";
import SmartInput from "./contact/SmartInput";
import HoldSubmitBtn from "./contact/HoldSubmitBtn";

// --- 🔊 SONIC UI ENGINE (Crash Safe) ---
const playSound = (type: "success" | "error" | "click") => {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } else if (type === "click") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    // Silent fail
  }
};

// --- 1. PREMIUM TOAST ---
const showPremiumToast = (message: string, type: "success" | "error" | "copy") => {
  playSound(type === "error" ? "error" : "success");
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className={`flex items-center gap-4 px-6 py-4 rounded-xl border backdrop-blur-2xl z-[9999] min-w-[340px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] 
      ${type === "success" ? "bg-[#050505]/95 border-green-500/20" : type === "error" ? "bg-[#050505]/95 border-red-500/20" : "bg-[#050505]/95 border-white/10"}`}
      >
        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border ${type === "success" ? "bg-green-500/10 border-green-500/20 text-green-500" : type === "error" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/10 border-white/20 text-white"}`}>
          {type === "success" ? <CheckCircle2 className="w-5 h-5" /> : type === "error" ? <XCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </div>
        <div className="flex flex-col">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${type === "success" ? "text-green-500" : type === "error" ? "text-red-500" : "text-white/60"}`}>
            {type === "success" ? "System Confirmed" : "System Alert"}
          </h4>
          <p className="text-white/90 text-xs font-medium">{message}</p>
        </div>
      </motion.div>
    ),
    { duration: 4000, position: "bottom-center" }
  );
};

// --- 2. TERMINAL SUCCESS SCREEN ---
const TerminalSuccess = ({ onReset }: { onReset: () => void }) => {
  const [ticketId, setTicketId] = useState("GENERATING...");
  useEffect(() => { setTicketId(`DPX-${Math.floor(1000 + Math.random() * 9000)}`); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-[#080808] border border-white/10 rounded-[2rem] p-6 md:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E50914] to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="relative w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
      >
        <div className="h-1 w-full bg-green-500" />
        <div className="p-6 md:p-8 space-y-6">
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
          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Ticket ID</p>
              <p className="text-[#E50914] font-bold text-sm">{ticketId}</p>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1">Status</p>
              <p className="text-green-500 font-bold">RECEIVED</p>
            </div>
          </div>
        </div>
      </motion.div>

      <button
        onClick={onReset}
        className="mt-8 text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center gap-2 group"
      >
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Hydration Safe States
  const [userLocation, setUserLocation] = useState("CALIBRATING...");
  const [time, setTime] = useState("--:--");
  const [ping, setPing] = useState(24);
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    } 
    
    // 1. Real-Time Clock
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        timeZone: "Asia/Karachi", // HQ Time
      }));
      setPing((prev) => Math.max(12, Math.min(60, prev + Math.floor(Math.random() * 10) - 5)));
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline); 
    
    // 🛰️ SATELLITE LOCATION LOGIC
    const establishSatelliteLock = async () => {
      const fallbackToIP = async () => {
          try {
              const res = await fetch("/api/geo", { method: "POST", body: JSON.stringify({}) }); 
              const data = await res.json();
              let city = data.location?.city?.toUpperCase();
              if (!city || city.includes("UNKNOWN") || city.includes("VOID")) {
                  city = "DIGITAL SPACE"; 
              }
              setUserLocation(city);
          } catch(e) { setUserLocation("OFF-GRID"); }
      };

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const res = await fetch("/api/geo", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  lat: position.coords.latitude,
                  lon: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                }),
              });
              const data = await res.json();
              if (data.location?.city && !data.location.city.includes("UNKNOWN")) {
                  setUserLocation(data.location.city.toUpperCase());
              } else {
                  fallbackToIP(); 
              }
            } catch (e) { fallbackToIP(); }
          },
          (error) => { console.warn(error); fallbackToIP(); },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else { fallbackToIP(); }
    };

    establishSatelliteLock();

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 2. FORM LOGIC
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

  const handleFocus = (name: string) => setFocusedField(name);
  const handleBlurField = () => setFocusedField(null);

  const handleBlur = useCallback((e: any) => {
    const { name, value } = e.target;
    handleBlurField();
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
    playSound("click");
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    showPremiumToast("Encrypted Coordinates Copied", "copy");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 bg-[#050505] text-white overflow-hidden"
    >
      {/* 3D Grid Floor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-5 md:px-12 relative z-10">
        {/* HEADER */}
        <div className="mb-20 flex flex-col items-start relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em]">
              Secure Channel: 443
            </span>
          </motion.div>
          <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">
            Initialize <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] via-white to-white/20">
              Protocol.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* --- LEFT: INPUT TERMINAL --- */}
          <div className="md:col-span-7 w-full relative">
            
            {/* 🤖 THE BOT GUARDIAN */}
            {/* 🔥 FIX: Adjusted mobile top position to prevent overlapping with text */}
            <div className="absolute -top-16 right-0 md:-top-35 md:-right-8 z-0 md:z-30 pointer-events-none">
              <PixoraBot
                status={status}
                mood={mood}
                focusedField={focusedField}
              />
            </div>

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <TerminalSuccess
                  key="success"
                  onReset={() => {
                    setStatus("idle");
                    setFormData({ name: "", email: "", brief: "" });
                  }}
                />
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/[0.02] border border-white/5 p-6 md:p-10 rounded-[2rem] backdrop-blur-sm relative z-10 shadow-2xl h-full flex flex-col justify-center"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                      onFocus={() => handleFocus("name")}
                      onBlur={handleBlur}
                    >
                      <SmartInput
                        name="name"
                        label="Identity / Name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                      />
                    </div>
                    <div
                      onFocus={() => handleFocus("email")}
                      onBlur={handleBlur}
                    >
                      <SmartInput
                        name="email"
                        label="Digital Coordinates (Email)"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                      />
                    </div>
                  </div>
                  <div
                    onFocus={() => handleFocus("brief")}
                    onBlur={handleBlur}
                    className="mt-8"
                  >
                    <SmartInput
                      type="textarea"
                      name="brief"
                      label="Mission Brief (Or use Voice)"
                      value={formData.brief}
                      onChange={handleChange}
                      error={errors.brief}
                      enableVoice={true}
                      onVoiceResult={handleVoiceInput}
                    />
                  </div>

                  <div className="mt-10">
                    <HoldSubmitBtn
                      onClick={handleHoldSubmit}
                      loading={status === "loading"}
                      disabled={!isFormValid}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- RIGHT: BENTO GRID DASHBOARD --- */}
          {/* 🔥 FIX: h-auto md:h-full ensures right column doesn't stretch weirdly on mobile */}
          <div className="md:col-span-5 flex flex-col gap-4 w-full h-auto md:h-full">
            
            {/* 1. HOLOGRAPHIC EMAIL STRIP */}
            <div
              onClick={handleCopyEmail}
              className="group relative w-full h-24 bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-[#E50914]/50 transition-all duration-500 shadow-lg shrink-0"
            >
              <div className="absolute right-6 top-1/2 -translate-x-10 -translate-y-1/2 flex gap-1 items-end h-6 pointer-events-none">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 16, 8] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.1,
                    }}
                    className="w-1 bg-[#E50914] rounded-full opacity-50"
                  />
                ))}
              </div>

              <div className="relative z-10 flex items-center h-full px-6 gap-4">
                <div
                  className={`p-3 rounded-full transition-colors ${copied ? "bg-green-500 text-black" : "bg-white/5 text-white group-hover:bg-[#E50914]"}`}
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </div>
                <div className="overflow-hidden w-full">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block mb-1">
                    Encrypted Uplink
                  </span>
                  <div className="relative w-full overflow-hidden">
                    <p className="text-lg md:text-xl font-bold text-white whitespace-nowrap group-hover:animate-marquee truncate">
                      hellodigitalpixora@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. STATS GRID */}
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* RADAR LOCATION */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[#E50914]/30 transition-colors min-h-[140px] md:min-h-auto">
                <div className="absolute -right-4 -top-4 w-24 h-24 border border-white/5 rounded-full flex items-center justify-center opacity-50">
                  <div className="w-full h-full border-t border-[#E50914] rounded-full animate-spin" />
                </div>

                <MapPin className="w-6 h-6 text-white/30 mb-4 group-hover:text-[#E50914] transition-colors" />
                <div>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block mb-1">
                    Sector
                  </span>
                  <span className="text-sm font-bold text-white leading-tight block truncate">
                    {userLocation}
                  </span>
                </div>
              </div>

              {/* SYSTEM STATUS */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex flex-col justify-between min-h-[140px] md:min-h-auto">
                <div className="flex justify-between items-start">
                  <Radio
                    className={`w-6 h-6 ${isOnline ? "text-green-500 animate-pulse" : "text-red-500"}`}
                  />
                  <span className="text-[9px] font-mono text-white/40">
                    {ping}ms
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block mb-1">
                    System
                  </span>
                  <span className="text-sm font-bold text-white leading-tight block">
                    {isOnline ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. TIME MODULE */}
            <div className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block mb-1">
                  Local Time
                </span>
                <span className="text-xl font-bold text-white font-mono">
                  {time}
                </span>
              </div>
              <Clock className="w-6 h-6 text-white/20" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-10%); }
        }
        .group:hover .group-hover\:animate-marquee {
          animation: marquee 2s linear infinite alternate;
        }
      `}</style>
    </section>
  );
}