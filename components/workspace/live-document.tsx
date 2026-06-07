"use client";

import { useState } from "react";

export function LiveDocument() {
  const [content, setContent] = useState(`## Project: AlloySphere OS
Welcome to the live collaborative document!

### Objectives
1. Implement real-time presence.
2. Establish a holographic glassmorphic UI.
3. Overhaul the discussions into a live command center.

Start typing below to collaborate with your team in real-time...
`);

  return (
    <div className="glass-panel border border-white/10 rounded-2xl flex flex-col h-full overflow-hidden relative">
      {/* Background glowing effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-surface-container-low/50 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <span className="material-symbols-outlined text-[18px]">description</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Product Strategy Doc</h3>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mock active collaborators in doc */}
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-surface">SY</div>
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-surface">JD</div>
          </div>
          <span className="text-[10px] text-on-surface-variant font-medium ml-1">Editing...</span>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 relative p-6 bg-transparent z-10 custom-scrollbar overflow-y-auto">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full min-h-[400px] bg-transparent text-white focus:outline-none resize-none placeholder:text-white/20 text-[15px] leading-relaxed"
          placeholder="Start typing..."
          spellCheck={false}
        />
        
        {/* Mock Caret for another user */}
        <div className="absolute top-[165px] left-[180px] flex flex-col pointer-events-none">
          <div className="w-0.5 h-5 bg-purple-500 animate-pulse" />
          <div className="bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded rounded-tl-none w-max mt-0.5 shadow-lg">
            System
          </div>
        </div>
      </div>
    </div>
  );
}
