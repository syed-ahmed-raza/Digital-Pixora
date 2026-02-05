"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

// --- TYPES ---
export interface Message {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export type ChatStatus = "idle" | "reading" | "thinking" | "typing" | "completed" | "error";
export type NetworkHealth = "excellent" | "good" | "poor" | "offline";

export const usePixoraChat = () => {
  // --- CORE STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [loadingText, setLoadingText] = useState("Ready"); // Humanized default
  const [networkHealth, setNetworkHealth] = useState<NetworkHealth>("good");

  // --- REFS ---
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // --- 🧠 MEMORY CORE (Auto-Repair) ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pixora_hq_v8");
      if (saved) {
        try { 
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) setMessages(parsed);
        } catch (e) { 
            console.warn("Memory Corrupted. Re-initializing..."); 
            localStorage.removeItem("pixora_hq_v8");
        }
      }
      
      // 📡 NETWORK MONITOR (Humanized Toasts)
      const updateNetwork = () => {
        if (!navigator.onLine) {
            setNetworkHealth("offline");
            toast.error("You're offline. Reconnecting...", { id: 'net-status', style: { background: '#000', color: '#fff', border: '1px solid #E50914' } });
            return;
        }
        
        if (networkHealth === 'offline') {
            toast.success("We're back online!", { id: 'net-status', style: { background: '#000', color: '#fff', border: '1px solid #22c55e' } });
        }

        // @ts-ignore
        const conn = (navigator as any).connection;
        if (conn) {
            if (conn.saveData || conn.effectiveType === '2g') setNetworkHealth("poor");
            else if (conn.effectiveType === '3g') setNetworkHealth("good");
            else setNetworkHealth("excellent");
        } else {
            setNetworkHealth("good");
        }
      };
      
      window.addEventListener('online', updateNetwork);
      window.addEventListener('offline', updateNetwork);
      return () => {
        window.removeEventListener('online', updateNetwork);
        window.removeEventListener('offline', updateNetwork);
      };
    }
  }, []);

  // AUTO-LOGGING (Last 30 messages)
  useEffect(() => {
    if (messages.length > 0) {
      const compressedMemory = messages.slice(-30); 
      localStorage.setItem("pixora_hq_v8", JSON.stringify(compressedMemory));
    }
  }, [messages]);

  // --- 📳 HAPTIC FEEDBACK ---
  const triggerHaptic = useCallback((pattern: number[] = [10]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }, []);

  // --- 🚀 PROCESSING ENGINE ---
  const sendMessage = async (text: string) => {
    if (!text.trim() || status === 'thinking' || status === 'typing') return;

    if (!navigator.onLine) {
        toast.error("Connection lost. Please wait.");
        return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    triggerHaptic([15]);

    const userMessage: Message = { 
        id: Date.now(), 
        role: "user", 
        content: text, 
        timestamp: Date.now() 
    };
    setMessages((prev) => [...prev, userMessage]);

    // --- HUMAN SIMULATION PROTOCOL (More Natural) ---
    setStatus("reading");
    setLoadingText("Reading..."); // Humanized
    const readingTime = Math.min(Math.max(600, text.length * 15), 1200); 
    await new Promise(resolve => setTimeout(resolve, readingTime));

    setStatus("thinking");
    setLoadingText("Thinking..."); // Humanized
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            messages: [...messages, userMessage],
            network_quality: networkHealth 
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.body || !response.ok) throw new Error("Connection Error");

      setStatus("typing");
      setLoadingText("Typing..."); // Humanized
      
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
            isFirstChunk = false; 
        }
        
        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;

        setMessages((prev) => prev.map(m => m.id === aiMessageId ? { ...m, content: aiContent } : m));
      }

      setStatus("completed");
      triggerHaptic([10]);

      // 🎉 SILENT CELEBRATION
      if (aiContent.toLowerCase().includes("congratulations") || text.toLowerCase().includes("celebrate")) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 }, colors: ['#E50914', '#ffffff'] });
      }

    } catch (error: any) {
      if (error.name === 'AbortError') return;

      setStatus("error");
      triggerHaptic([30, 30]); 
      
      toast.error("Something went wrong. Retrying...", {
         style: { background: '#000', border: '1px solid #E50914', color: '#fff' }
      });
      
      setMessages((prev) => [...prev, { 
          id: Date.now(), 
          role: "assistant", 
          content: "⚠️ **Connection dropped.**\nI couldn't get that. Could you say it again?",
          timestamp: Date.now()
      }]);
    } finally {
      abortControllerRef.current = null;
      setTimeout(() => setStatus((prev) => prev === 'completed' ? 'idle' : prev), 2500);
    }
  };

  // --- 🛠️ SYSTEM TOOLS ---
  const clearChat = () => {
    triggerHaptic([20, 10]);
    setMessages([]); 
    localStorage.removeItem("pixora_hq_v8"); 
    toast.success("Chat History Cleared", { style: { background: '#000', color: '#fff', fontSize: '12px' } });
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setStatus("idle");
        toast("Stopped", { icon: '🛑', style: { background: '#000', color: '#fff' } });
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