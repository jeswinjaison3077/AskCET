'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import DocumentUpload from '@/components/admin/DocumentUpload';
import DocumentTable, { DocumentRecord } from '@/components/admin/DocumentTable';
import { Database, FileCheck, Layers, RefreshCw, ShieldAlert, BarChart3, MessageSquare, ThumbsUp, Users, PieChart } from 'lucide-react';
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
      <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-[#070a12] transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Admin Access Required</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
            You are signed in with a Student account. Please log in with an Administrator account (`admin@college.edu`) to manage documents & analytics.
          </p>
        </div>
      </div>
    );
  }

  const totalChunks = documents.reduce((acc, d) => acc + (d._count?.chunks || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-[#070a12] transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">AskCET Admin Portal</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage knowledge documents, publish campus notices, and track AI analytics & student satisfaction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'documents'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Document & Notices
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Analytics & Insights
              </button>
            </div>

            <button
              onClick={() => {
                fetchDocuments();
                fetchAnalytics();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-md dark:shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">Total Knowledge Items</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{documents.length}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-md dark:shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">Vector Chunks Indexed</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{totalChunks}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-md dark:shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">Satisfaction Score</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {analytics?.metrics.satisfactionRate ?? 100}%
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-md dark:shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">Vector Database</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Active</div>
            </div>
          </div>
        </div>

        {/* Tab 1: Documents & Notices */}
        {activeTab === 'documents' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <DocumentUpload onUploadSuccess={() => { fetchDocuments(); fetchAnalytics(); }} />
            <DocumentTable documents={documents} onDelete={handleDeleteDocument} />
          </motion.div>
        )}

        {/* Tab 2: Analytics & Insights */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Total Registered Users
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.metrics.totalUsers ?? 0}</div>
              </div>

              <div className="bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Total Student Queries
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{analytics?.metrics.totalMessages ?? 0}</div>
              </div>

              <div className="bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Upvotes vs Downvotes
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  👍 {analytics?.metrics.upvotes ?? 0} <span className="text-slate-400 font-normal text-lg">/ 👎 {analytics?.metrics.downvotes ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Satisfaction Rate Progress */}
            <div className="bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg">
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
