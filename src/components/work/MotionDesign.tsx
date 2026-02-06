"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Play, Pause, Volume2, VolumeX, ArrowUpRight, SkipBack, SkipForward, Loader2, FastForward, Rewind } from "lucide-react";
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useVelocity, 
  useMotionValue, 
  useMotionTemplate, 
  AnimatePresence 
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Plugin Register
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- DATA ---
const videos = [
  { 
    id: 1, 
    title: "Automotive Cinema", 
    category: "Commercial", 
    src: "https://res.cloudinary.com/dpmejirju/video/upload/v1769633463/video-1_sivxip.mp4",
  },
  { 
    id: 2, 
    title: "Product Reveal", 
    category: "3D Motion", 
    src: "https://res.cloudinary.com/dpmejirju/video/upload/v1769633457/video-2_jxkeyb.mp4",
  },
  { 
    id: 3, 
    title: "Urban Dynamics", 
    category: "Lifestyle", 
    src: "https://res.cloudinary.com/dpmejirju/video/upload/v1769633479/Video-3_azutdu.mp4",
  },
];

// UTILS
const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// --- 1. VIDEO CARD (Smart AutoPlay & Physics) ---
const VideoCard = ({ video, index, onClick, scrollYProgress }: any) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDesktop, setIsDesktop] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Detect Device
    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth > 1024);
        check();
        window.addEventListener('resize', check, { passive: true });
        return () => window.removeEventListener('resize', check);
    }, []);

    // ⚡ SMART AUTOPLAY: Mobile Performance
    useEffect(() => {
        if (isDesktop) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
                if (videoRef.current) {
                    if (entry.isIntersecting) {
                        // ⚡ FIX: Play promise handling for mobile browsers
                        const playPromise = videoRef.current.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(() => {});
                        }
                    } else {
                        videoRef.current.pause();
                    }
                }
            },
            { threshold: 0.6 }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [isDesktop]);

    // Desktop Hover Logic
    useEffect(() => {
        if (isDesktop && videoRef.current) {
            if (isHovered) {
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) playPromise.catch(() => {});
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isHovered, isDesktop]);

    // Parallax & Physics
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
    
    const skewY = useTransform(smoothVelocity, [-1000, 1000], isDesktop ? [-2, 2] : [0, 0]);
    
    const y = useTransform(
        scrollYProgress, 
        [0, 1], 
        (isDesktop && index % 2 !== 0) ? [40, -40] : [0, 0]
    );

    // Magnetic Button Logic
    const x = useMotionValue(0);
    const yMouse = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 200, damping: 20 });
    const springY = useSpring(yMouse, { stiffness: 200, damping: 20 });

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        if (!isDesktop) return;
        const { left, top } = currentTarget.getBoundingClientRect();
        x.set(clientX - left);
        yMouse.set(clientY - top);
    }

    const holographicLight = useMotionTemplate`radial-gradient(400px circle at ${springX}px ${springY}px, rgba(255, 255, 255, 0.1), transparent 80%)`;

    return (
        <motion.div 
            ref={cardRef}
            style={{ y, skewY }} 
            onClick={onClick}
            onMouseEnter={() => isDesktop && setIsHovered(true)}
            onMouseLeave={() => isDesktop && setIsHovered(false)}
            onMouseMove={handleMouseMove}
            className="group relative w-full h-[50vh] md:h-[60vh] lg:h-[75vh] rounded-[2rem] overflow-hidden bg-[#0a0a0a] border border-white/5 cursor-pointer lg:cursor-none z-10 will-change-transform transform-gpu shadow-2xl"
        >
            {/* Magnetic Play Button (Desktop) */}
            <div className="hidden lg:block">
                <motion.div
                    style={{ 
                        left: 0, top: 0, 
                        x: springX, y: springY, 
                        translateX: "-50%", translateY: "-50%" 
                    }}
                    animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 w-24 h-24 pointer-events-none flex items-center justify-center"
                >
                    <div className="w-full h-full bg-[#E50914] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(229,9,20,0.6)] backdrop-blur-sm border border-white/20">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </motion.div>
            </div>

            {/* Dark Overlay */}
            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-700 z-10 pointer-events-none ${isHovered || (isVisible && !isDesktop) ? 'opacity-0' : 'opacity-100'}`} />
            
            {/* Holographic Shine */}
            <div className="hidden lg:block">
                <motion.div 
                    className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 mix-blend-overlay"
                    style={{ background: holographicLight }}
                />
            </div>

            {/* Content Info */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 z-30 translate-y-0 lg:translate-y-6 lg:group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]">
                <div className="flex items-center gap-3 mb-3">
                    <span className="w-6 h-[1px] bg-[#E50914]" />
                    <span className="text-[#E50914] text-xs font-mono uppercase tracking-widest">{video.category}</span>
                </div>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase leading-[0.85]">{video.title}</h3>
                
                {/* Watch Reel Hint */}
                <div className="hidden lg:flex items-center gap-2 mt-4 text-white/50 text-xs font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    Watch Reel <ArrowUpRight className="w-3 h-3" />
                </div>
            </div>

            {/* Video Player */}
            <video 
                ref={videoRef}
                src={video.src} 
                muted loop playsInline
                preload="metadata" // ⚡ FIX: Preload only metadata to save bandwidth
                className="absolute inset-0 w-full h-full object-cover scale-100 lg:scale-105 lg:group-hover:scale-110 transition-transform duration-[1.5s] ease-out grayscale lg:grayscale group-hover:grayscale-0 opacity-80 lg:opacity-60 group-hover:opacity-100"
            />
        </motion.div>
    );
};

// --- 2. THE ULTIMATE REEL PLAYER (Mobile Optimized) ---
const ReelPlayer = ({ video, onClose }: { video: any, onClose: () => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDesktop, setIsDesktop] = useState(false);
    
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const [showSkip, setShowSkip] = useState<'forward' | 'backward' | null>(null);

    // Timeout ref for controls
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsDesktop(window.innerWidth > 1024);

        document.body.style.overflow = "hidden";
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === " ") { e.preventDefault(); togglePlay(); }
            if (e.key === "ArrowRight") handleSkip(5);
            if (e.key === "ArrowLeft") handleSkip(-5);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => { 
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handleKeyDown);
            if(controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [onClose]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleSkip = (amount: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += amount;
            setShowSkip(amount > 0 ? 'forward' : 'backward');
            setTimeout(() => setShowSkip(null), 600);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setCurrentTime(current);
            setDuration(total || 0);
            setProgress((current / total) * 100);
            if (videoRef.current.readyState >= 3) setIsBuffering(false);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            const seekTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
            videoRef.current.currentTime = seekTime;
            setProgress(parseFloat(e.target.value));
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if(controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => { if (isPlaying) setShowControls(false); }, 2500);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX > rect.width / 2) handleSkip(5);
        else handleSkip(-5);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/98 flex items-center justify-center"
            onClick={onClose}
            onMouseMove={handleMouseMove}
        >
            {/* ⚡ AMBILIGHT (Desktop Only) */}
            {isDesktop && (
                <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                      <video src={video.src} autoPlay muted loop playsInline className="w-full h-full object-cover blur-[80px] scale-150" />
                </div>
            )}
            
            {!isDesktop && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#E50914]/20 to-black pointer-events-none" />
            )}

            {/* Close Button */}
            <button onClick={onClose} className="absolute top-6 right-6 md:top-8 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 z-[110] border border-white/10 backdrop-blur-md group">
                <X className="w-5 h-5 group-hover:scale-110" />
            </button>

            {/* PLAYER CONTAINER */}
            <motion.div 
                ref={containerRef}
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="relative w-full h-full md:w-auto md:h-[85vh] md:aspect-[9/16] bg-black md:rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group cursor-none"
                onClick={(e) => e.stopPropagation()} 
                onDoubleClick={handleDoubleClick} 
            >
                {isBuffering && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/20 backdrop-blur-sm">
                        <Loader2 className="w-12 h-12 text-[#E50914] animate-spin" />
                    </div>
                )}

                {/* DOUBLE TAP VISUALS */}
                <AnimatePresence>
                    {showSkip === 'forward' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="absolute right-10 top-1/2 -translate-y-1/2 z-40 w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 pointer-events-none">
                            <div className="flex flex-col items-center">
                                <FastForward className="w-6 h-6 text-white fill-white" />
                                <span className="text-[10px] font-bold text-white mt-1">+5s</span>
                            </div>
                        </motion.div>
                    )}
                    {showSkip === 'backward' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="absolute left-10 top-1/2 -translate-y-1/2 z-40 w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 pointer-events-none">
                            <div className="flex flex-col items-center">
                                <Rewind className="w-6 h-6 text-white fill-white" />
                                <span className="text-[10px] font-bold text-white mt-1">-5s</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <video 
                    ref={videoRef}
                    src={video.src} 
                    autoPlay loop={false} playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onWaiting={() => setIsBuffering(true)} 
                    onPlaying={() => setIsBuffering(false)}
                    onLoadedData={() => setIsBuffering(false)}
                    onClick={togglePlay}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full h-full object-cover cursor-pointer"
                />

                {!isPlaying && !isBuffering && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                        <div className="w-20 h-20 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                    </div>
                )}

                {/* CONTROLS (HUD) */}
                <div className={`absolute bottom-0 left-0 w-full p-6 z-30 transition-all duration-500 transform ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <div className="mb-4">
                        <span className="text-[#E50914] text-[10px] font-bold uppercase tracking-widest">{video.category}</span>
                        <h3 className="text-xl font-bold text-white leading-tight">{video.title}</h3>
                    </div>

                    <div className="flex items-center gap-3 mb-4 group/seek">
                        <span className="text-[10px] font-mono text-white/70 w-8 text-right">{formatTime(currentTime)}</span>
                        <div className="relative flex-1 h-1 bg-white/20 rounded-full cursor-pointer transition-all hover:h-2">
                            <div className="absolute top-0 left-0 h-full bg-[#E50914] rounded-full" style={{ width: `${progress}%` }} />
                            <input type="range" min="0" max="100" value={progress} onChange={handleSeek} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <span className="text-[10px] font-mono text-white/50 w-8">{formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="text-white hover:text-[#E50914] transition-colors p-2 hover:bg-white/10 rounded-full">
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                            </button>
                            <button className="text-white hover:text-white/80 transition-colors p-2 hover:bg-white/10 rounded-full" onClick={() => handleSkip(-5)}>
                                <SkipBack className="w-5 h-5" />
                            </button>
                            <button className="text-white hover:text-white/80 transition-colors p-2 hover:bg-white/10 rounded-full" onClick={() => handleSkip(5)}>
                                <SkipForward className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => { if(videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); }}} className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default function MotionDesign() {
  const container = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  
  // Parallax Setup
  const { scrollYProgress } = useScroll({ target: container, offset: ["start end", "end start"] });

  useEffect(() => {
    // ⚡ LAYOUT STABILITY FIX
    const ctx = gsap.context(() => {
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);

        if(textRef.current) {
             gsap.fromTo(textRef.current.querySelectorAll('.reveal-text'), 
                { y: 100, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: textRef.current, start: "top 85%" } }
            );
        }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative bg-[#050505] py-20 md:py-32 border-t border-white/5 overflow-hidden z-20">
      
      {/* Noise Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 overflow-hidden mix-blend-overlay">
         <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* HEADER */}
        <div ref={textRef} className="flex flex-col md:flex-row items-end justify-between mb-16 md:mb-24 px-2">
            <div className="overflow-hidden">
                <div className="flex items-center gap-3 mb-6 reveal-text">
                    <span className="text-[#E50914] text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#E50914] rounded-full animate-pulse"></span>
                        Motion Lab
                    </span>
                </div>
                {/* Clamped Text */}
                <h2 className="text-[clamp(3.5rem,14vw,9vw)] font-black text-white uppercase leading-[0.8] tracking-tighter reveal-text">Video</h2>
                <h2 className="text-[clamp(3.5rem,14vw,9vw)] font-black text-transparent bg-clip-text bg-gradient-to-b from-white/40 to-transparent uppercase leading-[0.8] tracking-tighter reveal-text" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.6)' }}>Editing.</h2>
            </div>
            
            <div className="hidden md:flex items-center gap-6 mb-2 reveal-text">
                 <div className="w-12 h-[1px] bg-white/20" />
                 <p className="text-white/40 text-sm max-w-xs text-balance font-light">Cinematic storytelling. <br/> Vertical precision.</p>
            </div>
        </div>

        {/* DESKTOP GRID */}
        <div className="hidden lg:grid grid-cols-3 gap-8 px-4 perspective-[1000px]">
            {videos.map((video, i) => (
                <VideoCard key={video.id} video={video} index={i} onClick={() => setSelectedVideo(video)} scrollYProgress={scrollYProgress} />
            ))}
        </div>

        {/* MOBILE/TABLET SLIDER */}
        <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-12 px-4 no-scrollbar">
            {videos.map((video, i) => (
                <div key={video.id} className="min-w-[85vw] snap-center">
                    <VideoCard video={video} index={i} onClick={() => setSelectedVideo(video)} scrollYProgress={scrollYProgress} />
                </div>
            ))}
             <div className="min-w-[5vw] shrink-0" />
        </div>
      </div>

      {/* FULL SCREEN PLAYER MODAL */}
      <AnimatePresence>
        {selectedVideo && <ReelPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      </AnimatePresence>
    </section>
  );
}