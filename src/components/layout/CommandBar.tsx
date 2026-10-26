import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { ViewMode, SortField, SortOrder } from '../../types';
import { getBreadcrumbSegments } from '../../utils/fileSystemLogic';

interface CommandBarProps {
  currentView: string;
  currentPath: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoUp: () => void;
  onNavigatePath: (path: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onChangeSort: (field: SortField, order: SortOrder) => void;
  onRefresh: () => void;
  onNewFolder?: () => void;
  selectedCount: number;
  onDeleteSelected?: () => void;
  onCopySelected?: () => void;
  onCutSelected?: () => void;
  canPaste?: boolean;
  onPaste?: () => void;
  onShowProperties?: () => void;
  dualPaneEnabled?: boolean;
  onToggleDualPane?: () => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  currentView,
  currentPath,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onGoUp,
  onNavigatePath,
  searchQuery,
  onSearchChange,
  viewMode,
  onChangeViewMode,
  sortField,
  sortOrder,
  onChangeSort,
  onRefresh,
  onNewFolder,
  selectedCount,
  onDeleteSelected,
  onCopySelected,
  onCutSelected,
  canPaste,
  onPaste,
  onShowProperties,
  dualPaneEnabled,
  onToggleDualPane,
}) => {
  const [isEditingPath, setIsEditingPath] = React.useState(false);
  const [pathInput, setPathInput] = React.useState(currentPath);
  const [showSortMenu, setShowSortMenu] = React.useState(false);

  React.useEffect(() => {
    setPathInput(currentPath);
  }, [currentPath]);

  const breadcrumbs = getBreadcrumbSegments(currentPath);

  const handlePathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingPath(false);
    if (pathInput.trim()) {
      onNavigatePath(pathInput.trim());
    }
  };

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs select-none font-sans">
      {/* 1. Breadcrumb Hierarchy Bar & Directory Navigation */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {/* Navigation History Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Back (Alt+Left)"
            aria-label="Back"
          >
            <MaterialIcon name="arrow_back" size={18} />
          </button>
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Forward (Alt+Right)"
            aria-label="Forward"
          >
            <MaterialIcon name="arrow_forward" size={18} />
          </button>
          <button
            onClick={onGoUp}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Up to parent folder (Alt+Up)"
            aria-label="Up"
          >
            <MaterialIcon name="arrow_upward" size={18} />
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
            title="Refresh (F5)"
            aria-label="Refresh"
          >
            <MaterialIcon name="refresh" size={18} />
          </button>
        </div>

        {/* Interactive Breadcrumb Hierarchy Bar */}
        <div className="flex-1 min-w-0 h-9 px-3 rounded-full border border-neutral-200 dark:border-neutral-700 bg-[#f0f4f9] dark:bg-[#131314] flex items-center justify-between gap-1 overflow-hidden transition-all focus-within:border-[#0b57d0] focus-within:bg-white dark:focus-within:bg-[#1e1f20]">
          {isEditingPath ? (
            <form onSubmit={handlePathSubmit} className="w-full flex items-center">
              <input
                type="text"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                onBlur={() => setIsEditingPath(false)}
                autoFocus
                className="w-full bg-transparent outline-none text-xs text-neutral-800 dark:text-neutral-100 font-mono"
              />
            </form>
          ) : (
            <nav aria-label="Breadcrumb" className="w-full flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 font-sans">
              {breadcrumbs.map((seg, idx) => (
                <div key={idx} className="flex items-center gap-1 shrink-0">
                  {idx > 0 && <MaterialIcon name="chevron_right" size={15} className="text-neutral-400" />}
                  <button
                    onClick={() => onNavigatePath(seg.path)}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium text-xs transition-colors truncate max-w-[150px]"
                    title={`Navigate to ${seg.label}`}
                  >
                    {idx === 0 && <MaterialIcon name="computer" size={15} className="text-neutral-500" />}
                    {idx === 1 && <MaterialIcon name="hard_drive" size={14} className="text-neutral-500" />}
                    <span>{seg.label}</span>
                  </button>
                </div>
              ))}
            </nav>
          )}

          <button
            onClick={() => setIsEditingPath(!isEditingPath)}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 shrink-0"
            title={isEditingPath ? 'Done Editing' : 'Edit Path Manually'}
          >
            <MaterialIcon name={isEditingPath ? 'check' : 'edit'} size={14} />
          </button>
        </div>
      </div>

      {/* 2. Middle & Right: Clean M3 Search Bar & Actions */}
      <div className="flex items-center gap-2 shrink-0 justify-between md:justify-end">
        {/* Clean M3 Search Bar */}
        <div className="relative w-48 sm:w-64">
          <div className="relative flex items-center">
            <MaterialIcon name="search" size={18} className="text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files..."
              className="w-full h-9 pl-9 pr-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-[#f0f4f9] dark:bg-[#131314] text-xs text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-[#0b57d0] focus:bg-white dark:focus:bg-[#1e1f20] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                aria-label="Clear Search"
              >
                <MaterialIcon name="close" size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Selected Items Action Bar */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-1 bg-[#e8f0fe] dark:bg-[#004a77]/50 px-2.5 py-1 rounded-full border border-[#aecbfa] dark:border-[#004a77] animate-in fade-in">
            <span className="text-[11px] font-medium text-[#041e49] dark:text-[#c2e7ff] mr-1">
              {selectedCount} selected
            </span>
            {onCopySelected && (
              <button
                onClick={onCopySelected}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200"
                title="Copy (Ctrl+C)"
              >
                <MaterialIcon name="content_copy" size={15} />
              </button>
            )}
            {onCutSelected && (
              <button
                onClick={onCutSelected}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200"
                title="Cut (Ctrl+X)"
              >
                <MaterialIcon name="content_cut" size={15} />
              </button>
            )}
            {onDeleteSelected && (
              <button
                onClick={onDeleteSelected}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#ba1a1a] dark:text-[#ffb4ab]"
                title="Delete (Del)"
              >
                <MaterialIcon name="delete" size={15} />
              </button>
            )}
            {onShowProperties && (
              <button
                onClick={onShowProperties}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-neutral-700 dark:text-neutral-200"
                title="Properties"
              >
                <MaterialIcon name="info" size={15} />
              </button>
            )}
          </div>
        )}

        {/* Paste Action Button if clipboard has items */}
        {canPaste && onPaste && (
          <button
            onClick={onPaste}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium transition-colors shadow-2xs"
            title="Paste Clipboard (Ctrl+V)"
          >
            <MaterialIcon name="content_paste" size={15} />
            <span>Paste</span>
          </button>
        )}

        {/* New Folder Button */}
        {onNewFolder && (
          <button
            onClick={onNewFolder}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-medium transition-colors"
            title="Create New Folder (Ctrl+Shift+N)"
          >
            <MaterialIcon name="create_new_folder" size={17} className="text-[#0b57d0] dark:text-[#a8c7fa]" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
        )}

        {/* View Mode Toggle: Grid, List, Compact */}
        <div className="flex items-center bg-[#f0f4f9] dark:bg-[#131314] p-0.5 rounded-full border border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => onChangeViewMode('grid')}
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-[#1e1f20] text-[#0b57d0] dark:text-[#a8c7fa] shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
            title="Grid View"
          >
            <MaterialIcon name="grid_view" size={15} />
          </button>
          <button
            onClick={() => onChangeViewMode('list')}
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#1e1f20] text-[#0b57d0] dark:text-[#a8c7fa] shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
            title="List View"
          >
            <MaterialIcon name="format_list_bulleted" size={15} />
          </button>
          <button
            onClick={() => onChangeViewMode('compact')}
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'compact'
                ? 'bg-white dark:bg-[#1e1f20] text-[#0b57d0] dark:text-[#a8c7fa] shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
            title="Compact Table Details"
          >
            <MaterialIcon name="table_rows" size={15} />
          </button>
        </div>

        {/* Sort Menu */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors"
            title="Sort Options"
          >
            <MaterialIcon name="sort" size={16} />
            <span className="capitalize hidden lg:inline">{sortField}</span>
          </button>
          {showSortMenu && (
            <div className="absolute right-0 mt-1 w-44 rounded-2xl shadow-xl bg-white dark:bg-[#1e1f20] border border-neutral-200 dark:border-neutral-700 p-1.5 z-40 animate-in fade-in zoom-in-95">
              <div className="text-[10px] font-medium text-neutral-400 px-3 py-1 uppercase tracking-wider">
                Sort By
              </div>
              {(['name', 'mtime', 'size', 'category'] as SortField[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    if (sortField === f) {
                      onChangeSort(f, sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      onChangeSort(f, 'asc');
                    }
                    setShowSortMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                    sortField === f
                      ? 'bg-[#e8f0fe] dark:bg-[#004a77]/50 text-[#0b57d0] dark:text-[#a8c7fa] font-medium'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="capitalize">
                    {f === 'mtime' ? 'Date Modified' : f === 'category' ? 'File Type' : f}
                  </span>
                  {sortField === f && (
                    <MaterialIcon name={sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'} size={14} className="text-[#0b57d0]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
