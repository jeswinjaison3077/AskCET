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
    <div className="bg-[#080d1a]/90 rounded-3xl border border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-950/40 backdrop-blur-xl">
      <div className="px-6 py-4.5 border-b border-cyan-500/20 flex items-center justify-between bg-[#040711]/60">
        <h3 className="font-black text-white text-base">Indexed CET Knowledge Base & Notices ({documents.length})</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-[#040711] text-slate-400 font-extrabold uppercase tracking-wider border-b border-cyan-500/20">
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
          <tbody className="divide-y divide-slate-800/80 font-medium">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-semibold">
                  No college documents or notices indexed yet. Post a notice or upload a file above!
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const isNotice = doc.fileType === 'notice';
                return (
                  <tr key={doc.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-white flex items-center gap-2.5">
                      {isNotice ? (
                        <BellRing className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      <div>
                        <div>{doc.title}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{doc.fileName} ({doc.version})</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-200 font-extrabold border border-cyan-500/30">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-semibold">{doc.department}</td>
                    <td className="px-6 py-4">
                      {doc.status === 'INDEXED' && (
                        <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-black">
                          <CheckCircle className="w-3 h-3 text-emerald-400" /> Indexed
                        </span>
                      )}
                      {doc.status === 'PROCESSING' && (
                        <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-full text-[10px] font-black">
                          <Clock className="w-3 h-3 animate-spin text-amber-400" /> Indexing
                        </span>
                      )}
                      {doc.status === 'FAILED' && (
                        <span className="inline-flex items-center gap-1 text-rose-300 bg-rose-950/80 border border-rose-500/40 px-2.5 py-1 rounded-full text-[10px] font-black">
                          <AlertTriangle className="w-3 h-3 text-rose-400" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-cyan-300 font-black">{doc._count?.chunks ?? 0} vectors</td>
                    <td className="px-6 py-4 text-slate-400 font-medium">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 border border-transparent hover:border-rose-800/60 transition-all"
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
