'use client';

import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { HelpCircle, ChevronDown, BookOpen, Home, Calendar, CreditCard, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_CATEGORIES = [
  {
    category: 'Academics & Attendance',
    icon: BookOpen,
    color: 'from-cyan-500 to-blue-600',
    questions: [
      {
        q: 'What is the minimum attendance required to appear for semester end examinations?',
        a: 'Students must maintain a minimum of 75% attendance in each course to be eligible to appear for semester examinations. Condonation up to 10% may be granted on medical grounds upon submitting a valid certificate to the Academic Office.',
      },
      {
        q: 'How many credits are required for graduation in B.Tech?',
        a: 'As per KTU / CET academic regulations, B.Tech students must complete a total of 160 credits across 8 semesters, including core subjects, electives, lab practicals, and final year projects.',
      },
    ],
  },
  {
    category: 'Hostels & Campus Rules',
    icon: Home,
    color: 'from-indigo-500 to-purple-600',
    questions: [
      {
        q: 'What are the hostel gate timings and curfew rules?',
        a: 'The hostel gate closes at 6:30 PM for first and second year students, and 7:00 PM for senior students. Late entry requires prior written approval from the Resident Warden.',
      },
      {
        q: 'How do I apply for hostel leave or weekend pass?',
        a: 'Hostel leave permissions must be submitted online via the CET Warden Portal at least 24 hours prior to departure, signed by the parents/guardians.',
      },
    ],
  },
  {
    category: 'Examinations & Revaluation',
    icon: Calendar,
    color: 'from-emerald-500 to-teal-600',
    questions: [
      {
        q: 'What is the procedure and fee for semester exam revaluation?',
        a: 'Revaluation applications open within 10 days of result publication. Students can apply via the KTU portal by paying the prescribed revaluation fee per paper.',
      },
      {
        q: 'When are supplementary exams conducted?',
        a: 'Supplementary examinations are typically held alongside even and odd semester end examinations, as notified by the Controller of Examinations.',
      },
    ],
  },
  {
    category: 'Fees, Scholarships & Grants',
    icon: CreditCard,
    color: 'from-amber-500 to-orange-600',
    questions: [
      {
        q: 'What scholarships are available for CET students?',
        a: 'Eligible students can apply for Central Sector Scholarships, MCM Scholarship, e-Grantz for SC/ST/OEC students, and Alumni Association Merit Scholarships.',
      },
      {
        q: 'Where can I get fee structure receipts and Bonafide certificates?',
        a: 'Bonafide and fee structure certificates can be requested at the Academic Counter 3 or downloaded from the student portal.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-[#070a12] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 text-xs font-bold">
            <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Campus Knowledge Directory</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Campus Questions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Find instant verified answers regarding CET academic regulations, hostel curfews, semester exams, and scholarship guidelines.
          </p>
        </div>

        {/* Accordion Categories */}
        <div className="space-y-6">
          {FAQ_CATEGORIES.map((cat, catIdx) => {
            const Icon = cat.icon;
            return (
              <div key={catIdx} className="space-y-3">
                <div className="flex items-center gap-2 font-black text-base text-slate-900 dark:text-white px-1">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{cat.category}</span>
                </div>

                <div className="space-y-3">
                  {cat.questions.map((q, qIdx) => {
                    const itemKey = `${catIdx}-${qIdx}`;
                    const isOpen = !!openItems[itemKey];
                    return (
                      <div
                        key={qIdx}
                        className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => toggleItem(itemKey)}
                          className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        >
                          <span className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                            {q.q}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed font-medium"
                            >
                              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60">
                                {q.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
