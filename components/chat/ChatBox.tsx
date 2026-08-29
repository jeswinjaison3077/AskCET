'use client';

import { useState, KeyboardEvent } from 'react';
import { Send, Sparkles, Loader2, BookOpen, Home, Calendar, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatBoxProps {
  onSendMessage: (message: string) => void;
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

export default function ChatBox({ onSendMessage, isLoading }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {/* Category Pills & Quick Questions */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-500 dark:text-slate-400 shrink-0 font-bold flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" /> Quick Topics:
          </span>
          {CATEGORIZED_PROMPTS.map((cat, i) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === i;
            return (
              <button
                key={i}
                onClick={() => setActiveCategory(i)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 text-xs ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/30'
                    : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.category}</span>
              </button>
            );
          })}
        </div>

        {/* Suggested Prompts for Active Category */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {CATEGORIZED_PROMPTS[activeCategory].prompts.map((prompt, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSendMessage(prompt)}
              disabled={isLoading}
              className="shrink-0 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 shadow-xs transition-all text-xs font-medium"
            >
              "{prompt}"
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Input Box */}
      <div className="relative bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-cyan-500/40 border border-slate-200 dark:border-slate-800 flex items-end gap-2 shadow-2xl transition-colors duration-300">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AskCET anything about academic rules, exam schedules, hostel policies, fees..."
          disabled={isLoading}
          rows={2}
          className="w-full bg-transparent resize-none px-3 py-1 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none max-h-32"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
        </motion.button>
      </div>
    </div>
  );
}
