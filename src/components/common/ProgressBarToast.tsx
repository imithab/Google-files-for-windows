import React from 'react';
import { MaterialIcon } from './MaterialIcon';
import { OperationProgress } from '../../types';

interface ProgressBarToastProps {
  progress: OperationProgress | null;
  onDismiss: () => void;
  onCancel?: () => void;
}

export const ProgressBarToast: React.FC<ProgressBarToastProps> = ({
  progress,
  onDismiss,
  onCancel,
}) => {
  if (!progress) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 w-84 rounded-2xl shadow-xl bg-white/95 dark:bg-[#1e1f20]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700/80 p-3.5 select-none text-xs animate-in slide-in-from-bottom-2 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {progress.status === 'running' ? (
            <MaterialIcon name="sync" size={18} className="text-[#0b57d0] dark:text-[#a8c7fa] animate-spin" />
          ) : progress.status === 'completed' ? (
            <MaterialIcon name="check_circle" size={18} className="text-[#00875a] dark:text-[#81c995]" />
          ) : (
            <MaterialIcon name="warning" size={18} className="text-[#f9ab00]" />
          )}
          <span className="font-medium text-neutral-800 dark:text-neutral-100 capitalize">
            {progress.type === 'scan' ? 'Indexing Files...' : `${progress.type}ing files`}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          <MaterialIcon name="close" size={16} />
        </button>
      </div>

      <div className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono">
        {progress.currentItemName || `${progress.processedItems} of ${progress.totalItems} items`}
      </div>

      <div className="relative mt-2 h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0b57d0] dark:bg-[#a8c7fa] transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {progress.status === 'running' && onCancel && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={onCancel}
            className="text-[11px] text-[#ba1a1a] dark:text-[#ffb4ab] hover:underline font-medium"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
