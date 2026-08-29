'use client';

import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import BorderGlow from '@/components/animations/BorderGlow';
import SpecularButton from '@/components/animations/SpecularButton';
import { Sparkles, ShieldCheck, BookOpen, Cpu, ArrowRight, Database, MessageSquare, GraduationCap, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#060810] relative overflow-hidden">
      <Navbar />

      {/* Ambient Spotlights */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col items-center text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black shadow-lg shadow-cyan-950/40 mb-8"
        >
          <GraduationCap className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>College of Engineering Trivandrum (CET) • APJ Abdul Kalam Technological University (KTU)</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.15]"
        >
          AI Knowledge Platform for <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">College of Engineering Trivandrum</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-medium"
        >
          Grounded in official CET campus regulations, B.Tech/M.Tech/MCA/MBA curricula, KTU examination guidelines, hostel office policies, and CET placement statistics.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/chat"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-98 border border-cyan-400/30"
          >
            <MessageSquare className="w-5 h-5 text-cyan-200" />
            <span>Launch CET AI Assistant</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login?mode=signup"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#080d1a]/90 hover:bg-[#0c1428] text-cyan-200 hover:text-white font-extrabold text-sm border border-cyan-500/30 hover:border-cyan-400 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-cyan-950/30"
          >
            Create Student Account
          </Link>
        </motion.div>

        {/* RAG Pipeline Workflow Section wrapped in BorderGlow */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 w-full max-w-5xl"
        >
          <BorderGlow
            edgeSensitivity={30}
            glowColor="190 90 60"
            backgroundColor="rgba(8, 13, 26, 0.92)"
            borderRadius={32}
            glowRadius={35}
            glowIntensity={1.2}
            colors={['#38bdf8', '#818cf8', '#c084fc']}
            className="w-full shadow-2xl shadow-cyan-950/50"
          >
            <div className="p-8 text-left relative overflow-hidden backdrop-blur-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center border border-cyan-400/40 shadow-lg shadow-cyan-500/30">
                  <Cpu className="w-6 h-6 text-cyan-200" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">How AskCET RAG Pipeline Operates</h2>
                  <p className="text-xs text-slate-300 font-extrabold">Industrial 4-Stage Vector Pipeline for Zero Hallucination Campus Answers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#050814] p-5 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-xs mb-3 shadow-md">1</div>
                  <h3 className="font-extrabold text-sm text-white mb-1">CET Document Ingestion</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">Official CET circulars, KTU handbooks, and PDFs are parsed, cleaned, and split into semantic chunks.</p>
                </div>

                <div className="bg-[#050814] p-5 rounded-2xl border border-blue-500/20 hover:border-blue-400/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs mb-3 shadow-md">2</div>
                  <h3 className="font-extrabold text-sm text-white mb-1">Vector Embeddings</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">Gemini <code className="text-cyan-300 font-extrabold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-700/50">text-embedding-004</code> converts text into 768-dimensional vectors.</p>
                </div>

                <div className="bg-[#050814] p-5 rounded-2xl border border-indigo-500/20 hover:border-indigo-400/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs mb-3 shadow-md">3</div>
                  <h3 className="font-extrabold text-sm text-white mb-1">Supabase Hybrid Search</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">Cosine similarity + keyword re-ranking fetches relevant CET handbook chunks in milliseconds.</p>
                </div>

                <div className="bg-[#050814] p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-400/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-xs mb-3 shadow-md">4</div>
                  <h3 className="font-extrabold text-sm text-white mb-1">Verifiable Citation</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">Streams precise answers backed by page-level citations from official CET documents.</p>
                </div>
              </div>
            </div>
          </BorderGlow>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#080d1a]/90 p-6 rounded-3xl border border-cyan-500/25 shadow-xl shadow-cyan-950/40 backdrop-blur-xl"
          >
            <BookOpen className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="font-black text-lg text-white mb-2">Verifiable CET Citations</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">Every answer cites the specific CET regulation handbook, academic calendar, or KTU exam rule.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#080d1a]/90 p-6 rounded-3xl border border-indigo-500/25 shadow-xl shadow-indigo-950/40 backdrop-blur-xl"
          >
            <ShieldCheck className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="font-black text-lg text-white mb-2">CET Admin Governance</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">Students query the assistant seamlessly; CET administrators upload and index new notices in real-time.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#080d1a]/90 p-6 rounded-3xl border border-purple-500/25 shadow-xl shadow-purple-950/40 backdrop-blur-xl"
          >
            <Building2 className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-black text-lg text-white mb-2">Complete CET Scope</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">Covers B.Tech, M.Tech, MCA, MBA, hostel rules, passing criteria, and CET campus placement statistics.</p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#040711]/90 py-6 text-center text-xs text-slate-400 font-extrabold relative z-10">
        College of Engineering Trivandrum (CET) AI Platform — Built with Next.js 14, Tailwind CSS, Supabase & Google Gemini API
      </footer>
    </div>
  );
}
