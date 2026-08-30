'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Loader2, BookOpen, Home, Calendar, CreditCard, Mic, MicOff, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatBoxProps {
  onSendMessage: (message: string, language?: string) => void;
  isLoading: boolean;
}

const CATEGORIZED_PROMPTS = [
  {
    category: 'Academics',
    icon: BookOpen,
    prompts: [
      'What is the minimum attendance requirement for semester exams?',
      'What is the official KTU SGPA to percentage formula?',
    ],
  },
  {
    category: 'Hostel',
    icon: Home,
    prompts: [
      'What are the hostel gate timings and curfew rules?',
      'How do I clear hostel mess dues and get leave permission?',
    ],
  },
  {
    category: 'Exams',
    icon: Calendar,
    prompts: [
      'When is the deadline for exam registration and revaluation?',
      'What are the grace mark rules for NSS / Sports?',
    ],
  },
  {
    category: 'Fees & Grants',
    icon: CreditCard,
    prompts: [
      'What scholarships are available for CET students?',
      'How does the Tuition Fee Waiver (TFW) scheme work?',
    ],
  },
];

const LANGUAGES = [
  { code: 'English', label: '🇬🇧 English' },
  { code: 'Malayalam', label: '🇮🇳 മലയാളം' },
  { code: 'Hindi', label: '🇮🇳 हिंदी' },
];

export default function ChatBox({ onSendMessage, isLoading }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recording is supported in Google Chrome, Microsoft Edge, and Safari. Please use a supported browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = selectedLanguage === 'Malayalam' ? 'ml-IN' : selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-US';

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (e: any) => {
          let liveTranscript = '';
          for (let i = 0; i < e.results.length; i++) {
            liveTranscript += e.results[i][0].transcript;
          }
          if (liveTranscript) {
            setInput(liveTranscript);
          }
        };

        rec.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
        rec.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Mic start exception:', err);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
    onSendMessage(input.trim(), selectedLanguage);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSuggestion = (promptText: string) => {
    onSendMessage(promptText, selectedLanguage);
    setInput('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 relative z-30">
      {/* Category Quick Suggestion Chips - Direct Send on Click */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex flex-wrap gap-2 px-1"
        >
          {CATEGORIZED_PROMPTS[activeCategory].prompts.map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggestion(promptText)}
              disabled={isLoading}
              className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all font-semibold shadow-xs cursor-pointer active:scale-95"
            >
              💡 {promptText}
            </button>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Voice Recording Live Indicator Bar */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-black flex items-center justify-between shadow-lg shadow-rose-950/40"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>🎙️ Listening in {selectedLanguage}... Speak your question now!</span>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="text-[11px] bg-rose-500 text-white px-2.5 py-1 rounded-xl font-bold hover:bg-rose-400 cursor-pointer"
          >
            Done Recording
          </button>
        </motion.div>
      )}

      {/* Main Glassmorphic Input Container */}
      <div className="relative bg-[#080d1a]/95 backdrop-blur-2xl rounded-[32px] border border-cyan-500/30 p-3 sm:p-4 shadow-2xl shadow-cyan-950/50 space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask AskCET anything in ${selectedLanguage} (e.g. attendance rules, SGPA formula, hostel curfew)...`}
          rows={2}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none tracking-wide font-medium leading-relaxed"
        />

        {/* Input Bar Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cyan-500/20">
          {/* Left Side: Inline Language Selector Pills & Topic Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Inline Language Selector Tabs */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-xs shrink-0">
              <Globe className="w-3.5 h-3.5 text-cyan-400 ml-2 mr-1" />
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    selectedLanguage === lang.code
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Topic Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIZED_PROMPTS.map((cat, i) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveCategory(i)}
                    className={`shrink-0 px-3 py-1.5 rounded-2xl font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-xs'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{cat.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Voice Mic & Circular Send Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Speech-to-Text Voice Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading}
              className={`p-2.5 rounded-full transition-all shrink-0 border cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse border-rose-400 shadow-md shadow-rose-500/30'
                  : 'bg-slate-900/90 text-slate-300 hover:text-cyan-400 border-slate-700/80'
              }`}
              title={isListening ? 'Stop recording voice' : 'Speak question using Voice Mic'}
            >
              {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Circular Send Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-full transition-all shrink-0 border cursor-pointer border-cyan-400/40 shadow-lg ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 hover:scale-105 active:scale-95'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
