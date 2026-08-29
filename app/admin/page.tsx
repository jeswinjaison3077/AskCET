'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import DocumentUpload from '@/components/admin/DocumentUpload';
import DocumentTable, { DocumentRecord } from '@/components/admin/DocumentTable';
import { Database, FileCheck, Layers, Users, RefreshCw, ShieldAlert } from 'lucide-react';

export default function AdminDashboardPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    fetchDocuments();
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

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch {
      // Ignore delete error
    }
  };

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
          <p className="text-sm text-slate-400 max-w-md">
            You are signed in with a Student account. Please log in with an Administrator account to manage college knowledge base documents.
          </p>
        </div>
      </div>
    );
  }

  const totalChunks = documents.reduce((acc, d) => acc + (d._count?.chunks || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">AskCET Admin Knowledge Base</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Upload, organize, and monitor college document ingestion & pgvector embeddings.
            </p>
          </div>

          <button
            onClick={fetchDocuments}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Documents</div>
              <div className="text-2xl font-extrabold text-white">{documents.length}</div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Vector Chunks Indexed</div>
              <div className="text-2xl font-extrabold text-white">{totalChunks}</div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Vector Store Status</div>
              <div className="text-2xl font-extrabold text-emerald-400">pgvector Active</div>
            </div>
          </div>
        </div>

        {/* Upload Portal Component */}
        <DocumentUpload onUploadSuccess={fetchDocuments} />

        {/* Document Table Component */}
        <DocumentTable documents={documents} onDelete={handleDeleteDocument} />
      </main>
    </div>
  );
}
