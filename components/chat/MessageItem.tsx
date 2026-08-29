'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, BookOpen, ThumbsUp, ThumbsDown, Copy, Check, FileText, ChevronDown, ChevronUp, ShieldCheck, Volume2, VolumeX, Share2 } from 'lucide-react';

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
  const [shared, setShared] = useState(false);
  const [feedback, setFeedback] = useState<'UPVOTE' | 'DOWNVOTE' | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const plainText = content ? content.replace(/\*\*/g, '') : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `🎓 *AskCET Verified Answer*:\n\n${plainText.slice(0, 300)}...\n\n🔗 Verified via AskCET College Intelligence Assistant`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AskCET College Answer',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
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
      const utterance = new SpeechSynthesisUtterance(plainText.replace(/[*#]/g, ''));
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

  // Helper to format bold markdown segments cleanly
  const renderFormattedText = (raw: string) => {
    if (!raw) return null;
    const parts = raw.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-3 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar Badge */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
          isUser
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent font-bold'
            : 'bg-white dark:bg-[#121824] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Grounded Confidence Indicator */}
        {hasCitations && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Grounded Answer • Verified Sources</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-xs font-medium'
              : 'bg-white dark:bg-[#121824] text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200 dark:border-slate-800/80 shadow-xs font-normal'
          }`}
        >
          <div className="whitespace-pre-wrap leading-relaxed">
            {isUser ? content : renderFormattedText(content)}
          </div>
        </div>

        {/* Verified Sources Collapsible Box */}
        {hasCitations && (
          <div className="w-full bg-slate-50 dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setShowSources(!showSources)}
              className="w-full flex items-center justify-between font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Verified Sources ({citations.length})</span>
              </div>
              {showSources ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {showSources && (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                {citations.map((c, i) => (
                  <div key={i} className="bg-white dark:bg-[#121824] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{c.documentTitle}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          Page {c.pageNumber}
                        </span>
                      </div>
                      {c.snippet && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 italic leading-normal">
                          "{c.snippet}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message Toolbar Controls */}
        {!isUser && (
          <div className="flex items-center gap-2 px-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <button
              onClick={toggleSpeak}
              className={`flex items-center gap-1 transition-colors py-1 px-2 rounded-md ${
                isSpeaking
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isSpeaking ? 'Stop reading out loud' : 'Read answer out loud'}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-slate-900 dark:text-white" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Stop' : 'Read Aloud'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Share answer"
            >
              {shared ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{shared ? 'Copied Link' : 'Share'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {id && (
              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                <button
                  onClick={() => handleFeedback('UPVOTE')}
                  className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    feedback === 'UPVOTE' ? 'text-emerald-600 dark:text-emerald-400' : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Helpful response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleFeedback('DOWNVOTE')}
                  className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    feedback === 'DOWNVOTE' ? 'text-rose-600 dark:text-rose-400' : 'hover:text-slate-900 dark:hover:text-white'
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
