'use client';

import { useState } from 'react';
import { Bot, User, BookOpen, ThumbsUp, ThumbsDown, Copy, Check, FileText } from 'lucide-react';

export interface Citation {
  documentTitle: string;
  category: string;
  department: string;
  pageNumber: number;
  snippet: string;
}

export interface MessageProps {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  createdAt?: string;
}

export default function MessageItem({ id, role, content, citations, createdAt }: MessageProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'UPVOTE' | 'DOWNVOTE' | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!id) return;
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: id, type }),
      });
      setFeedback(type);
    } catch {
      // Ignore rating error
    }
  };

  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-gradient-to-tr from-slate-800 to-indigo-900 text-brand-400 border border-slate-700'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Content Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-600/10'
              : 'glass-card text-slate-100 rounded-tl-none border border-slate-800 shadow-lg'
          }`}
        >
          <div className="whitespace-pre-wrap">{content}</div>
        </div>

        {/* Citations Box for Assistant */}
        {!isUser && citations && citations.length > 0 && (
          <div className="mt-1 w-full bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-brand-400 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grounded Document Sources ({citations.length})</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {citations.map((c, i) => (
                <div key={i} className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-200 truncate">{c.documentTitle}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        Page {c.pageNumber}
                      </span>
                    </div>
                    {c.snippet && <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 italic">"{c.snippet}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 px-1 text-slate-400 text-xs">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 hover:text-white transition-colors py-1 px-1.5 rounded hover:bg-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {id && (
              <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                <button
                  onClick={() => handleFeedback('UPVOTE')}
                  className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                    feedback === 'UPVOTE' ? 'text-emerald-400' : 'hover:text-white'
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleFeedback('DOWNVOTE')}
                  className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                    feedback === 'DOWNVOTE' ? 'text-rose-400' : 'hover:text-white'
                  }`}
                  title="Inaccurate response"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
