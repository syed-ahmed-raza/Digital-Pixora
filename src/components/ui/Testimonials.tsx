"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Star, Quote, BadgeCheck } from "lucide-react";

// --- DATA ---
const reviews = [
  { 
    client: "Marcus Thorne", 
    role: "CMO, Velvet & Oak", 
    text: "Pixora delivered an experience, not just a site. Our online inquiries increased by 40% in the first month.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
  },
  { 
    client: "Elena Rostova", 
    role: "Founder, NeoSynthetics", 
    text: "Working with them on our AI branding was a masterclass in efficiency. They translated complex algorithms into a visual language.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop"
  },
  { 
    client: "Julian Vane", 
    role: "Director, ArchStream", 
    text: "The 3D WebGL implementation is seamless. No lag, just pure immersion. Rare to find developers with this design sensitivity.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    client: "Sophia Lin", 
    role: "Head of Product, Lumina", 
    text: "Their prompt engineering work saved our creative team hundreds of hours. The assets were indistinguishable from studio photography.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
  },
  { 
    client: "David Chen", 
    role: "CTO, NextLevel", 
    text: "Fast, responsive, and futuristic. The best agency we've worked with. The code quality is top-tier.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop"
  },
  { 
    client: "Alex Morgan", 
    role: "CEO, TechFlow", 
    text: "They didn't just build a website, they built a legacy. The 3D interactions are insane. Our investors were blown away.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop"
  },
];

// --- 1. THE TITAN REVIEW CARD (Lightweight) ---
const ReviewCard = ({ review }: { review: any }) => {
    return (
        <div className="group/card relative w-full border border-white/5 bg-[#0a0a0a] rounded-2xl p-6 md:p-8 overflow-hidden transition-all duration-300 hover:border-[#E50914]/40 hover:bg-[#0f0f0f] will-change-transform">
            
            {/* Hover Spotlight Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E50914]/5 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    {/* Header: Stars & Audio Wave */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="w-3.5 h-3.5 fill-[#E50914] text-[#E50914]" />
                                ))}
                            </div>
                            <span className="text-[9px] text-[#E50914]/80 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3" /> Verified Client
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/card:bg-[#E50914]/10 transition-colors">
                            <Quote className="w-4 h-4 text-white/20 group-hover/card:text-[#E50914] transition-colors" />
                        </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-white/80 text-sm md:text-base leading-relaxed mb-8 font-light relative">
                        "{review.text}"
                    </p>
                </div>

                {/* Footer: User Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-white/5 group-hover/card:border-white/10 transition-colors">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0 group-hover/card:scale-105 transition-transform">
                        <Image 
                            src={review.image} 
                            alt={review.client} 
                            fill 
                            className="object-cover" 
                            sizes="48px" 
                        />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm tracking-tight">{review.client}</h4>
                        <p className="text-white/40 text-xs font-mono mt-0.5">
                            {review.role}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 2. INFINITE SCROLL COLUMN (Memoized & Accelerated) ---
const ReviewColumn = ({ reviews, className, duration = "40s", reverse = false }: { reviews: any[], className?: string, duration?: string, reverse?: boolean }) => {
    // ⚡ Optimization: Memoize array to prevent recreation on re-renders
    const infiniteReviews = useMemo(() => [...reviews, ...reviews], [reviews]);

    return (
        <div 
            className={`${className} relative h-full overflow-hidden mask-fade`}
            style={{ 
                '--duration': duration,
                '--direction': reverse ? 'reverse' : 'normal'
            } as React.CSSProperties}
        >
            <div className="animate-marquee flex flex-col gap-6 w-full will-change-transform backface-hidden perspective-1000">
                {infiniteReviews.map((review, i) => (
                    <ReviewCard key={i} review={review} />
                ))}
            </div>
        </div>
    );
};

// --- 3. MAIN SECTION ---
export default function Testimonials() {
  return (
    <section className="relative bg-[#050505] border-t border-white/5 overflow-hidden py-24 md:py-40 z-20">
      
      {/* Background Noise (Optimized: Using CSS over SVG for grain if possible, but kept safe here) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden mix-blend-overlay">
         <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16 md:mb-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E50914]/5 border border-[#E50914]/20 rounded-full mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full animate-pulse shadow-[0_0_10px_#E50914]" />
                <span className="text-[#E50914] text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">Client Success</span>
            </div>
            <h2 className="text-[clamp(3.5rem,10vw,7rem)] font-black text-white uppercase tracking-tighter leading-[0.9]">
                Trust. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10">Earned.</span>
            </h2>
        </div>

        {/* --- INFINITE MARQUEE GRID --- */}
        {/* ⚡ Layout: Fixed heights ensure no CLS (Cumulative Layout Shift) */}
        <div className="relative h-[600px] md:h-[800px] overflow-hidden">
            
            {/* Top & Bottom Fade Masks */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050505] to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent z-20 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full px-2">
                
                {/* Column 1 (Slow) */}
                <ReviewColumn reviews={reviews} duration="60s" className="h-full" />

                {/* Column 2 (Reverse - Hidden Mobile) */}
                <div className="hidden md:block h-full">
                     <ReviewColumn reviews={reviews} duration="50s" reverse={true} />
                </div>

                {/* Column 3 (Fastest - Hidden Tablet) */}
                <div className="hidden lg:block h-full">
                     <ReviewColumn reviews={reviews} duration="45s" />
                </div>

            </div>
        </div>

      </div>

      {/* Global Styles for Animations (Hardware Accelerated) */}
      <style jsx global>{`
        /* Force GPU Acceleration */
        .backface-hidden {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        .perspective-1000 {
            perspective: 1000px;
            -webkit-perspective: 1000px;
        }
        
        @keyframes marquee {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(0, -50%, 0); }
        }
        .animate-marquee {
            animation: marquee var(--duration) linear infinite var(--direction);
        }
        .animate-marquee:hover {
            animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}