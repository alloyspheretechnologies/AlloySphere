"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full max-w-[800px] mx-auto animate-in fade-in py-12 flex flex-col items-center justify-center text-center">
      <div className="glass-panel p-12 rounded-2xl border border-white/10 w-full flex flex-col items-center">
        <span className="material-symbols-outlined text-[48px] text-red-500 mb-4 block">error</span>
        <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
        <p className="text-sm text-on-surface-variant mb-6 max-w-sm">
          There was an error loading this section of the dashboard.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-surface-container-high border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
