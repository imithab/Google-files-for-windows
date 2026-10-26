import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { AppSettings } from '../../types';
import { ACCENT_PALETTES } from '../../theme/tokens';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onTriggerRescan: () => void;
  isScanning: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onTriggerRescan,
  isScanning,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    'appearance' | 'indexing' | 'file-mgmt' | 'privacy' | 'about'
  >('appearance');

  const [newFolderInput, setNewFolderInput] = React.useState('');
  const [cacheCleared, setCacheCleared] = React.useState(false);

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderInput.trim() && !settings.indexedFolders.includes(newFolderInput.trim())) {
      onUpdateSettings({
        indexedFolders: [...settings.indexedFolders, newFolderInput.trim()],
      });
      setNewFolderInput('');
    }
  };

  const handleRemoveFolder = (folder: string) => {
    onUpdateSettings({
      indexedFolders: settings.indexedFolders.filter((f) => f !== folder),
    });
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  const navTabs = [
    { id: 'appearance', label: 'Appearance', icon: 'palette' },
    { id: 'indexing', label: 'File Indexing', icon: 'hard_drive' },
    { id: 'file-mgmt', label: 'File Management', icon: 'visibility' },
    { id: 'privacy', label: 'Privacy & Cache', icon: 'security' },
    { id: 'about', label: 'About Files Studio', icon: 'info' },
  ];

  return (
    <div className="flex-1 flex overflow-hidden select-none bg-[#f8fafd] dark:bg-[#131314] font-sans">
      {/* Settings Navigation Sidebar */}
      <div className="w-60 border-r border-neutral-200 dark:border-neutral-800 p-4 space-y-1.5 bg-white dark:bg-[#1e1f20] shrink-0">
        <div className="px-3 py-2 mb-2">
          <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <MaterialIcon name="settings" size={20} className="text-[#0b57d0] dark:text-[#a8c7fa]" />
            <span>Settings</span>
          </h2>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Preferences & Storage</p>
        </div>

        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-semibold shadow-2xs'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-[#f1f3f4] dark:hover:bg-[#282a2c]'
              }`}
            >
              <MaterialIcon
                name={tab.icon}
                fill={isActive}
                size={18}
                className={isActive ? 'text-[#001d35] dark:text-[#c2e7ff]' : 'text-neutral-500 dark:text-neutral-400'}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200">
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Appearance & Theme
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                Customize visual theme, accent colors, and thumbnail sizing with Material 3 styling.
              </p>
            </div>

            {/* Theme Selector */}
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] space-y-3.5 shadow-xs">
              <label className="font-medium block text-neutral-900 dark:text-neutral-100 text-xs">
                Application Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Light', icon: 'light_mode' },
                  { id: 'dark', label: 'Dark', icon: 'dark_mode' },
                  { id: 'system', label: 'System', icon: 'devices' },
                ].map((th) => {
                  const isSelected = settings.theme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => onUpdateSettings({ theme: th.id as any })}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-[#0b57d0] bg-[#e8f0fe] dark:bg-[#004a77]/50 text-[#0b57d0] dark:text-[#a8c7fa] font-semibold'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <MaterialIcon
                        name={th.icon}
                        fill={isSelected}
                        size={22}
                        className={isSelected ? 'text-[#0b57d0] dark:text-[#a8c7fa]' : 'text-neutral-500'}
                      />
                      <span>{th.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Palette Selector */}
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] space-y-3.5 shadow-xs">
              <label className="font-medium block text-neutral-900 dark:text-neutral-100 text-xs">
                Accent Color (Material You)
              </label>
              <div className="flex items-center gap-3">
                {Object.entries(ACCENT_PALETTES).map(([key, pal]) => {
                  const isSelected = settings.accentColor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => onUpdateSettings({ accentColor: key as any })}
                      style={{ backgroundColor: pal.primary }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform ${
                        isSelected ? 'ring-4 ring-[#0b57d0]/30 scale-110 shadow-md' : 'hover:scale-105'
                      }`}
                      title={pal.name}
                    >
                      {isSelected && <MaterialIcon name="check" size={18} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thumbnail Size */}
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] flex items-center justify-between shadow-xs">
              <div>
                <label className="font-medium block text-neutral-900 dark:text-neutral-100">
                  Default Gallery Thumbnail Size
                </label>
                <span className="text-neutral-500 text-[11px]">Scale of image and media grid cells</span>
              </div>
              <select
                value={settings.thumbnailSize}
                onChange={(e) => onUpdateSettings({ thumbnailSize: e.target.value as any })}
                className="px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-medium text-xs text-neutral-900 dark:text-neutral-100 outline-none"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'indexing' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  File Indexing Locations
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Configure which directories are crawled for universal discovery.
                </p>
              </div>

              <button
                onClick={onTriggerRescan}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium transition-colors shadow-xs"
              >
                <MaterialIcon name="sync" size={16} className={isScanning ? 'animate-spin' : ''} />
                <span>{isScanning ? 'Scanning...' : 'Rescan Now'}</span>
              </button>
            </div>

            {/* Add Location Form */}
            <form onSubmit={handleAddFolder} className="flex gap-2">
              <input
                type="text"
                value={newFolderInput}
                onChange={(e) => setNewFolderInput(e.target.value)}
                placeholder="e.g. C:\Users\GoogleDesigner\WorkProjects"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#0b57d0] text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200"
              >
                <MaterialIcon name="create_new_folder" size={18} className="text-[#0b57d0] dark:text-[#a8c7fa]" />
                <span>Add Folder</span>
              </button>
            </form>

            {/* Indexed Folders List */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] divide-y divide-neutral-100 dark:divide-neutral-800 shadow-xs">
              {settings.indexedFolders.map((folder) => (
                <div key={folder} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <MaterialIcon name="folder" size={16} className="text-[#0b57d0] dark:text-[#a8c7fa] shrink-0" />
                    <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300 truncate">
                      {folder}
                    </span>
                  </div>
                  {settings.indexedFolders.length > 1 && (
                    <button
                      onClick={() => handleRemoveFolder(folder)}
                      className="p-1 rounded-full text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Remove"
                    >
                      <MaterialIcon name="delete" size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'file-mgmt' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                File Management Preferences
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                Configure safety confirmations and file explorer defaults.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] space-y-4 shadow-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium block text-neutral-900 dark:text-neutral-100">
                    Show File Name Extensions
                  </span>
                  <span className="text-neutral-500 text-[11px]">Display .png, .mp4, .pdf at end of names</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showFileExtensions}
                  onChange={(e) => onUpdateSettings({ showFileExtensions: e.target.checked })}
                  className="w-4 h-4 accent-[#0b57d0] rounded"
                />
              </label>

              <div className="border-t border-neutral-100 dark:border-neutral-800" />

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium block text-neutral-900 dark:text-neutral-100">
                    Show Hidden Files and Folders
                  </span>
                  <span className="text-neutral-500 text-[11px]">Show files beginning with dot or system flags</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showHiddenFiles}
                  onChange={(e) => onUpdateSettings({ showHiddenFiles: e.target.checked })}
                  className="w-4 h-4 accent-[#0b57d0] rounded"
                />
              </label>

              <div className="border-t border-neutral-100 dark:border-neutral-800" />

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium block text-neutral-900 dark:text-neutral-100">
                    Confirm Before Permanent Deletion
                  </span>
                  <span className="text-neutral-500 text-[11px]">Prompt for confirmation before removing items</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.confirmDelete}
                  onChange={(e) => onUpdateSettings({ confirmDelete: e.target.checked })}
                  className="w-4 h-4 accent-[#0b57d0] rounded"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                Privacy & Cache Management
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                Local-only architecture with zero external uploads.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] space-y-4 shadow-xs">
              <div className="flex items-start gap-3">
                <MaterialIcon name="security" size={24} className="text-[#00875a] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                    100% Local Storage & Processing
                  </h4>
                  <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed text-[11px]">
                    Files Studio stores all file indexing metadata, favourites, and album records strictly on your local disk in standard JSON/SQLite databases. No file names, contents, or usage histories are ever transmitted to any external server.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-medium block text-neutral-900 dark:text-neutral-100">
                    Clear Thumbnail & Search Cache
                  </span>
                  <span className="text-neutral-500 text-[11px]">Remove cached preview assets</span>
                </div>
                <button
                  onClick={handleClearCache}
                  className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
                >
                  {cacheCleared ? 'Cache Cleared!' : 'Clear Cache'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                About Files Studio
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                Next-generation desktop file manager for Windows.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] space-y-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                {/* Google Files 4-color brand fold icon */}
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 p-2 shadow-sm border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center">
                  <svg className="w-8 h-8" viewBox="0 0 192 192" fill="none">
                    <path d="M40 32C40 23.1634 47.1634 16 56 16H104L152 64V160C152 168.837 144.837 176 136 176H56C47.1634 176 40 168.837 40 160V32Z" fill="#4285F4" />
                    <path d="M104 16L152 64H112C107.582 64 104 60.4183 104 56V16Z" fill="#AECBFA" />
                    <path d="M40 76H112C116.418 76 120 79.5817 120 84V176H56C47.1634 176 40 168.837 40 160V76Z" fill="#34A853" />
                    <path d="M112 112L152 152V160C152 168.837 144.837 176 136 176H112V112Z" fill="#EA4335" />
                    <path d="M40 76L76 112H40V76Z" fill="#FBBC04" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                    Files Studio (Desktop Edition)
                  </h4>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Version 2.4.0 (Build 2026.10) · Inspired by Google Files & Material Design 3
                  </div>
                </div>
              </div>

              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
                Files Studio combines the visual simplicity and effortless media categorisation of Google Files for Android with the robust filesystem capabilities of a native Windows desktop file manager.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] text-neutral-500 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <span className="font-medium block text-neutral-700 dark:text-neutral-300">Design Framework</span>
                  <span>Google Material Design 3 (M3)</span>
                </div>
                <div>
                  <span className="font-medium block text-neutral-700 dark:text-neutral-300">Storage Engine</span>
                  <span>Direct Node.js & WinFS Bridge</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
