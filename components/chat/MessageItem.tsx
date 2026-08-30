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

  const plainText = content ? content.replace(/[*#]/g, '') : '';

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
      const utterance = new SpeechSynthesisUtterance(plainText);
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

  // Clean math LaTeX text & format inline elements
  const renderFormattedText = (raw: string) => {
    if (!raw) return null;

    // Clean up raw backslash/tab escapes in LaTeX string math
    let cleaned = raw
      .replace(/\t\s*ext\{([^}]+)\}/g, '$1')
      .replace(/\t\s*imes/g, ' × ')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\times/g, ' × ')
      .replace(/\\%/g, '%')
      .replace(/\\\$/g, '$');

    // Parse block math $$...$$
    const mathBlocks = cleaned.split(/(\$\$.*?\$\$)/gs);

    return mathBlocks.map((block, bIdx) => {
      if (block.startsWith('$$') && block.endsWith('$$')) {
        const mathContent = block
          .slice(2, -2)
          .replace(/\\text\{([^}]+)\}/g, '$1')
          .replace(/\\times/g, ' × ')
          .replace(/\\%/g, '%')
          .trim();

        return (
          <div
            key={bIdx}
            className="my-3 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 font-mono text-sm tracking-wide shadow-inner overflow-x-auto text-center"
          >
            <span className="font-extrabold text-cyan-300">📐 {mathContent}</span>
          </div>
        );
      }

      // Parse bold **...**
      const boldParts = block.split(/(\*\*.*?\*\*)/g);
      return boldParts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong
              key={`${bIdx}-${pIdx}`}
              className="font-extrabold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20 inline-block my-0.5"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, type: 'spring', stiffness: 300, damping: 24 }}
      className={`flex gap-3.5 my-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* iOS Avatar Badge */}
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
          isUser
            ? 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-cyan-500/25'
            : 'bg-[#080d1a] text-cyan-400 border border-cyan-500/30 shadow-xl'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-cyan-400" />}
      </div>

      {/* Content Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[80%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Grounded Confidence Indicator */}
        {hasCitations && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Grounded Answer • Verified Match</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-6 py-5 rounded-[28px] text-[15px] leading-[1.85] tracking-wide ${
            isUser
              ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-xl shadow-cyan-500/20 font-semibold'
              : 'bg-[#080d1a]/95 text-slate-100 rounded-tl-xs border border-cyan-500/25 shadow-2xl backdrop-blur-2xl font-medium'
          }`}
        >
          <div className="whitespace-pre-wrap space-y-2">
            {isUser ? content : renderFormattedText(content)}
          </div>
        </div>

        {/* Verified Sources Collapsible Box */}
        {hasCitations && (
          <div className="mt-1 w-full bg-[#040711]/80 border border-cyan-500/20 rounded-2xl p-3.5 text-xs text-slate-300 shadow-xs backdrop-blur-md">
            <button
              onClick={() => setShowSources(!showSources)}
              className="w-full flex items-center justify-between font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Verified Campus Sources ({citations.length})</span>
              </div>
              {showSources ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showSources && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-2 mt-2.5 pt-2.5 border-t border-cyan-500/20"
              >
                {citations.map((c, i) => (
                  <div key={i} className="bg-[#080d1a] p-3 rounded-xl border border-cyan-500/20 flex items-start gap-2 shadow-2xs">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-white">{c.documentTitle}</div>
                      <div className="text-[10px] text-cyan-300 font-semibold mb-1">
                        Category: {c.category} | Page {c.pageNumber}
                      </div>
                      <div className="text-slate-400 italic text-[11px]">"{c.snippet}"</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Action Controls for Assistant Messages */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-1 text-slate-400">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={toggleSpeak}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
              title="Read aloud"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
              title="Share response"
            >
              {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <div className="h-3 w-px bg-slate-800 mx-1" />

            <button
              onClick={() => handleFeedback('UPVOTE')}
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                feedback === 'UPVOTE' ? 'text-emerald-400 bg-emerald-950/50' : 'hover:text-emerald-400'
              }`}
              title="Helpful"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleFeedback('DOWNVOTE')}
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${
                feedback === 'DOWNVOTE' ? 'text-rose-400 bg-rose-950/50' : 'hover:text-rose-400'
              }`}
              title="Not helpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
