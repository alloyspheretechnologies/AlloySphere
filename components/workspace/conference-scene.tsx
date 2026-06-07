"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  angle: number;
  distance: number;
}

export function ConferenceScene({ members, isMuted, isScreenSharing }: { members: TeamMember[], isMuted: boolean, isScreenSharing: boolean }) {
  const getPosition = (angle: number, distance: number) => {
    const rad = (angle * Math.PI) / 180;
    const r = (distance / 100) * 280;
    const x = r * Math.cos(rad);
    const y = r * Math.sin(rad) * 0.4;
    return { x, y };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />

      {/* Isometric Rings (rendered flat, CSS-rotated) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: 700, height: 700, transform: "translate(-50%,-50%) rotateX(65deg)" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-indigo-500/15" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute inset-[80px] rounded-full border border-dashed border-indigo-400/20" />
        <div className="absolute inset-[180px] rounded-full border border-indigo-300/25 bg-indigo-950/10 backdrop-blur-sm shadow-[0_0_60px_rgba(99,102,241,0.15)_inset]" />
        <div className="absolute inset-[270px] rounded-full bg-indigo-500/10 border-2 border-indigo-400/40 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-full h-full rounded-full bg-white/10 blur-lg" />
        </div>
      </div>

      {/* Center Hologram */}
      <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{ marginTop: -120 }}>
        <div className="relative px-6 py-4 rounded-2xl border border-indigo-400/40 bg-indigo-950/70 backdrop-blur-2xl shadow-[0_0_40px_rgba(99,102,241,0.3)] text-center">
          <motion.div animate={{ top: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-px bg-indigo-300/30" />
          <div className="text-white font-bold text-sm tracking-[0.15em] uppercase">Conference</div>
          <div className="text-[9px] text-indigo-300 uppercase tracking-widest font-semibold mt-1">Live Session Active</div>
          <div className="mt-3 flex items-end justify-center gap-1 h-8">
            {[35, 65, 45, 85, 55, 75, 40].map((h, i) => (
              <motion.div key={i} animate={{ height: [`${Math.max(15, h - 25)}%`, `${h}%`, `${Math.max(15, h - 25)}%`] }} transition={{ duration: 1.2 + i * 0.15, repeat: Infinity, ease: "easeInOut" }} className="w-1.5 bg-indigo-400/80 rounded-full" />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Avatars */}
      <div className="absolute top-1/2 left-1/2 w-0 h-0 z-30">
        {members.map((member, idx) => {
          const { x, y } = getPosition(member.angle, member.distance);
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="absolute flex flex-col items-center"
              style={{ left: x, top: y, transform: "translate(-50%, -100%)" }}
            >
              {/* Base ring on table */}
              <div className="absolute bottom-0 w-16 h-5 rounded-[100%] border border-current opacity-40 pointer-events-none" style={{ color: member.color, transform: "translateY(50%)" }}>
                <motion.div animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} className="absolute inset-0 rounded-[100%] border border-inherit" />
              </div>

              {/* Beam */}
              <div className="absolute bottom-0 w-10 h-16 opacity-25 blur-sm pointer-events-none origin-bottom" style={{ background: `linear-gradient(to top, ${member.color}, transparent)` }} />

              {/* Floating avatar card */}
              <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 2.5 + idx * 0.3, repeat: Infinity, ease: "easeInOut" }} className="relative z-10 flex flex-col items-center cursor-pointer group">
                <div className="w-11 h-11 rounded-full border-2 overflow-hidden shadow-lg transition-transform group-hover:scale-110" style={{ borderColor: member.color, boxShadow: `0 0 12px ${member.color}40` }}>
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-white/15 to-white/5">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                  )}
                </div>
                <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-lg border border-white/10 text-center min-w-[90px]">
                  <div className="text-[11px] font-semibold text-white whitespace-nowrap">{member.name}</div>
                  <div className="text-[8px] text-white/50 whitespace-nowrap">{member.role}</div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Screen Share overlay indicator */}
      {isScreenSharing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 left-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] text-red-400 font-bold">Screen Sharing</span>
        </motion.div>
      )}
    </div>
  );
}
