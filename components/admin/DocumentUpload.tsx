'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

const CATEGORIES = [
  'Academics',
  'Examinations',
  'Hostel',
  'Fees',
  'Admissions',
  'Placements',
  'Library',
  'Scholarships',
  'Clubs & Events',
  'General',
];

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academics');
  const [department, setDepartment] = useState('General');
  const [version, setVersion] = useState('v1.0');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('department', department);
    formData.append('version', version);

    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document.');
      }

      setMessage({
        type: 'success',
        text: `Document uploaded and indexed successfully into ${data.chunkCount} vector chunks!`,
      });
      setFile(null);
      setTitle('');
      onUploadSuccess();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center gap-2 font-semibold text-lg text-white">
        <Upload className="w-5 h-5 text-brand-400" />
        <span>Upload Document to AI Knowledge Base</span>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-800/80 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Dropzone */}
        <div className="border-2 border-dashed border-slate-700 hover:border-brand-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors relative bg-slate-900/40">
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-brand-400" />
            {file ? (
              <span className="text-sm font-medium text-emerald-400">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
            ) : (
              <>
                <span className="text-sm text-slate-200 font-medium">Click or drag PDF, DOCX, or TXT file here</span>
                <span className="text-xs text-slate-400">Maximum size: 25MB</span>
              </>
            )}
          </div>
        </div>

        {/* Metadata Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Academic Regulations 2026"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="General, CSE, ECE..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Version Tag</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="v1.0"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-brand-600/20"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Extracting & Indexing Embeddings...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Process & Index Document</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
