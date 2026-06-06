import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
  iconFill?: boolean;
}

export function EmptyState({ icon, title, description, action, iconFill = true }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <span
          className="material-symbols-outlined text-[40px] text-on-surface-variant"
          style={iconFill ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}
