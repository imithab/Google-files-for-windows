import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { formatFileSize, formatDate } from '../../utils/fileSystemLogic';

interface SearchViewProps {
  query: string;
  results: FileItem[];
  onOpenFile: (file: FileItem) => void;
  onRevealInFolder: (file: FileItem) => void;
  onSelectQueryHint: (hint: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  query,
  results,
  onOpenFile,
  onRevealInFolder,
  onSelectQueryHint,
}) => {
  const hints = [
    { label: 'type:image', desc: 'Find photos & images', icon: 'photo_library' },
    { label: 'type:video', desc: 'Find video clips', icon: 'movie' },
    { label: 'type:pdf', desc: 'Find PDF documents', icon: 'picture_as_pdf' },
    { label: 'name:screenshot', desc: 'Name contains screenshot', icon: 'screenshot_monitor' },
    { label: 'size:large', desc: 'Files larger than 100 MB', icon: 'folder_zip' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto space-y-6 select-none font-sans">
      {/* Search Header */}
      <div>
        <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
          <MaterialIcon name="search" size={24} className="text-[#0b57d0] dark:text-[#a8c7fa]" />
          <span>Search Results</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          {query ? `Found ${results.length} files matching "${query}"` : 'Enter a query or select a Google search filter to begin.'}
        </p>
      </div>

      {/* Syntax Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-500 font-medium mr-1">Quick Filters:</span>
        {hints.map((h) => (
          <button
            key={h.label}
            onClick={() => onSelectQueryHint(h.label)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-[#e8f0fe] dark:hover:bg-[#004a77] text-xs font-mono text-[#0b57d0] dark:text-[#a8c7fa] transition-colors"
            title={h.desc}
          >
            <MaterialIcon name={h.icon} size={14} />
            <span>{h.label}</span>
          </button>
        ))}
      </div>

      {/* Results List */}
      {results.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400">
          <div className="w-16 h-16 rounded-full bg-[#f1f3f4] dark:bg-neutral-800 flex items-center justify-center mb-3">
            <MaterialIcon name="manage_search" size={32} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">
            {query ? 'No matching files found' : 'Type in the search bar above'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Search looks through filenames, extensions, and metadata across all indexed directories.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 shadow-xs">
          {results.map((file) => (
            <div
              key={file.id}
              onClick={() => onOpenFile(file)}
              className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#f8fafd] dark:hover:bg-neutral-800/60 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {file.category === 'photo' && file.mediaUrl ? (
                    <img src={file.mediaUrl} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <MaterialIcon
                      name={
                        file.category === 'photo' ? 'image' :
                        file.category === 'video' ? 'movie' :
                        file.category === 'audio' ? 'music_note' :
                        file.category === 'document' ? 'description' : 'insert_drive_file'
                      }
                      size={20}
                      className={
                        file.category === 'photo' ? 'text-rose-500' :
                        file.category === 'video' ? 'text-amber-500' :
                        file.category === 'audio' ? 'text-emerald-500' :
                        'text-[#0b57d0]'
                      }
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa] transition-colors">
                    {file.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono truncate mt-0.5">
                    {file.path}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="text-neutral-400">{formatFileSize(file.size)}</span>
                <span className="text-neutral-400 hidden sm:inline">{formatDate(file.mtime)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevealInFolder(file);
                  }}
                  className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  title="Reveal in Folder"
                >
                  <MaterialIcon name="folder_open" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

