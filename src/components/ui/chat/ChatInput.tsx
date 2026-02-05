"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Mic, Zap, Users, 
  Trash2, Download, Command, Sparkles, Activity,
  Terminal, Globe, Cpu, ChevronRight, Binary
} from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isListening: boolean;
  audioLevel?: number;
  onToggleListening: () => void;
  onClear: () => void;
  messagesLength: number;
}

export default function ChatInput({ 
  onSendMessage, isLoading, isListening, audioLevel = 0, onToggleListening, onClear, messagesLength 
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const chipsScrollRef = useRef<HTMLDivElement>(null);

  // --- 🖱️ SMOOTH CHIP NAVIGATION ---
  useEffect(() => {
    const el = chipsScrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: "smooth" }); 
    };
    el.addEventListener("wheel", onWheel);
    return () => el.removeEventListener("wheel", onWheel);
  }, [messagesLength]);

  // --- 👻 HQ GHOST TYPEWRITER ---
  useEffect(() => {
    if (isListening || input.length > 0) return;
    const phrases = [
      "Ask about our Neural Architecture...", 
      "Request a project roadmap...", 
      "Connect with Ahmed Raza...", 
      "Inquire about pricing packets...",
      "Verify system capabilities..."
    ];
    let currentPhraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      const currentPhrase = phrases[currentPhraseIndex];
      if (isDeleting) {
        setPlaceholder(prev => prev.substring(0, prev.length - 1));
        if (placeholder.length === 0) {
          isDeleting = false;
          currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
          timeout = setTimeout(type, 500);
          return;
        }
        timeout = setTimeout(type, 40);
      } else {
        setPlaceholder(currentPhrase.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex === currentPhrase.length) {
          isDeleting = true;
          timeout = setTimeout(type, 3000);
          return;
        }
        timeout = setTimeout(type, 60);
      }
    };
    timeout = setTimeout(type, 100);
    return () => clearTimeout(timeout);
  }, [input, isListening, placeholder.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="relative z-20 bg-[#050505]/90 backdrop-blur-3xl border-t border-white/5 pb-8 pt-4 rounded-b-[2.5rem]">
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        @keyframes laser-move { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .laser-line { animation: laser-move 3s infinite linear; }
      `}</style>

      {/* --- 1. HQ QUICK COMMANDS --- */}
      <AnimatePresence>
        {!isLoading && messagesLength < 2 && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="px-6 mb-4 overflow-hidden relative"
            >
                <div 
                    ref={chipsScrollRef}
                    className="flex gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
                >
                    {[
                        { icon: Globe, text: "Services", cmd: "What services do you offer?" },
                        { icon: Zap, text: "Pricing", cmd: "Give me an estimate." },
                        { icon: Users, text: "The Team", cmd: "Who is in the HQ team?" },
                        { icon: Terminal, text: "Stack", cmd: "Show tech capabilities." },
                    ].map((btn, i) => (
                        <motion.button 
                            key={i}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(229, 9, 20, 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSendMessage(btn.cmd)} 
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all shrink-0 whitespace-nowrap group/chip"
                        >
                            <btn.icon className="w-3 h-3 text-[#E50914]" /> {btn.text}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6">
          <form onSubmit={handleSubmit} className="relative flex flex-col gap-3">
              
              {/* --- 2. COMMAND INPUT DECK --- */}
              <div className={`
                  relative flex items-center bg-black border transition-all duration-700 rounded-3xl overflow-hidden group/input
                  ${isFocused ? 'border-[#E50914]/50 shadow-[0_0_30px_rgba(229,9,20,0.15)]' : 'border-white/10'}
              `}>
                  
                  {/* Laser Scanning Overlay */}
                  <div className={`absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#E50914] to-transparent laser-line transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
                  
                  <div className="pl-5 pr-2">
                    <Command className={`w-4 h-4 transition-colors ${isFocused ? 'text-[#E50914]' : 'text-white/20'}`} />
                  </div>

                  <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder={isListening ? "Awaiting voice data..." : placeholder} 
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-none outline-none py-5 text-[14px] text-white placeholder:text-white/10 font-medium tracking-wide z-10"
                  />
                  
                  {/* --- 3. HQ TRIGGER SYSTEMS --- */}
                  <div className="flex items-center gap-2 pr-3">
                      <AnimatePresence mode="wait">
                          {!input.trim() ? (
                              <motion.button 
                                  key="mic"
                                  type="button" 
                                  onClick={onToggleListening}
                                  className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-[#E50914] text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                              >
                                  {isListening ? (
                                      <div className="flex items-center justify-center gap-0.5">
                                          {[...Array(3)].map((_, i) => (
                                              <motion.div 
                                                key={i} 
                                                animate={{ height: [4, 12, 4] }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                className="w-1 bg-white rounded-full"
                                              />
                                          ))}
                                      </div>
                                  ) : <Mic className="w-5 h-5" />}
                              </motion.button>
                          ) : (
                              <motion.button 
                                  key="send"
                                  type="submit" 
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="group/btn flex items-center gap-2 pl-4 pr-2 py-2 bg-white text-black rounded-2xl font-black text-[10px] tracking-tighter hover:bg-[#E50914] hover:text-white transition-all duration-500 shadow-xl"
                              >
                                  INITIATE <div className="w-6 h-6 bg-black/10 rounded-lg flex items-center justify-center group-hover/btn:bg-white/20 transition-colors"><ChevronRight className="w-3.5 h-3.5" /></div>
                              </motion.button>
                          )}
                      </AnimatePresence>
                  </div>
              </div>

              {/* --- 4. DATA LOG FOOTER --- */}
              <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-[#E50914] animate-ping' : 'bg-green-500'}`} />
                      <p className="text-[9px] text-white/30 font-black tracking-[0.3em] uppercase font-mono">
                          {isLoading ? 'Uplink Processing' : 'Connection Stable'}
                      </p>
                  </div>
                  <div className="flex gap-6">
                      <button onClick={onClear} className="flex items-center gap-2 text-[9px] font-black text-white/10 hover:text-[#E50914] transition-all tracking-widest uppercase">
                          <Trash2 className="w-3 h-3" /> Purge
                      </button>
                      <button className="flex items-center gap-2 text-[9px] font-black text-white/10 hover:text-white transition-all tracking-widest uppercase">
                        <Binary className="w-3 h-3" /> Log Session
                      </button>
                  </div>
              </div>
          </form>
      </div>
    </div>
  );
}