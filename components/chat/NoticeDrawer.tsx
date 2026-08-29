'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, BellRing, Clock, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

interface NoticeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (promptText: string) => void;
}

interface DeadlineItem {
  title: string;
  department: string;
  deadlineDate: string;
  daysLeft: number;
  category: string;
  promptText: string;
}

const UPCOMING_DEADLINES: DeadlineItem[] = [
  {
    title: 'B.Tech S6 Exam Registration & Fee Payment',
    department: 'Academic Office',
    deadlineDate: '30 August 2026',
    daysLeft: 1,
    category: 'Examinations',
    promptText: 'What is the B.Tech S6 Exam Registration deadline and fee payment procedure?',
  },
  {
    title: 'Hostel Odd Semester Mess Fee Clearance',
    department: 'Hostel Administration',
    deadlineDate: '05 September 2026',
    daysLeft: 7,
    category: 'Hostel',
    promptText: 'What are the rules and deadline for hostel mess fee clearance?',
  },
  {
    title: 'MCM & e-Grantz Scholarship Portal Application',
    department: 'Scholarship Desk',
    deadlineDate: '15 September 2026',
    daysLeft: 17,
    category: 'Scholarships',
    promptText: 'What scholarships are available and how to apply for MCM and e-Grantz?',
  },
];

export default function NoticeDrawer({ isOpen, onClose, onSelectPrompt }: NoticeDrawerProps) {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/admin/documents')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.documents) {
            setNotices(data.documents.filter((d: any) => d.fileType === 'notice'));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40"
          />

          {/* Side Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-[#090d16] border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl transition-colors duration-300"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                <BellRing className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Campus Deadlines & Notices</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Active Countdowns Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Upcoming Deadlines
                  </span>
                  <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-pulse" /> Live Tracker
                  </span>
                </div>

                <div className="space-y-2.5">
                  {UPCOMING_DEADLINES.map((item, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        if (onSelectPrompt) onSelectPrompt(item.promptText);
                        onClose();
                      }}
                      className="bg-slate-50 dark:bg-slate-900/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-cyan-500/40 transition-all space-y-2 group shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200 dark:border-cyan-500/20">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                          {item.daysLeft === 1 ? '1 Day Left' : `${item.daysLeft} Days Left`}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {item.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                        <span>{item.department}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          {item.deadlineDate} <ArrowRight className="w-3 h-3 text-cyan-500 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Official Published Notices Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Admin Published Notices ({notices.length})
                  </span>
                </div>

                {notices.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 font-medium">
                    No official campus notices published yet.
                  </div>
                ) : (
                  notices.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (onSelectPrompt) onSelectPrompt(`Tell me details about: ${n.title}`);
                        onClose();
                      }}
                      className="bg-slate-50 dark:bg-slate-900/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-cyan-500/40 transition-all space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                          {n.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {n.department} • Category: {n.category}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
