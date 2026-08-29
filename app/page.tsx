'use client';

import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import { Sparkles, ShieldCheck, BookOpen, Cpu, ArrowRight, Database, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a12]">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold shadow-xs mb-8"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Retrieval-Augmented Generation (RAG) v1.0</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.15]"
        >
          Your AI College Assistant Grounded in <span className="gradient-text">Official Campus Documents</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed font-normal"
        >
          AskCET answers your questions on academic regulations, exam timetables, hostel rules, fee breakdowns, and scholarships with instant, verifiable document citations.
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
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-98"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Start Asking Questions</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login?mode=signup"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card text-slate-200 hover:text-white font-bold text-base border border-slate-700/80 hover:border-slate-600 flex items-center justify-center transition-all hover:scale-105"
          >
            Create Student Account
          </Link>
        </motion.div>

        {/* RAG Pipeline Workflow Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 w-full max-w-5xl glass-panel rounded-3xl p-8 border border-slate-800 text-left shadow-2xl shadow-black/60"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">How AskCET RAG Works Under the Hood</h2>
              <p className="text-xs text-slate-400 font-medium">4-Stage Pipeline for Zero Hallucination Campus Q&A</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-extrabold text-xs mb-3 shadow-sm">1</div>
              <h3 className="font-bold text-sm text-white mb-1">Document Ingestion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">PDFs & DOCX files are parsed, text cleaned, and split into semantic chunks.</p>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs mb-3 shadow-sm">2</div>
              <h3 className="font-bold text-sm text-white mb-1">768-Dim Embeddings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Gemini <code className="text-cyan-300 font-semibold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">text-embedding-004</code> builds vector representations.</p>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs mb-3 shadow-sm">3</div>
              <h3 className="font-bold text-sm text-white mb-1">Similarity Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Cosine distance similarity retrieves Top-5 relevant handbook chunks in ms.</p>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs mb-3 shadow-sm">4</div>
              <h3 className="font-bold text-sm text-white mb-1">Grounded Response</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Gemini streams verified answers with precise document page citations.</p>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-2xl border border-slate-800 shadow-xl"
          >
            <BookOpen className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="font-extrabold text-lg text-white mb-2">Verifiable Citations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Every response links directly to the underlying college circular, regulations handbook, or notice page.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-2xl border border-slate-800 shadow-xl"
          >
            <ShieldCheck className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="font-extrabold text-lg text-white mb-2">Role-Based Access</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Students query the assistant seamlessly; administrators gain full control over document indexing and updates.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-6 rounded-2xl border border-slate-800 shadow-xl"
          >
            <Database className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-extrabold text-lg text-white mb-2">Vector Similarity Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Industrial-grade vector similarity search for fast, accurate retrieval across all campus documents.</p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16]/80 py-6 text-center text-xs text-slate-400 font-medium">
        AskCET Knowledge Platform — Grounded College Assistant built with Next.js 14, Tailwind CSS & Google Gemini API
      </footer>
    </div>
  );
}
