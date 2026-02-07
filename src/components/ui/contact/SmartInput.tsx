"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, AlertCircle, StopCircle, Zap } from "lucide-react";
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

// --- NATIVE SPEECH RECOGNITION (Robust Hook) ---
const useNativeSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                setIsSupported(true);
                const recognition = new SpeechRecognition();
                recognition.continuous = false; // Stop after speaking
                recognition.interimResults = true; // Show results while speaking
                recognition.lang = "en-US";
                recognitionRef.current = recognition;
            }
        }
        
        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
        };
    }, []);

    const startListening = (onResult: (text: string, isFinal: boolean) => void) => {
        if (!recognitionRef.current) return;

        try {
            setIsListening(true);
            recognitionRef.current.start();

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    onResult(finalTranscript, true);
                    setIsListening(false);
                } else if (interimTranscript) {
                    // Optional: You can use this to show live preview
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech Error:", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    toast.error("Microphone access blocked.");
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } catch (e) {
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { isListening, isSupported, startListening, stopListening };
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
  // Ensure ID is stable across renders but unique
  const inputId = useRef(`input-${name}`).current; 
  
  const { isListening, isSupported, startListening, stopListening } = useNativeSpeech();

  const handleMicClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onVoiceResult) return;

      if (isListening) {
          stopListening();
          toast("Voice Input Paused", { 
              icon: "⏸️", 
              style: { background: "#111", color: "#fff", border: "1px solid #333" }
          });
      } else {
          startListening((text, isFinal) => {
              if (isFinal) {
                  onVoiceResult(text);
                  toast.success("Voice Captured", {
                    style: { background: "#050505", color: "#fff", border: "1px solid #22c55e" },
                    icon: "🎙️",
                  });
              }
          });
      }
  };

  return (
    <div className="relative group w-full mb-8">
      <motion.div 
        animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`relative bg-[#0f0f0f] rounded-xl transition-all duration-500 overflow-hidden
        ${error ? "border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : 
          isFocused ? "border-white/30 bg-[#151515]" : "border border-white/10 hover:border-white/20"}`}
      >
        {/* Animated Laser Border (Bottom) */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5 pointer-events-none" />
        <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: isFocused || isListening ? "100%" : "0%" }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className={`absolute bottom-0 left-0 h-[2px] z-30 ${error ? 'bg-red-500' : (isListening ? 'bg-green-500' : 'bg-[#E50914]')}`}
        />

        {/* Listening Mode Visualization (Organic Waveform) */}
        <AnimatePresence>
            {isListening && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-green-500/5 z-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="flex gap-1 items-center h-full opacity-30">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <motion.div 
                                key={i}
                                animate={{ height: ["20%", `${Math.random() * 80 + 20}%`, "20%"] }}
                                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                                className="w-1 bg-green-500 rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Floating Label */}
        <label 
            htmlFor={inputId}
            className={`absolute left-5 transition-all duration-300 pointer-events-none z-10 ${
            isFocused || value 
            ? "top-3 text-[9px] text-[#E50914] font-black uppercase tracking-[0.2em]" 
            : "top-5 text-sm text-white/40 font-medium group-hover:text-white/60"
        }`}>
            {label}
        </label>

        {/* 🎤 MIC BUTTON */}
        {enableVoice && isSupported && (
            <button 
                type="button" 
                onClick={handleMicClick}
                className={`absolute top-3 right-3 p-2 rounded-full transition-all z-50 cursor-pointer hover:bg-white/10 active:scale-95 ${
                    isListening ? 'bg-green-500/20 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse' : 'text-white/30 hover:text-white'
                }`}
                title={isListening ? "Stop Listening" : "Use Voice Input"}
            >
                {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
        )}

        {/* Input Fields */}
        {type === "textarea" ? (
            <textarea 
                id={inputId}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                rows={4}
                className="w-full bg-transparent text-white px-5 pt-8 pb-4 text-base md:text-lg font-light focus:outline-none resize-none placeholder-transparent relative z-20 selection:bg-[#E50914]/30"
                spellCheck="false"
            />
        ) : (
            <input 
                id={inputId}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoComplete="off"
                className="w-full bg-transparent text-white px-5 pt-8 pb-4 text-base md:text-lg font-light focus:outline-none placeholder-transparent relative z-20 selection:bg-[#E50914]/30"
            />
        )}
      </motion.div>
      
      {/* Error Message (Shake Effect) */}
      <AnimatePresence>
        {error && (
            <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
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