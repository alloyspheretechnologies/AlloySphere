"use client";

import { motion } from "framer-motion";

export interface CursorProps {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

export function LiveCursors({ cursors }: { cursors: CursorProps[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[100] overflow-hidden">
      {cursors.map((cursor) => (
        <motion.div
          key={cursor.id}
          className="absolute top-0 left-0 flex flex-col items-start drop-shadow-lg"
          initial={{ x: cursor.x, y: cursor.y, opacity: 0 }}
          animate={{ x: cursor.x, y: cursor.y, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 250,
            mass: 0.5,
          }}
          style={{ zIndex: 9999 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-glow"
          >
            <path
              d="M5.65376 2.15376C5.40573 1.90573 5 2.08146 5 2.43223V21.5678C5 21.9185 5.40573 22.0943 5.65376 21.8462L11.5 16H20.5678C20.9185 16 21.0943 15.5943 20.8462 15.3462L5.65376 2.15376Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
          <div
            className="px-2 py-1 mt-1 ml-4 rounded-full text-[10px] font-bold text-white shadow-lg whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
