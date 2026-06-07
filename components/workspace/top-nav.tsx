"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { profileService } from "@/lib/services/profile.service";
import { SlideOver } from "@/components/shared/slide-over";

export function TopNav() {
  const [profile, setProfile] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let channel: any;

    const loadData = async () => {
      const { data: profData } = await profileService.getCurrentProfile();
      if (!profData) return;
      
      setProfile(profData);

      const { notificationService } = await import("@/lib/services/notification.service");
      const { data: notifs } = await notificationService.getNotifications(profData.id, { pageSize: 10 });
      setNotifications(notifs || []);
      const unread = notifs?.filter(n => !n.is_read).length || 0;
      setUnreadCount(unread);

      // Subscribe to realtime notifications
      channel = notificationService.subscribeToNotifications(profData.id, (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    };

    loadData();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  const handleMarkAllRead = async () => {
    if (!profile) return;
    const { notificationService } = await import("@/lib/services/notification.service");
    await notificationService.markAllAsRead(profile.id);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'task_assigned': return { icon: 'assignment_ind', color: 'text-blue-400' };
      case 'task_updated': return { icon: 'update', color: 'text-emerald-400' };
      case 'application_received': return { icon: 'description', color: 'text-amber-400' };
      case 'message': return { icon: 'chat', color: 'text-purple-400' };
      default: return { icon: 'notifications', color: 'text-white/50' };
    }
  };

  return (
    <>
      <nav className="bg-background/80 backdrop-blur-xl flex justify-between items-center w-full px-8 py-2 max-w-[1920px] mx-auto z-50 fixed top-0 border-b border-white/10 shadow-[0_0_20px_rgba(132,43,210,0.1)]">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>change_history</span>
            <span className="text-2xl font-bold text-primary">AlloySphere</span>
          </Link>
        </div>

        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              className="w-full bg-surface-container-high/50 border border-white/10 rounded-full py-2 pl-12 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50 hover:border-white/20 holographic-lift" 
              placeholder="Search workspaces, members, startups..." 
              type="text"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
              <span className="text-xs border border-white/20 rounded px-1.5 py-0.5">⌘</span>
              <span className="text-xs border border-white/20 rounded px-1.5 py-0.5">K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowNotifications(true)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-white/5 rounded-full transition-all duration-300 relative btn-glow">
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            )}
          </button>
          
          <Link href="/profile" className="flex items-center gap-3 p-1 pr-3 hover:bg-white/5 rounded-full transition-all duration-300 border border-transparent hover:border-white/10 holographic-lift">
            {profile?.avatar_url ? (
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover border border-primary/30" src={profile.avatar_url} />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-primary/30 font-bold text-xs text-white">
                {(profile?.name || "U").substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-on-surface">{profile?.name || "Loading..."}</div>
              <div className="text-[10px] text-on-surface-variant capitalize">{profile?.role?.replace("_", " ") || ""}</div>
            </div>
          </Link>
        </div>
      </nav>

      {/* Notifications Panel */}
      <SlideOver open={showNotifications} onClose={() => setShowNotifications(false)} title="Notifications" width="md">
        <div className="p-4 space-y-4">
          {notifications.length > 0 ? notifications.map(n => {
            const { icon, color } = getIconForType(n.type);
            return (
              <div key={n.id} className={`glass-panel p-4 rounded-xl border ${n.is_read ? 'border-white/5 opacity-70' : 'border-primary/50'} flex gap-4 items-start`}>
                <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                <div>
                  <div className="text-sm font-bold text-white">{n.title}</div>
                  <div className="text-xs text-on-surface-variant">{n.body}</div>
                  <div className="text-[10px] text-on-surface-variant mt-2">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-4xl text-white/20 mb-2">notifications_off</span>
              <p className="text-sm text-on-surface-variant">No notifications yet</p>
            </div>
          )}
          {notifications.length > 0 && (
            <div className="text-center pt-4">
              <button onClick={handleMarkAllRead} className="text-xs text-on-surface-variant hover:text-white transition-colors">Mark all as read</button>
            </div>
          )}
        </div>
      </SlideOver>
    </>
  );
}
