import { Bot, Calendar, Cpu, LineChart, LayoutDashboard, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

const features = [
  {
    title: "Neural Planner",
    description: "Our neural engine breaks down your complex syllabus into a perfectly timed cosmic schedule.",
    icon: <Calendar className="w-6 h-6 text-white" />,
    className: "sm:col-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10",
    link: "/planner",
    illustration: (
      <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-tl-[40px] pointer-events-none" />
    )
  },
  {
    title: "Cosmic Tutor",
    description: "Deep learning analogies that connect concepts. Physics to Football.",
    icon: <Bot className="w-6 h-6 text-white" />,
    className: "border-white/10 bg-white/[0.02]",
    link: "/tutor"
  },
  {
    title: "Micro-Quizzes",
    description: "Instant verification with AI fast-fire questions.",
    icon: <Zap className="w-6 h-6 text-white" />,
    className: "border-white/10 bg-white/[0.02] lg:col-start-4",
    link: "/tutor" // Placeholder for now
  },
  {
    title: "Syllabus Parse",
    description: "Upload PDF. Receive Analysis.",
    icon: <Cpu className="w-6 h-6 text-white" />,
    className: "lg:col-span-1 lg:row-span-2 border-white/10 bg-white/[0.02] lg:col-start-3 lg:row-start-1",
    link: "/upload"
  },
  {
    title: "Progress Tracking",
    description: "Real-time analytics of your study habits. See your growth.",
    icon: <LineChart className="w-6 h-6 text-white" />,
    className: "sm:col-span-2 lg:col-span-2 bg-gradient-to-tr from-white/5 to-white/[0.02] border-white/10 lg:col-start-3 lg:row-start-3",
    link: "/dashboard"
  },
  {
    title: "Command Center",
    description: "Your mission control. Organized.",
    icon: <LayoutDashboard className="w-6 h-6 text-white" />,
    className: "sm:col-span-2 lg:col-span-2 border-white/10 bg-white/[0.02] lg:col-start-1 lg:row-start-3",
    link: "/dashboard"
  }
];

export function Features() {
  return (
    <div className="w-full font-inter">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-auto lg:h-[600px]">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className={cn(
              "group relative overflow-hidden rounded-[24px] border p-8 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.08] block",
              feature.className
            )}
          >
            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <div className="mb-4 inline-flex p-2.5 rounded-xl bg-white/10 border border-white/5 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2 tracking-tight group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-[90%] group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>
              
              <div className="mt-4 flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                View Feature <span className="ml-1">→</span>
              </div>
            </div>

            {/* Decorative elements */}
            {feature.illustration}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Features;
