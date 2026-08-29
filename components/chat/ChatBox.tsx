'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { Send, Sparkles, Loader2, BookOpen, Home, Calendar, CreditCard, Mic, MicOff, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpecularButton from '@/components/animations/SpecularButton';

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
  { code: 'English', short: 'EN', label: '🇬🇧 English' },
  { code: 'Malayalam', short: 'ML', label: '🇮🇳 മലയാളം' },
  { code: 'Hindi', short: 'HI', label: '🇮🇳 हिंदी' },
];

export default function ChatBox({ onSendMessage, isLoading }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = selectedLanguage === 'Malayalam' ? 'ml-IN' : selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-US';

        rec.onresult = (e: any) => {
          const transcript = Array.from(e.results)
            .map((res: any) => res[0].transcript)
            .join('');
          setInput(transcript);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onerror = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, [selectedLanguage]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim(), selectedLanguage);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const activeLangObj = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2.5">
      {/* Quick Suggested Prompt Chips Floating above AI Capsule */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORIZED_PROMPTS[activeCategory].prompts.map((prompt, idx) => (
          <SpecularButton
            key={idx}
            radius={999}
            lineColor="#38bdf8"
            baseColor="#0f172a"
            intensity={0.5}
            onClick={() => onSendMessage(prompt, selectedLanguage)}
            disabled={isLoading}
            className="shrink-0 px-3.5 py-1 rounded-full bg-[#0d1526]/80 hover:bg-[#131d33] text-slate-300 hover:text-cyan-300 border border-slate-800/80 hover:border-cyan-500/40 shadow-xs transition-all text-[11px] font-semibold"
          >
            "{prompt}"
          </SpecularButton>
        ))}
      </div>

      {/* State-of-the-Art Modern AI Capsule Input Container */}
      <div className="relative rounded-[28px] bg-[#0c1324]/85 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_12px_45px_-10px_rgba(6,182,212,0.35)] focus-within:border-cyan-400/60 focus-within:shadow-[0_12px_50px_-8px_rgba(6,182,212,0.5)] transition-all duration-300 p-3.5 space-y-3">
        {/* Main Textarea Input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? '🎙️ Listening... Speak your question now...'
              : `Ask AskCET in ${selectedLanguage} (academic regulations, exam dates, hostel rules)...`
          }
          disabled={isLoading}
          rows={2}
          className="w-full bg-transparent resize-none px-2 text-sm text-white placeholder-slate-400 focus:outline-none max-h-36 leading-relaxed font-medium"
        />

        {/* Integrated Bottom Action Strip */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
          {/* Left Side: Topic Pills & Globe Language Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Language Selector Dropdown Pill */}
            <div className="relative shrink-0 z-30">
              <SpecularButton
                radius={999}
                lineColor="#38bdf8"
                baseColor="#0f172a"
                intensity={0.6}
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-cyan-300 transition-all text-xs font-black shadow-xs"
                title="Switch AI Language (English, Malayalam, Hindi)"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[11px] font-black">{activeLangObj.short}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
              </SpecularButton>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    className="absolute left-0 bottom-full mb-2 w-36 bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 z-40 space-y-1 text-xs"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl font-bold transition-all flex items-center justify-between ${
                          selectedLanguage === lang.code
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Topic Category Pills */}
            <div className="flex items-center gap-1.5">
              {CATEGORIZED_PROMPTS.map((cat, i) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === i;
                return (
                  <SpecularButton
                    key={i}
                    radius={999}
                    lineColor={isSelected ? '#38bdf8' : '#64748b'}
                    baseColor={isSelected ? '#0284c7' : '#0f172a'}
                    intensity={isSelected ? 1.2 : 0.4}
                    onClick={() => setActiveCategory(i)}
                    className={`shrink-0 px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 text-xs ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-300 border border-cyan-400/50 shadow-xs'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{cat.category}</span>
                  </SpecularButton>
                );
              })}
            </div>
          </div>

          {/* Right Side: Voice Mic & Circular Send Specular Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Speech-to-Text Voice Mic Specular Button */}
            <SpecularButton
              radius={999}
              lineColor={isListening ? '#f43f5e' : '#38bdf8'}
              baseColor={isListening ? '#be123c' : '#0f172a'}
              intensity={isListening ? 1.5 : 0.6}
              onClick={toggleListening}
              disabled={isLoading}
              className={`p-2.5 rounded-full transition-all shrink-0 border ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse border-rose-400 shadow-md shadow-rose-500/30'
                  : 'bg-slate-900/90 text-slate-300 hover:text-cyan-400 border-slate-700/80'
              }`}
              title={isListening ? 'Stop recording voice' : 'Speak question using Voice Mic'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </SpecularButton>

            {/* Send Specular Button */}
            <SpecularButton
              radius={999}
              lineColor="#38bdf8"
              baseColor="#0284c7"
              intensity={1.2}
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/30 border border-cyan-400/40"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </SpecularButton>
          </div>
        </div>
      </div>
    </div>
  );
}
