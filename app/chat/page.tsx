'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import ChatSidebar, { ConversationItem } from '@/components/chat/ChatSidebar';
import MessageItem, { Citation } from '@/components/chat/MessageItem';
import ChatBox from '@/components/chat/ChatBox';
import NoticeDrawer from '@/components/chat/NoticeDrawer';
import { Sparkles, Loader2, BookOpen, Home, Calendar, ArrowRight, Menu, Plus, Flame, ShieldAlert, Download, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';

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
    desc: 'Attendance policies, grading rules, credit requirements & course registration.',
    question: 'What is the minimum attendance requirement for semester exams?',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Home,
    title: 'Hostel & Campus Rules',
    desc: 'Gate curfew timings, mess schedules, leave applications & room allotment rules.',
    question: 'What are the hostel gate timings and curfew rules?',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: Calendar,
    title: 'Exams & Schedules',
    desc: 'Mid-semester timetables, supplementary exam dates & result revaluation.',
    question: 'When is the deadline for exam registration and revaluation?',
    color: 'from-emerald-500 to-teal-600',
  },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    <div className="h-screen flex flex-col bg-slate-50/70 dark:bg-[#070a12] overflow-hidden transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat History Sidebar */}
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
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50/50 dark:bg-[#070a12]/60">
          {/* Header Sub-bar */}
          <div className="px-4 py-2.5 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              {/* Icon-only Hamburger Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-cyan-500/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center justify-center shadow-xs"
                title="Toggle Sidebar"
              >
                <Menu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </button>

              <span className="text-xs font-bold text-slate-800 dark:text-slate-300 truncate">
                {isTemporaryChat ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-bold">
                    <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
                    Temporary Chat
                  </span>
                ) : activeConversationId ? (
                  conversations.find((c) => c.id === activeConversationId)?.title || 'Current Chat'
                ) : (
                  'New Conversation'
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Notice & Deadline Side Panel Trigger */}
              <button
                onClick={() => setIsNoticeDrawerOpen(!isNoticeDrawerOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 text-xs font-bold transition-all shadow-xs relative"
                title="Open Campus Deadlines & Notices Panel"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                <span className="hidden sm:inline">Deadlines & Notices</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5 animate-ping" />
              </button>

              {/* Export Chat Transcript Button */}
              {messages.length > 0 && (
                <button
                  onClick={exportConversationMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold transition-all shadow-xs"
                  title="Export chat transcript as Markdown report"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="hidden sm:inline">Export Chat</span>
                </button>
              )}

              {/* Temporary Chat Button */}
              <button
                onClick={toggleTemporaryChat}
                className={`p-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                  isTemporaryChat
                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/50 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-amber-500 dark:hover:text-amber-400'
                }`}
                title={isTemporaryChat ? 'Temporary Chat Mode Active (Click to turn off)' : 'Enable Temporary Chat Mode'}
              >
                <Flame className={`w-4 h-4 ${isTemporaryChat ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
              </button>

              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </div>

          {/* Temporary Mode Banner */}
          {isTemporaryChat && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/40 px-4 py-2 text-center text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Temporary Chat Mode Active — Messages will not be saved to history.</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="h-full flex flex-col items-center justify-center text-center p-6 max-w-3xl mx-auto space-y-6"
              >
                {/* Hero Icon */}
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Welcome to <span className="gradient-text">AskCET Intelligence</span>
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-medium">
                    Your AI Knowledge Assistant for CET College of Engineering. Ask any question regarding college rules, exam schedules, hostel policies, or course details.
                  </p>
                </div>

                {/* Interactive Sample Question Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left mt-2">
                  {FEATURE_CARDS.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <motion.button
                        key={i}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage(card.question)}
                        className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl hover:shadow-cyan-500/10 hover:border-cyan-500/40 transition-all text-left group flex flex-col justify-between backdrop-blur-md"
                      >
                        <div>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center mb-3 shadow-md`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{card.desc}</p>
                        </div>
                        <div className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          <span>Try Asking This</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                className="flex items-center gap-2.5 text-xs text-cyan-700 dark:text-cyan-300 font-semibold py-2.5 px-4 bg-white dark:bg-slate-900/90 rounded-2xl max-w-sm border border-cyan-200 dark:border-cyan-500/30 shadow-md dark:shadow-xl"
              >
                <Loader2 className="w-4 h-4 animate-spin text-cyan-600 dark:text-cyan-400" />
                <span>Searching CET vector database & generating answer...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Box */}
          <div className="p-4 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800/80 shadow-lg dark:shadow-2xl">
            <ChatBox onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
