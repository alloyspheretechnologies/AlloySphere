"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profileService } from "@/lib/services/profile.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Modal } from "@/components/shared/modal";

const STAGES = ["Screening", "Due Diligence", "Term Sheet", "Portfolio"];

export default function InvestmentsPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Edit Note Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);
      if (!prof) return;

      const supabase = getSupabaseBrowserClient();
      const { data: saved } = await supabase
        .from("saved_startups")
        .select("*, startup:startups(*)")
        .eq("user_id", prof.id)
        .order("created_at", { ascending: false });

      setWatchlist(saved || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSaveNote = async () => {
    if (!profile || !editingItem) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.from("saved_startups").update({ notes: noteText }).eq("user_id", profile.id).eq("startup_id", editingItem.startup_id);
    setShowNoteModal(false);
    await loadData();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in h-[calc(100vh-140px)] flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
            Investment Pipeline <span className="material-symbols-outlined text-white text-3xl pulse-core">account_tree</span>
          </h1>
          <p className="text-on-surface-variant mt-2">Manage your active deals and tracked companies.</p>
        </div>
        <Link href="/discover" className="px-5 py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">search</span> Find Deals
        </Link>
      </header>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {STAGES.map((stage, idx) => (
          <div key={stage} className="w-[350px] shrink-0 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{stage}</span>
              <span className="bg-white/5 text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-bold border border-white/5">
                {idx === 0 ? watchlist.length : 0}
              </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {idx === 0 && watchlist.map(item => (
                <div key={item.id} className="glass-panel p-5 rounded-xl border border-white/10 hover:border-white/30 transition-all holographic-lift relative group">
                  <div className="flex justify-between items-start mb-3">
                    <Link href={`/startup/${item.startup?.slug}`} className="font-bold text-white text-lg hover:underline">{item.startup?.name}</Link>
                    <span className="bg-white/5 text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded capitalize">{item.startup?.stage?.replace("_", " ")}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">{item.startup?.industry}</p>

                  {item.notes && (
                    <div className="bg-surface-container-high/50 p-3 rounded-lg border border-white/5 mb-4 relative">
                      <p className="text-xs text-on-surface-variant italic line-clamp-3">&ldquo;{item.notes}&rdquo;</p>
                      <button onClick={() => { setEditingItem(item); setNoteText(item.notes); setShowNoteModal(true); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                      </button>
                    </div>
                  )}

                  {!item.notes && (
                     <button onClick={() => { setEditingItem(item); setNoteText(""); setShowNoteModal(true); }}
                      className="text-xs text-on-surface-variant hover:text-white flex items-center gap-1 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[14px]">add_comment</span> Add Note
                    </button>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-xs text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">group</span> {item.startup?.team_size || 1} members</span>
                    <button className="text-white hover:text-white/70 text-xs font-semibold">Move →</button>
                  </div>
                </div>
              ))}

              {idx !== 0 && (
                 <div className="glass-panel p-6 rounded-xl border border-white/5 border-dashed text-center text-sm text-on-surface-variant opacity-50 flex flex-col items-center justify-center h-32">
                   Drag deals here
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showNoteModal} onClose={() => setShowNoteModal(false)} title="Investor Note">
        <div className="space-y-4">
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
            className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none min-h-[120px] resize-none" placeholder="Add your evaluation notes..." />
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={() => setShowNoteModal(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
            <button onClick={handleSaveNote} className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90">
              Save Note
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
