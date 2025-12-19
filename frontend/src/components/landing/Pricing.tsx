import { Check } from "lucide-react";
import { Button } from "../ui/Button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "0",
    description: "Perfect for trying out the AI capabilities.",
    features: ["5 Syllabus Parses / month", "Basic Study Schedule", "Limited AI Tutor Access", "Community Support"],
    highlight: false,
    upcoming: false
  },
  {
    name: "Pro",
    price: "12",
    description: "For serious students who want top grades.",
    features: ["Unlimited Syllabus Parses", "Advanced Cosmic Schedule", "Unlimited AI Tutor (GPT-4)", "Priority Support", "Progress Analytics"],
    highlight: true,
    upcoming: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For universities and large institutions.",
    features: ["SSO Integration", "Custom Domain", "Dedicated Success Manager", "SLA Guarantee", "Advanced Reporting"],
    highlight: false,
    upcoming: true
  }
];

export function Pricing() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto" id="pricing">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-medium text-white mb-6">Simple Pricing</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
          Start for free, upgrade when you need more power.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan, i) => (
          <div 
            key={i} 
            className={`
              relative p-8 rounded-3xl border flex flex-col
              ${plan.highlight 
                ? "bg-white/[0.05] border-white/20 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]" 
                : "bg-white/[0.02] border-white/5 hover:border-white/10 transition-colors"
              }
            `}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-medium text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-400 h-10">{plan.description}</p>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-bold text-white">${plan.price}</span>
              {plan.price !== "Custom" && <span className="text-gray-500">/month</span>}
            </div>

            <div className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, f) => (
                <div key={f} className="flex items-start gap-3">
                  <div className={`mt-1 p-0.5 rounded-full ${plan.highlight ? "bg-white text-black" : "bg-white/10 text-white"}`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {plan.upcoming ? (
              <Button 
                onClick={() => alert(`The ${plan.name} plan is coming soon!`)}
                className={`w-full rounded-full h-12 font-medium tracking-wide transition-all ${
                  plan.highlight 
                    ? "bg-white/50 text-black cursor-not-allowed hover:bg-white/50" 
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/5 cursor-not-allowed"
                }`}
              >
                Upcoming
              </Button>
            ) : (
              <Link to="/dashboard" className="w-full">
                <Button 
                  className={`w-full rounded-full h-12 font-medium tracking-wide transition-all ${
                    plan.highlight 
                      ? "bg-white text-black hover:bg-gray-200" 
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
