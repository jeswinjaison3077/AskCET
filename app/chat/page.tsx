'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import ChatSidebar, { ConversationItem } from '@/components/chat/ChatSidebar';
import MessageItem, { Citation } from '@/components/chat/MessageItem';
import ChatBox from '@/components/chat/ChatBox';
import NoticeDrawer from '@/components/chat/NoticeDrawer';
import { Loader2, BookOpen, Home, Calendar, ArrowRight, Menu, Plus, Flame, ShieldAlert, Download, BellRing } from 'lucide-react';
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
    desc: 'Attendance policies, credit requirements, passing criteria & registration.',
    question: 'What is the minimum attendance requirement for semester exams?',
  },
  {
    icon: Home,
    title: 'Hostel & Campus Rules',
    desc: 'Gate curfew timings, mess fee clearance, leave passes & warden permissions.',
    question: 'What are the hostel gate timings and curfew rules?',
  },
  {
    icon: Calendar,
    title: 'Exams & Schedules',
    desc: 'Timetables, supplementary exam dates, revaluation & portal registration.',
    question: 'When is the deadline for exam registration and revaluation?',
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
    <div className="h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F17] overflow-hidden transition-colors duration-200">
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
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Header Action Bar */}
          <div className="px-5 py-2.5 bg-white dark:bg-[#0E131F] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between z-20">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-medium flex items-center gap-1.5"
                title="Toggle History Sidebar"
              >
                <Menu className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-semibold">History</span>
              </button>

              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                {isTemporaryChat ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Temporary Chat
                  </span>
                ) : activeConversationId ? (
                  conversations.find((c) => c.id === activeConversationId)?.title || 'Current Chat'
                ) : (
                  'New Conversation'
                )}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNoticeDrawerOpen(!isNoticeDrawerOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 text-xs font-bold transition-colors"
                title="Open Campus Deadlines & Notices Panel"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Deadlines & Notices</span>
              </button>

              {messages.length > 0 && (
                <button
                  onClick={exportConversationMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors hover:bg-slate-100 dark:hover:bg-slate-900"
                  title="Export chat transcript as Markdown report"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}

              <button
                onClick={toggleTemporaryChat}
                className={`p-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  isTemporaryChat
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300 dark:border-amber-800'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500'
                }`}
                title="Temporary Chat"
              >
                <Flame className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleNewChat}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </div>

          {/* Temporary Mode Banner */}
          {isTemporaryChat && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 px-4 py-2 text-center text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Temporary Chat Mode Active — Messages will not be saved to your history.</span>
            </div>
          )}

          {/* Chat Stream & Minimalist Hero Screen */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-3xl mx-auto space-y-8">
                {/* Minimal Clean Logo */}
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.jpg"
                    alt="AskCET Logo"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                  />
                  <div className="text-left">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      AskCET College Intelligence
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      Source-grounded AI for CET College of Engineering
                    </p>
                  </div>
                </div>

                {/* Minimalist Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
                  {FEATURE_CARDS.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(card.question)}
                        className="bg-white dark:bg-[#121824] p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600 transition-colors text-left group flex flex-col justify-between shadow-xs"
                      >
                        <div>
                          <Icon className="w-5 h-5 text-slate-700 dark:text-slate-300 mb-3" />
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>
                        </div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <span>Ask Question</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => <MessageItem key={index} {...msg} />)
            )}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 bg-white dark:bg-[#121824] rounded-xl max-w-sm border border-slate-200 dark:border-slate-800 shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                <span>Searching college vector database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Clean Command Box */}
          <div className="p-4 bg-white dark:bg-[#0E131F] border-t border-slate-200 dark:border-slate-800/80">
            <ChatBox onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
