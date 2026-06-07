"use client";

import { Rocket, Lightbulb, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

const roles = [
  {
    id: "founder",
    title: "For Founders",
    headline: "Build Your Vision. Scale Your Team.",
    description: "AlloySphere gives you the operational tools to turn ideas into funded, execution-driven companies. Manage projects, recruit top talent, and report to investors all in one place.",
    icon: Rocket,
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
    features: ["Task & Roadmap Management", "Equity & Role Distribution", "Investor Updates"],
    href: "/login"
  },
  {
    id: "talent",
    title: "For Talent",
    headline: "Contribute to the Next Big Thing.",
    description: "Discover high-potential startups looking for your skills. Build a verified portfolio of contributions, earn equity, and grow alongside visionary founders.",
    icon: Lightbulb,
    color: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-400",
    features: ["Verified Contribution Score", "Skill-based Matching", "Direct Founder Access"],
    href: "/login"
  },
  {
    id: "investor",
    title: "For Investors",
    headline: "Back Execution, Not Just Hype.",
    description: "Access a curated pipeline of startups actively building. Track real-time milestones, team activity, and product progress before writing a check.",
    icon: TrendingUp,
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
    features: ["Real-time Milestone Tracking", "Deal Flow Curation", "Direct Due Diligence"],
    href: "/login"
  }
];

export function RoleCards() {
  return (
    <section className="w-full py-32 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Built for the Entire Ecosystem</h2>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">Three distinct personas. One unified operating system designed to eliminate friction and accelerate growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <div key={role.id} data-aos="fade-up" data-aos-delay={idx * 100} className="relative group">
                {/* Glow effect behind card */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl`} />
                
                <div className="relative h-full glass-panel border border-white/10 rounded-3xl p-8 flex flex-col transition-all duration-500 group-hover:-translate-y-2 group-hover:border-white/20 bg-black/40 backdrop-blur-xl z-10 overflow-hidden">
                  
                  {/* Decorative background element */}
                  <div className={`absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${role.color} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />

                  <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/10`}>
                    <Icon className={`w-7 h-7 ${role.iconColor}`} />
                  </div>
                  
                  <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">{role.title}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{role.headline}</h3>
                  <p className="text-on-surface-variant leading-relaxed mb-8 flex-1">{role.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {role.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <CheckIcon className={`w-4 h-4 ${role.iconColor}`} />
                        <span className="text-sm font-medium text-white/90">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={role.href} className="inline-flex items-center gap-2 text-sm font-bold text-white group/btn mt-auto">
                    Get Started 
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
