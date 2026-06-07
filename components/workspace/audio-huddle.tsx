"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isSpeaking: boolean;
  color: string;
}

export function AudioHuddle({ participants, currentUser }: { participants: Participant[], currentUser: any }) {
  const [joined, setJoined] = useState(false);

  const displayParticipants = joined
    ? [...participants, { id: "me", name: currentUser?.name || "You", avatar: currentUser?.avatar_url, isSpeaking: true, color: "#10b981" }]
    : participants;

  return (
    <div className="glass-panel border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
      {/* Background FX */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 animate-pulse">settings_input_antenna</span>
            Live Huddle
          </h3>
          <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-1 font-semibold">
            {displayParticipants.length} {displayParticipants.length === 1 ? 'Person' : 'People'} Active
          </p>
        </div>
        <button
          onClick={() => setJoined(!joined)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-glow ${
            joined
              ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
              : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/40 hover:text-white"
          }`}
        >
          {joined ? "Leave Huddle" : "Join Call"}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 relative z-10">
        {displayParticipants.map((p) => (
          <div key={p.id} className="relative flex flex-col items-center">
            <div className="relative w-12 h-12 rounded-full">
              {/* Speaking Ripple FX */}
              {p.isSpeaking && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border border-current opacity-50"
                    style={{ color: p.color }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-current opacity-50"
                    style={{ color: p.color }}
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  />
                </>
              )}
              {/* Avatar */}
              {p.avatar ? (
                <img src={p.avatar} alt={p.name} className="w-full h-full rounded-full object-cover border-2 border-surface relative z-10" />
              ) : (
                <div className="w-full h-full rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-white font-bold relative z-10" style={{ borderColor: p.isSpeaking ? p.color : undefined }}>
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              {/* Mic Icon */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-container border border-white/10 flex items-center justify-center z-20">
                <span className={`material-symbols-outlined text-[10px] ${p.isSpeaking ? "text-emerald-400" : "text-on-surface-variant"}`}>
                  {p.isSpeaking ? "mic" : "mic_off"}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-medium mt-2 text-on-surface-variant truncate w-16 text-center">
              {p.name}
            </span>
          </div>
        ))}

        {displayParticipants.length === 0 && (
          <div className="w-full py-4 text-center text-xs text-on-surface-variant/50 border border-dashed border-white/10 rounded-xl">
            No one is currently in the huddle.
          </div>
        )}
      </div>
    </div>
  );
}
