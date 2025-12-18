import { Bot, Calendar, Cpu, LineChart, LayoutDashboard, Zap, Brain } from "lucide-react";
import { cn } from "../lib/utils";

const features = [
  {
    title: "AI Study Planner",
    description: "Our neural engine breaks down your complex syllabus into a perfectly timed cosmic schedule. No more cramming.",
    icon: <Calendar className="w-8 h-8 text-white" />,
    className: "md:col-span-2 md:row-span-2 bg-brand-dark border-brand-gray",
    illustration: <Brain className="w-24 h-24 absolute -right-4 -bottom-4 text-brand-gray/30" />
  },
  {
    title: "Cosmic Tutor",
    description: "Deep learning analogies that connect concepts. Physics to Football.",
    icon: <Bot className="w-8 h-8 text-purple-400" />,
    className: "md:col-span-1 md:row-span-1 border-brand-gray",
  },
  {
    title: "Micro-Quizzes",
    description: "Instant verification with AI fast-fire questions.",
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    className: "md:col-span-1 md:row-span-1 border-brand-gray",
  },
  {
    title: "Syllabus Analysis",
    description: "Upload any PDF and watch our AI extract core concepts and key dates in seconds.",
    icon: <Cpu className="w-8 h-8 text-blue-400" />,
    className: "md:col-span-1 md:row-span-2 border-brand-gray",
  },
  {
    title: "Progress Tracking",
    description: "Real-time analytics of your study habits. See your growth.",
    icon: <LineChart className="w-8 h-8 text-green-400" />,
    className: "md:col-span-2 md:row-span-1 bg-brand-dark/50 border-brand-gray",
  },
  {
    title: "Dynamic Dashboard",
    description: "Your mission control. Organized in a sleek interface.",
    icon: <LayoutDashboard className="w-8 h-8 text-pink-400" />,
    className: "md:col-span-1 md:row-span-1 border-brand-gray",
  }
];

export function Features() {
  return (
    <div className="min-h-screen bg-brand-black py-24 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Next-Gen <br/>
            <span className="text-brand-text-muted">Learning Tech</span>
          </h1>
          <p className="text-brand-text-muted text-lg max-w-2xl mx-auto">
            Supercharge your academic journey with our suite of AI-powered tools designed for the modern student.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative overflow-hidden rounded-[32px] border p-8 transition-all hover:border-brand-text-muted/50",
                "bg-brand-dark",
                feature.className
              )}
            >
              <div className="flex flex-col h-full justify-between relative z-10">
                <div>
                  <div className="mb-4 inline-block p-3 rounded-2xl bg-brand-gray/50 border border-white/5">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                    {feature.title}
                  </h3>
                  <p className="text-brand-text-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                <div className="mt-4 flex items-center text-xs font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Explore <Zap className="w-3 h-3 ml-1 fill-white" />
                </div>
              </div>

              {/* Decorative elements */}
              {feature.illustration}
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
            <button className="px-8 py-4 rounded-full bg-white text-black font-bold tracking-wide hover:bg-gray-200 transition-colors">
              Get Started Now
            </button>
        </div>
      </div>
    </div>
  );
}

export default Features;
