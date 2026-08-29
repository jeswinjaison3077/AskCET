'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, BellRing, Calendar, Building2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

const CATEGORIES = [
  'Examinations',
  'Academics',
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
  const [activeTab, setActiveTab] = useState<'notice' | 'file'>('notice');

  // Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('Notice — B.Tech S6 Exam Registration');
  const [noticeDate, setNoticeDate] = useState('25 August 2026');
  const [noticeDept, setNoticeDept] = useState('Academic Office');
  const [noticeCategory, setNoticeCategory] = useState('Examinations');
  const [noticeContent, setNoticeContent] = useState(
    'B.Tech S6 Regular and Supplementary Examination Registration for August/September 2026 is now open. All eligible students must complete course registration and fee payment on the KTU portal on or before 30 August 2026. Hall tickets will be issued at the Academic Office.'
  );

  // File Form State
  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileCategory, setFileCategory] = useState('Academics');
  const [fileDepartment, setFileDepartment] = useState('General');
  const [fileVersion, setFileVersion] = useState('v1.0');

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!fileTitle) {
        setFileTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleNoticeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('isNotice', 'true');
    formData.append('title', noticeTitle);
    formData.append('noticeDate', noticeDate);
    formData.append('department', noticeDept);
    formData.append('category', noticeCategory);
    formData.append('noticeContent', noticeContent);

    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish campus notice.');
      }

      setMessage({
        type: 'success',
        text: `Campus Notice "${noticeTitle}" published and indexed into ${data.chunkCount} vector chunks!`,
      });
      onUploadSuccess();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Publishing failed.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', fileTitle);
    formData.append('category', fileCategory);
    formData.append('department', fileDepartment);
    formData.append('version', fileVersion);

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
        text: `Document "${fileTitle}" uploaded & indexed into ${data.chunkCount} vector chunks!`,
      });
      setFile(null);
      setFileTitle('');
      onUploadSuccess();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-lg dark:shadow-2xl transition-colors duration-300">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 font-extrabold text-lg text-slate-900 dark:text-white">
          <BellRing className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <span>Publish & Index College Knowledge</span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('notice')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'notice'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Post Campus Notice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'file'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF / DOCX / MD</span>
          </button>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Tab 1: Notice Publisher */}
      {activeTab === 'notice' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleNoticeSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Notice Title */}
            <div className="sm:col-span-2">
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Notice Title / Subject
              </label>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="Notice — B.Tech S6 Exam Registration"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            {/* Notice Date */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Date
              </label>
              <input
                type="text"
                value={noticeDate}
                onChange={(e) => setNoticeDate(e.target.value)}
                placeholder="25 August 2026"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Department */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Issuing Department
              </label>
              <input
                type="text"
                value={noticeDept}
                onChange={(e) => setNoticeDept(e.target.value)}
                placeholder="Academic Office, CSE, Hostel Office..."
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Category
              </label>
              <select
                value={noticeCategory}
                onChange={(e) => setNoticeCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notice Details Content */}
          <div className="text-xs">
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Official Notice Content & Guidelines</label>
            <textarea
              rows={4}
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="Enter full notice text, deadlines, instructions, rules..."
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Indexing Notice into Vector Database...</span>
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4" />
                <span>Publish Notice & Index into AI Database</span>
              </>
            )}
          </button>
        </motion.form>
      )}

      {/* Tab 2: File Upload */}
      {activeTab === 'file' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleFileSubmit}
          className="space-y-4"
        >
          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-slate-50/50 dark:bg-slate-950/40">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.markdown"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              {file ? (
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              ) : (
                <>
                  <span className="text-sm text-slate-800 dark:text-slate-200 font-bold">Click or drag PDF, DOCX, TXT, or MD file here</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Maximum size: 25MB</span>
                </>
              )}
            </div>
          </div>

          {/* Metadata Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Document Title</label>
              <input
                type="text"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                placeholder="Academic Regulations 2026"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Category</label>
              <select
                value={fileCategory}
                onChange={(e) => setFileCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Department</label>
              <input
                type="text"
                value={fileDepartment}
                onChange={(e) => setFileDepartment(e.target.value)}
                placeholder="General, CSE, ECE..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Version Tag</label>
              <input
                type="text"
                value={fileVersion}
                onChange={(e) => setFileVersion(e.target.value)}
                placeholder="v1.0"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting & Indexing Embeddings...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Process & Index Document File</span>
              </>
            )}
          </button>
        </motion.form>
      )}
    </div>
  );
}
