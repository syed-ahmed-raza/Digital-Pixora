"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";
import { 
  User, Copy, Check, 
  Crown, Palette, Video, TrendingUp, Activity, Volume2, Globe, Sparkles, StopCircle, 
  MapPin, Clock, Wifi, Hexagon
} from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
}

// --- 🔊 GLOBAL SONIC ENGINE (Memory Safe Singleton) ---
let audioCtx: AudioContext | null = null;

const playSound = (type: 'hover' | 'click') => {
    if (typeof window === 'undefined') return;
    try {
        if (!audioCtx) {
            // @ts-ignore
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;

        if (type === 'hover') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.005, now); // Ultra Subtle
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
            osc.start(now); osc.stop(now + 0.05);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now); osc.stop(now + 0.1);
        }
    } catch(e) {}
};

// --- 🏆 TEAM DATA BANK ---
const TEAM_DATA = [
  { name: "Ahmed Raza", role: "Founder & Architect", icon: Crown, color: "#E50914" },
  { name: "Minahil Fatima", role: "Creative Director", icon: Palette, color: "#ff0088" },
  { name: "Uzair Khan", role: "Growth Lead", icon: TrendingUp, color: "#00ff88" },
  { name: "Syeda Ramsha", role: "UI Specialist", icon: Palette, color: "#bf00ff" },
  { name: "Wanya & Wasea", role: "Motion Engine", icon: Video, color: "#00ccff" },
];

