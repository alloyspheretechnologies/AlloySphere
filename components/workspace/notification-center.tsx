"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { notificationService } from "@/lib/services/notification.service";
import { profileService } from "@/lib/services/profile.service";
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useRealtimeSubscription({
    table: "notifications",
    filter: profile ? `user_id=eq.${profile.id}` : undefined,
    enabled: !!profile,
    onData: (payload) => {
      if (profile && payload.new) {
        setNotifications((prev) => [payload.new, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    },
  });

  const loadNotifications = async () => {
    const { data: prof } = await profileService.getCurrentProfile();
    if (!prof) return;
    setProfile(prof);

    const { data } = await notificationService.getNotifications(prof.id, { pageSize: 20 });
    setNotifications(data);
    
    const { count } = await notificationService.getUnreadCount(prof.id);
    setUnreadCount(count);
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    await notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    if (!profile || unreadCount === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await notificationService.markAllAsRead(profile.id);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Optional: Mark all as read when opening
      // handleMarkAllAsRead();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-white/5 rounded-full transition-all duration-300 border border-transparent hover:border-white/10 holographic-lift focus:outline-none min-h-0"
      >
        <span className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors text-[22px] md:text-[24px]" style={{ fontVariationSettings: unreadCount > 0 ? "'FILL' 1" : "'FILL' 0" }}>
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface-container animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown — full-width on mobile, positioned on desktop */}
          <div className="fixed left-2 right-2 top-14 z-50 md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-96 glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-surface-container-high/50">
              <h3 className="font-bold text-white">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Mark all as read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="md:hidden p-1 hover:bg-white/10 rounded-lg transition-colors min-h-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">close</span>
                </button>
              </div>
            </div>
            
            <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => handleMarkAsRead(notif.id, notif.is_read)}
                      className={`p-4 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer ${!notif.is_read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm ${!notif.is_read ? 'font-bold text-white' : 'font-medium text-on-surface'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-on-surface-variant whitespace-nowrap shrink-0">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2">{notif.body}</p>
                        {notif.link && (
                          <Link href={notif.link} className="inline-block mt-2 text-xs text-primary hover:underline">
                            View Details
                          </Link>
                        )}
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-2 block">notifications_off</span>
                  <p className="text-sm text-on-surface-variant">You're all caught up!</p>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-white/10 bg-surface-container-high/50 text-center">
              <Link href="/settings?tab=notifications" onClick={() => setIsOpen(false)} className="text-xs text-on-surface-variant hover:text-white transition-colors">
                Notification Settings
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
