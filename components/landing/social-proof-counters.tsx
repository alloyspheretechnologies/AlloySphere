"use client";

import { useEffect, useState, useRef } from "react";

const stats = [
  { label: "Active Startups", value: 1240, suffix: "+" },
  { label: "Projects Delivered", value: 8500, suffix: "+" },
  { label: "Talent Connected", value: 45000, suffix: "+" },
  { label: "Capital Deployed", value: 120, prefix: "$", suffix: "M+" },
];

function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isVisible]);

  return { count, ref };
}

export function SocialProofCounters() {
  return (
    <section className="w-full py-24 bg-black relative border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { count, ref } = useCounter(stat.value, 2500 + idx * 200);
            return (
              <div key={stat.label} ref={ref} className="text-center group">
                <div className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-2 tracking-tight group-hover:scale-105 transition-transform duration-500">
                  {stat.prefix}{count.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-sm md:text-base font-semibold text-on-surface-variant uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
