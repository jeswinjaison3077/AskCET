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
            className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30"
          />

          {/* Ultra-Smooth 60fps Drawer */}
          <motion.aside
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-72 shrink-0 bg-white/95 dark:bg-[#080c16]/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col h-full shadow-2xl z-40 relative transition-colors duration-300"
          >
            {/* Sidebar Brand & Action Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center">
                    <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight uppercase">
                    Chat History
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
                  title="Close sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Chat</span>
              </motion.button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {conversations.length === 0 ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40">
                  <Sparkles className="w-6 h-6 text-cyan-500 dark:text-cyan-400 mx-auto mb-2 opacity-60 animate-pulse" />
                  No previous conversations. Ask a question to start asking CET!
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <motion.div
                      key={conv.id}
                      whileHover={{ x: 3 }}
                      onClick={() => onSelect(conv.id)}
                      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                        isActive
                          ? 'bg-cyan-50/90 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-500/30 shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border border-transparent'
                      }`}
                    >
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                      <span className="truncate flex-1">{conv.title}</span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
