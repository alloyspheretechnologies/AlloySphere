"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
}

export function ConferenceChat() {
  const [activeTab, setActiveTab] = useState<"chat" | "docs">("chat");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [docs, setDocs] = useState<SharedDoc[]>([]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: "You",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      color: "#8b5cf6",
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const handleDocUpload = () => {
    const name = prompt("Enter document name (e.g. 'Sprint Plan.pdf'):");
    if (!name) return;
    setDocs((prev) => [{ id: Date.now().toString(), name, sharedBy: "You", time: "now", type: name.split(".").pop() || "file" }, ...prev]);
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case "pdf": return "picture_as_pdf";
      case "figma": case "fig": return "palette";
      case "md": case "markdown": return "description";
      case "zip": return "folder_zip";
      default: return "insert_drive_file";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Switcher */}
      <div className="flex border-b border-white/10">
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
            Shared Files
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
            <div className="p-3 border-t border-white/10">
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
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <span className="material-symbols-outlined text-[18px]">{getDocIcon(doc.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{doc.name}</div>
                    <div className="text-[10px] text-white/40">{doc.sharedBy} • {doc.time}</div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg">
                    <span className="material-symbols-outlined text-[16px] text-white/50">download</span>
                  </button>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <span className="material-symbols-outlined text-[32px] text-white/10 mb-2">folder_open</span>
                  <p className="text-xs text-white/25">No shared files yet.</p>
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="p-3 border-t border-white/10">
              <button onClick={handleDocUpload} className="w-full py-2.5 border border-dashed border-white/15 rounded-xl text-xs font-semibold text-white/40 hover:text-white/70 hover:border-white/30 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                Share a Document
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
