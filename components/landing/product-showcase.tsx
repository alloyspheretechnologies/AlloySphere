"use client";

import { CheckCircle2, Circle, Clock, LayoutGrid, ListTodo, Users, Zap } from "lucide-react";

export function ProductShowcase() {
  return (
    <section className="w-full py-32 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs tracking-wider uppercase mb-4">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            High-Fidelity Workspace
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Execution is Everything</h2>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">A unified interface that replaces your disconnected stack of project management, recruitment, and reporting tools.</p>
        </div>

        {/* CSS Mockup of the Platform UI */}
        <div className="relative rounded-2xl border border-white/10 bg-black shadow-2xl overflow-hidden holographic-lift" data-aos="fade-up" data-aos-delay="100">
          
          {/* Top Nav Mock */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 bg-surface-container-lowest">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center text-[10px]">A</span>
                Acme Corp
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center px-3">
                <span className="text-xs text-on-surface-variant">Search anything...</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20" />
            </div>
          </div>

          <div className="flex h-[600px]">
            {/* Sidebar Mock */}
            <div className="w-64 border-r border-white/10 bg-surface-container-low p-4 flex flex-col gap-1 hidden md:flex">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-3">Workspace</div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-white text-sm font-medium">
                <LayoutGrid className="w-4 h-4" /> Overview
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant text-sm font-medium hover:bg-white/5">
                <ListTodo className="w-4 h-4" /> Roadmap
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant text-sm font-medium hover:bg-white/5">
                <Users className="w-4 h-4" /> Team
              </div>
            </div>

            {/* Main Content Mock */}
            <div className="flex-1 bg-black p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Q3 Product Launch</h3>
                  <p className="text-sm text-on-surface-variant">Track progress across engineering and marketing.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-black -mr-3 relative z-30" />
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-black -mr-3 relative z-20" />
                  <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-black relative z-10" />
                </div>
              </div>

              {/* Board Columns Mock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1 */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Circle className="w-4 h-4 text-on-surface-variant" /> In Progress <span className="bg-white/10 px-2 py-0.5 rounded text-xs ml-auto">2</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-surface-container-low shadow-sm">
                    <div className="text-sm font-medium text-white mb-2">Implement Auth Flow</div>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-4">
                      <Clock className="w-3 h-3" /> Due Tomorrow
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Engineering</span>
                      <div className="w-5 h-5 rounded-full bg-purple-500" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-surface-container-low shadow-sm">
                    <div className="text-sm font-medium text-white mb-2">Design Landing Page</div>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-4">
                      <Clock className="w-3 h-3" /> Due Friday
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Design</span>
                      <div className="w-5 h-5 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed <span className="bg-white/10 px-2 py-0.5 rounded text-xs ml-auto">1</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-surface-container-low shadow-sm opacity-60">
                    <div className="text-sm font-medium text-white line-through mb-2">Database Schema</div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Engineering</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
