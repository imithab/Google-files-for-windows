import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { StorageAnalysisData, FileItem } from '../../types';
import { formatFileSize } from '../../utils/fileSystemLogic';

interface StorageViewProps {
  storageData: StorageAnalysisData | null;
  onOpenFile: (file: FileItem) => void;
  onRevealInFolder: (file: FileItem) => void;
  onCleanStorage: (itemPaths: string[]) => void;
}

export const StorageView: React.FC<StorageViewProps> = ({
  storageData,
  onOpenFile,
  onRevealInFolder,
  onCleanStorage,
}) => {
  const [cleaningSuccess, setCleaningSuccess] = React.useState(false);

  if (!storageData) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-400 font-sans">
        Loading storage analysis...
      </div>
    );
  }

  const primaryDrive = storageData.drives[0];
  const usedPercent = primaryDrive ? Math.round((primaryDrive.usedBytes / primaryDrive.totalBytes) * 100) : 33;

  const handleExecuteCleanup = (items: FileItem[]) => {
    const paths = items.map((i) => i.path);
    onCleanStorage(paths);
    setCleaningSuccess(true);
    setTimeout(() => setCleaningSuccess(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-6xl mx-auto space-y-8 select-none font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-neutral-800 dark:text-neutral-100 flex items-center gap-2.5 font-display tracking-tight">
          <MaterialIcon name="pie_chart" size={26} className="text-[#0b57d0] dark:text-[#a8c7fa]" />
          <span>Storage Analysis</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-1 font-sans">
          Detailed drive consumption, category distribution, duplicate detection, and safe disk cleanup.
        </p>
      </div>

      {cleaningSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-medium animate-in fade-in font-sans">
          <MaterialIcon name="check_circle" fill size={20} className="text-emerald-600" />
          <span>Selected cleanup operation completed successfully. Disk space reclaimed!</span>
        </div>
      )}

      {/* Drive Capacity Card */}
      {primaryDrive && (
        <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e2124] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MaterialIcon name="hard_drive" fill size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 font-sans">
                  {primaryDrive.name}
                </h3>
                <span className="text-xs text-neutral-500 font-sans">
                  {formatFileSize(primaryDrive.usedBytes)} used of {formatFileSize(primaryDrive.totalBytes)} ({usedPercent}%)
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 font-sans">
                {formatFileSize(primaryDrive.freeBytes)} Available
              </span>
            </div>
          </div>

          {/* Segmented Category Bar */}
          <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex shadow-inner">
            {storageData.breakdown.map((b) => {
              const segPercent = (b.bytes / primaryDrive.totalBytes) * 100;
              return (
                <div
                  key={b.category}
                  style={{ width: `${Math.max(segPercent, 1.5)}%`, backgroundColor: b.color }}
                  title={`${b.label}: ${formatFileSize(b.bytes)}`}
                />
              );
            })}
            <div className="flex-1 bg-neutral-200 dark:bg-neutral-700" title="Free Space" />
          </div>

          {/* Category Legends */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-sans">
            {storageData.breakdown.map((b) => (
              <div key={b.category} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                <div className="min-w-0">
                  <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate">{b.label}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">{formatFileSize(b.bytes)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Cleanup Review Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2 font-sans">
          <MaterialIcon name="auto_awesome" fill size={18} className="text-blue-600" />
          <span>Safe Cleanup Opportunities</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {storageData.cleanupCandidates.map((cand) => (
            <div
              key={cand.id}
              className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e2124] flex flex-col justify-between shadow-xs space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-100 font-sans">
                    {cand.title}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono">
                    +{formatFileSize(cand.reclaimBytes)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                  {cand.description}
                </p>
                <div className="mt-2 text-[11px] text-neutral-400 font-sans">
                  {cand.items.length} {cand.items.length === 1 ? 'file' : 'files'} identified
                </div>
              </div>

              <button
                onClick={() => handleExecuteCleanup(cand.items)}
                className="w-full py-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 font-semibold text-xs text-neutral-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-2 font-sans"
              >
                <MaterialIcon name="delete" size={16} />
                <span>Clean {formatFileSize(cand.reclaimBytes)}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Duplicate Candidates */}
      {storageData.duplicateGroups.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2 font-sans">
            <MaterialIcon name="content_copy" size={18} className="text-amber-500" />
            <span>Duplicate File Candidates</span>
          </h2>

          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e2124] divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
            {storageData.duplicateGroups.map((group, idx) => (
              <div key={idx} className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {group.items[0].name} ({group.items.length} copies)
                  </span>
                  <span className="text-neutral-400 font-mono">
                    {formatFileSize(group.size)} each · Reclaimable: {formatFileSize(group.potentialReclaimBytes)}
                  </span>
                </div>

                <div className="space-y-1.5 pl-3 border-l-2 border-amber-400 dark:border-amber-600">
                  {group.items.map((item, i) => (
                    <div key={item.path} className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span className="font-mono truncate max-w-lg">{item.path}</span>
                      <div className="flex items-center gap-2 font-sans">
                        {i === 0 ? (
                          <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-600">Original</span>
                        ) : (
                          <button
                            onClick={() => handleExecuteCleanup([item])}
                            className="text-red-500 hover:underline font-medium"
                          >
                            Remove Duplicate
                          </button>
                        )}
                        <button
                          onClick={() => onRevealInFolder(item)}
                          className="p-1 hover:text-neutral-800 dark:hover:text-neutral-200"
                        >
                          <MaterialIcon name="folder_open" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Largest Files Table */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-sans">
          Largest Files on Disk
        </h2>

        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e2124] overflow-hidden">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400">
                <th className="py-2.5 px-4">File Name</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-4 text-right">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {storageData.largestFiles.map((file) => (
                <tr
                  key={file.id}
                  onClick={() => onOpenFile(file)}
                  className="hover:bg-neutral-50 dark:hover:bg-[#282b2e] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-4 font-medium text-neutral-800 dark:text-neutral-100 truncate max-w-xs">
                    {file.name}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400 font-mono text-[11px] truncate max-w-xs">
                    {file.path}
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500 capitalize">{file.category}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-neutral-800 dark:text-neutral-200 font-semibold">
                    {formatFileSize(file.size)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
