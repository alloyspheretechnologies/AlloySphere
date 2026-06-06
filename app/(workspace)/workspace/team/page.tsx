"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { Modal } from "@/components/shared/modal";

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;
      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s) => s.owner_id === profile.id) || startups?.[0];
      if (!myStartup) { setLoading(false); return; }
      setStartup(myStartup);
      const { data: mems } = await startupService.getMembers(myStartup.id);
      setMembers(mems || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!startup || !confirm("Remove this team member?")) return;
    await startupService.removeMember(startup.id, userId);
    await loadData();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  const roleOrder: Record<string, number> = { owner: 0, admin: 1, member: 2, viewer: 3 };
  const sorted = [...members].sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9));

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-in fade-in">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Team</h1>
          <p className="text-on-surface-variant mt-1">{members.length} member{members.length !== 1 ? "s" : ""} in {startup?.name || "your startup"}</p>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="px-5 py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">person_add</span> Invite Member
        </button>
      </header>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-white/5 text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
          <span>Member</span>
          <span>Role</span>
          <span>Status</span>
          <span></span>
        </div>
        {sorted.map((m: any) => (
          <div key={m.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 border-b border-white/5 last:border-0 items-center hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3">
              {m.profile?.avatar_url ? (
                <img src={m.profile.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                  {(m.profile?.name || "U").substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-white">{m.profile?.name || "Member"}</div>
                <div className="text-xs text-on-surface-variant">{m.profile?.headline || m.profile?.role || ""}</div>
              </div>
            </div>
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded capitalize ${
              m.role === "owner" ? "bg-white/10 text-white" :
              m.role === "admin" ? "bg-amber-500/20 text-amber-400" :
              "bg-white/5 text-on-surface-variant"
            }`}>{m.role}</span>
            <span className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${m.status === "active" ? "bg-emerald-400" : "bg-white/30"}`} />
              <span className="text-xs text-on-surface-variant capitalize">{m.status}</span>
            </span>
            <div>
              {m.role !== "owner" && (
                <button onClick={() => handleRemoveMember(m.user_id)}
                  className="text-on-surface-variant hover:text-red-400 transition-colors p-1 rounded hover:bg-white/5">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">Invite a user by their profile ID or email. They'll receive a notification to join your workspace.</p>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">User ID or Email</label>
            <input type="text" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none" placeholder="Enter user ID" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
            <button onClick={async () => {
              if (startup && inviteEmail.trim()) {
                await startupService.inviteMember(startup.id, inviteEmail.trim());
                setShowInvite(false); setInviteEmail(""); await loadData();
              }
            }} className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90">
              Send Invite
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
