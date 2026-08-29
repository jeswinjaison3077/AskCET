'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { Send, Sparkles, Loader2, BookOpen, Home, Calendar, CreditCard, Mic, MicOff, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpecularButton from '@/components/animations/SpecularButton';
import BorderGlow from '@/components/animations/BorderGlow';

interface ChatBoxProps {
  onSendMessage: (message: string, language?: string) => void;
  isLoading: boolean;
}

const CATEGORIZED_PROMPTS = [
  {
    category: 'Academics',
    icon: BookOpen,
    prompts: [
      'What is the minimum attendance requirement?',
      'What are the passing criteria for Semester 1 courses?',
    ],
  },
  {
    category: 'Hostel',
    icon: Home,
    prompts: [
      'What are the hostel gate timings and rules?',
      'How to apply for hostel leave permission?',
    ],
  },
  {
    category: 'Exams',
    icon: Calendar,
    prompts: [
      'When is the exam registration deadline?',
      'What are the rules for re-valuation & supplementary exams?',
    ],
  },
  {
    category: 'Fees & Grants',
    icon: CreditCard,
    prompts: [
      'What is the tuition fee breakdown and payment deadline?',
      'What scholarships are available for CET students?',
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
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {/* Top Bar: Category Pills & Symbol-Only Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-bold flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" /> Topics:
          </span>
          {CATEGORIZED_PROMPTS.map((cat, i) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === i;
            return (
              <SpecularButton
                key={i}
                radius={999}
                lineColor={isSelected ? '#38bdf8' : '#64748b'}
                baseColor={isSelected ? '#0284c7' : '#1e293b'}
                intensity={isSelected ? 1.2 : 0.4}
                onClick={() => setActiveCategory(i)}
                className={`shrink-0 px-3 py-1 font-semibold transition-all flex items-center gap-1.5 text-xs ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/30'
                    : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.category}</span>
              </SpecularButton>
            );
          })}
        </div>

        {/* Globe Symbol Language Selector Button & Dropdown */}
        <div className="relative self-end sm:self-auto shrink-0 z-30">
          <SpecularButton
            radius={12}
            lineColor="#38bdf8"
            baseColor="#0f172a"
            intensity={0.6}
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all text-xs font-bold shadow-xs"
            title="Switch AI Language (English, Malayalam, Hindi)"
          >
            <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="text-[11px] font-extrabold">{activeLangObj.short}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangDropdownOpen ? 'rotate-180 text-cyan-500' : ''}`} />
          </SpecularButton>

          <AnimatePresence>
            {isLangDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-40 space-y-1 text-xs"
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
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{lang.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Suggested Prompts for Active Category */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORIZED_PROMPTS[activeCategory].prompts.map((prompt, idx) => (
          <SpecularButton
            key={idx}
            radius={12}
            lineColor="#38bdf8"
            baseColor="#0f172a"
            intensity={0.5}
            onClick={() => onSendMessage(prompt, selectedLanguage)}
            disabled={isLoading}
            className="shrink-0 px-3.5 py-1.5 bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 shadow-xs transition-all text-xs font-medium"
          >
            "{prompt}"
          </SpecularButton>
        ))}
      </div>

      {/* Main Input Box Wrapped in React Bits BorderGlow Edge Proximity Glow */}
      <BorderGlow
        edgeSensitivity={30}
        glowColor="190 90 60"
        backgroundColor="rgba(15, 23, 42, 0.85)"
        borderRadius={22}
        glowRadius={30}
        glowIntensity={1.2}
        coneSpread={25}
        animated={false}
        colors={['#38bdf8', '#818cf8', '#c084fc']}
      >
        <div className="relative p-2.5 flex items-end gap-2 w-full">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? '🎙️ Listening... Speak your question now...'
                : `Ask AskCET in ${selectedLanguage} (academic rules, exam dates, hostel policies)...`
            }
            disabled={isLoading}
            rows={2}
            className="w-full bg-transparent resize-none px-3 py-1 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none max-h-32"
          />

          {/* Speech-to-Text Voice Mic Specular Button */}
          <SpecularButton
            radius={12}
            lineColor={isListening ? '#f43f5e' : '#38bdf8'}
            baseColor={isListening ? '#be123c' : '#1e293b'}
            intensity={isListening ? 1.5 : 0.6}
            onClick={toggleListening}
            disabled={isLoading}
            className={`p-2.5 transition-all shrink-0 border ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse border-rose-400 shadow-md shadow-rose-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 border-slate-200 dark:border-slate-700/60'
            }`}
            title={isListening ? 'Stop recording voice' : 'Speak question using Voice Mic'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </SpecularButton>

          {/* Send Specular Button */}
          <SpecularButton
            radius={12}
            lineColor="#38bdf8"
            baseColor="#0284c7"
            intensity={1.2}
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-11 h-11 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
          </SpecularButton>
        </div>
      </BorderGlow>
    </div>
  );
}
