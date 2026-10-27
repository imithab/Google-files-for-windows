import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { formatFileSize, formatDate } from '../../utils/fileSystemLogic';

interface DocumentsViewProps {
  documents: FileItem[];
  onOpenDocument: (doc: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onOpenDocument,
  onContextMenu,
}) => {
  const [filterType, setFilterType] = React.useState<string>('all');

  const filtered = React.useMemo(() => {
    if (filterType === 'all') return documents;
    if (filterType === 'pdf') return documents.filter((d) => d.extension === 'pdf');
    if (filterType === 'code') return documents.filter((d) => ['cpp', 'cc', 'c', 'h', 'hpp', 'java', 'py', 'go', 'js', 'ts', 'tsx', 'json', 'sh', 'sql', 'rs'].includes(d.extension));
    if (filterType === 'word') return documents.filter((d) => ['doc', 'docx', 'rtf'].includes(d.extension));
    if (filterType === 'sheet') return documents.filter((d) => ['xls', 'xlsx', 'csv'].includes(d.extension));
    if (filterType === 'text') return documents.filter((d) => ['txt', 'md', 'markdown'].includes(d.extension));
    return documents;
  }, [documents, filterType]);

  const getDocIcon = (ext: string) => {
    if (ext === 'pdf') return <MaterialIcon name="picture_as_pdf" fill size={22} className="text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <MaterialIcon name="article" fill size={22} className="text-blue-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <MaterialIcon name="table_chart" fill size={22} className="text-emerald-500" />;
    if (['md', 'txt'].includes(ext)) return <MaterialIcon name="description" fill size={22} className="text-neutral-500" />;
    if (['cpp', 'cc', 'c', 'h', 'hpp'].includes(ext)) return <MaterialIcon name="memory" fill size={22} className="text-blue-600" />;
    if (ext === 'java') return <MaterialIcon name="coffee" fill size={22} className="text-amber-600" />;
    if (ext === 'py') return <MaterialIcon name="terminal" fill size={22} className="text-emerald-600" />;
    if (ext === 'go') return <MaterialIcon name="cloud_sync" fill size={22} className="text-cyan-600" />;
    return <MaterialIcon name="code" size={22} className="text-purple-500" />;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none bg-neutral-50/50 dark:bg-[#191c1e] font-sans">
      {/* Category Tabs with Material 3 pills */}
      <div className="px-6 py-2.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-[#1e2124]/70 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'code', label: 'Code (C++, Java, Py, Go)' },
            { id: 'text', label: 'Markdown & Text' },
            { id: 'sheet', label: 'Spreadsheets' },
            { id: 'pdf', label: 'PDFs' },
            { id: 'word', label: 'Word' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium font-sans transition-all ${
                filterType === tab.id
                  ? 'bg-[#e8f0fe] dark:bg-[#082855] text-[#185abc] dark:text-[#8ab4f8] font-semibold shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-neutral-400 font-sans">
          {filtered.length} {filtered.length === 1 ? 'document' : 'documents'}
        </span>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400">
            <MaterialIcon name="description" size={48} className="text-neutral-300 dark:text-neutral-700 mb-2" />
            <h3 className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm font-sans">
              No documents found
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Documents from Documents, Desktop, and Downloads appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onOpenDocument(doc)}
                onContextMenu={(e) => onContextMenu(e, doc)}
                className="group p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1e2124] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getDocIcon(doc.extension)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs text-neutral-800 dark:text-neutral-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-sans">
                      {doc.name}
                    </h4>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-1 font-sans">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>·</span>
                      <span className="uppercase text-[10px] font-mono">{doc.extension}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-sans">
                  <span>Modified {formatDate(doc.mtime)}</span>
                  <MaterialIcon name="open_in_new" size={16} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
