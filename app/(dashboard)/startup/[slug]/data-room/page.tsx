"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { startupService } from "@/lib/services/startup.service";
import { dataRoomService } from "@/lib/services/data-room.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function InvestorDataRoom() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  
  const [startup, setStartup] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  useEffect(() => {
    if (slug) loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      const { data: startupData } = await startupService.getStartupBySlug(slug);
      if (!startupData) return router.push("/startups");
      
      setStartup(startupData);

      // Fetch all documents. RLS automatically filters what the user can see.
      const { data: docs } = await dataRoomService.getStartupDocuments(startupData.id);
      setDocuments(docs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: any) => {
    setDownloadingDocId(doc.id);
    try {
      // Get temporary signed URL and log the download/view event
      const { url } = await dataRoomService.getDocumentUrl(doc.id, doc.file_url);
      if (url) {
        window.open(url, '_blank');
      } else {
        alert("Failed to generate secure link. Your access may have expired.");
      }
    } catch (e) {
      console.error(e);
      alert("Error accessing document.");
    } finally {
      setDownloadingDocId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const hasFullAccess = documents.some(d => d.is_public === false);

  return (
    <div className="w-full max-w-[800px] mx-auto animate-in fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/startup/${slug}`} className="text-sm text-on-surface-variant hover:text-white mb-2 inline-flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Profile
          </Link>
          <div className="flex items-center gap-4 mt-2">
            {startup.logo_url && (
              <img src={startup.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {startup.name} Data Room
              </h1>
              <p className="text-on-surface-variant text-sm mt-0.5">Secure Document Library</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
        
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">verified_user</span>
              Access Level: {hasFullAccess ? 'Full Data Room Access' : 'Public Access Only'}
            </h2>
            <p className="text-sm text-on-surface-variant">
              {hasFullAccess 
                ? "You have been granted secure access to this startup's internal and investor-facing documents. All views and downloads are tracked and audited." 
                : "You are currently viewing publicly available documents. Request full Data Room access from the founders to view internal financials and diligence materials."}
            </p>
          </div>
          
          {!hasFullAccess && (
            <button className="shrink-0 px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-400 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              Request Access
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Available Documents ({documents.length})</h3>
        
        {documents.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-white/5">
            <span className="material-symbols-outlined text-4xl text-white/20 mb-3">folder_off</span>
            <p className="text-on-surface-variant">No documents available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="p-5 glass-panel rounded-2xl border border-white/10 flex flex-col transition-all hover:bg-white/[0.04]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.is_public ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      <span className="material-symbols-outlined">
                        {doc.document_type === 'pitch_deck' ? 'presentation' :
                         doc.document_type === 'financial_summary' ? 'monitoring' : 
                         'description'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight capitalize">{doc.document_type.replace(/_/g, ' ')}</h4>
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                        {doc.is_public ? 'Public Document' : 'Confidential'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="text-xs text-on-surface-variant">
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  
                  <button 
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingDocId === doc.id}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">{doc.is_public ? 'visibility' : 'lock_open'}</span>
                    {downloadingDocId === doc.id ? 'Loading...' : 'Secure View'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
