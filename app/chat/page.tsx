'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import ChatSidebar, { ConversationItem } from '@/components/chat/ChatSidebar';
import MessageItem, { Citation } from '@/components/chat/MessageItem';
import ChatBox from '@/components/chat/ChatBox';
import NoticeDrawer from '@/components/chat/NoticeDrawer';
import ScrollFloat from '@/components/animations/ScrollFloat';
import SpecularButton from '@/components/animations/SpecularButton';
import BorderGlow from '@/components/animations/BorderGlow';
import { Loader2, BookOpen, Home, Calendar, ArrowRight, Plus, Flame, Download, BellRing, Sparkles, History, ChevronDown, Award, Briefcase, FileText } from 'lucide-react';
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
    desc: '75% attendance rules, credit system, grade point calculation & condonation.',
    question: 'What is the minimum attendance requirement for semester exams?',
    gradient: 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
    border: 'hover:border-cyan-500/50',
    iconColor: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
  },
  {
    icon: Home,
    title: 'Hostel & Campus Rules',
    desc: 'Curfew timings, warden passes, mess dues clearance & hostel allotment.',
    question: 'What are the hostel gate timings and curfew rules?',
    gradient: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20',
    border: 'hover:border-indigo-500/50',
    iconColor: 'bg-gradient-to-tr from-indigo-500 to-purple-600',
  },
  {
    icon: Calendar,
    title: 'Exams & Revaluation',
    desc: 'Semester end exams, supply registration, revaluation fees & KTU results.',
    question: 'When is the deadline for exam registration and revaluation?',
    gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
    border: 'hover:border-emerald-500/50',
    iconColor: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
  },
  {
    icon: Award,
    title: 'Scholarships & Grants',
    desc: 'Central sector grants, e-Grantz for SC/ST/OEC & Alumni Merit scholarships.',
    question: 'What scholarships are available for CET students?',
    gradient: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20',
    border: 'hover:border-amber-500/50',
    iconColor: 'bg-gradient-to-tr from-amber-500 to-orange-600',
  },
  {
    icon: Briefcase,
    title: 'Placements & Internships',
    desc: 'Placement Cell CGPA eligibility, campus recruitment drives & internship NOC.',
    question: 'What is the minimum CGPA required for campus placements?',
    gradient: 'from-purple-500/20 via-violet-500/20 to-indigo-500/20',
    border: 'hover:border-purple-500/50',
    iconColor: 'bg-gradient-to-tr from-purple-500 to-violet-600',
  },
  {
    icon: FileText,
    title: 'Certificates & Services',
    desc: 'Bonafide certificates, fee structure slips, conduct certificates & Counter 3.',
    question: 'Where can I get fee structure receipts and Bonafide certificates?',
    gradient: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
    border: 'hover:border-blue-500/50',
    iconColor: 'bg-gradient-to-tr from-blue-500 to-cyan-600',
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
  const [scrollTop, setScrollTop] = useState(0);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isPointerInside, setIsPointerInside] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const mainStreamRef = useRef<HTMLElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    fetchConversations();
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = 0;
    }
    setScrollTop(0);
  }, [isTemporaryChat, activeConversationId]);

  const handleScroll = () => {
    if (chatScrollContainerRef.current) {
      setScrollTop(chatScrollContainerRef.current.scrollTop);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!mainStreamRef.current) return;
    const rect = mainStreamRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

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
    setScrollTop(0);
    fetchConversations();
    setTimeout(() => {
      if (chatScrollContainerRef.current) {
        chatScrollContainerRef.current.scrollTop = 0;
      }
    }, 10);
  };

  const toggleTemporaryChat = () => {
    setIsTemporaryChat((prev) => !prev);
    setActiveConversationId(null);
    setMessages([]);
    setScrollTop(0);
    setTimeout(() => {
      if (chatScrollContainerRef.current) {
        chatScrollContainerRef.current.scrollTop = 0;
      }
    }, 10);
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

  // Scroll Blur/Fade Calculations for Hero View
  const heroOpacity = Math.max(0, 1 - scrollTop / 200);
  const heroBlur = Math.min(16, scrollTop / 12);
  const heroScale = Math.max(0.9, 1 - scrollTop / 1200);

  return (
    <div className="h-screen flex flex-col bg-slate-50/80 dark:bg-[#060810] overflow-hidden transition-colors duration-500">
      <Navbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

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

        {/* Main Conversation Stream with Custom Background Torch Spotlight Effect */}
        <main
          ref={mainStreamRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={() => setIsPointerInside(true)}
          onPointerLeave={() => setIsPointerInside(false)}
          className="flex-1 flex flex-col h-full overflow-hidden relative backdrop-blur-3xl"
        >
          {/* Custom Line Art Background Image Layer */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 -z-10"
            style={{
              opacity: isPointerInside ? 0.18 : 0,
              backgroundImage: `url('/bg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'sepia(100%) hue-rotate(165deg) saturate(220%) brightness(0.85)',
              WebkitMaskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)`,
              maskImage: `radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)`,
            }}
          />

          {/* Soft Cyan/Indigo Torch Light Beam Circle */}
          <div
            className="absolute pointer-events-none transition-opacity duration-300 rounded-full blur-2xl -z-10"
            style={{
              opacity: isPointerInside ? 0.18 : 0,
              left: `${mousePos.x - 95}px`,
              top: `${mousePos.y - 95}px`,
              width: '190px',
              height: '190px',
              background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, rgba(99,102,241,0.18) 50%, transparent 100%)',
            }}
          />

          {/* iOS Header Control Sub-bar */}
          <div className="px-5 py-3 bg-white/70 dark:bg-[#080c16]/75 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between z-20 transition-all">
            <div className="flex items-center gap-2">
              {/* Symbol-Only History Toggle Specular Button */}
              <SpecularButton
                radius={16}
                lineColor="#38bdf8"
                baseColor="#1e293b"
                intensity={0.6}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-xs"
                title="Toggle Chat History Sidebar"
              >
                <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </SpecularButton>

              {/* Pure '+' Symbol-Only New Chat Specular Button */}
              <SpecularButton
                radius={16}
                lineColor="#38bdf8"
                baseColor="#0284c7"
                intensity={1}
                onClick={handleNewChat}
                className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 font-black transition-all shadow-xs"
                title="Start a new conversation"
              >
                <Plus className="w-4 h-4" />
              </SpecularButton>

              <span className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-200 truncate hidden md:flex items-center gap-2 ml-2">
                {isTemporaryChat ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-black bg-amber-50/80 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200/80 dark:border-amber-800/60">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    Incognito Mode
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
              {/* Notice & Deadline Specular Trigger */}
              <SpecularButton
                radius={16}
                lineColor="#f59e0b"
                baseColor="#78350f"
                intensity={0.8}
                onClick={() => setIsNoticeDrawerOpen(!isNoticeDrawerOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-50/90 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30 text-xs font-extrabold transition-all shadow-xs relative"
                title="Open Campus Deadlines & Notices Panel"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                <span className="hidden sm:inline">Deadlines & Notices</span>
              </SpecularButton>

              {/* Export Chat Transcript Button */}
              {messages.length > 0 && (
                <SpecularButton
                  radius={16}
                  lineColor="#38bdf8"
                  baseColor="#1e293b"
                  intensity={0.6}
                  onClick={exportConversationMarkdown}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 text-xs font-bold transition-all shadow-xs"
                  title="Export chat transcript as Markdown report"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="hidden sm:inline">Export</span>
                </SpecularButton>
              )}

              {/* Sleek Incognito / Temporary Chat Specular Toggle Pill */}
              <SpecularButton
                radius={16}
                lineColor={isTemporaryChat ? '#f59e0b' : '#38bdf8'}
                baseColor={isTemporaryChat ? '#78350f' : '#1e293b'}
                intensity={isTemporaryChat ? 1.2 : 0.6}
                onClick={toggleTemporaryChat}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all border shadow-xs ${
                  isTemporaryChat
                    ? 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 shadow-amber-500/10'
                    : 'bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800/80 hover:text-amber-500'
                }`}
                title={isTemporaryChat ? 'Click to turn off Incognito Mode' : 'Enable Incognito Temporary Chat'}
              >
                <Flame className={`w-3.5 h-3.5 ${isTemporaryChat ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{isTemporaryChat ? 'Incognito On' : 'Incognito'}</span>
              </SpecularButton>
            </div>
          </div>

          {/* Chat Messages Stream & Hero Screen */}
          <div
            ref={chatScrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-12 scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
                {/* HERO SCREEN - Stays EXACTLY Dead Center */}
                <div
                  style={{
                    opacity: heroOpacity,
                    filter: `blur(${heroBlur}px)`,
                    transform: `scale(${heroScale})`,
                    transition: 'opacity 0.1s linear, filter 0.1s linear, transform 0.1s linear',
                  }}
                  className="min-h-[calc(100vh-210px)] w-full flex flex-col items-center justify-center text-center space-y-6 pointer-events-auto"
                >
                  {/* Hero Smaller & Brighter Feathered 3D Sphere Logo */}
                  <div className="relative group cursor-pointer">
                    {/* Vibrant Grounding 3D Sphere Elliptical Drop Shadow & Bright Backlight Glow */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-5 rounded-[100%] bg-cyan-400/50 blur-lg group-hover:bg-cyan-300/70 transition-all duration-500" />
                    <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Compact 3D Sphere Orb Body (104px w-26 h-26) */}
                    <div
                      className="relative w-26 h-26 rounded-full overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
                      style={{
                        background: 'radial-gradient(circle at 35% 25%, #1e293b 0%, #060810 100%)',
                        boxShadow: `
                          inset 0 0 18px rgba(255, 255, 255, 0.6),
                          inset -8px -8px 18px rgba(0, 0, 0, 0.7),
                          inset 8px 8px 16px rgba(56, 189, 248, 0.55),
                          0 20px 40px -6px rgba(6, 182, 212, 0.6)
                        `,
                      }}
                    >
                      {/* Bright Base Logo Image with 3D Spherical Scale & Soft Edge Feather */}
                      <img
                        src="/logo.jpg"
                        alt="AskCET Bright 3D Feathered Sphere Logo"
                        className="absolute inset-0 w-full h-full object-cover rounded-full scale-120"
                        style={{
                          maskImage: 'radial-gradient(circle closest-side at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.98) 75%, rgba(0,0,0,0.55) 90%, rgba(0,0,0,0) 100%)',
                          WebkitMaskImage: 'radial-gradient(circle closest-side at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.98) 75%, rgba(0,0,0,0.55) 90%, rgba(0,0,0,0) 100%)',
                          filter: 'contrast(1.15) brightness(1.2)',
                        }}
                      />

                      {/* Bright 3D Spherical Volume Shading */}
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background: `
                            radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.2) 25%, rgba(0, 0, 0, 0) 55%),
                            radial-gradient(circle at 75% 80%, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 45%, rgba(0, 0, 0, 0) 80%),
                            radial-gradient(circle at center, rgba(0, 0, 0, 0) 50%, rgba(56, 189, 248, 0.35) 85%, rgba(0, 0, 0, 0.6) 100%)
                          `,
                        }}
                      />

                      {/* Bright Specular Glass Highlight Spot (Top-Left Light Source) */}
                      <div
                        className="absolute top-2 left-2.5 w-10 h-6 rounded-full pointer-events-none -rotate-12"
                        style={{
                          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%)',
                          filter: 'blur(0.8px)',
                        }}
                      />

                      {/* Bright Bottom Fresnel Rim Reflection */}
                      <div
                        className="absolute bottom-1 left-3 right-3 h-3.5 rounded-b-full pointer-events-none"
                        style={{
                          background: 'linear-gradient(to top, rgba(56, 189, 248, 0.75), rgba(56, 189, 248, 0))',
                          filter: 'blur(1px)',
                        }}
                      />
                    </div>

                    {/* Pure Diamond Icon Symbol without background, rotating in sync with scroll */}
                    <div
                      style={{ transform: `rotate(${scrollTop * 1.5}deg)` }}
                      className="absolute -bottom-1 -right-1 text-cyan-400 drop-shadow-[0_0_16px_rgba(6,182,212,1)] transition-transform duration-75 z-20"
                    >
                      <Sparkles className="w-6.5 h-6.5 text-cyan-400" />
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

                  {/* Subtle Light Opacity Scroll Text Hint */}
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="pt-6 flex flex-col items-center gap-1 text-xs font-extrabold text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => {
                      chatScrollContainerRef.current?.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                  >
                    <span>Scroll for FAQs</span>
                    <ChevronDown className="w-4 h-4 text-cyan-500" />
                  </motion.div>
                </div>

                {/* 6 Campus FAQ Tiles - Wrapped in React Bits BorderGlow */}
                <div className="w-full pt-8 pb-24">
                  <div className="text-center mb-8">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Explore Popular Campus Topics & FAQs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full text-left">
                    {FEATURE_CARDS.map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 40, scale: 0.94 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          viewport={{ once: false, amount: 0.05 }}
                          transition={{
                            duration: 0.45,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="h-full"
                        >
                          <BorderGlow
                            edgeSensitivity={30}
                            glowColor="190 90 60"
                            backgroundColor="rgba(15, 23, 42, 0.85)"
                            borderRadius={28}
                            glowRadius={35}
                            glowIntensity={1.2}
                            colors={['#38bdf8', '#818cf8', '#c084fc']}
                            className="h-full"
                          >
                            <div
                              onClick={() => handleSendMessage(card.question)}
                              className="p-6 text-left group flex flex-col justify-between h-full cursor-pointer relative overflow-hidden"
                            >
                              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.gradient} rounded-full blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                              
                              <div>
                                <div className={`w-12 h-12 rounded-2xl ${card.iconColor} text-white flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300`}>
                                  <Icon className="w-6 h-6" />
                                </div>

                                {/* React Bits ScrollFloat Animated Character Title */}
                                <ScrollFloat
                                  scrollContainerRef={chatScrollContainerRef}
                                  animationDuration={0.7}
                                  ease="back.inOut(2)"
                                  scrollStart="top 98%"
                                  scrollEnd="top 75%"
                                  stagger={0.02}
                                  containerClassName="mb-1.5"
                                  textClassName="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors"
                                >
                                  {card.title}
                                </ScrollFloat>

                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 font-medium">{card.desc}</p>
                              </div>

                              <div className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                                <span>Try Asking This</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                              </div>
                            </div>
                          </BorderGlow>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
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
