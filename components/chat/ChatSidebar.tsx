'use client';

import { Plus, MessageSquare, Trash2, Sparkles, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  conversations: ConversationItem[];
  activeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
}

export default function ChatSidebar({
  conversations,
  activeId,
  isOpen,
  onClose,
  onSelect,
  onNewChat,
  onDelete,
}: ChatSidebarProps) {
  const handleSelectConversation = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Mobile Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30"
          />

          {/* Ultra-Smooth Drawer */}
          <motion.aside
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-72 shrink-0 bg-[#080d1a]/95 backdrop-blur-2xl border-r border-cyan-500/20 flex flex-col h-full shadow-2xl z-40 relative text-slate-200"
          >
            {/* Sidebar Brand & Action Header */}
            <div className="p-4 border-b border-cyan-500/20 space-y-4 bg-[#040711]/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <History className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-xs font-black text-white tracking-tight uppercase">
                    Chat History
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  title="Close sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-cyan-500/30 border border-cyan-400/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-cyan-200" />
                <span>Start New Chat</span>
              </motion.button>
            </div>

            {/* Single Clean History Item List with Right-Corner Delete Button */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {conversations.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8 px-4 border border-dashed border-cyan-500/20 rounded-2xl bg-[#040711]/40 font-medium">
                  <Sparkles className="w-6 h-6 text-cyan-400 mx-auto mb-2 opacity-80 animate-pulse" />
                  No saved conversations yet. Ask a question to start chatting!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {conversations.map((c) => {
                    const isActive = c.id === activeId;
                    return (
                      <motion.div
                        key={c.id}
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        onClick={() => handleSelectConversation(c.id)}
                        className={`group relative flex items-center justify-between p-3 rounded-2xl text-xs font-extrabold transition-all border cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/40'
                            : 'bg-[#050814]/90 border-slate-800/90 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-8">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                          <span className="truncate">{c.title}</span>
                        </div>

                        {/* Trash Delete Icon at Right Corner */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(c.id);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/80 opacity-70 group-hover:opacity-100 transition-all border border-transparent hover:border-rose-800/50 shrink-0 cursor-pointer"
                          title="Delete this conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
