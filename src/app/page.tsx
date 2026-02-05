import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/ui/Hero";
import Services from "@/components/ui/Services";
import Marquee from "@/components/ui/Marquee";
import Work from "@/components/ui/Work";
import Testimonials from "@/components/ui/Testimonials";
import About from "@/components/ui/About";
import Contact from "@/components/ui/Contact";
import Footer from "@/components/ui/Footer";

export default function Home() {
  return (
    // Fix: Used global CSS variable for background & removed redundant selection classes
    <main className="relative w-full min-h-screen bg-[hsl(var(--background))]">
      
      {/* 1. NAVIGATION */}
      <Navbar />
      
      {/* 2. HERO (Sticky) */}
      <div className="relative w-full z-0">
        <Hero />
      </div>

      {/* 3. GLASS CONTENT (Optimized) */}
      <div className="relative z-10 w-full bg-[hsl(var(--background))]/95 backdrop-blur-md md:backdrop-blur-xl border-t border-white/10 rounded-t-[2rem] md:rounded-t-[4rem] mt-0 md:-mt-[10vh] overflow-hidden shadow-2xl shadow-black">
          
          {/* Spacer for Desktop overlapping effect */}
          <div className="hidden md:block h-20" /> 
          
          <section id="services" className="pt-10 md:pt-0">
            <Services />
          </section>
          
          <div className="py-6 md:py-10">
            <Marquee />
          </div>
      </div>

      {/* 4. WORK SECTION */}
      <div className="relative z-20 w-full bg-[hsl(var(--background))]">
          <Work />
      </div>

      {/* 5. REMAINING CONTENT */}
      <div className="relative z-20 w-full bg-[hsl(var(--background))]">
          <section id="about" className="relative w-full border-t border-white/5">
            <About />
          </section>

          <section id="testimonials" className="relative w-full">
            <Testimonials />
          </section>
          
          <section id="contact" className="relative w-full">
            <Contact />
          </section>

          <footer className="border-t border-white/5 bg-black">
            <Footer />
          </footer>
      </div>

    </main>
  );
}