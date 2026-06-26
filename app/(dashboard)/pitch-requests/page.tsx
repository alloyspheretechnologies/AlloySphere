"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pitchRequestService } from "@/lib/services/pitch-request.service";
import { profileService } from "@/lib/services/profile.service";
import { Modal } from "@/components/shared/modal";
import { ProfileLink } from "@/components/shared/profile-link";

export default function PitchRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<'accepted' | 'declined'>('accepted');
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;
      
      const { data: reqs, error } = await pitchRequestService.getIncomingPitchRequests(profile.id);
      if (error) console.error("Error fetching pitch requests:", error);
      setRequests(reqs || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleOpenModal = (req: any, type: 'accepted' | 'declined') => {
    setSelectedRequest(req);
    setActionType(type);
    setResponseText("");
    setShowModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await pitchRequestService.respondToPitchRequest(
        selectedRequest.id,
        actionType,
        responseText || undefined
      );
      await loadData();
      setShowModal(false);
    } catch (e) {
      console.error(e);
      alert("Failed to send response.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const statusConfig: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-blue-500/20", text: "text-blue-400" },
    viewed: { bg: "bg-amber-500/20", text: "text-amber-400" },
    accepted: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
    declined: { bg: "bg-red-500/20", text: "text-red-400" },
    expired: { bg: "bg-white/5", text: "text-on-surface-variant" },
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-in fade-in pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Pitch Requests</h1>
        <p className="text-on-surface-variant mt-2">Manage incoming pitch requests from investors.</p>
      </header>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "accepted", "declined"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
              filter === s ? "bg-white text-black border-white" : "bg-surface-container-high border-white/10 text-on-surface-variant hover:border-white/20"
            }`}>
            {s === "all" ? `All (${requests.length})` : `${s} (${requests.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((req: any) => {
            const cfg = statusConfig[req.status] || statusConfig.pending;
            const investor = req.investor || {};
            const startup = req.startup || {};
            
            return (
              <div key={req.id} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                  <div className="flex gap-4 items-start">
                    <ProfileLink profileId={investor.id}>
                      {investor.avatar_url ? (
                        <img src={investor.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white">
                          {(investor.name || "I").charAt(0)}
                        </div>
                      )}
                    </ProfileLink>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        {investor.name || "Investor"}
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${cfg.bg} ${cfg.text}`}>{req.status}</span>
                      </h3>
                      <p className="text-sm text-on-surface-variant">{investor.headline || "Investor"}</p>
                      <div className="text-xs text-on-surface-variant mt-1">Requested a pitch for <span className="font-semibold text-white">{startup.name || 'Startup'}</span> • {new Date(req.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  {req.status === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleOpenModal(req, 'declined')}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                        Decline
                      </button>
                      <button onClick={() => handleOpenModal(req, 'accepted')}
                        className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors">
                        Accept & Send Report
                      </button>
                    </div>
                  )}
                </div>
                
                {req.message && (
                  <div className="mt-2 bg-surface-container-high rounded-xl p-4 border border-white/5">
                    <div className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Message from investor</div>
                    <p className="text-sm text-white">&ldquo;{req.message}&rdquo;</p>
                  </div>
                )}
                
                {req.response && (
                  <div className="mt-3 bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Your Response</div>
                    <p className="text-sm text-white">&ldquo;{req.response}&rdquo;</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">handshake</span>
          <h3 className="text-lg font-bold text-white mb-2">No pitch requests</h3>
          <p className="text-sm text-on-surface-variant">When investors request a pitch from your startup, they will appear here.</p>
        </div>
      )}

      {/* Response Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={actionType === 'accepted' ? "Accept Pitch Request" : "Decline Pitch Request"} size="lg">
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-white/5">
            <div className="text-sm font-medium text-white">{selectedRequest?.investor?.name}</div>
            <div className="text-xs text-on-surface-variant">{selectedRequest?.investor?.headline}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">
              {actionType === 'accepted' ? "Pitch Report / Message" : "Reason for declining (Optional)"}
            </label>
            <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[120px] resize-none"
              placeholder={actionType === 'accepted' ? "Attach your pitch report link or write a message to the investor..." : "Let the investor know why you are declining..."} />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white" disabled={submitting}>Cancel</button>
            <button
              onClick={handleSubmitResponse}
              disabled={submitting || (actionType === 'accepted' && !responseText.trim())}
              className={`px-6 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all ${
                actionType === 'accepted' ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-red-500 text-white hover:bg-red-400'
              }`}>
              {submitting ? "Sending..." : (actionType === 'accepted' ? "Send Report" : "Decline Request")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
