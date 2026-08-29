'use client';

import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import LineSidebar from '@/components/animations/LineSidebar';
import { HelpCircle, ChevronDown, BookOpen, Home, Calendar, CreditCard, Sparkles, Award, Briefcase } from 'lucide-react';
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
        q: 'How many credits and activity points are required for B.Tech graduation?',
        a: 'As per KTU / CET academic regulations, B.Tech students must complete a total of 160 credits across 8 semesters along with 100 mandatory Activity Points (earned via NSS, NCC, professional bodies, or cultural participation).',
      },
      {
        q: 'What is the official KTU formula to convert SGPA / CGPA into percentage?',
        a: 'The official formula prescribed by KTU to convert CGPA to percentage is: Percentage Marks = (CGPA - 0.5) × 10.',
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
      {
        q: 'What is the procedure for mess dues clearance and hostel vacant pass?',
        a: 'Students must pay all monthly mess dues by the 10th of every month at the Hostel Office. Before vacating at the end of the year, a No-Dues Certificate must be signed by the Senior Warden.',
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
        a: 'Revaluation applications open within 10 days of result publication. Students can apply via the KTU student portal by paying the prescribed revaluation fee per paper.',
      },
      {
        q: 'When are supplementary exams conducted?',
        a: 'Supplementary examinations are typically held alongside even and odd semester end examinations, as notified by the Controller of Examinations.',
      },
      {
        q: 'Are grace marks awarded for NSS, NCC, or University sports level participation?',
        a: 'Yes, KTU awards up to 5% to 10% grace marks per semester for students representing CET or KTU in state/national sports, NSS special camps, or Republic Day parades.',
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
      {
        q: 'How does the Tuition Fee Waiver (TFW) scheme work at CET?',
        a: '5% of total seats in each branch are reserved under TFW for meritorious students with family annual income below ₹8 Lakhs. Tuition fees are completely waived for selected students.',
      },
    ],
  },
  {
    category: 'Placements & Internships',
    icon: Briefcase,
    color: 'from-purple-500 to-violet-600',
    questions: [
      {
        q: 'What is the CGPA eligibility criterion for campus placement drives?',
        a: 'While requirements vary by company, most tier-1 IT & core recruiters require a minimum CGPA of 6.5 or 7.0 with no standing backlogs at the time of recruitment drives.',
      },
      {
        q: 'How can I obtain an official Internship NOC from the college?',
        a: 'Students can apply for an Internship NOC through the Placement Cell desk by attaching the internship offer letter and HOD recommendation.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSidebarItemClick = (index: number) => {
    setActiveCategoryIndex(index);
    const element = document.getElementById(`faq-cat-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sidebarCategoryTitles = FAQ_CATEGORIES.map((c) => c.category);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80 dark:bg-[#060810] transition-colors duration-500 relative overflow-hidden">
      {/* Ambient Backdrop Blurs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50/90 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-500/30 text-xs font-black shadow-xs backdrop-blur-md">
            <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Campus Knowledge Directory</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Campus Questions</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Find instant verified answers regarding CET academic regulations, hostel curfews, semester exams, and scholarship guidelines.
          </p>
        </motion.div>

        {/* Desktop 2-Column Layout with Clean Proximity LineSidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sticky Left LineSidebar Navigation (Clean text proximity shift, no markers or numbers) */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24 bg-white/70 dark:bg-slate-900/70 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl shadow-xl">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 px-1">
              Topic Sections
            </div>
            <LineSidebar
              items={sidebarCategoryTitles}
              accentColor="#06b6d4"
              textColor="#94a3b8"
              showIndex={false}
              showMarker={false}
              proximityRadius={140}
              maxShift={24}
              falloff="smooth"
              itemGap={18}
              fontSize={0.85}
              smoothing={100}
              defaultActive={activeCategoryIndex}
              onItemClick={(index) => handleSidebarItemClick(index)}
            />
          </div>

          {/* Accordion Categories Content Stream */}
          <div className="lg:col-span-3 space-y-8">
            {FAQ_CATEGORIES.map((cat, catIdx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  id={`faq-cat-${catIdx}`}
                  key={catIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: catIdx * 0.08 }}
                  className="space-y-3 scroll-mt-24"
                >
                  <div className="flex items-center gap-2.5 font-black text-lg text-slate-900 dark:text-white px-1">
                    <div className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-lg shadow-cyan-500/20`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{cat.category}</span>
                  </div>

                  <div className="space-y-3">
                    {cat.questions.map((q, qIdx) => {
                      const itemKey = `${catIdx}-${qIdx}`;
                      const isOpen = !!openItems[itemKey];
                      return (
                        <motion.div
                          key={qIdx}
                          whileHover={{ scale: 1.008 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/40"
                        >
                          <button
                            onClick={() => toggleItem(itemKey)}
                            className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                          >
                            <span className="flex items-start gap-3">
                              <Sparkles className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                              {q.q}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed font-medium"
                              >
                                <div className="bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-inner">
                                  {q.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
