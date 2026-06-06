"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, description, children, size = "md" }: ModalProps) {
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Content */}
      <div
        className={`relative z-10 w-full ${sizeMap[size]} glass-panel rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200`}
      >
        {(title || description) && (
          <div className="px-6 pt-6 pb-0">
            <div className="flex items-center justify-between mb-1">
              {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors ml-auto"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            {description && <p className="text-sm text-on-surface-variant">{description}</p>}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
