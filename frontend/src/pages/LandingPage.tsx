import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { Brain, Calendar, Upload, Zap, BarChart3 } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-black text-brand-text pt-24 font-inter">
      
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32 text-center max-w-5xl mx-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-gray/20 via-brand-black to-brand-black -z-10 blur-3xl opacity-50" />
        
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
          The Smarter Way <br />
          <span className="text-brand-text-muted">to Master Learning</span>
        </h1>
        
        <p className="text-lg md:text-xl text-brand-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
          Learn-Flow helps modern students streamline their education with a powerful, AI-driven platform that adapts to you.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/dashboard">
            <Button size="lg" className="h-12 px-8 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-sm tracking-wide transition-all transform hover:scale-105">
              Start for free
            </Button>
          </Link>
          <Link to="/features">
            <Button size="lg" variant="ghost" className="h-12 px-8 rounded-full border border-brand-gray text-brand-text hover:bg-brand-gray/50 text-sm font-semibold">
              Explore Features
            </Button>
          </Link>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
          
          {/* Main Large Card - Smart Planning */}
          <div className="md:col-span-2 md:row-span-2 bg-brand-dark border border-brand-gray rounded-[32px] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group">
             <div className="relative z-10">
               <div className="w-12 h-12 rounded-full bg-brand-gray flex items-center justify-center mb-6">
                 <Calendar className="w-6 h-6 text-white" />
               </div>
               <h3 className="text-3xl font-bold mb-4">Smart Planning</h3>
               <p className="text-brand-text-muted text-lg">Our AI analyzes your syllabus to generate the perfect study schedule.</p>
             </div>
             <div className="mt-8 relative h-64 w-full bg-brand-black/50 rounded-2xl border border-brand-gray/30 p-6 flex flex-col gap-3 group-hover:bg-brand-black/70 transition-colors">
                {/* Mock Schedule Items */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-gray/20 border border-brand-gray/30">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <div className="h-2 w-24 bg-brand-gray/50 rounded"></div>
                  <div className="ml-auto h-2 w-12 bg-brand-gray/50 rounded"></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-gray/20 border border-brand-gray/30 opacity-70">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <div className="h-2 w-20 bg-brand-gray/50 rounded"></div>
                  <div className="ml-auto h-2 w-12 bg-brand-gray/50 rounded"></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-gray/20 border border-brand-gray/30 opacity-40">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <div className="h-2 w-28 bg-brand-gray/50 rounded"></div>
                  <div className="ml-auto h-2 w-12 bg-brand-gray/50 rounded"></div>
                </div>
             </div>
          </div>

          {/* Top Right Wide Card - AI Tutor */}
          <div className="md:col-span-2 md:row-span-1 bg-brand-dark border border-brand-gray rounded-[32px] p-10 flex flex-col justify-center relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">AI Tutor</h3>
                <p className="text-brand-text-muted mb-6">Instant explanations and custom analogies.</p>
              </div>
              <Brain className="w-10 h-10 text-brand-gray group-hover:text-white transition-colors" />
            </div>
            <div className="bg-brand-black rounded-xl p-4 border border-brand-gray/50 relative">
               <div className="absolute -top-3 -right-3 bg-brand-gray rounded-full p-2">
                 <Zap className="w-4 h-4 text-white fill-white" />
               </div>
               <p className="text-sm text-brand-text-muted">"Explain Quantum Entanglement like I'm 5..."</p>
            </div>
          </div>

          {/* Bottom Small Card 1 - Syllabus Parse */}
          <div className="md:col-span-1 md:row-span-1 bg-brand-dark border border-brand-gray rounded-[32px] p-8 flex flex-col justify-between group hover:border-white/20 transition-colors">
            <Upload className="w-8 h-8 text-brand-text-muted mb-4 group-hover:text-white transition-colors" />
            <div>
              <h3 className="text-lg font-bold mb-1">Instant Setup</h3>
              <p className="text-xs text-brand-text-muted">Upload PDF to Study Plan.</p>
            </div>
          </div>

          {/* Bottom Small Card 2 - Stats */}
          <div className="md:col-span-1 md:row-span-1 bg-brand-dark border border-brand-gray rounded-[32px] p-8 flex flex-col justify-between group hover:border-white/20 transition-colors">
            <BarChart3 className="w-8 h-8 text-brand-text-muted mb-4 group-hover:text-white transition-colors" />
            <div>
              <h3 className="text-lg font-bold mb-1">Analytics</h3>
              <p className="text-xs text-brand-text-muted">Track your mastery.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-gray py-12 text-center text-brand-text-muted text-sm">
        <p>&copy; 2025 Learn-Flow. All rights reserved.</p>
      </footer>

    </div>
  );
}
