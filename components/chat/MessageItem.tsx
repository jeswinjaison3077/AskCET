'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, BookOpen, ThumbsUp, ThumbsDown, Copy, Check, FileText, ChevronDown, ChevronUp, ShieldCheck, Volume2, VolumeX } from 'lucide-react';

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
  const [showSources, setShowSources] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content.replace(/[*#]/g, ''));
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
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
  const hasCitations = !isUser && citations && citations.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3.5 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
          isUser
            ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/25'
            : 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700/80 shadow-slate-200/50 dark:shadow-slate-900/50'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Content Container */}
      <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Confidence Indicator Badge */}
        {hasCitations && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-bold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Grounded Answer • High Relevance Match</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-5 py-4 rounded-3xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-lg shadow-cyan-500/15 font-medium'
              : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl'
          }`}
        >
          <div className="whitespace-pre-wrap">{content}</div>
        </div>

        {/* Citations Box for Assistant */}
        {hasCitations && (
          <div className="mt-1 w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
            <button
              onClick={() => setShowSources(!showSources)}
              className="w-full flex items-center justify-between font-semibold text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Verified Campus Sources ({citations.length})</span>
              </div>
              {showSources ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showSources && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-2 mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80"
              >
                {citations.map((c, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2 shadow-2xs">
                    <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{c.documentTitle}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 shrink-0">
                          Page {c.pageNumber}
                        </span>
                      </div>
                      {c.snippet && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 italic leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60">
                          "{c.snippet}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Message Action Toolbar */}
        {!isUser && (
          <div className="flex items-center gap-3 px-1 text-slate-500 dark:text-slate-400 text-xs">
            {/* Read Aloud Voice Speaker */}
            <button
              onClick={toggleSpeak}
              className={`flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg font-medium ${
                isSpeaking
                  ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/20'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
              title={isSpeaking ? 'Stop reading out loud' : 'Read answer out loud'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-cyan-500 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Stop Speaking' : 'Read Aloud'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {id && (
              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                <button
                  onClick={() => handleFeedback('UPVOTE')}
                  className={`p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors ${
                    feedback === 'UPVOTE' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleFeedback('DOWNVOTE')}
                  className={`p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors ${
                    feedback === 'DOWNVOTE' ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40' : 'hover:text-slate-900 dark:hover:text-white'
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
    </motion.div>
  );
}
