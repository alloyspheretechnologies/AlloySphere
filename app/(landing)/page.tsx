import Link from "next/link";
import ScrollPortraitWallDemo from "@/components/demo/demo";
import { ThreeBackground } from "@/components/ui/three-background";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col items-center relative">
      <ThreeBackground />
      
      {/* Navigation Bar */}
      <nav className="w-full fixed top-0 z-50 px-6 py-4 flex justify-between items-center bg-background/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-white text-2xl">change_history</span>
          <span className="font-bold text-lg text-white">AlloySphere</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-on-surface-variant hover:text-white transition-colors h-10 flex items-center">
            Sign In
          </Link>
          <Link href="/role-selection" className="px-5 h-10 flex items-center justify-center glass-panel text-white rounded-lg font-semibold hover:bg-white/10 transition-all btn-glow border border-white/20 text-sm">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full relative flex flex-col items-center justify-center min-h-screen px-4 text-center overflow-hidden pt-24" data-aos="fade-up">
        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-label-md tracking-wider uppercase mb-4 holographic-lift">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            System Online v3.0
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display-lg font-bold tracking-tight text-white leading-tight">
            The Startup <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Operating System</span>
          </h1>
          
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto font-body-lg mt-6">
            Command center for high-growth ventures. Unify your data, team, and investors in a single, high-fidelity workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12">
            <Link 
              href="/role-selection"
              className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] w-full sm:w-auto"
            >
              Start Building
            </Link>
            <Link 
              href="#demo"
              className="px-8 py-3 glass-panel text-white rounded-lg font-semibold hover:bg-white/10 transition-all btn-glow w-full sm:w-auto flex items-center justify-center gap-2 border border-white/20"
            >
              Initialize Demo
            </Link>
          </div>
        </div>
      </section>

      {/* GSAP Component Section */}
      <section id="demo" className="w-full relative z-10 border-t border-white/5 bg-background">
        <div className="text-center pt-24 pb-8" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-white mb-4">Discover the Network</h2>
          <p className="text-on-surface-variant max-w-xl mx-auto">Scroll to explore the founders, builders, and investors already leveraging the AlloySphere ecosystem.</p>
        </div>
        <ScrollPortraitWallDemo />
      </section>
      
      {/* Footer */}
      <footer className="w-full py-12 border-t border-white/5 text-center text-sm text-on-surface-variant flex flex-col items-center justify-center gap-4 bg-background relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-white text-xl">change_history</span>
          <span className="font-bold text-white">AlloySphere</span>
        </div>
        <p>© 2026 AlloySphere O.S. All rights reserved.</p>
      </footer>
    </div>
  );
}
