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
   
    <div className="relative w-full h-screen sticky top-0 z-0">
      
     
      <div className="relative z-20 w-full h-full">
        <Hero />
      </div>

    
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

// --- 2. MAIN CONTENT FLOW (Scrolls OVER Hero) ---
const MainContentFlow = () => {
  return (
    // Main Wrapper: z-30 (Hero ke upar ayega)
    <div className="relative z-30 w-full bg-[#020202]">
      
      {/* A. GLASS OVERLAP LAYER (Visual Polish) */}
      <div className="-mt-6 relative z-40">
        <div className="bg-[#020202]/95 backdrop-blur-xl border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,1)]">
          <section id="services" className="pt-16 md:pt-24">
            <Services />
          </section>
          
          <div className="py-12 md:py-20">
            <Marquee />
          </div>
        </div>
      </div>

      {/* B. SOLID CONTENT SECTIONS */}
      <div className="relative z-30 bg-[#020202]">
        
        <section id="work" className="relative w-full">
          <Work />
        </section>

        <section id="about" className="relative w-full border-t border-white/5">
          <About />
        </section>

        {/* GPU Trigger for smooth animation */}
        <section id="testimonials" className="relative w-full transform-gpu">
          <Testimonials />
        </section>
        
        <section id="contact" className="relative w-full">
          <Contact />
        </section>

        <footer className="border-t border-white/5 bg-black pb-5 md:pb-0">
          <Footer />
        </footer>

      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#020202]">
  
      <Navbar />
      
      {/* Step 1: Hero Sticky */}
      <StickyHeroSection />
      
      {/* Step 2: Rest of the site scrolls over it */}
      <MainContentFlow />
    </main>
  );
}