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

type ReaderTheme = 'light' | 'sepia' | 'dark' | 'oled';
type ReaderFontSize = 'sm' | 'md' | 'lg';
type ViewTab = 'rendered' | 'source';

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  currentDocument,
  onClose,
  onRevealInFolder,
}) => {
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const [viewTab, setViewTab] = React.useState<ViewTab>('rendered');
  const [readerTheme, setReaderTheme] = React.useState<ReaderTheme>('light');
  const [fontSize, setFontSize] = React.useState<ReaderFontSize>('md');
  const [showOutline, setShowOutline] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [currentMatchIdx, setCurrentMatchIdx] = React.useState(0);
  const [pdfPage, setPdfPage] = React.useState(1);

  React.useEffect(() => {
    if (!currentDocument) return;
    setLoading(true);
    setSearchQuery('');
    setIsSearching(false);
    setPdfPage(1);

    api
      .getTextContent(currentDocument.path)
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        // Fallback for demo or binary
        if (currentDocument.extension === 'pdf') {
          setContent(
            `# ${currentDocument.name}\n\nDocument Specification & Architecture\nPrepared for Files Studio\n\n## Section 1: Overview\nThis document outlines the desktop architecture and storage management principles.\n\n## Section 2: Security & Permissions\nAll virtual folders adhere to local filesystem permissions and encryption boundaries.\n\n## Section 3: Distribution\nPackaged as a lightweight self-contained Windows application.`
          );
        } else {
          setContent(
            `# ${currentDocument.name}\n\nFile format: .${currentDocument.extension}\nSize: ${formatFileSize(currentDocument.size)}\nModified: ${formatDate(currentDocument.mtime)}\n\nThis file is available in your local directory.`
          );
        }
        setLoading(false);
      });
  }, [currentDocument?.path]);

  // Keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearching) setIsSearching(false);
        else onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearching(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearching]);

  const ext = currentDocument?.extension?.toLowerCase() || '';
  const isMarkdown = ['md', 'markdown'].includes(ext);
  const isCsv = ['csv', 'tsv'].includes(ext);
  const isCode = ['js', 'ts', 'tsx', 'jsx', 'json', 'html', 'css', 'py', 'sql', 'sh', 'yaml', 'yml', 'cpp', 'cc', 'c', 'h', 'hpp', 'java', 'go', 'rs'].includes(ext);
  const isPdf = ext === 'pdf';

  // Google Core Language Domain Info
  const googleLanguageInfo: Record<string, { label: string; domain: string; color: string; icon: string }> = {
    cpp: {
      label: 'C++20 (Google Core)',
      domain: 'Used for performance-critical systems, core search algorithms, Google File System (GFS/Colossus), and execution speed.',
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      icon: 'memory'
    },
    cc: {
      label: 'C++20 (Google Core)',
      domain: 'Used for performance-critical systems, core search algorithms, Google File System, and execution speed.',
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      icon: 'memory'
    },
    java: {
      label: 'Java 21 (Enterprise & Android)',
      domain: 'Heavily utilized for enterprise systems, backend networking, and foundational Android systems.',
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
      icon: 'coffee'
    },
    py: {
      label: 'Python 3.12 (ML & Tooling)',
      domain: 'The preferred language for data science, machine learning models, automation scripts, and rapid backend tooling.',
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      icon: 'terminal'
    },
    go: {
      label: 'Go / Golang (Google Cloud)',
      domain: 'Developed internally by Google to solve scalability issues, Go is extensively used across Google Cloud services and modern backend microservices.',
      color: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900',
      icon: 'cloud_sync'
    }
  };

  const currentLangSpec = googleLanguageInfo[ext];

  const lines = content.split('\n');
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Outline / Headings extraction
  const outline = React.useMemo(() => {
    if (!currentDocument) return [];
    const matches: { text: string; level: number; line: number }[] = [];
    lines.forEach((l, idx) => {
      const match = l.match(/^(#{1,4})\s+(.+)/);
      if (match) {
        matches.push({
          level: match[1].length,
          text: match[2].trim(),
          line: idx,
        });
      }
    });
    return matches;
  }, [lines, currentDocument]);

  // Search matches
  const matchPositions = React.useMemo(() => {
    if (!currentDocument || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const positions: number[] = [];
    lines.forEach((l, i) => {
      if (l.toLowerCase().includes(q)) positions.push(i);
    });
    return positions;
  }, [lines, searchQuery, currentDocument]);

  if (!currentDocument) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Theme styling rules
  const themeClasses = {
    light: 'bg-white text-neutral-800 border-neutral-200 dark:bg-[#1e2024] dark:text-neutral-100 dark:border-neutral-800',
    sepia: 'bg-[#fbf0d9] text-[#433422] border-[#e8d5b5]',
    dark: 'bg-[#181a1d] text-[#e3e3e3] border-[#2b2f36]',
    oled: 'bg-[#000000] text-[#f0f0f0] border-[#222222]',
  }[readerTheme];

  const fontSizeClasses = {
    sm: 'text-xs leading-relaxed',
    md: 'text-sm leading-relaxed',
    lg: 'text-base leading-loose',
  }[fontSize];

  // Render Markdown Parser Simulation
  const renderFormattedMarkdown = (raw: string) => {
    const rawLines = raw.split('\n');
    return (
      <div className="space-y-3.5 max-w-3xl mx-auto py-4">
        {rawLines.map((line, idx) => {
          // Headers
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} id={`line-${idx}`} className="text-2xl font-bold font-display border-b border-neutral-200/60 dark:border-neutral-800 pb-2 mt-6 mb-3 text-neutral-900 dark:text-neutral-50">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} id={`line-${idx}`} className="text-xl font-semibold font-display mt-5 mb-2 text-neutral-800 dark:text-neutral-100">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} id={`line-${idx}`} className="text-base font-semibold font-display mt-4 mb-1.5 text-neutral-800 dark:text-neutral-200">
                {line.replace('### ', '')}
              </h3>
            );
          }
          // Blockquote
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-3 border-[#0b57d0] pl-4 italic text-neutral-600 dark:text-neutral-400 my-2">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          // Bullet list or Checkbox
          if (line.startsWith('- [x] ')) {
            return (
              <div key={idx} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 ml-2">
                <MaterialIcon name="check_box" size={17} className="text-[#0b57d0]" />
                <span className="line-through opacity-75">{line.replace('- [x] ', '')}</span>
              </div>
            );
          }
          if (line.startsWith('- [ ] ')) {
            return (
              <div key={idx} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 ml-2">
                <MaterialIcon name="check_box_outline_blank" size={17} className="text-neutral-400" />
                <span>{line.replace('- [ ] ', '')}</span>
              </div>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-5 list-disc text-neutral-700 dark:text-neutral-300">
                {line.substring(2)}
              </li>
            );
          }
          // Empty line
          if (!line.trim()) {
            return <div key={idx} className="h-2" />;
          }
          // Standard Paragraph
          return (
            <p key={idx} className="text-neutral-700 dark:text-neutral-300">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  // Render CSV table
  const renderCsvTable = (raw: string) => {
    const rawLines = raw.trim().split('\n').filter(Boolean);
    if (rawLines.length === 0) return <div className="p-8 text-neutral-400">Empty table</div>;

    const headers = rawLines[0].split(',').map((h) => h.trim());
    const rows = rawLines.slice(1).map((r) => r.split(',').map((c) => c.trim()));

    return (
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs max-w-4xl mx-auto my-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-100 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700">
              <th className="py-2.5 px-3 text-neutral-400 font-mono w-12 text-center">#</th>
              {headers.map((h, i) => (
                <th key={i} className="py-2.5 px-4 font-semibold text-neutral-800 dark:text-neutral-100 font-display">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <td className="py-2 px-3 text-center text-neutral-400 font-mono text-[11px]">{rIdx + 1}</td>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2 px-4 text-neutral-700 dark:text-neutral-300 font-sans">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-150 font-sans">
      <div className={`w-full max-w-5xl h-[86vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden border ${themeClasses} transition-colors duration-150`}>
        {/* Top Header Bar */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-inherit bg-inherit shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#e8f0fe] dark:bg-[#004a77]/50 text-[#0b57d0] dark:text-[#a8c7fa] flex items-center justify-center shrink-0 shadow-2xs">
              <MaterialIcon
                name={
                  isPdf ? 'picture_as_pdf' :
                  isCsv ? 'table_chart' :
                  isMarkdown ? 'menu_book' :
                  isCode ? 'code' : 'description'
                }
                size={22}
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-medium truncate max-w-md font-display">{currentDocument.name}</h2>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-2 mt-0.5">
                <span>{formatFileSize(currentDocument.size)}</span>
                <span>·</span>
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{readingTimeMinutes} min read</span>
                <span>·</span>
                <span>{lines.length} lines</span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5">
            {/* View Tab Toggle for Markdown */}
            {isMarkdown && (
              <div className="flex items-center bg-neutral-200/70 dark:bg-neutral-800 p-0.5 rounded-full mr-2">
                <button
                  onClick={() => setViewTab('rendered')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    viewTab === 'rendered' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Formatted
                </button>
                <button
                  onClick={() => setViewTab('source')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    viewTab === 'source' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs' : 'text-neutral-500'
                  }`}
                >
                  Source
                </button>
              </div>
            )}

            {/* Find Search Button */}
            <button
              onClick={() => setIsSearching(!isSearching)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isSearching ? 'bg-[#0b57d0] text-white shadow-xs' : 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
              title="Search in Document (Ctrl+F)"
            >
              <MaterialIcon name="search" size={19} />
            </button>

            {/* Table of Contents / Outline Toggle */}
            {outline.length > 0 && (
              <button
                onClick={() => setShowOutline(!showOutline)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  showOutline ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100' : 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
                title="Table of Contents"
              >
                <MaterialIcon name="format_list_bulleted" size={19} />
              </button>
            )}

            {/* Font Size Selector */}
            <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded-full">
              {(['sm', 'md', 'lg'] as ReaderFontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase transition-colors cursor-pointer ${
                    fontSize === size ? 'bg-[#0b57d0] text-white shadow-2xs' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                  title={`Font size: ${size}`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Theme Toggle (Paper / Sepia / Dark) */}
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => setReaderTheme(readerTheme === 'light' ? 'sepia' : readerTheme === 'sepia' ? 'dark' : 'light')}
                className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                title={`Theme: ${readerTheme}`}
              >
                <MaterialIcon name="palette" size={19} />
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium transition-colors cursor-pointer ml-1"
            >
              <MaterialIcon name={copied ? 'check' : 'content_copy'} size={15} className={copied ? 'text-emerald-500' : ''} />
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Print Document (Ctrl+P)"
            >
              <MaterialIcon name="print" size={19} />
            </button>

            {/* Reveal in folder */}
            <button
              onClick={() => onRevealInFolder(currentDocument)}
              className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Reveal in Folder"
            >
              <MaterialIcon name="folder_open" size={19} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <MaterialIcon name="close" size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar Strip if active */}
        {isSearching && (
          <div className="px-6 py-2 border-b border-inherit bg-neutral-100/70 dark:bg-neutral-800/70 flex items-center justify-between gap-3 text-xs shrink-0 animate-in slide-in-from-top duration-150">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <MaterialIcon name="search" size={18} className="text-neutral-400" />
              <input
                type="text"
                autoFocus
                placeholder="Find in document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-full px-3 py-1 text-xs outline-none focus:border-[#0b57d0]"
              />
            </div>
            <div className="flex items-center gap-2 text-neutral-500 text-xs">
              <span>
                {matchPositions.length > 0 ? `${matchPositions.length} matches found` : searchQuery ? 'No matches' : ''}
              </span>
              <button
                onClick={() => setIsSearching(false)}
                className="p-1 hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Reader Body with optional Table of Contents */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Reading Canvas */}
          <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${fontSizeClasses} selection:bg-[#c2e7ff] dark:selection:bg-[#004a77]`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-3 font-sans">
                <MaterialIcon name="sync" size={32} className="animate-spin text-[#0b57d0]" />
                <span>Reading and parsing document...</span>
              </div>
            ) : isCsv ? (
              renderCsvTable(content)
            ) : isMarkdown && viewTab === 'rendered' ? (
              renderFormattedMarkdown(content)
            ) : (
              /* Code or Plain Text View with Line Numbers & Syntax Highlighting */
              <div className="max-w-4xl mx-auto">
                {currentLangSpec && (
                  <div className={`mb-5 p-4 rounded-2xl border flex items-start gap-3.5 shadow-2xs font-sans ${currentLangSpec.color}`}>
                    <div className="w-9 h-9 rounded-xl bg-white/70 dark:bg-black/30 flex items-center justify-center shrink-0 shadow-2xs">
                      <MaterialIcon name={currentLangSpec.icon} size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs font-display flex items-center gap-2">
                        <span>{currentLangSpec.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/40 uppercase tracking-wider font-mono font-medium">Google Core Engineering</span>
                      </div>
                      <p className="text-[11.5px] mt-1 leading-relaxed opacity-95">{currentLangSpec.domain}</p>
                    </div>
                  </div>
                )}

                <div className="flex font-mono text-xs leading-relaxed rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-black/20 p-2">
                  <div className="select-none text-neutral-400 dark:text-neutral-600 text-right pr-4 border-r border-neutral-200 dark:border-neutral-800 py-2">
                    {lines.map((_, i) => (
                      <div key={i} className="h-5">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="pl-4 py-2 flex-1 overflow-x-auto text-neutral-800 dark:text-neutral-200">
                    {lines.map((line, i) => {
                      const isMatched = searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());
                      const trimmed = line.trimStart();
                      const isComment = trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*');

                      return (
                        <div
                          key={i}
                          className={`h-5 whitespace-pre ${
                            isMatched ? 'bg-amber-300/30 dark:bg-amber-400/20 rounded px-1' : ''
                          }`}
                        >
                          {isComment ? (
                            <span className="text-emerald-700 dark:text-emerald-400 italic">{line}</span>
                          ) : (
                            line || ' '
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table of Contents Side Drawer */}
          {showOutline && outline.length > 0 && (
            <div className="w-72 border-l border-inherit bg-neutral-50/70 dark:bg-neutral-900/60 p-4 overflow-y-auto text-xs space-y-2 shrink-0 animate-in slide-in-from-right duration-150">
              <div className="flex items-center justify-between border-b border-inherit pb-2 mb-2">
                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 font-display">Document Outline</h4>
                <button
                  onClick={() => setShowOutline(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  <MaterialIcon name="close" size={16} />
                </button>
              </div>

              <div className="space-y-1">
                {outline.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const el = document.getElementById(`line-${item.line}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`cursor-pointer py-1 px-2 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 truncate text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${
                      item.level === 1 ? 'font-medium text-neutral-800 dark:text-neutral-200' :
                      item.level === 2 ? 'pl-4' : 'pl-6 text-[11px]'
                    }`}
                    title={item.text}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Status Bar with Stats */}
        <div className="h-9 px-6 border-t border-inherit bg-inherit flex items-center justify-between text-[11px] text-neutral-400 shrink-0 font-mono">
          <div className="flex items-center gap-3">
            <span>Encoding: UTF-8</span>
            <span>·</span>
            <span>Lines: {lines.length}</span>
            <span>·</span>
            <span>Characters: {charCount}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>{isMarkdown ? 'Markdown Reader' : isCsv ? 'CSV Table Reader' : isCode ? 'Code Viewer' : 'Document Reader'}</span>
            <span>·</span>
            <span>Files Studio v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
