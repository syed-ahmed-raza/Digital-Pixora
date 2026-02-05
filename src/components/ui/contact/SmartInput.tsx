"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface SmartInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: any) => void;
  error?: string;
  type?: "text" | "textarea";
  enableVoice?: boolean;
  onVoiceResult?: (text: string) => void;
}

// --- NATIVE SPEECH RECOGNITION (No Hook Needed) ---
const useNativeSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = "en-US";
            }
        }
    }, []);

    const startListening = (onResult: (text: string) => void) => {
        if (!recognitionRef.current) {
            toast.error("Voice input not supported in this browser.");
            return;
        }

        setIsListening(true);
        recognitionRef.current.start();

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
            setIsListening(false);
            toast.error("Voice input failed. Try again.");
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    };

    return { isListening, startListening };
};

export default function SmartInput({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  type = "text", 
  enableVoice = false, 
  onVoiceResult 
}: SmartInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  // 🔥 FIX: Using Native Implementation instead of external hook
  const { isListening, startListening } = useNativeSpeech();

  const handleMicClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onVoiceResult) return;

      startListening((text) => {
          onVoiceResult(text);
          toast.success("Voice Captured", {
            style: { background: "#0A0A0A", color: "#fff", border: "1px solid #22c55e" },
            icon: "🎙️",
          });
      });
  };

  return (
    <div className="relative group w-full mb-8">
      <motion.div 
        animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`relative bg-[#0f0f0f] rounded-xl transition-all duration-500 overflow-hidden group-hover:bg-[#151515]
        ${error ? "border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "border border-white/10 group-hover:border-white/20"}`}
      >
        {/* Animated Laser Border (Bottom) */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5 pointer-events-none" />
        <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: isFocused ? "100%" : "0%" }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className={`absolute bottom-0 left-0 h-[2px] z-30 ${error ? 'bg-red-500' : 'bg-[#E50914]'}`}
        />

        {/* Listening Mode Visualization (Waveform) */}
        <AnimatePresence>
            {isListening && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-red-500/5 z-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="flex gap-1 items-end h-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <motion.div 
                                key={i}
                                animate={{ height: [5, 20, 5] }}
                                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                                className="w-1 bg-[#E50914] rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Label Animation */}
        <label className={`absolute left-5 transition-all duration-300 pointer-events-none z-10 ${
            isFocused || value 
            ? "top-3 text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em]" 
            : "top-5 text-sm text-white/40 font-medium group-hover:text-white/60"
        }`}>
            {label}
        </label>

        {/* 🎤 MIC BUTTON */}
        {enableVoice && (
            <button 
                type="button" 
                onClick={handleMicClick}
                className={`absolute top-3 right-3 p-2 rounded-full transition-all z-50 cursor-pointer hover:bg-white/10 active:scale-95 ${
                    isListening ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-white/30 hover:text-white'
                }`}
                title="Use Voice Input"
            >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
        )}

        {/* Input Fields */}
        {type === "textarea" ? (
            <textarea 
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                rows={4}
                className="w-full bg-transparent text-white px-5 pt-8 pb-4 text-lg font-light focus:outline-none resize-none placeholder-transparent relative z-20 selection:bg-[#E50914]/30"
                spellCheck="false"
            />
        ) : (
            <input 
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoComplete="off"
                className="w-full bg-transparent text-white px-5 pt-8 pb-4 text-lg font-light focus:outline-none placeholder-transparent relative z-20 selection:bg-[#E50914]/30"
            />
        )}
      </motion.div>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
            <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="absolute -bottom-6 left-1 flex items-center gap-1.5"
            >
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</span>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}