const ChatMessage = memo(({ role, content }: ChatMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isMountedRef = useRef(true);

  // --- 🎙️ VOICE LOADER ---
  useEffect(() => {
    isMountedRef.current = true;
    const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (isMountedRef.current) setAvailableVoices(voices);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
        isMountedRef.current = false;
        window.speechSynthesis.cancel();
    };
  }, []);

  // --- 🔒 SCROLL PROTOCOL ---
  useEffect(() => {
    if (role === 'assistant' && content.includes('[SCROLL:')) {
      const match = content.match(/\[SCROLL:(.*?)\]/);
      if (match?.[1]) {
        // 🔥 FIX: Increased timeout to 800ms for reliable mobile scrolling
        setTimeout(() => {
            const targetId = match[1].toLowerCase(); 
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('ring-2', 'ring-[#E50914]', 'ring-offset-4', 'ring-offset-black');
                setTimeout(() => element.classList.remove('ring-2', 'ring-[#E50914]', 'ring-offset-4', 'ring-offset-black'), 3000);
            }
        }, 800);
      }
    }
  }, [content, role]);

  const handleCopy = () => {
    playSound('click');
    const cleanText = content.replace(/\[.*?\]/g, '').trim();
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    playSound('click');
    if (isPlaying) { 
        window.speechSynthesis.cancel(); 
        setIsPlaying(false); 
        return; 
    }
    window.speechSynthesis.cancel();
    
    // Clean text: Remove tags and markdown symbols
    const cleanText = content.replace(/\[.*?\]/g, '').replace(/[*#`_]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    // Smart Voice Selection
    const preferredVoice = availableVoices.find(voice => 
        voice.name.includes("Google हिन्दी") || 
        voice.lang.includes('ur') || 
        voice.lang.includes('hi') || 
        voice.name.includes('India') ||
        voice.name.includes('Samantha')
    );

    if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.rate = 1.0; 
        utterance.pitch = 1.0;
    }
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  // --- 🎭 ALIEN RENDERERS (RESPONSIVE) ---

  const renderGeoCard = (line: string) => {
      // Logic: [GEO_ID] Sector::Time::Status
      const parts = line.replace("[GEO_ID]", "").split("::").map(s => s.trim());
      return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            whileHover={{ scale: 1.02, rotateX: 5 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            // 🔥 FIX: 'w-full' ensures it respects parent bubble width on tiny screens
            className="my-4 relative overflow-hidden rounded-xl bg-[#080808] border border-white/10 group shadow-2xl w-full"
            onMouseEnter={() => playSound('hover')}
          >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
              {/* Holographic Scan Line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E50914] to-transparent shadow-[0_0_20px_#E50914] animate-[scan_3s_linear_infinite]" />
              
              <div className="bg-white/[0.03] px-4 py-2 border-b border-white/5 flex justify-between items-center backdrop-blur-md">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E50914] flex items-center gap-2">
                      <Globe className="w-3 h-3 animate-[spin_3s_linear_infinite]" /> SAT_UPLINK
                  </span>
                  <Activity className="w-3 h-3 text-green-500 animate-pulse" />
              </div>

              <div className="p-4 grid grid-cols-2 gap-4 relative z-10">
                  <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase font-bold tracking-wider">
                          <MapPin className="w-3 h-3 text-[#E50914]" /> Sector
                      </div>
                      <div className="text-sm font-mono text-white font-bold truncate tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                          {parts[0] || "Triangulating..."}
                      </div>
                  </div>
                  <div className="space-y-1 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[9px] text-white/40 uppercase font-bold tracking-wider">
                          <Clock className="w-3 h-3 text-[#E50914]" /> Local Time
                      </div>
                      <div className="text-sm font-mono text-white font-bold tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                          {parts[1] || "--:--"}
                      </div>
                  </div>
              </div>
              
              <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                      <Wifi className="w-3 h-3 text-white/30" />
                      <span className="text-[9px] font-mono text-white/40 uppercase">{parts[2] || "SECURE"}</span>
                  </div>
                  <span className="text-[9px] font-bold text-green-500 border border-green-500/20 px-1.5 rounded bg-green-500/5 shadow-[0_0_10px_rgba(34,197,94,0.2)]">ENCRYPTED</span>
              </div>
          </motion.div>
      );
  };

  const renderTeamCard = () => (
      <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full">
          {TEAM_DATA.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -4, borderColor: "rgba(229,9,20,0.4)" }}
                onMouseEnter={() => playSound('hover')}
                className="p-3 bg-white/[0.02] rounded-xl border border-white/5 cursor-pointer backdrop-blur-sm transition-all group relative overflow-hidden flex items-center gap-3 sm:block"
              >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-8 h-8 bg-black border border-white/10 rounded-lg sm:mb-2 flex items-center justify-center shadow-lg group-hover:shadow-[0_0_15px_rgba(229,9,20,0.3)] transition-all relative z-10 shrink-0">
                      <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" style={{ color: item.color }} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-white mb-0.5 truncate relative z-10">{item.name}</h4>
                    <p className="text-[9px] text-white/40 uppercase tracking-wider relative z-10">{item.role}</p>
                  </div>
              </motion.div>
          ))}
      </div>
  );

  const renderPricingCard = () => (
      // 🔥 FIX: 'w-full' for safety on narrow screens
      <div className="my-4 bg-[#080808] border border-white/10 rounded-xl overflow-hidden w-full group relative shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
          <div className="bg-white/[0.02] px-4 py-3 border-b border-white/5 flex justify-between items-center text-xs font-bold text-white relative z-10">
              <div className="flex items-center gap-2 text-[#E50914] uppercase tracking-widest text-[10px]">
                  <Hexagon className="w-3 h-3"/> Cost Analysis
              </div>
              <Sparkles className="w-3 h-3 text-[#E50914] animate-pulse" />
          </div>
          <div className="p-4 space-y-3 relative z-10">
              {[{l:"Frontend Interface", p:"$200+"}, {l:"Full Stack Engine", p:"$600+"}, {l:"3D / Motion", p:"$900+"}].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0 hover:bg-white/5 p-1 rounded transition-colors cursor-default" onMouseEnter={() => playSound('hover')}>
                      <span className="text-white/60 font-medium">{item.l}</span>
                      <span className="font-mono font-bold text-[#E50914] drop-shadow-[0_0_5px_rgba(229,9,20,0.5)]">{item.p}</span>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: role === 'user' ? 20 : -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className={`flex w-full mb-6 sm:mb-8 group ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <style jsx global>{`
        @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
      `}</style>

      {/* 🤖 AVATAR (AI ONLY - Responsive Size) */}
      {role !== 'user' && (
        <div className="relative mt-1 mr-2 sm:mr-4 shrink-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#050505] flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(229,9,20,0.15)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#E50914]/20 to-transparent opacity-50" />
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#E50914] relative z-10" />
            </div>
            {/* Neural Link Pulse */}
            <span className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#E50914] border-2 border-black rounded-full shadow-[0_0_10px_#E50914] animate-pulse"></span>
        </div>
      )}

      <div className={`relative max-w-[85%] sm:max-w-[80%] ${role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
          
          {/* LABEL (AI ONLY) */}
          {role !== 'user' && (
            <div className="flex items-center gap-2 mb-2 ml-1">
               <span className="text-[8px] sm:text-[9px] font-black tracking-[0.2em] text-white/40 uppercase">Pixora Core</span>
               {isPlaying && <div className="flex gap-0.5 items-end h-2">
                   {[1,2,3].map(i => <motion.div key={i} animate={{ height: [2, 8, 2] }} transition={{ repeat: Infinity, duration: 0.4, delay: i*0.1 }} className="w-0.5 bg-[#E50914]" />)}
               </div>}
            </div>
          )}

          {/* 💬 MESSAGE BUBBLE */}
          <div className={`
              relative px-4 py-3 sm:px-6 sm:py-5 text-sm sm:text-[15px] leading-relaxed shadow-2xl backdrop-blur-2xl border
              ${role === 'user' 
                  ? 'bg-gradient-to-br from-[#E50914] to-[#b2070f] text-white rounded-2xl rounded-br-sm border-[#E50914]/50 shadow-[0_10px_30px_rgba(229,9,20,0.2)]' 
                  : 'bg-[#0A0A0A]/95 text-gray-200 border-white/10 rounded-2xl rounded-tl-sm shadow-[0_10px_30px_rgba(0,0,0,0.5)]'}
          `}>
              {/* Inner Glow for AI */}
              {role !== 'user' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E50914]/50 via-transparent to-transparent opacity-20" />}

              <div className="relative z-10 w-full font-sans break-words">
                {content.split("\n").map((line, i) => {
                    // 🧠 PARSING ENGINE
                    if (line.includes("[GEO_ID]")) return renderGeoCard(line);
                    if (line.includes("[TEAM]")) return renderTeamCard();
                    if (line.includes("[PRICING]")) return renderPricingCard();
                    if (line.includes("[SCROLL:") || line.includes("[NAV:")) return null; // Logic handled by hooks
                    if (line.trim() === "") return <div key={i} className="h-2 sm:h-3" />;
                    
                    return (
                        <motion.p 
                            key={i} 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03, duration: 0.3 }} // Optimized Typewriter Effect
                            className="mb-1.5 last:mb-0"
                        >
                            {/* **Bold** Parser */}
                            {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                                if (part.startsWith("**") && part.endsWith("**")) {
                                    return <strong key={j} className="text-white font-extrabold tracking-wide drop-shadow-md bg-clip-text bg-gradient-to-r from-white to-white/80">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                            })}
                        </motion.p>
                    )
                })}
              </div>
          </div>

          {/* 🛠️ ACTION BAR (AI ONLY) */}
          {role !== 'user' && (
              <div className="flex items-center gap-3 sm:gap-4 mt-2 ml-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-y-2 sm:group-hover:translate-y-0">
                  <button 
                    onClick={handleSpeak} 
                    onMouseEnter={() => playSound('hover')}
                    className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${isPlaying ? 'text-[#E50914]' : 'text-white/30 hover:text-white'}`}
                  >
                      {isPlaying ? <StopCircle className="w-3 h-3" /> : <Volume2 className="w-3 h-3"/>}
                      <span className="hidden sm:inline">{isPlaying ? "TERMINATE" : "VOCALIZE"}</span>
                  </button>
                  <span className="text-white/5 text-[10px]">|</span>
                  <button 
                    onClick={handleCopy} 
                    onMouseEnter={() => playSound('hover')}
                    className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                  >
                      {copied ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
                      <span className="hidden sm:inline">{copied ? "SECURED" : "EXTRACT"}</span>
                  </button>
              </div>
          )}
      </div>
      
      {/* 👤 USER AVATAR */}
      {role === 'user' && (
        <div className="mt-1 ml-2 sm:ml-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center border border-white/10 shadow-lg">
            <User className="w-4 h-4 text-white/90" />
          </div>
        </div>
      )}
    </motion.div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;