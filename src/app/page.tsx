"use client";

import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/ui/Hero";
import Services from "@/components/ui/Services";
import Marquee from "@/components/ui/Marquee";
import Work from "@/components/ui/Work";
import Testimonials from "@/components/ui/Testimonials";
import About from "@/components/ui/About";
import Contact from "@/components/ui/Contact";
import Footer from "@/components/ui/Footer";

// --- 1. HERO WRAPPER (Sticky & Interactive) ---
const StickyHeroSection = () => {
  return (
    // 🔥 FIX: Sticky works because parent has no overflow:hidden
    <div className="relative w-full h-[100vh] sm:h-[100dvh] sticky top-0 left-0 z-0">
      <div className="relative w-full h-full">
        <Hero />
      </div>
      {/* Gradient fade at bottom for seamless blend */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

// --- 2. MAIN CONTENT FLOW (Scrolls OVER Hero) ---
const MainContentFlow = () => {
  return (
    // Main Wrapper: z-30 ensures it slides OVER the z-0 Hero
    <div className="relative z-30 w-full flex flex-col bg-transparent">
      
      {/* A. GLASS OVERLAP LAYER (The Parallax Entry) */}
      {/* Negative margin pulls this section UP over the Hero footer */}
      <div className="-mt-[5vh] md:-mt-[10vh] relative z-40 w-full">
        <div className="bg-[#020202] rounded-t-[2rem] md:rounded-t-[3.5rem] shadow-[0_-20px_80px_rgba(0,0,0,1)] border-t border-white/5 overflow-hidden">
          
          <section id="services" className="pt-16 md:pt-28 pb-10">
            <Services />
          </section>
          
          <div className="py-10 md:py-20">
            <Marquee />
          </div>

          {/* B. SOLID CONTENT SECTIONS */}
          <div className="relative w-full bg-[#020202]">
            
            <section id="work" className="relative w-full border-t border-white/5">
              <Work />
            </section>

            <section id="about" className="relative w-full border-t border-white/5">
              <About />
            </section>

            {/* GPU Trigger for smooth animation on heavy sections */}
            <section id="testimonials" className="relative w-full border-t border-white/5 transform-gpu">
              <Testimonials />
            </section>
            
            <section id="contact" className="relative w-full border-t border-white/5">
              <Contact />
            </section>

            {/* Footer padding for mobile safe area */}
            <footer className="border-t border-white/5 bg-black pb-safe md:pb-0">
              <Footer />
            </footer>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#020202]">
      {/* Navbar stays fixed on top */}
      <Navbar />
      
      {/* Step 1: Hero Sticky Background */}
      <StickyHeroSection />
      
      {/* Step 2: Rest of the site scrolls over it */}
      <MainContentFlow />
    </main>
  );
}