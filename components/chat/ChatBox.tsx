'use client';

import { useState, KeyboardEvent } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface ChatBoxProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const SUGGESTED_PROMPTS = [
  'What is the minimum attendance requirement?',
  'When is the exam registration deadline?',
  'What are the hostel gate timings and rules?',
  'What documents are required for admission?',
];

export default function ChatBox({ onSendMessage, isLoading }: ChatBoxProps) {
  const [input, setInput] = useState('');

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
      {/* Suggested Prompts Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-400" /> Try asking:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <div className="relative glass-panel rounded-2xl p-2 focus-within:ring-2 focus-within:ring-brand-500/50 border border-slate-800 flex items-end gap-2 shadow-2xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about college regulations, exams, hostel, fees..."
          disabled={isLoading}
          rows={2}
          className="w-full bg-transparent resize-none px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none max-h-32"
        />

        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-600/20"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
