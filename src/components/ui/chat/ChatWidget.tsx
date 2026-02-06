"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Bot,
  Minimize2,
  Maximize2,
  Hexagon,
  Sparkles,
  Zap
} from "lucide-react";

import { usePixoraChat } from "@/hooks/usePixoraChat";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

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
    stopGeneration,
    clearChat,
  } = usePixoraChat();

  const {
    isListening,
    transcript,
    startListening,
    resetTranscript,
    audioLevel,
  } = useSpeechRecognition();

  const [isMaximized, setIsMaximized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. HYDRATION & RESPONSIVE CHECK ---
  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- 2. POWER USER SHORTCUTS (ESC to Close) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // --- 3. SCROLL LOCK LOGIC (iOS Safe) ---
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.position = "fixed"; // iOS Freeze Fix
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isOpen, isMobile]);

  // --- 4. AUTO-SCROLL ---
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status]);

  // --- 5. VOICE SYNC ---
  useEffect(() => {
    if (transcript && !isListening) {
      sendMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, sendMessage, resetTranscript]);

  // --- 6. AUTO-WELCOME (PIXORA BRAIN IDENTITY) ---
  useEffect(() => {
    if (isOpen && isMounted && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            id: "intro",
            role: "assistant",
            content:
              "⚡ **System Online.**\n\nI am **Pixora AI**, your creative co-pilot.\n\nWhether you need a **High-Performance Website**, **AI Integration**, or just want to discuss a project—I'm plugged in and ready.\n\n**What's the mission today?**",
            timestamp: Date.now(),
          },
        ]);
      }, 600);
    }
  }, [isOpen, isMounted, messages.length, setMessages]);

  if (!isMounted) return null;

  return (
    <>
      <style jsx global>{`
        /* Custom Scrollbar for Chat */
        .titan-scroll::-webkit-scrollbar { width: 4px; }
        .titan-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .titan-scroll::-webkit-scrollbar-thumb { background: rgba(229, 9, 20, 0.4); border-radius: 10px; }
        .titan-scroll:hover::-webkit-scrollbar-thumb { background: #E50914; }

        /* Scanning Line Effect */
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
        .scanline {
          width: 100%; height: 50px;
          background: linear-gradient(to bottom, transparent, rgba(229, 9, 20, 0.1), transparent);
          animation: scanline 6s ease-in-out infinite;
        }
      `}</style>

      {/* --- WIDGET CONTAINER --- */}
      <div className={`fixed z-[9998] flex flex-col items-end pointer-events-none transition-all duration-300
          ${isMobile ? 'bottom-0 right-0 left-0' : 'bottom-6 right-6 md:bottom-10 md:right-10'}
      `}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              layout
              initial={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, y: 50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                width: isMaximized ? "90vw" : isMobile ? "100%" : "400px",
                height: isMaximized ? "85vh" : isMobile ? "100dvh" : "600px",
                borderRadius: isMobile && !isMaximized ? "0px" : "24px",
              }}
              exit={isMobile ? { opacity: 0, y: "100%" } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col overflow-hidden pointer-events-auto bg-[#050505]/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative will-change-transform origin-bottom-right"
            >
              
              {/* --- CYBER BACKGROUND --- */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="scanline absolute top-0 left-0" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
                <div className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] bg-[#E50914]/5 blur-[100px] rounded-full" />
              </div>

              {/* --- HEADER --- */}
              <div className={`relative z-20 px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01] ${isMobile ? 'pt-[env(safe-area-inset-top)] mt-2' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-black flex items-center justify-center border border-white/10 shadow-lg overflow-hidden group-hover:border-[#E50914]/50 transition-colors">
                      <Bot className="w-4 h-4 text-white group-hover:text-[#E50914] transition-colors" />
                      {/* Inner Glow */}
                      <motion.div
                        className="absolute inset-0 bg-[#E50914]/20 blur-md"
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                    </div>
                    {/* Online Dot */}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-black rounded-full ${networkHealth === "offline" ? "bg-red-500" : "bg-green-500 shadow-[0_0_8px_#22c55e]"}`} />
                  </div>
                  
                  <div>
                    <h3 className="text-[11px] font-black text-white tracking-[0.2em] uppercase flex items-center gap-2">
                      Pixora AI <Sparkles className="w-2 h-2 text-[#E50914]" />
                    </h3>
                    <p className="text-[9px] text-white/40 font-mono tracking-wide uppercase mt-0.5">
                      {networkHealth === "offline" ? "Reconnecting..." : "System Active"}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  {!isMobile && (
                    <button
                      onClick={() => setIsMaximized(!isMaximized)}
                      className="p-2 text-white/20 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                    >
                      {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-white/20 hover:text-[#E50914] hover:bg-[#E50914]/10 rounded-lg transition-all active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* --- MESSAGES AREA --- */}
              <div
                className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 space-y-6 titan-scroll"
                style={{ overscrollBehavior: "contain" }}
                onWheel={(e) => e.stopPropagation()}
              >
                {messages.map((m) => (
                  <ChatMessage key={m.id} role={m.role} content={m.content} />
                ))}

                {/* Typing Indicator */}
                {status === "thinking" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-r-2xl rounded-bl-2xl backdrop-blur-md">
                      <Hexagon className="w-3 h-3 text-[#E50914] animate-spin" />
                      <span className="text-[10px] text-white/60 font-mono tracking-[0.2em] uppercase animate-pulse">
                        {loadingText}
                      </span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-2" />
              </div>

              {/* --- INPUT AREA (Safe Area) --- */}
              <div className="relative z-20 pb-[env(safe-area-inset-bottom)] bg-black/40 backdrop-blur-xl border-t border-white/5">
                <ChatInput
                  onSendMessage={sendMessage}
                  isLoading={status === "thinking" || status === "typing"}
                  isListening={isListening}
                  audioLevel={audioLevel}
                  onToggleListening={startListening}
                  onClear={clearChat}
                  messagesLength={messages.length}
                />
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* --- FLOATING TRIGGER BUTTON (When Closed) --- */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              layoutId="trigger"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className={`
                group relative flex items-center justify-center bg-[#050505] border border-white/10 
                shadow-[0_10px_40px_rgba(229,9,20,0.3)] z-[50] overflow-hidden backdrop-blur-xl pointer-events-auto
                ${isMobile ? 'w-14 h-14 rounded-full m-5' : 'w-16 h-16 rounded-2xl m-8'}
              `}
            >
              {/* Active Pulse (If messages exist or loading) */}
              {(messages.length > 0 || status !== 'idle') && (
                 <div className="absolute inset-0 bg-[#E50914]/40 animate-ping opacity-30" />
              )}

              <div className="absolute inset-0 bg-[#E50914]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -inset-1 bg-gradient-to-tr from-[#E50914] to-transparent opacity-20 blur-lg group-hover:opacity-40 transition-opacity" />
              
              <div className="relative z-10 text-white group-hover:text-[#E50914] transition-colors duration-300">
                {status === 'thinking' ? (
                    <Zap className="w-6 h-6 animate-pulse" />
                ) : (
                    <MessageSquare className={isMobile ? "w-6 h-6" : "w-7 h-7"} strokeWidth={1.5} />
                )}
              </div>
              
              {/* Notification Dot */}
              <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E50914] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E50914] border-2 border-black"></span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}