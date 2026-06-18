"use client";

import { useEffect, useState } from "react";
import { documentService } from "@/lib/services/document.service";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { Modal } from "@/components/shared/modal";

export default function DocumentsPage() {
  const [folders, setFolders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadWorkspace(); }, []);
  useEffect(() => { if (workspace) loadContents(); }, [workspace, currentFolder]);

  const loadWorkspace = async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;
      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s) => s.owner_id === profile.id) || startups?.[0];
      if (!myStartup) { setLoading(false); return; }
      const { data: ws } = await workspaceService.getWorkspaceByStartup(myStartup.id);
      setWorkspace(ws);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadContents = async () => {
    if (!workspace) return;
    const [foldersRes, docsRes] = await Promise.all([
      documentService.listFolders(workspace.id, currentFolder),
      documentService.listDocuments(workspace.id, currentFolder),
    ]);
    setFolders(foldersRes.data || []);
    setDocuments(docsRes.data || []);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !workspace) return;
    const { data: profile } = await profileService.getCurrentProfile();
    await documentService.createFolder(workspace.id, newFolderName, currentFolder || undefined, profile?.id);
    setShowNewFolder(false); setNewFolderName("");
    await loadContents();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !workspace) return;
    setUploading(true);
    const { data: profile } = await profileService.getCurrentProfile();
    await documentService.uploadDocument(workspace.id, file, currentFolder || undefined, profile?.id);
    setUploading(false);
    await loadContents();
    e.target.value = "";
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await documentService.deleteDocument(id);
    await loadContents();
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setBreadcrumb((prev) => [...prev, { id: folderId, name: folderName }]);
    setCurrentFolder(folderId);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentFolder(null);
      setBreadcrumb([]);
    } else {
      const item = breadcrumb[index];
      setCurrentFolder(item.id);
      setBreadcrumb((prev) => prev.slice(0, index + 1));
    }
  };

  const getFileIcon = (type: string) => {
    if (type?.includes("image")) return "image";
    if (type?.includes("pdf")) return "picture_as_pdf";
    if (type?.includes("video")) return "videocam";
    if (type?.includes("spreadsheet") || type?.includes("csv")) return "table_chart";
    return "description";
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-in fade-in">
      <header className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Documents</h1>
          <p className="text-on-surface-variant mt-1">Shared files and folders for your team.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowNewFolder(true)}
            className="px-4 py-2 bg-white/5 text-white rounded-xl text-sm font-semibold border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">create_new_folder</span> New Folder
          </button>
          <label className="px-4 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            {uploading ? "Uploading..." : "Upload"}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button onClick={() => navigateToBreadcrumb(-1)} className="text-on-surface-variant hover:text-white transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">home</span> Root
        </button>
        {breadcrumb.map((item, i) => (
          <span key={item.id} className="flex items-center gap-2">
            <span className="text-on-surface-variant">/</span>
            <button onClick={() => navigateToBreadcrumb(i)} className="text-on-surface-variant hover:text-white transition-colors">
              {item.name}
            </button>
          </span>
        ))}
      </div>

      {/* Contents */}
      {folders.length === 0 && documents.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">folder_open</span>
          <h3 className="text-lg font-bold text-white mb-2">No files yet</h3>
          <p className="text-sm text-on-surface-variant">Upload documents or create folders to organize your startup&apos;s files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder: any) => (
            <button key={folder.id} onClick={() => navigateToFolder(folder.id, folder.name)}
              className="glass-panel p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all holographic-lift flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>folder</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">{folder.name}</div>
                <div className="text-xs text-on-surface-variant">Folder</div>
              </div>
            </button>
          ))}
          {documents.map((doc: any) => (
            <div key={doc.id} className="glass-panel p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">{getFileIcon(doc.file_type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{doc.name}</div>
                <div className="text-xs text-on-surface-variant">
                  {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : ""} • {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {doc.file_url && (
                  <button onClick={async () => {
                      const { url } = await documentService.getDocumentUrl(doc.file_url);
                      if (url) window.open(url, '_blank');
                    }}
                    className="p-1.5 rounded hover:bg-white/5 text-on-surface-variant hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>
                )}
                <button onClick={() => handleDeleteDoc(doc.id)}
                  className="p-1.5 rounded hover:bg-white/5 text-on-surface-variant hover:text-red-400 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showNewFolder} onClose={() => setShowNewFolder(false)} title="Create Folder">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Folder Name</label>
            <input type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none"
              placeholder="e.g. Pitch Decks" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={() => setShowNewFolder(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
            <button onClick={handleCreateFolder} disabled={!newFolderName.trim()}
              className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50">
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
