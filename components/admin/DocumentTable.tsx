'use client';

import { Trash2, FileText, CheckCircle, AlertTriangle, Clock, BellRing } from 'lucide-react';

export interface DocumentRecord {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  category: string;
  department: string;
  version: string;
  status: 'PENDING' | 'PROCESSING' | 'INDEXED' | 'FAILED';
  createdAt: string;
  _count?: {
    chunks: number;
  };
}

interface DocumentTableProps {
  documents: DocumentRecord[];
  onDelete: (id: string) => void;
}

export default function DocumentTable({ documents, onDelete }: DocumentTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg dark:shadow-2xl transition-colors duration-300">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Indexed Knowledge Base & Notices ({documents.length})</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Title / Notice</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5">Vector Chunks</th>
              <th className="px-6 py-3.5">Date Added</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  No college documents or notices indexed yet. Post a notice or upload a file above!
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const isNotice = doc.fileType === 'notice';
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      {isNotice ? (
                        <BellRing className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      )}
                      <div>
                        <div>{doc.title}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{doc.fileName} ({doc.version})</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">{doc.department}</td>
                    <td className="px-6 py-4">
                      {doc.status === 'INDEXED' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" /> Indexed
                        </span>
                      )}
                      {doc.status === 'PROCESSING' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <Clock className="w-3 h-3 animate-spin" /> Indexing
                        </span>
                      )}
                      {doc.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-extrabold">{doc._count?.chunks ?? 0} vectors</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-all"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
