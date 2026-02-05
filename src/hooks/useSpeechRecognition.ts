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
  const speakingTimer = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
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

  // --- 3. WAKE LOCK (Keep screen on while listening) ---
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

  // --- 4. AUDIO VISUALIZER (Natural VAD) ---
  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8; 
      analyser.fftSize = 512;

      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      scriptProcessor.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        
        let sum = 0;
        for (let i = 0; i < array.length; i++) {
          sum += array[i] * array[i];
        }
        const rms = Math.sqrt(sum / array.length);
        // Smoother scaling for visualizer
        const normalizedVal = Math.min(100, Math.round((rms / 100) * 100)); 
        
        const squelchedVal = normalizedVal < 5 ? 0 : normalizedVal;
        setAudioLevel(squelchedVal);

        // Simple Voice Detection
        if (squelchedVal > 10) {
            setIsSpeaking(true);
            if (speakingTimer.current) clearTimeout(speakingTimer.current);
            speakingTimer.current = setTimeout(() => setIsSpeaking(false), 500); 
        }
      };

      audioContextRef.current = audioContext;
    } catch (e) {
      console.warn("Audio analysis failed", e);
    }
  };

  const stopAudioAnalysis = () => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setAudioLevel(0);
    setIsSpeaking(false);
  };

  // --- 5. SPEECH RECOGNITION LOGIC ---
  const startListening = useCallback((lang: string = "en-US") => {
    if (!support || isListening) return;

    // Stop bot from speaking if user interrupts
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();

    toggleWakeLock(true);
    startAudioAnalysis();
    triggerHaptic([15]); 

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
      // Auto-stop after silence (Friendly UX)
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        if (recognitionRef.current) recognitionRef.current.stop();
      }, 4000); 

      let finalChunk = "";
      let interimChunk = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const rawText = result[0].transcript;
        const lowerText = rawText.toLowerCase().trim();
        
        // Voice Commands
        const clearCommands = ["delete all", "clear chat", "reset", "start over"];
        const stopCommands = ["stop", "abort", "cancel", "pause"];

        if (clearCommands.some(cmd => lowerText.includes(cmd))) {
            setTranscript("");
            setInterimTranscript("");
            triggerHaptic([30]);
            toast.success("Transcript cleared", { 
                style: { background: '#000', color: '#fff', border: '1px solid #333' } 
            });
            return;
        }
        
        if (stopCommands.some(cmd => lowerText === cmd)) {
            stopListening();
            return;
        }

        if (result.isFinal) {
          finalChunk += rawText;
        } else {
          interimChunk += rawText;
        }
      }

      if (finalChunk) {
        setTranscript((prev) => {
            const cleanPrev = prev.trim();
            const cleanNew = finalChunk.trim();
            // Capitalize first letter
            const polishedNew = cleanNew.charAt(0).toUpperCase() + cleanNew.slice(1);
            return cleanPrev ? `${cleanPrev} ${polishedNew}` : polishedNew;
        });
      }
      setInterimTranscript(interimChunk);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") return;
      if (event.error === "not-allowed") {
          toast.error("Please allow microphone access to talk.", {
             icon: '🎙️',
             style: { background: '#000', color: '#fff', border: '1px solid #333' }
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
      triggerHaptic([10]);
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

  // Cleanup
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