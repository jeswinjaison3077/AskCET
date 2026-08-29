'use client';

import { Trash2, FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

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
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="font-semibold text-white text-base">Indexed Document Knowledge Base ({documents.length})</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-6 py-3">Document Title</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Chunks</th>
              <th className="px-6 py-3">Uploaded</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  No college documents indexed yet. Upload a document above!
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                    <div>
                      <div>{doc.title}</div>
                      <div className="text-[10px] text-slate-400">{doc.fileName} ({doc.version})</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{doc.department}</td>
                  <td className="px-6 py-4">
                    {doc.status === 'INDEXED' && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-medium">
                        <CheckCircle className="w-3 h-3" /> Indexed
                      </span>
                    )}
                    {doc.status === 'PROCESSING' && (
                      <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-[10px] font-medium">
                        <Clock className="w-3 h-3 animate-spin" /> Processing
                      </span>
                    )}
                    {doc.status === 'FAILED' && (
                      <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded text-[10px] font-medium">
                        <AlertTriangle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-semibold">{doc._count?.chunks ?? 0} vectors</td>
                  <td className="px-6 py-4 text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
