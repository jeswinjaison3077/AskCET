import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import { Sparkles, ShieldCheck, BookOpen, Search, Cpu, ArrowRight, CheckCircle, Database } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Retrieval-Augmented Generation (RAG) v1.0</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Your AI College Assistant Grounded in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Official Campus Documents</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
          Ask CET anything about academic regulations, exam dates, hostel rules, fee breakdowns, and scholarships. Get precise, verifiable answers backed by exact document citations.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/chat"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-brand-600/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span>Start Asking Questions</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login?mode=signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-card text-slate-200 hover:text-white font-semibold text-base border border-slate-700 hover:border-slate-600 flex items-center justify-center transition-all"
          >
            Create Student Account
          </Link>
        </div>

        {/* RAG Core Intelligence Pipeline Banner */}
        <div className="mt-20 w-full max-w-5xl glass-panel rounded-3xl p-8 border border-slate-800 text-left shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-6 h-6 text-brand-400" />
            <h2 className="text-xl font-bold text-white">How AskCET RAG Works Under the Hood</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold mb-3">1</div>
              <h3 className="font-semibold text-sm text-white mb-1">Document Ingestion</h3>
              <p className="text-xs text-slate-400">PDFs & DOCX files are parsed, text cleaned, and split into semantic chunks.</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-3">2</div>
              <h3 className="font-semibold text-sm text-white mb-1">768-Dim Vector Embedding</h3>
              <p className="text-xs text-slate-400">Gemini <code className="text-brand-300">text-embedding-004</code> converts chunks into pgvector embeddings.</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3">3</div>
              <h3 className="font-semibold text-sm text-white mb-1">Similarity Search</h3>
              <p className="text-xs text-slate-400">Cosine distance search retrieves Top-5 relevant handbook chunks in milliseconds.</p>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3">4</div>
              <h3 className="font-semibold text-sm text-white mb-1">Grounded Generation</h3>
              <p className="text-xs text-slate-400">Gemini 1.5 streams answer with page citations and zero hallucination risk.</p>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <BookOpen className="w-8 h-8 text-brand-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">Verifiable Citations</h3>
            <p className="text-xs text-slate-400">Every response links directly to the underlying college circular, regulations handbook, or notice page.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">Role-Based Access</h3>
            <p className="text-xs text-slate-400">Students query the assistant seamlessly; administrators gain full control over document indexing and updates.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <Database className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="font-bold text-lg text-white mb-2">PostgreSQL pgvector</h3>
            <p className="text-xs text-slate-400">Industrial-grade vector similarity search running in local Docker container with low latency.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        AskCET Portfolio Application — Built with Next.js 14, Tailwind CSS, PostgreSQL pgvector & Google Gemini API
      </footer>
    </div>
  );
}
