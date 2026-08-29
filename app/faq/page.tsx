'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import LineSidebar from '@/components/animations/LineSidebar';
import { HelpCircle, ChevronDown, BookOpen, Home, Calendar, CreditCard, Sparkles, Briefcase } from 'lucide-react';
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
      {
        q: 'What is the maximum number of years allowed to complete B.Tech degree at CET?',
        a: 'As per university guidelines, students admitted to B.Tech must complete all degree requirements within a maximum period of 6 academic years (12 semesters) from the date of admission.',
      },
      {
        q: 'How is SGPA calculated at the end of each semester?',
        a: 'SGPA is calculated by taking the sum of the product of credits and grade points earned in all courses divided by the total sum of credits registered in that semester.',
      },
      {
        q: 'What is the minimum internal evaluation mark required to pass a subject?',
        a: 'Students must secure a minimum of 45% in Internal Assessment (IA) evaluation (continuous evaluation tests, assignments, and tutorials) to be eligible for end semester exams.',
      },
      {
        q: 'How do I apply for course condonation if attendance falls between 65% and 74%?',
        a: 'Condonation applications accompanied by a verified medical certificate and prescribed university fee receipt must be submitted through the HOD to the Academic Office before semester end.',
      },
      {
        q: 'Can I apply for branch transfer after Semester 1?',
        a: 'Branch transfer is permitted after S2 based on merit rank of combined S1/S2 CGPA against vacant seats in target departments, subject to university quota notifications.',
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
      {
        q: 'What are the rules regarding motor vehicle usage inside campus hostels?',
        a: 'First year hostel residents are strictly prohibited from parking personal two-wheelers or cars inside hostel premises. Senior students must register vehicle details with campus security.',
      },
      {
        q: 'What is the procedure to clear mess dues and get mess fee refund for long leaves?',
        a: 'Mess reduction is permitted for continuous approved leaves exceeding 5 consecutive days, provided a leave application is submitted to the Mess Secretary 48 hours in advance.',
      },
      {
        q: 'Where are the main student canteens and central dining facilities located on campus?',
        a: 'The Central CET College Canteen operates near the Administrative Block, with annex canteens located near PG Block, Mens Hostel 1, and Womens Hostel complex.',
      },
      {
        q: 'What are the emergency contact numbers for campus security and health centers?',
        a: 'Campus Security Gate 1 and CET Health Centre medical officers are reachable 24/7 via internal phone extensions or emergency helplines posted at hostel notice boards.',
      },
      {
        q: 'What are the anti-ragging policies and complaint cell contacts at CET?',
        a: 'CET maintains zero tolerance for ragging. Complaints can be filed directly with the Anti-Ragging Committee, HODs, Warden Office, or online via the UGC Anti-Ragging Portal.',
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
      {
        q: 'What is the procedure for obtaining a duplicate hall ticket if lost before exams?',
        a: 'Apply at the Controller of Examinations desk in the Administrative Block with a passport photo and pay the nominal duplicate hall ticket fee before exam commencement.',
      },
      {
        q: 'How many backlogs are allowed before entering 7th semester placement eligibility?',
        a: 'While criteria vary by company, most tier-1 IT & core recruiters permit a maximum of 2 active backlogs during early campus recruitment drives.',
      },
      {
        q: 'What happens if a student misses a series exam due to representational sports/cultural duty?',
        a: 'Special re-series examinations are conducted by respective departments for students on official duty pass representing CET at university/state events.',
      },
      {
        q: 'How do I request a photocopy of my evaluated semester answer scripts?',
        a: 'Apply for evaluated answer script copy on the KTU student portal within 7 days of result announcement after paying the required fee per answer script.',
      },
      {
        q: 'What are the rules regarding university exam hall entry and calculator usage?',
        a: 'Students must arrive 15 mins before exam start. Non-programmable scientific calculators (e.g. Casio fx-991ES) are allowed, while smartwatches and mobile phones are strictly banned.',
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
      {
        q: 'What is the deadline for e-Grantz scholarship renewal for SC/ST/OEC students?',
        a: 'e-Grantz renewals must be submitted within 30 days of entering the new academic year via the e-Grantz 3.0 portal along with income and caste certificates.',
      },
      {
        q: 'Where can I get semester fee extension or installment permission?',
        a: 'Written applications for fee payment extension must be submitted to the Principal through HOD with guardian undertaking prior to the due date.',
      },
      {
        q: 'What is the procedure for claiming caution deposit refund upon graduation?',
        a: 'Submit the completed No-Dues Clearance Form signed by HOD, Library, Hostels, and Accounts Section along with original fee receipt to Counter 2.',
      },
      {
        q: 'Are there financial aid schemes for economically backward general category students?',
        a: 'Yes, CET Alumni Association provides Merit-cum-Means financial assistance and laptop grants to deserving students each academic year.',
      },
      {
        q: 'How can I download official fee breakdown slips for educational loan processing?',
        a: 'Official fee breakdown slips stamped with college seal are issued by Counter 3 upon presenting your CET admission ID card.',
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
      {
        q: 'What companies regularly visit CET for campus recruitment?',
        a: 'Top recruiters visiting CET include TCS, Infosys, Cognizant, L&T, Tata Elxsi, Bosch, Texas Instruments, Oracle, Mahindra, and MRF.',
      },
      {
        q: 'When does the campus placement season officially commence for final year students?',
        a: 'Placement drives officially begin in July at the start of the 7th semester and continue through the 8th semester until graduation.',
      },
      {
        q: 'Is summer internship mandatory for 6th semester B.Tech students?',
        a: 'Yes, a 2 to 4 week industrial training or internship is mandatory between S6 and S7 for industrial exposure credits as per KTU curriculum.',
      },
      {
        q: 'What training programs are organized by Career Guidance & Placement Unit (CGPU)?',
        a: 'CGPU conducts aptitude training, mock technical interviews, coding bootcamps, resume building workshops, and soft skill sessions throughout S5-S7.',
      },
      {
        q: 'What is the policy for students receiving multiple job offers during placement drives?',
        a: 'CET operates a One-Student One-Job policy; once a student receives an offer, they can only apply for higher slab dream companies offering 1.5x salary.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number>(0);
  const [activeYOffset, setActiveYOffset] = useState<number>(0);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSidebarItemClick = (index: number) => {
    setActiveCategoryIndex(index);
    const element = document.getElementById(`faq-cat-${index}`);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  // Real-Time Scroll Observer - Translates active Topic Tile vertically to line up side-by-side with active heading
  useEffect(() => {
    const handleScrollObserver = () => {
      let currentIdx = 0;
      const triggerPosition = window.innerHeight * 0.35;

      FAQ_CATEGORIES.forEach((_, idx) => {
        const el = document.getElementById(`faq-cat-${idx}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerPosition) {
            currentIdx = idx;
          }
        }
      });

      setActiveCategoryIndex(currentIdx);

      const activeHeadingEl = document.getElementById(`faq-cat-${currentIdx}`);
      const gridEl = document.getElementById('faq-grid-container');
      if (activeHeadingEl && gridEl) {
        const gridRect = gridEl.getBoundingClientRect();
        const activeRect = activeHeadingEl.getBoundingClientRect();
        const relativeY = Math.max(0, activeRect.top - gridRect.top);
        setActiveYOffset(relativeY);
      }
    };

    window.addEventListener('scroll', handleScrollObserver, { passive: true });
    handleScrollObserver();
    return () => window.removeEventListener('scroll', handleScrollObserver);
  }, []);

  const sidebarCategoryTitles = FAQ_CATEGORIES.map((c) => c.category);
  const activeCategoryObj = FAQ_CATEGORIES[activeCategoryIndex] || FAQ_CATEGORIES[0];
  const ActiveIcon = activeCategoryObj.icon;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80 dark:bg-[#060810] transition-colors duration-500 relative">
      {/* Ambient Backdrop Blurs */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[450px] h-[450px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

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

        {/* Desktop 2-Column Layout with Vertically Sliding Active Topic Section Tile */}
        <div id="faq-grid-container" className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start relative min-h-[800px]">
          {/* Vertically Sliding Left Sidebar Container that physically moves down to match active heading Y-offset */}
          <div className="hidden lg:block lg:col-span-1 relative h-full">
            <motion.aside
              animate={{ y: activeYOffset }}
              transition={{ type: 'spring', stiffness: 240, damping: 28 }}
              className="bg-white/80 dark:bg-slate-900/80 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl shadow-2xl z-20 w-full space-y-4"
            >
              <div className="flex items-center gap-2 px-1">
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${activeCategoryObj.color} text-white flex items-center justify-center shadow-md`}>
                  <ActiveIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Topic Sections
                </div>
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
                itemGap={16}
                fontSize={0.85}
                smoothing={100}
                defaultActive={activeCategoryIndex}
                onItemClick={(index) => handleSidebarItemClick(index)}
              />
            </motion.aside>
          </div>

          {/* Accordion Categories Content Stream */}
          <div className="lg:col-span-3 space-y-12">
            {FAQ_CATEGORIES.map((cat, catIdx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  id={`faq-cat-${catIdx}`}
                  key={catIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: catIdx * 0.08 }}
                  className="space-y-3 scroll-mt-28"
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
