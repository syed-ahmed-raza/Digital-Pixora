"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

export interface Message {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export type ChatStatus = "idle" | "reading" | "thinking" | "typing" | "completed" | "error";
export type NetworkHealth = "excellent" | "good" | "poor" | "offline";

// --- 🔊 GLOBAL SONIC ENGINE (Lazy Singleton) ---
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
        // 🔥 FIX: Safari support added (webkitAudioContext)
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
    return audioCtx;
};

export const usePixoraChat = () => {
  // --- CORE STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [loadingText, setLoadingText] = useState("Ready");
  const [networkHealth, setNetworkHealth] = useState<NetworkHealth>("good");

  const abortControllerRef = useRef<AbortController | null>(null);
  const processedNavs = useRef<Set<string>>(new Set());

  // --- 🔊 PROCEDURAL AUDIO GENERATOR ---
  const playUiSound = useCallback((type: 'send' | 'receive' | 'error' | 'nav') => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const now = ctx.currentTime;
        
        if (type === 'send') {
            osc.type = 'sine'; 
            osc.frequency.setValueAtTime(800, now); 
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1); 
            gain.gain.setValueAtTime(0.05, now); 
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1); 
            osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'receive') {
            osc.type = 'triangle'; 
            osc.frequency.setValueAtTime(400, now); 
            osc.frequency.linearRampToValueAtTime(600, now + 0.1); 
            gain.gain.setValueAtTime(0.03, now); 
            gain.gain.linearRampToValueAtTime(0.001, now + 0.2); 
            osc.start(now); osc.stop(now + 0.2);
        } else if (type === 'nav') {
            osc.type = 'sawtooth'; 
            osc.frequency.setValueAtTime(200, now); 
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.3); 
            gain.gain.setValueAtTime(0.02, now); 
            gain.gain.linearRampToValueAtTime(0.001, now + 0.3); 
            osc.start(now); osc.stop(now + 0.3);
        } else if (type === 'error') {
            osc.type = 'square'; 
            osc.frequency.setValueAtTime(150, now); 
            gain.gain.setValueAtTime(0.05, now); 
            gain.gain.linearRampToValueAtTime(0.001, now + 0.3); 
            osc.start(now); osc.stop(now + 0.3);
        }
    } catch (e) {
        // Silent fail if audio blocked
    }
  }, []);
  
  // --- 🧠 MEMORY CORE ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pixora_hq_v9");
      if (saved) {
        try { 
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) setMessages(parsed);
        } catch (e) { localStorage.removeItem("pixora_hq_v9"); }
      }
      
      const updateNetwork = () => {
        if (!navigator.onLine) {
            setNetworkHealth("offline");
            toast.error("Offline. Neural Link Severed.", { style: { background: '#000', color: '#fff', border: '1px solid #E50914' } });
        } else {
            // 🔥 FIX: Safe check for navigator.connection (Not supported in Firefox/Safari)
            const conn = (navigator as any).connection;
            if (conn) {
                if (conn.saveData || conn.effectiveType === '2g') setNetworkHealth("poor");
                else setNetworkHealth("excellent");
            } else { setNetworkHealth("good"); }
        }
      };
      
      updateNetwork();
      window.addEventListener('online', updateNetwork);
      window.addEventListener('offline', updateNetwork);
      return () => {
        window.removeEventListener('online', updateNetwork);
        window.removeEventListener('offline', updateNetwork);
      };
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const compressedMemory = messages.slice(-50); 
      localStorage.setItem("pixora_hq_v9", JSON.stringify(compressedMemory));
    }
  }, [messages]);

  const triggerHaptic = useCallback((pattern: number[] = [10]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }, []);

  const handleNavigationTrigger = useCallback((text: string, msgId: string | number) => {
    if (text.includes("[NAV:")) {
        const match = text.match(/\[NAV:(.*?)\]/);
        if (match && match[1]) {
            const targetId = match[1].toLowerCase();
            const triggerId = `${targetId}-${msgId}`;
            
            if (!processedNavs.current.has(triggerId)) {
                processedNavs.current.add(triggerId);
                const element = document.getElementById(targetId);
                
                if (element) {
                    playUiSound('nav');
                    triggerHaptic([50]);
                    
                    // Close chat on mobile if navigating
                    if (window.innerWidth < 768) setIsOpen(false);
                    
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add temporary highlight class
                        element.classList.add('ring-2', 'ring-[#E50914]', 'ring-offset-4', 'ring-offset-black', 'transition-all', 'duration-1000');
                        setTimeout(() => element.classList.remove('ring-2', 'ring-[#E50914]', 'ring-offset-4', 'ring-offset-black'), 3000);
                    }, 300);
                }
            }
        }
    }
  }, [playUiSound, triggerHaptic]);

  // --- 🚀 PROCESSING ENGINE ---
  const sendMessage = async (text: string) => {
    if (!text.trim() || status === 'thinking' || status === 'typing') return;

    if (!navigator.onLine) {
        toast.error("Connection Lost. Reconnecting...");
        return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    triggerHaptic([15]);
    playUiSound('send');

    const userMessage: Message = { 
        id: Date.now(), 
        role: "user", 
        content: text, 
        timestamp: Date.now() 
    };
    setMessages((prev) => [...prev, userMessage]);

    setStatus("reading");
    setLoadingText("Reading...");
    
    // Dynamic reading time based on length
    const readingTime = Math.min(Math.max(600, text.length * 20), 1500); 
    await new Promise(resolve => setTimeout(resolve, readingTime));

    setStatus("thinking");
    setLoadingText("Thinking...");
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            messages: [...messages, userMessage],
            network_quality: networkHealth,
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.body || !response.ok) throw new Error("Neural Uplink Failed");

      setStatus("typing");
      setLoadingText("Typing...");
      
      const aiMessageId = Date.now() + 1;
      setMessages((prev) => [...prev, { 
          id: aiMessageId, 
          role: "assistant", 
          content: "", 
          timestamp: Date.now() 
      }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (isFirstChunk) { 
            triggerHaptic([20]);
            playUiSound('receive');
            isFirstChunk = false; 
        }
        
        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;

        // Check for navigation commands in real-time
        handleNavigationTrigger(aiContent, aiMessageId);
        
        setMessages((prev) => prev.map(m => m.id === aiMessageId ? { ...m, content: aiContent } : m));
      }

      setStatus("completed");
      triggerHaptic([10]);

      // 🎉 Celebration Logic
      if (aiContent.toLowerCase().includes("congratulations") || 
          text.toLowerCase().includes("deal") || 
          aiContent.includes("welcome to the team")) {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.8 }, colors: ['#E50914', '#ffffff'] });
          playUiSound('receive');
      }

    } catch (error: any) {
      if (error.name === 'AbortError') return;

      setStatus("error");
      playUiSound('error');
      triggerHaptic([30, 30, 30]); 
      
      toast.error("Signal Interrupted. Retrying...", {
         style: { background: '#000', border: '1px solid #E50914', color: '#fff' }
      });
      
      setMessages((prev) => [...prev, { 
          id: Date.now(), 
          role: "assistant", 
          content: "⚠️ **Signal Lost.**\nMy connection was severed. Please try again.",
          timestamp: Date.now()
      }]);
    } finally {
      abortControllerRef.current = null;
      setTimeout(() => setStatus((prev) => prev === 'completed' ? 'idle' : prev), 2500);
    }
  };

  const clearChat = () => {
    triggerHaptic([20, 10]);
    setMessages([]); 
    localStorage.removeItem("pixora_hq_v9"); 
    toast.success("Memory Purged", { style: { background: '#000', color: '#fff' } });
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setStatus("idle");
        toast("Process Halted", { icon: '🛑', style: { background: '#000', color: '#fff' } });
    }
  };

  return {
    isOpen, setIsOpen,
    messages, setMessages,
    status, loadingText, networkHealth, 
    sendMessage, triggerHaptic,
    clearChat, stopGeneration
  };
};