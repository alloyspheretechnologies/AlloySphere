"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import { documentService } from "@/lib/services/document.service";
import { profileService } from "@/lib/services/profile.service";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  color: string;
}

interface SharedDoc {
  id: string;
  name: string;
  sharedBy: string;
  time: string;
  type: string;
  url?: string;
  isUploading?: boolean;
}

interface ChatProps {
  channel: any;
  profile: any;
}

export function ConferenceChat({ channel, profile }: ChatProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "docs">("chat");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { workspace } = useWorkspaceStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [docs, setDocs] = useState<SharedDoc[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, docs]);

  useEffect(() => {
    if (!channel) return;

    let isMounted = true;

    const messageHandler = (payload: any) => {
      if (!isMounted) return;
      const { type, data } = payload.payload;
      if (type === 'chat_message') {
        setMessages((prev) => [...prev, data]);
      } else if (type === 'doc_shared') {
        setDocs((prev) => [data, ...prev]);
      }
    };

    // Supabase RealtimeChannel does not have a public .off() method
    channel.on('broadcast', { event: 'conference_activity' }, messageHandler);
    
    return () => {
      isMounted = false;
    };
  }, [channel]);

  const handleSend = () => {
    if (!input.trim() || !profile) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: profile.name || "You",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      color: "#8b5cf6",
    };
    
    setMessages((prev) => [...prev, { ...msg, sender: "You" }]);
    setInput("");

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'conference_activity',
        payload: { type: 'chat_message', data: msg }
      });
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !workspace) return;

    // Optimistic UI
    const tempId = Date.now().toString();
    setDocs((prev) => [
      { id: tempId, name: file.name, sharedBy: "You", time: "Uploading...", type: file.name.split(".").pop() || "file", isUploading: true },
      ...prev,
    ]);

    try {
      // Wait for 1 second for visual feedback (since it's typically very fast)
      await new Promise(r => setTimeout(r, 1000));
      
      const { data: profile } = await profileService.getCurrentProfile();
      const { data, error, path } = await documentService.uploadDocument(
        workspace.id,
        file,
        undefined,
        profile?.id,
        'conference_files'
      );

      if (error || !data) {
        throw new Error(error?.message || "Upload failed");
      }

      // Get signed URL for the conference file
      const { url } = await documentService.getDocumentUrl(path || data.file_url, 'conference_files');

      const newDoc = {
        id: data.id,
        name: data.name,
        sharedBy: profile?.name || "Someone",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: file.name.split(".").pop() || "file",
        url: url || data.file_url,
        isUploading: false
      };

      setDocs((prev) => prev.map(d => d.id === tempId ? { ...newDoc, sharedBy: "You" } : d));

      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'conference_activity',
          payload: { type: 'doc_shared', data: newDoc }
        });
      }
    } catch (e) {
      console.error(e);
      // Remove failed upload
      setDocs((prev) => prev.filter(d => d.id !== tempId));
      alert("Failed to upload document");
    }
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = async (doc: SharedDoc) => {
    if (!doc.url) return;
    const { url } = await documentService.getDocumentUrl(doc.url);
    if (url) window.open(url, '_blank');
  };

  const getDocIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf": return "picture_as_pdf";
      case "figma": case "fig": return "palette";
      case "md": case "markdown": return "description";
      case "zip": return "folder_zip";
      case "png": case "jpg": case "jpeg": case "svg": return "image";
      default: return "insert_drive_file";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="flex border-b border-white/10 shrink-0">
        <button onClick={() => setActiveTab("chat")} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors relative ${activeTab === "chat" ? "text-white" : "text-white/40 hover:text-white/60"}`}>
          <span className="flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">chat</span>
            Chat
          </span>
          {activeTab === "chat" && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
        </button>
        <button onClick={() => setActiveTab("docs")} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors relative ${activeTab === "docs" ? "text-white" : "text-white/40 hover:text-white/60"}`}>
          <span className="flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">folder_shared</span>
            Files
          </span>
          {activeTab === "docs" && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "chat" ? (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {messages.length > 0 ? messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${msg.sender === "You" ? "bg-indigo-500/20 text-white border border-indigo-500/20" : "bg-white/5 text-white/90 border border-white/5"}`}>
                    {msg.sender !== "You" && (
                      <div className="text-[10px] font-bold mb-0.5" style={{ color: msg.color }}>{msg.sender}</div>
                    )}
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-white/30 mt-0.5 px-1">{msg.time}</span>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <span className="material-symbols-outlined text-[32px] text-white/10 mb-2">chat</span>
                  <p className="text-xs text-white/25">No messages yet. Start chatting!</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 shrink-0">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/20"
                  placeholder="Type a message..."
                />
                <button onClick={handleSend} className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center hover:bg-indigo-500/30 transition-colors shrink-0">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              {docs.length > 0 ? docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 relative overflow-hidden">
                    {doc.isUploading && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                    <span className="material-symbols-outlined text-[18px]">{getDocIcon(doc.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{doc.name}</div>
                    <div className="text-[10px] text-white/40">{doc.sharedBy} • {doc.time}</div>
                  </div>
                  {!doc.isUploading && (
                    <button onClick={() => handleDownload(doc)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg">
                      <span className="material-symbols-outlined text-[16px] text-white/50">download</span>
                    </button>
                  )}
                  {doc.isUploading && (
                    <div className="w-4 h-4 border-2 border-indigo-500/50 border-t-indigo-400 rounded-full animate-spin mr-2" />
                  )}
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <span className="material-symbols-outlined text-[32px] text-white/10 mb-2">folder_open</span>
                  <p className="text-xs text-white/25">No shared files yet.</p>
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="p-3 border-t border-white/10 shrink-0">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleDocUpload} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={!workspace}
                className="w-full py-2.5 border border-dashed border-white/15 rounded-xl text-xs font-semibold text-white/40 hover:text-white/70 hover:border-white/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                {workspace ? "Share a Document" : "Loading workspace..."}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
