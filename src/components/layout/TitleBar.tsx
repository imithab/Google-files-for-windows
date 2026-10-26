import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { TabInfo } from '../../types';

declare global {
  interface Window {
    electronAPI?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      platform?: string;
    };
  }
}

interface TitleBarProps {
  currentView: string;
  tabs: TabInfo[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  currentView,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  theme,
  onToggleTheme,
}) => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize();
    }
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    }
  };

  return (
    <header className="h-11 select-none flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-[#f8fafd] dark:bg-[#131314] px-4 text-xs z-50 transition-colors font-sans titlebar-drag-region">
      {/* Left: Google Files Brand Fold & Clean App Title */}
      <div className="flex items-center gap-2.5 shrink-0 titlebar-no-drag">
        <div className="w-6 h-6 relative flex items-center justify-center shrink-0">
          <svg viewBox="0 0 48 48" className="w-5 h-5" fill="none">
            <path d="M6 12C6 8.68629 8.68629 6 12 6H24V24H6V12Z" fill="#1A73E8" />
            <path d="M24 6H36C39.3137 6 42 8.68629 42 12V24H24V6Z" fill="#EA4335" />
            <path d="M24 24H42V36C42 39.3137 39.3137 42 36 42H24V24Z" fill="#FBBC04" />
            <path d="M6 24H24V42H12C8.68629 42 6 39.3137 6 36V24Z" fill="#34A853" />
            <polygon points="24,14 34,24 24,34 14,24" fill="#ffffff" fillOpacity="0.35" />
          </svg>
        </div>

        <span className="font-semibold text-neutral-800 dark:text-neutral-100 text-[14px] tracking-tight font-display">
          Files Studio
        </span>
      </div>

      {/* Middle: Explorer Tabs or Minimal View Title */}
      <div className="flex-1 flex items-center justify-center max-w-xl mx-4 overflow-x-auto no-scrollbar titlebar-no-drag">
        {currentView === 'explorer' ? (
          <div className="flex items-center gap-1 w-full justify-start overflow-hidden">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`group relative flex items-center gap-2 px-3 py-1 rounded-full text-xs cursor-pointer max-w-[180px] transition-all ${
                    isActive
                      ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <MaterialIcon name="folder" fill={isActive} size={15} />
                  <span className="truncate">{tab.title || 'Local Disk (C:)'}</span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                      aria-label="Close Tab"
                    >
                      <MaterialIcon name="close" size={13} />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              onClick={onNewTab}
              className="p-1 rounded-full text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors ml-1"
              title="New Tab"
              aria-label="New Tab"
            >
              <MaterialIcon name="add" size={16} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Right: Theme Toggle & Window Controls */}
      <div className="flex items-center gap-1 shrink-0 titlebar-no-drag">
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors"
          title={`Switch Theme (Current: ${theme})`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <MaterialIcon name="light_mode" fill size={18} className="text-amber-400" />
          ) : (
            <MaterialIcon name="dark_mode" fill size={18} />
          )}
        </button>

        <div className="flex items-center ml-1">
          <button
            onClick={handleMinimize}
            className="w-8 h-7 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors rounded-sm cursor-pointer"
            title="Minimize"
            aria-label="Minimize"
          >
            <MaterialIcon name="remove" size={16} />
          </button>
          <button
            onClick={handleMaximize}
            className="w-8 h-7 flex items-center justify-center text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors rounded-sm cursor-pointer"
            title={isMaximized ? 'Restore' : 'Maximize'}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
          >
            <MaterialIcon name={isMaximized ? 'filter_none' : 'crop_square'} size={14} />
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-7 flex items-center justify-center text-neutral-500 hover:bg-[#ba1a1a] hover:text-white transition-colors rounded-sm cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
