'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/shared/Navbar';
import ChatSidebar, { ConversationItem } from '@/components/chat/ChatSidebar';
import MessageItem, { Citation } from '@/components/chat/MessageItem';
import ChatBox from '@/components/chat/ChatBox';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  createdAt?: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load conversation list on mount
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

  // Load specific conversation messages
  const loadConversationMessages = async (id: string) => {
    setActiveConversationId(id);
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

  // Stream send message handler
  const handleSendMessage = async (userText: string) => {
    if (!userText || isLoading) return;

    // Append user message immediately
    const userMsg: ChatMessage = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationId: activeConversationId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch response.');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMsg: ChatMessage = { role: 'assistant', content: '', citations: [] };

      // Push placeholder assistant message
      setMessages((prev) => [...prev, assistantMsg]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'metadata') {
                if (parsed.conversationId && !activeConversationId) {
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
              // Non-JSON line ignore
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, an error occurred while connecting to the AskCET RAG server. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Chat History Sidebar */}
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={loadConversationMessages}
          onNewChat={handleNewChat}
          onDelete={handleDeleteConversation}
        />

        {/* Main Conversation Stream */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-brand-600/30">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">How can AskCET assist you today?</h2>
                <p className="text-sm text-slate-400">
                  Ask any question regarding college rules, exam schedules, hostel policies, or course details. AskCET will search official documents and cite verified sources.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => <MessageItem key={index} {...msg} />)
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-brand-400 font-medium py-2 px-3 glass-card rounded-xl max-w-xs border border-brand-500/20">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching vector database & generating answer...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Box */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800/80">
            <ChatBox onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
