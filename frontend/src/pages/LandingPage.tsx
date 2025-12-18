import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { Features } from "./Features";
import { ChevronRight, Rocket } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent } from "react";

export function LandingPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 }; // Smooth physics
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const background = useMotionTemplate`radial-gradient(
    600px circle at ${springX}px ${springY}px,
    rgba(255, 255, 255, 0.04),
    transparent 80%
  )`;

  function handleMouseMove({ clientX, clientY, currentTarget }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#050505] text-gray-200 pt-24 font-inter selection:bg-white/20 relative group"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive Cursor Gradient */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 group-hover:opacity-100 opacity-50"
        style={{ background }}
      />
      
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32 text-center max-w-5xl mx-auto overflow-hidden z-10">
        {/* Ambient Background Glows (Static) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.02] blur-[120px] rounded-full pointing-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-zinc-800/[0.05] blur-[100px] rounded-full pointing-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
            v2.0 is live
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.95] bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Master Learning <br />
            <span className="text-gray-500">With Intelligence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            A premium, AI-driven workspace designed for the modern scholar. Parse syllabi, generate schedules, and master concepts—all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link to="/dashboard">
              <Button size="lg" className="h-14 px-8 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-sm tracking-wide transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Get Started <Rocket className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="ghost" 
              className="h-14 px-8 rounded-full border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white text-sm font-semibold backdrop-blur-sm"
              onClick={scrollToFeatures}
            >
              Explore Features <ChevronRight className="ml-1 w-4 h-4 opacity-50" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 pb-32 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">Core Capabilities</h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto"></div>
        </div>
        <Features />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center">
        <p className="text-gray-500 text-sm">
          &copy; 2025 Learn-Flow. Crafted with <span className="text-gray-300">Intelligence</span>.
        </p>
      </footer>

    </div>
  );
}
