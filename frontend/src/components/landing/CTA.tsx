import { Button } from "../ui/Button";
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 text-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[450px] lg:w-[600px] h-[200px] sm:h-[300px] lg:h-[400px] bg-white/[0.02] blur-[80px] sm:blur-[100px] lg:blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-medium text-white mb-6 sm:mb-8 tracking-tight">
          Ready to Master Your Learning?
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-8 sm:mb-12 font-light max-w-2xl mx-auto px-4">
          Join the platform that is redefining education for the AI era. Start your journey today.
        </p>
        
        <Link to="/dashboard">
          <Button className="h-14 px-12 rounded-full bg-white text-black hover:bg-gray-200 font-medium text-lg tracking-wide transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] hover:scale-105">
            Get Started Now
          </Button>
        </Link>
      </div>
    </section>
  );
}
