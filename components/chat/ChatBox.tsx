'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Loader2, BookOpen, Home, Calendar, CreditCard, Mic, MicOff, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  { code: 'English', short: 'EN', label: 'EN • English' },
  { code: 'Malayalam', short: 'ML', label: 'ML • മലയാളം' },
  { code: 'Hindi', short: 'HI', label: 'HI • हिंदी' },
];

export default function ChatBox({ onSendMessage, isLoading }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const baseInputRef = useRef<string>('');
  const finalTranscriptRef = useRef<string>('');

  const stopListeningInternal = () => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
  };

  const toggleListening = async () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recording is supported in Google Chrome, Microsoft Edge, and Safari. Please use a supported browser.');
      return;
    }

    if (isListeningRef.current) {
      stopListeningInternal();
    } else {
      try {
        // Save base input text so we append speech onto existing text smoothly
        baseInputRef.current = input;
        finalTranscriptRef.current = '';

        // Request active audio stream permissions upfront
        let stream: MediaStream | null = null;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
          } catch (micErr: any) {
            console.warn('Microphone permission error:', micErr);
            alert('Microphone permission was denied. Please allow microphone access in your browser settings (click lock icon next to URL).');
            return;
          }
        }

        const startRecognitionEngine = () => {
          try {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = selectedLanguage === 'Malayalam' ? 'ml-IN' : selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-US';

            rec.onstart = () => {
              isListeningRef.current = true;
              setIsListening(true);
            };

            rec.onresult = (e: any) => {
              let interimTranscript = '';
              let newFinalSegment = '';

              for (let i = e.resultIndex; i < e.results.length; ++i) {
                const transcriptChunk = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                  newFinalSegment += transcriptChunk + ' ';
                } else {
                  interimTranscript += transcriptChunk;
                }
              }

              if (newFinalSegment) {
                finalTranscriptRef.current += newFinalSegment;
              }

              const prefix = baseInputRef.current ? baseInputRef.current.trim() + ' ' : '';
              const fullSpeechText = (prefix + finalTranscriptRef.current + interimTranscript).trim();
              if (fullSpeechText) {
                setInput(fullSpeechText);
              }
            };

            rec.onerror = (err: any) => {
              console.warn('Speech recognition error:', err.error, err.message);
              if (err.error === 'not-allowed' || err.error === 'permission-denied') {
                alert('Microphone access was denied. Please allow microphone permissions in your browser settings (click lock icon next to URL).');
                stopListeningInternal();
              }
            };

            rec.onend = () => {
              // If user is still actively recording, restart recognition to allow continuous long-form speech like ChatGPT
              if (isListeningRef.current) {
                try {
                  startRecognitionEngine();
                } catch {
                  stopListeningInternal();
                }
              } else {
                stopListeningInternal();
              }
            };

            recognitionRef.current = rec;
            rec.start();
          } catch (engineErr) {
            console.warn('Recognition start exception:', engineErr);
            stopListeningInternal();
          }
        };

        startRecognitionEngine();
      } catch (err) {
        console.warn('Mic start exception:', err);
        stopListeningInternal();
      }
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    if (isListeningRef.current) {
      stopListeningInternal();
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

  const activeLangObj = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

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

      {/* Main Glassmorphic Input Container Wrapped in BorderGlow */}
      <BorderGlow
        edgeSensitivity={30}
        glowColor="190 90 60"
        backgroundColor="rgba(8, 13, 26, 0.95)"
        borderRadius={32}
        glowRadius={35}
        glowIntensity={1.2}
        colors={['#38bdf8', '#818cf8', '#c084fc']}
        className="w-full shadow-2xl shadow-cyan-950/50"
      >
        <div className="relative p-3 sm:p-4 space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask AskCET anything in ${selectedLanguage} (e.g. attendance rules, SGPA formula, hostel curfew)...`}
          rows={2}
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none tracking-wide font-medium leading-relaxed"
        />

        {/* Input Bar Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-cyan-500/20 relative">
          {/* Left Side: Short-Form Language Dropdown & Topic Category Pills */}
          <div className="flex items-center gap-2">
            {/* Language Selector Dropdown (Globe + Short Form EN / ML / HI) */}
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="px-3 py-1.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeLangObj.short}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <AnimatePresence>
                {isLangDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute left-0 bottom-full mb-2 w-36 bg-[#0f172a] border border-cyan-500/40 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1 text-xs backdrop-blur-xl"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl font-bold transition-all flex items-center justify-between cursor-pointer ${
                          selectedLanguage === lang.code
                            ? 'bg-cyan-500/20 text-cyan-300 font-black'
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
      </BorderGlow>
    </div>
  );
}
