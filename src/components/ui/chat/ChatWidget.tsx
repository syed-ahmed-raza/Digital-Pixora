"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Bot, // Isay hum neeche 'Sparkles' ya 'User' se replace kar sakte hain agar chaho
  Minimize2,
  Maximize2,
  Hexagon,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. HYDRATION & INITIALIZATION
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. SCROLL LOCK LOGIC
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // 3. AUTO-SCROLL
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status]);

  // 4. VOICE SYNC
  useEffect(() => {
    if (transcript && !isListening) {
      sendMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, sendMessage, resetTranscript]);

  // 5. AUTO-WELCOME (HUMANIZED 🧠)
  useEffect(() => {
    if (isOpen && isMounted && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            id: "intro",
            role: "assistant",
            content:
              // 🔥 CHANGE: More Human, Less Robot
              "👋 **Hey there!** I'm your creative co-pilot at Digital Pixora.\n\nWhether you need a **3D Website**, **AI Agent**, or just want to brainstorm ideas—I'm plugged in and ready.\n\n**What are we building today?**",
            timestamp: Date.now(),
          },
        ]);
      }, 500);
    }
  }, [isOpen, isMounted, messages.length, setMessages]);

  if (!isMounted) return null;

  return (
    <>
      <style jsx global>{`
        .titan-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .titan-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .titan-scroll::-webkit-scrollbar-thumb {
          background: rgba(229, 9, 20, 0.2);
          border-radius: 10px;
        }
        .titan-scroll:hover::-webkit-scrollbar-thumb {
          background: #e50914;
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        .scanline {
          width: 100%;
          height: 100px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(229, 9, 20, 0.05),
            transparent
          );
          animation: scanline 8s linear infinite;
        }
      `}</style>

      <div className="fixed z-[9999] bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col items-end pointer-events-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                width: isMaximized
                  ? "90vw"
                  : window.innerWidth < 768
                    ? "100vw"
                    : "420px",
                height: isMaximized
                  ? "85vh"
                  : window.innerWidth < 768
                    ? "100dvh"
                    : "650px",
                bottom: window.innerWidth < 768 && !isMaximized ? "-24px" : "0px",
                right: window.innerWidth < 768 && !isMaximized ? "-24px" : "0px",
              }}
              exit={{ opacity: 0, y: 100, scale: 0.8, filter: "blur(20px)" }}
              transition={{ type: "spring", stiffness: 250, damping: 28 }}
              className="flex flex-col overflow-hidden pointer-events-auto bg-black/95 backdrop-blur-3xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative will-change-transform rounded-t-[2.5rem] md:rounded-[2.5rem]"
            >
              {/* CYBER BACKGROUND */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="scanline absolute top-0 left-0" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[#E50914]/5 blur-[120px] rounded-full" />
              </div>

              {/* HEADER */}
              <div className="relative z-10 px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#111] to-black flex items-center justify-center border border-white/10 shadow-xl overflow-hidden">
                      <Bot className="w-5 h-5 text-white" />
                      <motion.div
                        className="absolute inset-0 bg-[#E50914]/20"
                        animate={{ opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-black rounded-full ${networkHealth === "offline" ? "bg-gray-500" : "bg-green-500"}`}
                    />
                  </div>
                  <div>
                    {/* 🔥 CHANGE: Name update to sound more approachable */}
                    <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">
                      Pixora Assistant
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[9px] text-white/40 font-mono tracking-widest uppercase">
                        {networkHealth === "offline" ? "Offline" : "Online & Ready"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="hidden md:flex p-2 text-white/20 hover:text-white transition-colors"
                  >
                    {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-white/20 hover:text-[#E50914] transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* CHAT AREA */}
              <div
                className="relative z-10 flex-1 overflow-y-auto p-4 md:p-5 space-y-6 titan-scroll"
                style={{ overscrollBehavior: "contain" }}
                onWheel={(e) => e.stopPropagation()}
              >
                {messages.map((m) => (
                  <ChatMessage key={m.id} role={m.role} content={m.content} />
                ))}

                {status === "thinking" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                      <Hexagon className="w-3 h-3 text-[#E50914] animate-spin" />
                      <span className="text-[9px] text-white/60 font-mono tracking-[0.2em] uppercase">
                        {loadingText}
                      </span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* INPUT AREA */}
              <div className="relative z-20">
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

        {/* TRIGGER BUTTON */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              layoutId="trigger"
              initial={{ scale: 0, rotate: 20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="group relative w-16 h-16 rounded-3xl flex items-center justify-center bg-[#050505] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[50] overflow-hidden backdrop-blur-xl pointer-events-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#E50914]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 text-white group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="absolute top-4 right-4 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E50914] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E50914]"></span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}