"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-on-surface flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
      <span className="material-symbols-outlined text-[64px] text-red-500 mb-6">error</span>
      <h1 className="text-3xl font-bold text-white mb-2">Something went wrong!</h1>
      <p className="text-on-surface-variant max-w-md mb-8">
        We apologize for the inconvenience. An unexpected error occurred.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all btn-glow"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-surface-container-high border border-white/10 font-semibold rounded-xl hover:bg-white/10 transition-all text-white"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
