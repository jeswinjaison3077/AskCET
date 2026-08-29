'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import { Search, FileText, BellRing, BookOpen, Filter, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DocumentResult {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  category: string;
  department: string;
  version: string;
  status: string;
  createdAt: string;
  _count?: { chunks: number };
}

const CATEGORIES = ['All', 'Academics', 'Examinations', 'Hostel', 'Fees', 'Admissions', 'General'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [documents, setDocuments] = useState<DocumentResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSearchResults();
  }, [selectedCategory]);

  const fetchSearchResults = async (searchQuery: string = query) => {
    setLoading(true);
    try {
      const catParam = selectedCategory === 'All' ? '' : selectedCategory;
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(catParam)}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSearchResults(query);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-[#070a12] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Campus Knowledge Search</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Search College Documents & Notices
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search across indexed academic regulations, exam circulars, hostel rules, fee structures, and campus notices.
          </p>
        </div>

        {/* Search Bar & Filters */}
        <form onSubmit={handleSearchSubmit} className="space-y-4 max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword, notice title, department (e.g. S6 Exam, Attendance, Hostel)..."
              className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-28 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 shadow-xl transition-all font-medium"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold shadow-md transition-all"
            >
              Search
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Filter:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </form>

        {/* Results List */}
        <div className="space-y-3 max-w-4xl mx-auto pt-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
            <span>Found {documents.length} Indexed Knowledge Items</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm font-semibold animate-pulse">
              Searching college vector database...
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              No matching documents or notices found. Try a different search keyword!
            </div>
          ) : (
            documents.map((doc) => {
              const isNotice = doc.fileType === 'notice';
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900/90 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl flex items-start gap-4 hover:border-cyan-500/40 transition-all"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isNotice ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                  }`}>
                    {isNotice ? <BellRing className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{doc.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {doc.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Indexed
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Department: <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.department}</span> • Version: <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.version}</span> • {doc._count?.chunks || 0} Vector Chunks
                    </p>

                    <div className="text-[11px] text-slate-400 pt-1">
                      Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
