'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import ChatSidebar, { ConversationItem } from '@/components/chat/ChatSidebar';
import MessageItem, { Citation } from '@/components/chat/MessageItem';
import ChatBox from '@/components/chat/ChatBox';
import NoticeDrawer from '@/components/chat/NoticeDrawer';
import { Loader2, BookOpen, Home, Calendar, ArrowRight, Menu, Plus, Flame, ShieldAlert, Download, BellRing, Sparkles, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  createdAt?: string;
}

const FEATURE_CARDS = [
  {
    icon: BookOpen,
    title: 'Academic Regulations',
    desc: 'Attendance policies, credit requirements, passing criteria & registration.',
    question: 'What is the minimum attendance requirement for semester exams?',
    gradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
    border: 'hover:border-cyan-500/50',
    iconColor: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
  },
  {
    icon: Home,
    title: 'Hostel & Campus Rules',
    desc: 'Gate curfew timings, mess fee clearance, leave passes & warden permissions.',
    question: 'What are the hostel gate timings and curfew rules?',
    gradient: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20',
    border: 'hover:border-indigo-500/50',
    iconColor: 'bg-gradient-to-tr from-indigo-500 to-purple-600',
  },
  {
    icon: Calendar,
    title: 'Exams & Schedules',
    desc: 'Timetables, supplementary exam dates, revaluation & portal registration.',
    question: 'When is the deadline for exam registration and revaluation?',
    gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
    border: 'hover:border-emerald-500/50',
    iconColor: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
  },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [isNoticeDrawerOpen, setIsNoticeDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {
      // Handle error
    }
  };

  const loadConversationMessages = async (id: string) => {
    setActiveConversationId(id);
    setIsTemporaryChat(false);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        const loadedMessages: ChatMessage[] = (data.conversation.messages || []).map((m: any) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          citations: m.sources ? (typeof m.sources === 'string' ? JSON.parse(m.sources) : m.sources) : [],
          createdAt: m.createdAt,
        }));
        setMessages(loadedMessages);
      }
    } catch {
      // Handle error
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setIsTemporaryChat(false);
    fetchConversations();
  };

  const toggleTemporaryChat = () => {
    setIsTemporaryChat((prev) => !prev);
    if (!isTemporaryChat) {
      setActiveConversationId(null);
      setMessages([]);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        handleNewChat();
      }
    } catch {
      // Handle delete error
    }
  };

  const exportConversationMarkdown = () => {
    if (messages.length === 0) return;
    let mdContent = `# AskCET Chat Transcript\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;
    messages.forEach((msg, idx) => {
      if (msg.role === 'user') {
        mdContent += `### 👤 Student Question (${idx + 1})\n${msg.content}\n\n`;
      } else {
        mdContent += `### 🤖 AskCET Grounded Answer\n${msg.content}\n\n`;
        if (msg.citations && msg.citations.length > 0) {
          mdContent += `**Verified Sources:**\n`;
          msg.citations.forEach((c) => {
            mdContent += `- **${c.documentTitle}** (Category: ${c.category} | Page ${c.pageNumber})\n`;
          });
          mdContent += `\n`;
        }
      }
      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AskCET_Chat_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendMessage = async (userText: string, language: string = 'English') => {
    if (!userText || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationId: isTemporaryChat ? null : activeConversationId,
          isTemporary: isTemporaryChat,
          language: language,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch response.');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsg: ChatMessage = { role: 'assistant', content: '', citations: [] };

      setMessages((prev) => [...prev, assistantMsg]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              if (!isTemporaryChat) fetchConversations();
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'metadata') {
                if (parsed.conversationId && !isTemporaryChat) {
                  setActiveConversationId(parsed.conversationId);
                  fetchConversations();
                }
                if (parsed.citations) {
                  assistantMsg.citations = parsed.citations;
                }
              } else if (parsed.type === 'content' && parsed.delta) {
                assistantMsg.content += parsed.delta;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...assistantMsg };
                  return updated;
                });
              }
            } catch {
              // Ignore non-json
            }
          }
        }
      }
      if (!isTemporaryChat) fetchConversations();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, an error occurred while connecting to the AskCET server. Please try asking again.',
        },
      ]);
    } finally {
      setIsLoading(false);
      if (!isTemporaryChat) fetchConversations();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50/80 dark:bg-[#060810] overflow-hidden transition-colors duration-500">
      <Navbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Chat History Sidebar (Collapsed by default) */}
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelect={loadConversationMessages}
          onNewChat={handleNewChat}
          onDelete={handleDeleteConversation}
        />

        {/* Side Notice & Deadlines Drawer */}
        <NoticeDrawer
          isOpen={isNoticeDrawerOpen}
          onClose={() => setIsNoticeDrawerOpen(false)}
          onSelectPrompt={handleSendMessage}
        />

        {/* Main Conversation Stream */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative backdrop-blur-3xl">
          {/* iOS Header Control Sub-bar */}
          <div className="px-5 py-3 bg-white/70 dark:bg-[#080c16]/75 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between z-20 transition-all">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs text-xs font-bold"
                title="Toggle History Sidebar"
              >
                <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden sm:inline">History</span>
              </motion.button>

              <span className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-200 truncate flex items-center gap-2">
                {isTemporaryChat ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-black bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                    Temporary Chat Mode
                  </span>
                ) : activeConversationId ? (
                  conversations.find((c) => c.id === activeConversationId)?.title || 'Current Chat'
                ) : (
                  'New Conversation'
                )}
              </span>
            </div>

            {/* iOS Action Controls */}
            <div className="flex items-center gap-2">
              {/* Notice & Deadline Side Panel Trigger */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsNoticeDrawerOpen(!isNoticeDrawerOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50/90 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30 text-xs font-extrabold transition-all shadow-xs relative"
                title="Open Campus Deadlines & Notices Panel"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                <span className="hidden sm:inline">Deadlines & Notices</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5 animate-ping" />
              </motion.button>

              {/* Export Chat Transcript Button */}
              {messages.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={exportConversationMarkdown}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold transition-all shadow-xs"
                  title="Export chat transcript as Markdown report"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="hidden sm:inline">Export</span>
                </motion.button>
              )}

              {/* Temporary Chat Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTemporaryChat}
                className={`p-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center ${
                  isTemporaryChat
                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/50 shadow-sm'
                    : 'bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-slate-200/80 dark:border-slate-800/80 hover:text-amber-500 dark:hover:text-amber-400'
                }`}
                title={isTemporaryChat ? 'Temporary Chat Active' : 'Enable Temporary Chat'}
              >
                <Flame className={`w-4 h-4 ${isTemporaryChat ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
              </motion.button>

              {/* New Chat Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 text-xs font-black transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Chat</span>
              </motion.button>
            </div>
          </div>

          {/* Temporary Mode Banner */}
          {isTemporaryChat && (
            <div className="bg-amber-50/90 dark:bg-amber-950/60 border-b border-amber-200/80 dark:border-amber-800/60 px-4 py-2 text-center text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Temporary Chat Mode Active — Conversation will not be stored in your history.</span>
            </div>
          )}

          {/* Chat Messages Stream & Hero Screen */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
                className="h-full flex flex-col items-center justify-center text-center p-6 max-w-4xl mx-auto space-y-8"
              >
                {/* Hero iOS Squircle Logo with Pulse Glow */}
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                  <img
                    src="/logo.jpg"
                    alt="AskCET Logo"
                    className="relative w-24 h-24 rounded-[32px] object-cover shadow-2xl border-2 border-white/20 dark:border-slate-700/80 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1.5 rounded-2xl bg-cyan-500 text-white shadow-lg">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                </div>

                <div className="space-y-3 max-w-xl">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Welcome to <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">AskCET Intelligence</span>
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Your source-grounded AI assistant for CET College of Engineering. Ask anything about academic regulations, exam timetables, hostel curfews, or fee schedules.
                  </p>
                </div>

                {/* Interactive Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full text-left mt-2">
                  {FEATURE_CARDS.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <motion.button
                        key={i}
                        whileHover={{ y: -6, scale: 1.025 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        onClick={() => handleSendMessage(card.question)}
                        className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xl dark:shadow-2xl ${card.border} transition-all text-left group flex flex-col justify-between relative overflow-hidden`}
                      >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.gradient} rounded-full blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        <div>
                          <div className={`w-12 h-12 rounded-2xl ${card.iconColor} text-white flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1.5 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{card.desc}</p>
                        </div>

                        <div className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <span>Try Asking This</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              messages.map((msg, index) => <MessageItem key={index} {...msg} />)
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-xs text-cyan-700 dark:text-cyan-300 font-bold py-3 px-5 bg-white/90 dark:bg-slate-900/90 rounded-2xl max-w-sm border border-cyan-200 dark:border-cyan-500/30 shadow-xl backdrop-blur-xl"
              >
                <Loader2 className="w-4 h-4 animate-spin text-cyan-600 dark:text-cyan-400" />
                <span>Searching CET vector database & generating grounded answer...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Floating iOS Input Box */}
          <div className="p-4 sm:p-5 bg-white/70 dark:bg-[#080c16]/75 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/70 shadow-2xl">
            <ChatBox onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
