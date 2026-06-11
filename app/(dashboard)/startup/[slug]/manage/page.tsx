"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { startupService } from "@/lib/services/startup.service";
import { dataRoomService } from "@/lib/services/data-room.service";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { DocumentUpload } from "@/components/settings/document-upload";

export default function StartupDocumentManagement() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [startup, setStartup] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'investor_facing' | 'internal'>('investor_facing');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    if (slug) loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      const { data: startupData } = await startupService.getStartupBySlug(slug);
      if (!startupData) return router.push("/startups");

      // RBAC: Ensure current user is the owner
      if (startupData.owner_id !== user?.id) {
        return router.push(`/startup/${slug}`);
      }
      
      setStartup(startupData);

      // Fetch all documents for this startup
      const { data: docs } = await dataRoomService.getStartupDocuments(startupData.id);
      setDocuments(docs || []);

      // Fetch audit logs
      const { data: logs } = await dataRoomService.getAuditLogs(startupData.id);
      setAuditLogs(logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDoc = (type: string) => documents.find(d => d.document_type === type);

  const handleUpload = async (file: File, type: string, category: 'investor_facing' | 'internal', isPublic: boolean) => {
    if (!startup) return;
    await dataRoomService.uploadStartupDocument({
      startupId: startup.id,
      file,
      category,
      documentType: type,
      isPublic
    });
    await loadData();
  };

  const handleDelete = async (docId: string, url: string) => {
    await dataRoomService.deleteDocument(docId, url);
    await loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const investorDocs = [
    { type: 'pitch_deck', label: 'Pitch Deck', public: true },
    { type: 'one_pager', label: 'One Pager', public: true },
    { type: 'business_plan', label: 'Business Plan', public: false },
    { type: 'financial_summary', label: 'Financial Summary', public: false },
    { type: 'executive_summary', label: 'Executive Summary', public: false }
  ];

  const internalDocs = [
    { type: 'product_roadmap', label: 'Product Roadmap', public: false },
    { type: 'technical_architecture', label: 'Technical Architecture', public: false },
    { type: 'market_research', label: 'Market Research', public: false },
    { type: 'due_diligence', label: 'Due Diligence Documents', public: false }
  ];

  return (
    <div className="w-full max-w-[1000px] mx-auto animate-in fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/startup/${slug}`} className="text-sm text-on-surface-variant hover:text-white mb-2 inline-flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Startup
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Startup Management
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Owner Access</span>
          </h1>
          <p className="text-on-surface-variant mt-1">Manage documents, data room access, and track investor engagement.</p>
        </div>
      </div>

      <div className="flex gap-6 mb-6 border-b border-white/10">
        <button 
          onClick={() => setActiveTab('investor_facing')}
          className={`pb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'investor_facing' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-on-surface-variant hover:text-white'}`}
        >
          Investor Data Room Files
        </button>
        <button 
          onClick={() => setActiveTab('internal')}
          className={`pb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'internal' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-on-surface-variant hover:text-white'}`}
        >
          Internal Documents
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">{activeTab === 'investor_facing' ? 'Investor Facing' : 'Internal'} Documents</h2>
              <p className="text-sm text-on-surface-variant">
                {activeTab === 'investor_facing' 
                  ? "These files will be accessible to investors who are granted access to your Data Room." 
                  : "These files are strictly for your team members."}
              </p>
            </div>

            {(activeTab === 'investor_facing' ? investorDocs : internalDocs).map(docDef => {
              const currentDoc = getDoc(docDef.type);
              
              return (
                <div key={docDef.type} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-white flex items-center gap-2">
                        {docDef.label}
                        {docDef.public && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Public on Profile</span>}
                      </div>
                      <div className="text-xs text-on-surface-variant mt-1">
                        {currentDoc ? `Uploaded on ${new Date(currentDoc.created_at).toLocaleDateString()}` : "Not uploaded yet"}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {currentDoc ? (
                        <>
                          <button 
                            onClick={() => window.open(`/api/documents/download?id=${currentDoc.id}`, '_blank')}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
                          >
                            View
                          </button>
                          <label className="px-3 py-1.5 text-xs font-semibold bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                            Replace
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleDelete(currentDoc.id, currentDoc.file_url).then(() => {
                                    handleUpload(e.target.files![0], docDef.type, activeTab, docDef.public);
                                  });
                                }
                              }}
                            />
                          </label>
                          <button 
                            onClick={() => handleDelete(currentDoc.id, currentDoc.file_url)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </>
                      ) : (
                        <label className="px-4 py-1.5 text-xs font-semibold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">upload_file</span>
                          Upload
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleUpload(e.target.files[0], docDef.type, activeTab, docDef.public);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log Panel */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 h-full flex flex-col">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">history</span>
              Audit Logs
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Real-time tracking of Data Room access.</p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[500px]">
              {auditLogs.length === 0 ? (
                <div className="text-center py-10 text-xs text-on-surface-variant">No activity logged yet.</div>
              ) : (
                auditLogs.map((log: any) => (
                  <div key={log.id} className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {log.user?.avatar_url ? (
                          <img src={log.user.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-[10px]">{log.user?.name?.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-white">{log.user?.name}</span>
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      <span className={`font-semibold ${
                        log.action === 'view' ? 'text-blue-400' :
                        log.action === 'download' ? 'text-emerald-400' :
                        log.action === 'upload' ? 'text-indigo-400' : 'text-red-400'
                      }`}>
                        {log.action.toUpperCase()}
                      </span>
                      {" "}{log.document?.name}
                    </div>
                    <div className="text-[10px] text-on-surface-variant mt-1.5 opacity-60">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
