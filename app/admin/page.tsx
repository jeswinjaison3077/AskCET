'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import DocumentUpload from '@/components/admin/DocumentUpload';
import DocumentTable, { DocumentRecord } from '@/components/admin/DocumentTable';
import { Database, FileCheck, Layers, RefreshCw, ShieldAlert, BarChart3, MessageSquare, ThumbsUp, Users, PieChart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  metrics: {
    totalUsers: number;
    totalConversations: number;
    totalMessages: number;
    totalDocuments: number;
    totalChunks: number;
    upvotes: number;
    downvotes: number;
    satisfactionRate: number;
  };
  recentFeedback: Array<{
    id: string;
    type: string;
    user: { name: string; email: string };
    message: { content: string };
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'analytics'>('documents');
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchAnalytics();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/documents');
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch {
      // Ignore
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        fetchAnalytics();
      }
    } catch {
      // Ignore delete error
    }
  };

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/80 dark:bg-[#060810] transition-colors duration-500">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Admin Access Required</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md font-medium">
            You are signed in with a Student account. Please log in with an Administrator account (`admin@college.edu`) to manage documents & analytics.
          </p>
        </div>
      </div>
    );
  }

  const totalChunks = documents.reduce((acc, d) => acc + (d._count?.chunks || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80 dark:bg-[#060810] transition-colors duration-500 relative overflow-hidden">
      {/* Ambient Backdrop Blurs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header & Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50/90 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-500/30 text-xs font-black mb-2 shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> Administrative Portal
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">AskCET Admin Portal</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              Manage knowledge documents, publish campus notices, and track AI analytics & student satisfaction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* iOS Style Floating Tab Bar */}
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-inner text-xs font-bold">
              <button
                onClick={() => setActiveTab('documents')}
                className={`relative px-4 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === 'documents'
                    ? 'text-cyan-700 dark:text-cyan-300 font-extrabold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {activeTab === 'documents' && (
                  <motion.div
                    layoutId="adminActiveTab"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                Document & Notices
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`relative px-4 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === 'analytics'
                    ? 'text-cyan-700 dark:text-cyan-300 font-extrabold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {activeTab === 'analytics' && (
                  <motion.div
                    layoutId="adminActiveTab"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700/80 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                Analytics & Insights
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fetchDocuments();
                fetchAnalytics();
              }}
              className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-xs backdrop-blur-md"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-600 dark:text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 shadow-xl dark:shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold shadow-md">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-extrabold">Total Knowledge Items</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{documents.length}</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 shadow-xl dark:shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-md">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-extrabold">Vector Chunks Indexed</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{totalChunks}</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 shadow-xl dark:shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-md">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-extrabold">Satisfaction Score</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {analytics?.metrics.satisfactionRate ?? 100}%
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-4 shadow-xl dark:shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-md">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-extrabold">Vector Database</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Active</div>
            </div>
          </motion.div>
        </div>

        {/* Tab 1: Documents & Notices */}
        {activeTab === 'documents' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <DocumentUpload onUploadSuccess={() => { fetchDocuments(); fetchAnalytics(); }} />
            <DocumentTable documents={documents} onDelete={handleDeleteDocument} />
          </motion.div>
        )}

        {/* Tab 2: Analytics & Insights */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 space-y-2 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400">
                  <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Total Registered Users
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.metrics.totalUsers ?? 0}</div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 space-y-2 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400">
                  <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Total Student Queries
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.metrics.totalMessages ?? 0}</div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 space-y-2 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400">
                  <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Upvotes vs Downvotes
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  👍 {analytics?.metrics.upvotes ?? 0} <span className="text-slate-400 font-normal text-lg">/ 👎 {analytics?.metrics.downvotes ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Satisfaction Rate Progress */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-white">
                  <PieChart className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Student Answer Satisfaction Index
                </div>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{analytics?.metrics.satisfactionRate ?? 100}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${analytics?.metrics.satisfactionRate ?? 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
