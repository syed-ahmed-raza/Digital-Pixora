"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

interface SpeechRecognitionState {
  isListening: boolean;
  isSpeaking: boolean; 
  transcript: string;
  interimTranscript: string;
  audioLevel: number; 
  startListening: (lang?: string) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  support: boolean;
}

// --- 🔊 GLOBAL AUDIO CONTEXT (Singleton for Stability) ---
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtx) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
    return audioCtx;
};

export const useSpeechRecognition = (): SpeechRecognitionState => {
  // --- STATE ---
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [support, setSupport] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // --- REFS ---
  const recognitionRef = useRef<any>(null);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null); // 🔒 Added for Cleanup
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // --- 1. COMPATIBILITY CHECK ---
  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setSupport(true);
    }
  }, []);

  // --- 2. HAPTIC FEEDBACK ---
  const triggerHaptic = useCallback((pattern: number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }, []);

  // --- 3. WAKE LOCK (Prevents Sleep) ---
  const toggleWakeLock = async (active: boolean) => {
    try {
      if (active && 'wakeLock' in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } else if (!active && wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch (err) { /* Silent fail */ }
  };

  // --- 4. HIGH-PERFORMANCE AUDIO VISUALIZER (60 FPS) ---
  const updateVisualizer = () => {
      if (!analyserRef.current || !isListening) return;

      const array = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(array);

      // Calculate RMS (Root Mean Square) for accurate volume
      let sum = 0;
      for (let i = 0; i < array.length; i++) {
          sum += array[i] * array[i];
      }
      const rms = Math.sqrt(sum / array.length);
      
      // Normalize to 0-100 range with sensitivity boost
      const normalizedVal = Math.min(100, Math.round((rms / 128) * 100 * 1.5)); 
      
      // Noise Gate: Ignore tiny background hum
      const finalLevel = normalizedVal < 5 ? 0 : normalizedVal;
      
      setAudioLevel(finalLevel);
      setIsSpeaking(finalLevel > 15); // Voice Activity Detection Threshold

      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };

  const startAudioAnalysis = async () => {
    try {
      stopAudioAnalysis(); // Safety Cleanup

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') await ctx.resume();

      const analyser = ctx.createAnalyser();
      analyser.smoothingTimeConstant = 0.85; // Smoother animations
      analyser.fftSize = 256; // Faster processing

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // 🔒 LOCK: Store references for proper disconnect
      sourceRef.current = source;
      analyserRef.current = analyser;
      
      // Start the 60FPS loop
      updateVisualizer();

    } catch (e) {
      console.warn("Visualizer Init Failed", e);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
    }
    // 🔒 CLEANUP: Disconnect Source Node
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    setIsSpeaking(false);
  };

  // --- 5. SPEECH RECOGNITION CORE ---
  const startListening = useCallback((lang: string = "en-US") => {
    if (!support || isListening) return;

    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();

    toggleWakeLock(true);
    startAudioAnalysis();
    triggerHaptic([20]); 

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang; 
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
    };

    recognition.onresult = (event: any) => {
      // Auto-stop after 4s silence
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        if (recognitionRef.current) recognitionRef.current.stop();
      }, 4000); 

      let finalChunk = "";
      let interimChunk = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const rawText = result[0].transcript;
        
        if (result.isFinal) finalChunk += rawText;
        else interimChunk += rawText;
      }

      // Voice Command: "Clear" or "Reset"
      if (finalChunk.toLowerCase().includes("clear chat") || finalChunk.toLowerCase().includes("reset")) {
          setTranscript("");
          triggerHaptic([50]);
          return;
      }

      if (finalChunk) {
        setTranscript((prev) => {
            const cleanPrev = prev.trim();
            const cleanNew = finalChunk.trim();
            // Intelligent Capitalization
            const polished = cleanNew.charAt(0).toUpperCase() + cleanNew.slice(1);
            return cleanPrev ? `${cleanPrev} ${polished}` : polished;
        });
      }
      setInterimTranscript(interimChunk);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
          toast.error("Microphone Access Denied", {
             style: { background: '#000', color: '#fff', border: '1px solid #E50914' }
          });
          stopListening();
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsSpeaking(false);
      setInterimTranscript("");
      stopAudioAnalysis();
      toggleWakeLock(false);
      triggerHaptic([10, 10]);
    };

    try { recognition.start(); } catch (e) {}
  }, [support, isListening, triggerHaptic]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    stopAudioAnalysis();
    toggleWakeLock(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      stopAudioAnalysis();
      toggleWakeLock(false);
    };
  }, []);

  const fullTranscript = (transcript + (interimTranscript ? " " + interimTranscript : "")).trim();

  return { 
    isListening, 
    isSpeaking, 
    transcript: fullTranscript,
    interimTranscript,
    audioLevel, 
    startListening, 
    stopListening,
    resetTranscript,
    support
  };
};