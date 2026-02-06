"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  User, Copy, Check, 
  Crown, Palette, Video, TrendingUp, Fingerprint, Activity, Volume2, Globe, Sparkles, StopCircle, BarChart3
} from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
}

// --- 🏆 TEAM DATA BANK ---
const TEAM_DATA = [
  { name: "Ahmed Raza", role: "Lead Architect", icon: Crown, color: "#E50914" },
  { name: "Minahil Fatima", role: "Creative Head", icon: Palette, color: "#E50914" },
  { name: "Uzair Khan", role: "Growth Strategist", icon: TrendingUp, color: "#00ff88" },
  { name: "Syeda Ramsha", role: "UI Master", icon: Palette, color: "#ff00ff" },
  { name: "Wanya & Wasea", role: "Motion Duo", icon: Video, color: "#00ccff" },
];

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Ref to track component mount status for cleanup
  const isMountedRef = useRef(true);

  // --- 🎙️ LOAD VOICES & CLEANUP ---
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
        window.speechSynthesis.cancel(); // 🛑 Stop speaking if chat closes
    };
  }, []);

  // --- 🔒 HQ SCROLL PROTOCOL (Triggered by AI Tags) ---
  useEffect(() => {
    if (role === 'assistant' && content.includes('[SCROLL:')) {
      const match = content.match(/\[SCROLL:(.*?)\]/);
      if (match?.[1]) {
        const targetId = match[1].toLowerCase(); 
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Visual highlight effect on target section
            element.classList.add('ring-offset-4', 'ring-2', 'ring-[#E50914]', 'transition-all', 'duration-1000');
            setTimeout(() => element.classList.remove('ring-offset-4', 'ring-2', 'ring-[#E50914]'), 4000);
        }
      }
    }
  }, [content, role]);

  const handleCopy = () => {
    const cleanText = content.replace(/\[.*?\]/g, '').trim();
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- 🗣️ SMART SPEAK LOGIC (Hindi/Urdu Priority) ---
  const handleSpeak = () => {
    if (isPlaying) { 
        window.speechSynthesis.cancel(); 
        setIsPlaying(false); 
        return; 
    }
    
    window.speechSynthesis.cancel();
    
    // 1. Clean Text: Remove Markdown (**bold**) and System Tags [TEAM]
    const cleanText = content
        .replace(/\[.*?\]/g, '') // Remove [TAGS]
        .replace(/[*#`_]/g, '')  // Remove Markdown chars
        .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // 2. 🔥 VOICE SELECTION MAGIC
    // Priority: Google Hindi > Microsoft Urdu/Hindi > Any Local Hindi > Default
    const preferredVoice = availableVoices.find(
        voice => 
            voice.name.includes("Google हिन्दी") || 
            voice.lang.includes('ur') || 
            voice.lang.includes('hi') ||
            voice.name.includes('India')
    );

    if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.rate = 1.0; // Native voices are usually fast/clear
        utterance.pitch = 1.0;
    } else {
        // Fallback for English voices reading Roman Urdu
        utterance.rate = 0.9; // Slow down slightly for clarity
        utterance.pitch = 1.05;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98, y: 10 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      className={`flex w-full mb-6 sm:mb-8 group ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <style jsx global>{`
        .bento-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 8px; 
            width: 100%; 
        }
        @media (min-width: 640px) {
            .bento-grid { 
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
                gap: 12px; 
            }
        }
      `}</style>

      {/* 🤖 ASSISTANT AVATAR (Desktop Only) */}
      {role !== 'user' && (
        <div className="relative mt-1 mr-3 sm:mr-4 shrink-0 hidden sm:block">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#1a1a1a] to-black flex items-center justify-center border border-white/10 shadow-lg overflow-hidden">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#E50914]" />
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 border-2 border-black rounded-full"></span>
        </div>
      )}

      {/* 💬 MESSAGE BUBBLE */}
      <div className={`relative max-w-[90%] sm:max-w-[85%] ${role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
          
          {/* NAME LABEL */}
          {role !== 'user' && (
            <div className="flex items-center gap-2 mb-1.5 ml-1">
               <span className="text-[10px] sm:text-[11px] font-bold text-white/80">Pixora AI</span>
               {isPlaying && <BarChart3 className="w-3 h-3 text-[#E50914] animate-bounce" />}
            </div>
          )}

          <div className={`
              relative px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-[15px] leading-relaxed shadow-sm border
              ${role === 'user' 
                  ? 'bg-[#E50914] text-white rounded-br-sm border-[#E50914]' 
                  : 'bg-[#111] text-gray-200 border-white/10 rounded-tl-sm'}
          `}>
              <div className="relative z-10 w-full font-sans break-words">
                {content.split("\n").map((line, i) => {
                    
                    // --- 🧩 TEAM CARD RENDERER ---
                    if (line.includes("[TEAM]")) {
                        return (
                            <div key={i} className="my-4 sm:my-6 w-full">
                                <div className="flex items-center gap-2 mb-2 sm:mb-3 opacity-80">
                                    <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E50914]" />
                                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white">Core Squad</p>
                                </div>
                                <div className="bento-grid">
                                    {TEAM_DATA.map((m, idx) => (
                                        <motion.div 
                                          key={idx} 
                                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                                          className="p-3 sm:p-4 bg-white/[0.05] rounded-lg sm:rounded-xl border border-white/5 relative overflow-hidden transition-all cursor-pointer"
                                        >
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black/40 border border-white/10 rounded-md sm:rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
                                                <m.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: m.color }} />
                                            </div>
                                            <h4 className="text-[11px] sm:text-xs font-bold text-white mb-0.5 truncate">{m.name}</h4>
                                            <p className="text-[9px] text-white/40 uppercase tracking-wider truncate">{m.role}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    // --- 📊 PRICING CARD RENDERER ---
                    if (line.includes("[PRICING]")) {
                        return (
                             <div key={i} className="my-4 sm:my-6 bg-[#050505] border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden relative w-full max-w-full">
                                <div className="bg-white/[0.03] px-3 py-2 sm:px-4 sm:py-3 border-b border-white/5 flex justify-between items-center text-[11px] sm:text-xs font-bold text-white">
                                    <div className="flex items-center gap-2"><Fingerprint className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E50914]"/> Investment</div>
                                    <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/30" />
                                </div>
                                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                                    {[
                                      {l:"Frontend Deployment", p:"$200+"}, 
                                      {l:"Neural Integration", p:"$600+"},
                                      {l:"3D Architecture", p:"$900+"}
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[11px] sm:text-xs">
                                            <span className="text-white/60 truncate mr-2">{item.l}</span>
                                            <span className="font-mono font-bold text-[#E50914] whitespace-nowrap">{item.p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    // Hide Logic Tags from UI
                    if (line.includes("[SCROLL:") || line.includes("[NAV:")) return null;

                    if (line.trim() === "") return <div key={i} className="h-2 sm:h-3" />;
                    
                    // Simple Markdown (Bold)
                    return (
                        <p key={i} className="mb-1 last:mb-0 text-sm sm:text-[15px]">
                            {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                                if (part.startsWith("**") && part.endsWith("**")) {
                                    return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                            })}
                        </p>
                    )
                })}
              </div>
          </div>

          {/* 🛠️ ACTION BAR (Read Aloud / Copy) */}
          {role !== 'user' && (
              <div className="flex items-center gap-3 mt-2 ml-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={handleSpeak} 
                    className={`flex items-center gap-1.5 text-[9px] sm:text-[10px] font-medium transition-colors ${isPlaying ? 'text-[#E50914]' : 'text-white/40 hover:text-white'}`}
                  >
                      {isPlaying ? <StopCircle className="w-3 h-3" /> : <Volume2 className="w-3 h-3"/>}
                      {isPlaying ? "Stop Audio" : "Read Aloud"}
                  </button>
                  <span className="text-white/10">•</span>
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-medium text-white/40 hover:text-white transition-colors">
                      {copied ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
                      {copied ? "Copied" : "Copy"}
                  </button>
              </div>
          )}
      </div>
      
      {/* 👤 USER AVATAR */}
      {role === 'user' && (
        <div className="mt-1 ml-2 sm:ml-3 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
          </div>
        </div>
      )}
    </motion.div>
  );
}