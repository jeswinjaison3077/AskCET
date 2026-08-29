'use client';

import { Calendar, Clock, BellRing, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeadlineItem {
  title: string;
  department: string;
  deadlineDate: string; // e.g. "30 August 2026"
  daysLeft: number;
  category: string;
}

const UPCOMING_DEADLINES: DeadlineItem[] = [
  {
    title: 'B.Tech S6 Exam Registration & Fee Payment',
    department: 'Academic Office',
    deadlineDate: '30 August 2026',
    daysLeft: 1,
    category: 'Examinations',
  },
  {
    title: 'Hostel Odd Semester Mess Fee Clearance',
    department: 'Hostel Administration',
    deadlineDate: '05 September 2026',
    daysLeft: 7,
    category: 'Hostel',
  },
  {
    title: 'MCM & e-Grantz Scholarship Portal Application',
    department: 'Scholarship Desk',
    deadlineDate: '15 September 2026',
    daysLeft: 17,
    category: 'Scholarships',
  },
];

export default function DeadlineWidget() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-2 bg-white dark:bg-slate-900/90 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl transition-colors duration-300">
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2 font-extrabold text-xs text-slate-900 dark:text-white">
          <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Active Campus Deadlines & Notice Countdowns</span>
        </div>
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-500 animate-pulse" /> Live Tracker
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {UPCOMING_DEADLINES.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className="bg-slate-50/80 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-2"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold border border-cyan-200 dark:border-cyan-500/20">
                  {item.category}
                </span>
                <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                  {item.daysLeft === 1 ? '1 Day Left' : `${item.daysLeft} Days Left`}
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight line-clamp-2">{item.title}</h4>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="font-semibold">{item.department}</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{item.deadlineDate}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
