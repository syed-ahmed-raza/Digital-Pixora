"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, Zap, Users, 
  Trash2, Command, 
  Terminal, Globe, ChevronRight, Binary, ArrowUp
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
  onSendMessage, isLoading, isListening, onToggleListening, onClear, messagesLength 
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  
  // --- 🧠 TERMINAL MEMORY (Arrow Key History) ---
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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

  // --- 🎮 TERMINAL CONTROLS (Arrow Up Logic) ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Save to local history
    setHistory(prev => [...prev, input]);
    setHistoryIndex(-1);
    
    // Trigger Haptic
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(15);

    onSendMessage(input);
    setInput("");
  };

  const handleChipClick = (cmd: string) => {
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);
      onSendMessage(cmd);
  };

  return (
    <div className="relative z-20 bg-[#050505]/90 backdrop-blur-3xl border-t border-white/5 pb-6 pt-3 md:pb-8 md:pt-4 rounded-b-[2rem] md:rounded-b-[2.5rem]">
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        @keyframes laser-move { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        /* Laser speed increases when loading */
        .laser-line { animation: laser-move var(--laser-speed, 3s) infinite linear; }
      `}</style>

      {/* --- 1. HQ QUICK COMMANDS --- */}
      <AnimatePresence>
        {!isLoading && messagesLength < 2 && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="px-4 md:px-6 mb-3 md:mb-4 overflow-hidden relative"
            >
                <div 
                    ref={chipsScrollRef}
                    className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
                    style={{ touchAction: "pan-x" }}
                >
                    {[
                        { icon: Globe, text: "Services", cmd: "What services do you offer?" },
                        { icon: Zap, text: "Pricing", cmd: "Give me an estimate." },
                        { icon: Users, text: "The Team", cmd: "Who is in the HQ team?" },
                        { icon: Terminal, text: "Stack", cmd: "Show tech capabilities." },
                    ].map((btn, i) => (
                        <motion.button 
                            key={i}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(229, 9, 20, 0.15)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleChipClick(btn.cmd)} 
                            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all shrink-0 whitespace-nowrap group/chip shadow-sm hover:border-[#E50914]/30"
                        >
                            <btn.icon className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#E50914]" /> {btn.text}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 md:px-6">
          <form onSubmit={handleSubmit} className="relative flex flex-col gap-3">
              
              {/* --- 2. COMMAND INPUT DECK --- */}
              <div className={`
                  relative flex items-center bg-black border transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden group/input
                  ${isFocused ? 'border-[#E50914]/50 shadow-[0_0_25px_rgba(229,9,20,0.1)]' : 'border-white/10'}
                  ${isLoading ? 'opacity-80 grayscale cursor-not-allowed' : 'opacity-100'}
              `}>
                  
                  {/* Laser Scanning Overlay (Speed changes on Load) */}
                  <div 
                    className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#E50914] to-transparent laser-line transition-opacity duration-500 ${isFocused || isLoading ? 'opacity-100' : 'opacity-0'}`} 
                    style={{ "--laser-speed": isLoading ? "1s" : "3s" } as React.CSSProperties}
                  />
                  
                  <div className="pl-4 md:pl-5 pr-2">
                    {isLoading ? (
                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white/20 border-t-[#E50914] rounded-full animate-spin" />
                    ) : (
                        <Command className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${isFocused ? 'text-[#E50914]' : 'text-white/20'}`} />
                    )}
                  </div>

                  <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder={isListening ? "Awaiting voice data..." : (isLoading ? "System Processing..." : placeholder)} 
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-none outline-none py-3.5 md:py-5 text-[13px] md:text-[14px] text-white placeholder:text-white/15 font-medium tracking-wide z-10 min-w-0 disabled:cursor-not-allowed"
                      autoComplete="off"
                  />
                  
                  {/* --- 3. HQ TRIGGER SYSTEMS --- */}
                  <div className="flex items-center gap-2 pr-2 md:pr-3 shrink-0">
                      <AnimatePresence mode="wait">
                          {!input.trim() ? (
                              <motion.button 
                                  key="mic"
                                  type="button" 
                                  onClick={onToggleListening}
                                  className={`relative w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-[#E50914] text-white' : 'bg-white/5 text-white/30 hover:text-white'}`}
                              >
                                  {isListening ? (
                                      <div className="flex items-center justify-center gap-0.5">
                                          {[...Array(3)].map((_, i) => (
                                              <motion.div 
                                                key={i} 
                                                animate={{ height: [4, 12, 4] }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                className="w-0.5 md:w-1 bg-white rounded-full"
                                              />
                                          ))}
                                      </div>
                                  ) : <Mic className="w-4 h-4 md:w-5 md:h-5" />}
                              </motion.button>
                          ) : (
                              <motion.button 
                                  key="send"
                                  type="submit" 
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="group/btn flex items-center gap-2 pl-3 pr-1.5 py-1.5 md:pl-4 md:pr-2 md:py-2 bg-white text-black rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-tighter hover:bg-[#E50914] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                              >
                                  INITIATE <div className="w-5 h-5 md:w-6 md:h-6 bg-black/10 rounded-lg flex items-center justify-center group-hover/btn:bg-white/20 transition-colors"><ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" /></div>
                              </motion.button>
                          )}
                      </AnimatePresence>
                  </div>
              </div>

              {/* --- 4. DATA LOG FOOTER --- */}
              <div className="flex justify-between items-center px-1 md:px-2">
                  <div className="flex items-center gap-2 md:gap-3">
                      <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isLoading ? 'bg-[#E50914] animate-ping' : 'bg-green-500'}`} />
                      <p className="text-[8px] md:text-[9px] text-white/30 font-black tracking-[0.2em] md:tracking-[0.3em] uppercase font-mono truncate">
                          {isLoading ? 'Uplink Processing' : 'Connection Stable'}
                      </p>
                  </div>
                  <div className="flex gap-4 md:gap-6">
                      <button type="button" onClick={onClear} className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[9px] font-black text-white/10 hover:text-[#E50914] transition-all tracking-widest uppercase group/trash">
                          <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3 group-hover/trash:animate-bounce" /> <span className="hidden sm:inline">Purge</span>
                      </button>
                      <button type="button" className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[9px] font-black text-white/10 hover:text-white transition-all tracking-widest uppercase">
                        <ArrowUp className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span className="hidden sm:inline">History</span>
                      </button>
                  </div>
              </div>
          </form>
      </div>
    </div>
  );
}