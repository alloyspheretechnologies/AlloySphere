"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Users, CheckCircle, TrendingUp, DollarSign, Rocket } from "lucide-react";

const steps = [
  { id: "discovery", title: "Discovery", desc: "Find the right co-founders, talent, or execution-driven startups.", icon: Search, color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "collaboration", title: "Collaboration", desc: "Form teams and align on vision within a unified workspace.", icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
  { id: "execution", title: "Execution", desc: "Break down roadmaps into actionable tasks and hit milestones.", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { id: "growth", title: "Growth", desc: "Scale your product, user base, and team efficiently.", icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-400/10" },
  { id: "investment", title: "Investment", desc: "Connect with investors who back execution over hype.", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { id: "success", title: "Success", desc: "Build extraordinary companies that shape the future.", icon: Rocket, color: "text-white", bg: "bg-white/10" },
];

export function EcosystemFlow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollPercent = Math.max(0, Math.min(1, (window.innerHeight / 2 - rect.top) / rect.height));
      const index = Math.floor(scrollPercent * steps.length);
      setActiveIndex(Math.min(index, steps.length - 1));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full py-32 relative overflow-hidden bg-background border-t border-white/5" ref={containerRef}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs tracking-wider uppercase mb-4">
            <span className="material-symbols-outlined text-[14px]">timeline</span>
            The AlloySphere Journey
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">How Great Companies Are Built</h2>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">From an idea to a funded, high-growth startup. The entire lifecycle happens here.</p>
        </div>

        <div className="relative">
          {/* Mobile connecting line */}
          <div className="absolute left-[27px] top-0 bottom-0 w-px bg-white/10 md:hidden" />
          
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx <= activeIndex;
              const isEven = idx % 2 === 0;

              return (
                <div key={step.id} className="relative flex flex-col md:flex-row items-start md:items-center justify-center md:h-48 group">
                  
                  {/* Left Side (Content for Even, Empty for Odd) */}
                  <div className={`md:w-1/2 md:pr-16 flex ${isEven ? 'md:justify-end text-left md:text-right' : 'md:hidden'} pl-16 md:pl-0`}>
                    <div className={`transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
                      <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-on-surface-variant text-base max-w-sm">{step.desc}</p>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 glass-panel border border-white/10 shadow-xl holographic-lift group-hover:scale-110"
                       style={{ background: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.8)' }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${isActive ? step.bg : 'bg-transparent'}`}>
                      <Icon className={`w-5 h-5 transition-all duration-500 ${isActive ? step.color : 'text-on-surface-variant/50'}`} />
                    </div>
                  </div>

                  {/* Right Side (Content for Odd, Empty for Even) */}
                  <div className={`md:w-1/2 md:pl-16 flex ${!isEven ? 'md:justify-start text-left' : 'md:hidden'} pl-16 md:pl-0 mt-4 md:mt-0`}>
                    <div className={`transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
                      <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-on-surface-variant text-base max-w-sm">{step.desc}</p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
