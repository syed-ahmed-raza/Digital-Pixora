"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import {
  MessageSquare,
  X,
  Bot,
  Minimize2,
  Maximize2,
  Cpu,
  Wifi,
  Sparkles
} from "lucide-react";

import { usePixoraChat } from "@/hooks/usePixoraChat";
// Note: Ensure you have this hook or remove the voice parts if not needed
// Assuming a standard hook structure based on context
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"; 
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

// --- 🔊 SONIC UI ENGINE (SINGLETON PATTERN) ---
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window !== "undefined") {
    // @ts-ignore - Safari support
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext && !audioCtx) audioCtx = new AudioContext();
  }
  return audioCtx;
};

const playSound = (type: 'open' | 'close' | 'send' | 'hover') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'open') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    } else if (type === 'close') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    } else if (type === 'send') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
  } catch(e) {
      // Silent fail
  }
};

export default function ChatWidget() {
  const {
    isOpen,
    setIsOpen,
    messages,
    setMessages,
    status,
    loadingText,
    networkHealth,
    sendMessage,
    clearChat,
  } = usePixoraChat();

  // If you don't have useSpeechRecognition yet, comment this block out
  // and remove 'isListening', 'transcript', etc from props below
  const {
    isListening,
    transcript,
    startListening,
    stopListening, // Ensure your hook exports this
    resetTranscript,
    audioLevel,
  } = useSpeechRecognition();

  const [isMaximized, setIsMaximized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- MAGNETIC BUTTON LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
      if (isMobile) return;
      const { clientX, clientY, currentTarget } = e;
      const { left, top, width, height } = currentTarget.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      mouseX.set((clientX - centerX) * 0.25);
      mouseY.set((clientY - centerY) * 0.25);
  };

  const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
  };

  // --- 1. HYDRATION & RESPONSIVE CHECK ---
  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- 2. UI CONTROLS ---
  const toggleOpen = () => {
      if (!isOpen) playSound('open');
      else playSound('close');
      setIsOpen(!isOpen);
  };

  // --- 3. MOBILE SCROLL LOCK ---
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, isMobile]);

  // --- 4. AUTO-SCROLL ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, isOpen]);

  // --- 5. VOICE SYNC ---
  useEffect(() => {
    if (transcript && !isListening) {
      sendMessage(transcript);
      playSound('send');
      resetTranscript();
    }
  }, [transcript, isListening, sendMessage, resetTranscript]);

  // --- 6. AUTO-WELCOME ---
  useEffect(() => {
    if (isOpen && isMounted && messages.length === 0) {
      setTimeout(() => {
        setMessages([{
            id: "intro",
            role: "assistant",
            content: "⚡ **System Online.**\n\nI am **Pixora AI**, your creative co-pilot. I can architect your **Next.js Site**, design a **Logo**, or plan a **Viral Campaign**.\n\n**What's the mission today?**",
            timestamp: Date.now(),
        }]);
      }, 600);
    }
  }, [isOpen, isMounted, messages.length, setMessages]);

  if (!isMounted) return null;

  return (
    <>
      {/* GLOBAL STYLES FOR SCROLLBAR & GLASS */}
      <style jsx global>{`
        .titan-scroll::-webkit-scrollbar { width: 4px; }
        .titan-scroll::-webkit-scrollbar-track { background: transparent; }
        .titan-scroll::-webkit-scrollbar-thumb { background: rgba(229, 9, 20, 0.4); border-radius: 10px; }
        .titan-scroll:hover::-webkit-scrollbar-thumb { background: #E50914; }
        
        .glass-panel {
            background: rgba(5, 5, 5, 0.95);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 20px 80px rgba(0,0,0,0.9);
        }

        @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(1.4); opacity: 0; }
        }
        .pulse-ring::before {
            content: '';
            position: absolute;
            left: 0; top: 0; width: 100%; height: 100%;
            background: rgba(229, 9, 20, 0.4);
            border-radius: 50%;
            z-index: -1;
            animation: pulse-ring 2s infinite;
        }
      `}</style>

      {/* --- WIDGET CONTAINER --- */}
      <div className={`fixed z-[9999] flex flex-col items-end pointer-events-none 
          ${isMobile ? 'bottom-0 right-0 left-0 h-[0px]' : 'bottom-8 right-8'}
      `}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              layout
              initial={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, y: 40, scale: 0.9, filter: "blur(12px)" }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                filter: "blur(0px)",
                width: isMaximized ? "90vw" : isMobile ? "100%" : "400px",
                height: isMaximized ? "85vh" : isMobile ? "100dvh" : "650px",
                borderRadius: isMobile && !isMaximized ? "0px" : "24px",
              }}
              exit={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, y: 40, scale: 0.9, filter: "blur(12px)" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              // 🔒 SCROLL FIX: StopPropagation to prevent body scroll interaction
              onWheel={(e) => e.stopPropagation()}
              className="glass-panel flex flex-col overflow-hidden pointer-events-auto relative will-change-transform origin-bottom-right overscroll-contain"
            >
              
              {/* --- 3D GRID & NOISE BACKGROUND --- */}
              <div className="absolute inset-0 z-0 pointer-events-none select-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#E50914]/5 to-transparent opacity-50" />
                {/* Cyber Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
              </div>

              {/* --- HEADER (HUD STYLE) --- */}
              <div 
                className={`relative z-20 px-5 py-4 border-b border-white/5 flex justify-between items-center select-none bg-black/20
                ${isMobile ? 'pt-[calc(env(safe-area-inset-top)+1rem)]' : ''}`}
                onDoubleClick={() => !isMobile && setIsMaximized(!isMaximized)}
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
                      <Bot className="w-5 h-5 text-white/90" />
                      {/* Scanning Effect */}
                      <motion.div 
                        className="absolute top-0 left-0 w-full h-0.5 bg-[#E50914]/80 shadow-[0_0_10px_#E50914]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    {/* Status Dot */}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-black rounded-full transition-colors duration-500 
                        ${networkHealth === 'offline' ? 'bg-red-500' : networkHealth === 'poor' ? 'bg-yellow-500' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}
                    `} />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                      PIXORA <span className="text-[#E50914]">AI</span>
                    </h3>
                    <div className="flex items-center gap-1.5">
                        {status === 'thinking' ? (
                            <>
                                <Cpu className="w-3 h-3 text-[#E50914] animate-pulse" />
                                <span className="text-[10px] text-[#E50914] font-mono uppercase tracking-wider animate-pulse">Processing...</span>
                            </>
                        ) : (
                            <>
                                <Wifi className="w-3 h-3 text-white/40" />
                                <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Secure Uplink</span>
                            </>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!isMobile && (
                    <button
                      onClick={() => setIsMaximized(!isMaximized)}
                      aria-label="Maximize Chat"
                      className="p-2 text-white/20 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                    >
                      {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={toggleOpen}
                    aria-label="Close Chat"
                    className="p-2 text-white/20 hover:text-[#E50914] hover:bg-[#E50914]/10 rounded-lg transition-all active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* --- MESSAGES AREA --- */}
              <div
                className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 space-y-6 titan-scroll overscroll-contain"
              >
                {messages.map((m, i) => (
                  <ChatMessage key={m.id || i} role={m.role} content={m.content} />
                ))}

                {/* AI Thinking Animation */}
                {status === "thinking" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#111] border border-white/10 rounded-r-2xl rounded-bl-2xl backdrop-blur-md shadow-lg">
                      <div className="flex gap-1">
                        <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-[#E50914] rounded-full" />
                        <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#E50914] rounded-full" />
                        <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#E50914] rounded-full" />
                      </div>
                      <span className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase">
                        {loadingText}
                      </span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* --- INPUT AREA --- */}
              {/* pb-safe ensures content isn't hidden behind home bar on iPhones */}
              <div className="relative z-20 pb-safe bg-black/60 backdrop-blur-xl border-t border-white/10">
                <ChatInput
                  onSendMessage={(msg) => { playSound('send'); sendMessage(msg); }}
                  isLoading={status === "thinking" || status === "typing"}
                  isListening={isListening}
                  audioLevel={audioLevel}
                  onToggleListening={isListening ? stopListening : startListening}
                  onClear={clearChat}
                  messagesLength={messages.length}
                />
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* --- THE MAGNETIC TRIGGER BUTTON (ORB) --- */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
                style={{ x: springX, y: springY }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative z-[50] pointer-events-auto"
            >
                <motion.button
                layoutId="trigger"
                aria-label="Open Chat"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -90 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => playSound('hover')}
                onClick={toggleOpen}
                className={`
                    pulse-ring group relative flex items-center justify-center bg-[#050505] border border-white/10 
                    shadow-[0_0_50px_rgba(229,9,20,0.6)] z-[50] overflow-hidden backdrop-blur-xl cursor-pointer
                    ${isMobile ? 'w-14 h-14 rounded-full m-5' : 'w-16 h-16 rounded-2xl m-8'}
                `}
                >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#E50914]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 group-hover:animate-[shine_1.5s_infinite]" />
                
                <div className="relative z-10 text-white group-hover:text-[#E50914] transition-colors duration-300">
                    <MessageSquare className={isMobile ? "w-6 h-6" : "w-7 h-7"} strokeWidth={1.5} />
                </div>
                
                {/* Notification Badge */}
                <span className="absolute top-3 right-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E50914] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E50914] border-2 border-black"></span>
                </span>
                </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}