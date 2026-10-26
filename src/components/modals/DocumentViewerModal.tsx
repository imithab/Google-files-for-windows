import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { api } from '../../services/api';
import { formatFileSize, formatDate } from '../../utils/fileSystemLogic';

interface DocumentViewerModalProps {
  currentDocument: FileItem | null;
  onClose: () => void;
  onRevealInFolder: (doc: FileItem) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  currentDocument,
  onClose,
  onRevealInFolder,
}) => {
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!currentDocument) return;
    setLoading(true);
    api
      .getTextContent(currentDocument.path)
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setContent('This document cannot be previewed in plain text mode. You can open it in its default Windows application.');
        setLoading(false);
      });
  }, [currentDocument?.path]);

  if (!currentDocument) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = content.split('\n').length;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-4xl h-[82vh] rounded-[28px] shadow-2xl bg-white dark:bg-[#1e1f20] border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden text-neutral-800 dark:text-neutral-100">
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-[#f8fafd] dark:bg-[#18191a]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] dark:bg-[#004a77]/50 text-[#0b57d0] dark:text-[#a8c7fa] flex items-center justify-center shrink-0">
              <MaterialIcon name="description" size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-medium truncate max-w-md">{currentDocument.name}</h2>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-0.5">
                <span>{formatFileSize(currentDocument.size)}</span>
                <span>·</span>
                <span>{lineCount} lines</span>
                <span>·</span>
                <span>{wordCount} words</span>
                <span>·</span>
                <span>Modified {formatDate(currentDocument.mtime)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-[#e8f0fe] dark:hover:bg-[#004a77]/40 text-xs font-medium text-neutral-700 dark:text-neutral-200 transition-colors"
            >
              <MaterialIcon name={copied ? 'check' : 'content_copy'} size={16} className={copied ? 'text-[#00875a]' : ''} />
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => onRevealInFolder(currentDocument)}
              className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              title="Reveal in Folder"
            >
              <MaterialIcon name="folder_open" size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              title="Close (Esc)"
            >
              <MaterialIcon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed bg-white dark:bg-[#1e1f20] selection:bg-[#c2e7ff] dark:selection:bg-[#004a77]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-2 font-sans">
              <MaterialIcon name="sync" size={28} className="animate-spin text-[#0b57d0]" />
              <span>Loading document content...</span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-800 dark:text-neutral-200 max-w-3xl mx-auto leading-relaxed">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
