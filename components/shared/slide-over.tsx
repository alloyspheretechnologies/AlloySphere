"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg";
}

const widthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

export function SlideOver({ open, onClose, title, children, width = "md" }: SlideOverProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex justify-end"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Panel — full width on mobile, constrained on desktop */}
      <div
        className={`relative z-10 w-full md:${widthMap[width]} h-full bg-surface-container border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col`}
      >
        {title && (
          <div className="h-14 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 shrink-0">
            <h2 className="text-base md:text-lg font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors touch-target"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
