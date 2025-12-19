import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "The AI syllabus parser saved me hours of manual data entry. It's like having a personal assistant for my degree.",
    author: "Alex Chen",
    role: "Computer Science Student",
    initials: "AC"
  },
  {
    quote: "Finally, a study planner that actually understands my schedule. The 'Cosmic Tutor' analogies make hard concepts click instantly.",
    author: "Sarah Miller",
    role: "Pre-Med",
    initials: "SM"
  },
  {
    quote: "I was drowning in deadlines until I found Learn-Flow. The visualization of my progress keeps me motivated every single day.",
    author: "James Wilson",
    role: "Engineering Major",
    initials: "JW"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-medium text-white mb-6">Trusted by Scholars</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
          Join thousands of students who have transformed their academic journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {testimonials.map((t, i) => (
          <div key={i} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors relative">
            <Quote className="w-8 h-8 text-white/20 mb-6" />
            
            <p className="text-gray-300 text-lg leading-relaxed mb-8 font-light">
              "{t.quote}"
            </p>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white">
                {t.initials}
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">{t.author}</h4>
                <p className="text-gray-500 text-xs">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
