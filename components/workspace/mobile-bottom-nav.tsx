"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav({ role }: { role: string | null }) {
  const pathname = usePathname();

  const navItems = [
    { icon: "home", label: "Home", href: "/home" },
    { icon: "explore", label: "Discover", href: "/discover" },
    { 
      icon: role === 'founder' ? "rocket_launch" : role === 'investor' ? "account_balance_wallet" : "work", 
      label: role === 'founder' ? "Startup" : role === 'investor' ? "Portfolio" : "Jobs", 
      href: role === 'founder' ? "/startup" : role === 'investor' ? "/investments" : "/jobs" 
    },
    { icon: "dynamic_feed", label: "Feed", href: "/feed" },
    { icon: "menu", label: "Menu", href: "#drawer", action: "drawer" } // Will open drawer
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container/95 backdrop-blur-xl border-t border-white/10 z-50 px-2 pb-safe pt-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          if (item.action === "drawer") {
            return (
              <button key={item.label} id="mobile-drawer-trigger" className="flex flex-col items-center justify-center w-16 py-1 text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px] mb-1">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 py-1 transition-colors ${
                isActive ? "text-primary" : "text-on-surface-variant hover:text-white"
              }`}
            >
              <div className={`px-4 py-1 rounded-full mb-1 transition-colors ${isActive ? 'bg-primary/20' : ''}`}>
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
              </div>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
