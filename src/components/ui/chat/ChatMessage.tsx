"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, Copy, Check, 
  Crown, Palette, Video, TrendingUp, Fingerprint, Activity, Volume2, Globe, Command, Sparkles, StopCircle
} from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
}

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

  // --- 🔒 HQ SCROLL PROTOCOL ---
  useEffect(() => {
    if (role === 'assistant' && content.includes('[SCROLL:')) {
      const match = content.match(/\[SCROLL:(.*?)\]/);
      if (match?.[1]) {
        const targetId = match[1].toLowerCase(); 
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const handleSpeak = () => {
    if (isPlaying) { window.speechSynthesis.cancel(); setIsPlaying(false); return; }
    window.speechSynthesis.cancel();
    const cleanText = content.replace(/\[.*?\]/g, '').replace(/[*#`_]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98, y: 10 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      className={`flex w-full mb-8 group ${role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <style jsx global>{`
        .bento-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; width: 100%; }
      `}</style>

      {/* 🤖 ASSISTANT AVATAR (Friendly Look) */}
      {role !== 'user' && (
        <div className="relative mt-1 mr-4 shrink-0 hidden sm:block">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#1a1a1a] to-black flex items-center justify-center border border-white/10 shadow-lg overflow-hidden">
                <Sparkles className="w-4 h-4 text-[#E50914]" />
            </div>
            {/* Online Status Dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></span>
        </div>
      )}

      {/* 💬 MESSAGE BUBBLE */}
      <div className={`relative max-w-[95%] sm:max-w-[85%] ${role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
          
          {/* HUMANIZED NAME LABEL */}
          {role !== 'user' && (
            <div className="flex items-center gap-2 mb-1.5 ml-1">
               <span className="text-[11px] font-bold text-white/80">Pixora Assistant</span>
               <span className="text-[9px] text-white/30">• Just now</span>
            </div>
          )}

          <div className={`
              relative px-5 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm border
              ${role === 'user' 
                  ? 'bg-[#E50914] text-white rounded-br-sm border-[#E50914]' 
                  : 'bg-[#111] text-gray-200 border-white/10 rounded-tl-sm'}
          `}>
              <div className="relative z-10 w-full font-sans">
                {content.split("\n").map((line, i) => {
                    
                    // --- 🧩 PIXORA BENTO SQUAD ---
                    if (line.includes("[TEAM]")) {
                        return (
                            <div key={i} className="my-6">
                                <div className="flex items-center gap-2 mb-3 opacity-80">
                                    <Activity className="w-3.5 h-3.5 text-[#E50914]" />
                                    <p className="text-xs font-bold uppercase tracking-wider text-white">Meet The Squad</p>
                                </div>
                                <div className="bento-grid">
                                    {TEAM_DATA.map((m, idx) => (
                                        <motion.div 
                                          key={idx} 
                                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                                          className="p-4 bg-white/[0.05] rounded-xl border border-white/5 relative overflow-hidden transition-all cursor-pointer"
                                        >
                                            <div className="w-8 h-8 bg-black/40 border border-white/10 rounded-lg mb-3 flex items-center justify-center">
                                                <m.icon className="w-4 h-4" style={{ color: m.color }} />
                                            </div>
                                            <h4 className="text-xs font-bold text-white mb-0.5">{m.name}</h4>
                                            <p className="text-[9px] text-white/40 uppercase tracking-wider">{m.role}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    // --- 📊 PRICING CARD ---
                    if (line.includes("[PRICING]")) {
                        return (
                             <div key={i} className="my-6 bg-[#050505] border border-white/10 rounded-2xl overflow-hidden relative w-full">
                                <div className="bg-white/[0.03] px-4 py-3 border-b border-white/5 flex justify-between items-center text-xs font-bold text-white">
                                    <div className="flex items-center gap-2"><Fingerprint className="w-3.5 h-3.5 text-[#E50914]"/> Estimated Cost</div>
                                    <Globe className="w-3.5 h-3.5 text-white/30" />
                                </div>
                                <div className="p-4 space-y-3">
                                    {[
                                      {l:"Frontend Deployment", p:"$200+"}, 
                                      {l:"Neural Integration", p:"$600+"},
                                      {l:"3D Architecture", p:"$900+"}
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                            <span className="text-white/60">{item.l}</span>
                                            <span className="font-mono font-bold text-[#E50914]">{item.p}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    if (line.includes("[SCROLL:")) return null;

                    if (line.trim() === "") return <div key={i} className="h-3" />;
                    
                    // Simple Markdown Parsing for Bold
                    return (
                        <p key={i} className="mb-1 last:mb-0">
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

          {/* 🛠️ HUMAN TOOLS (Read Aloud / Copy) */}
          {role !== 'user' && (
              <div className="flex items-center gap-3 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={handleSpeak} className="flex items-center gap-1.5 text-[10px] font-medium text-white/40 hover:text-white transition-colors">
                      {isPlaying ? <StopCircle className="w-3 h-3 text-[#E50914]" /> : <Volume2 className="w-3 h-3"/>}
                      {isPlaying ? "Stop" : "Read Aloud"}
                  </button>
                  <span className="text-white/10">•</span>
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-[10px] font-medium text-white/40 hover:text-white transition-colors">
                      {copied ? <Check className="w-3 h-3 text-green-500"/> : <Copy className="w-3 h-3"/>}
                      {copied ? "Copied" : "Copy"}
                  </button>
              </div>
          )}
      </div>
      
      {/* 👤 USER AVATAR (Right Side) */}
      {role === 'user' && (
        <div className="mt-1 ml-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <User className="w-4 h-4 text-white/70" />
          </div>
        </div>
      )}
    </motion.div>
  );
}