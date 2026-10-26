import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem, StorageAnalysisData } from '../../types';
import { formatFileSize, formatDate } from '../../utils/fileSystemLogic';

interface HomeDashboardProps {
  onNavigate: (view: string, path?: string) => void;
  onOpenFile: (file: FileItem) => void;
  recentFiles: FileItem[];
  storageData: StorageAnalysisData | null;
  counts: {
    photos: number;
    videos: number;
    audio: number;
    documents: number;
    downloads: number;
  };
  onTriggerRescan?: () => void;
  isScanning?: boolean;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  onOpenFile,
  recentFiles,
  storageData,
  counts,
}) => {
  // Calm, cohesive Material 3 tonal cards
  const quickCategories = [
    {
      id: 'photos',
      label: 'Photos',
      iconName: 'photo_library',
      count: counts.photos,
      view: 'photos',
    },
    {
      id: 'videos',
      label: 'Videos',
      iconName: 'movie',
      count: counts.videos,
      view: 'videos',
    },
    {
      id: 'audio',
      label: 'Audio',
      iconName: 'music_note',
      count: counts.audio,
      view: 'audio',
    },
    {
      id: 'documents',
      label: 'Documents',
      iconName: 'description',
      count: counts.documents,
      view: 'documents',
    },
    {
      id: 'downloads',
      label: 'Downloads',
      iconName: 'download',
      count: counts.downloads,
      view: 'explorer',
      path: 'C:\\Users\\GoogleDesigner\\Downloads',
    },
  ];

  const pinnedLocations = [
    { label: 'Pictures', path: 'C:\\Users\\GoogleDesigner\\Pictures', count: counts.photos, iconName: 'photo_library' },
    { label: 'Documents', path: 'C:\\Users\\GoogleDesigner\\Documents', count: counts.documents, iconName: 'description' },
    { label: 'Downloads', path: 'C:\\Users\\GoogleDesigner\\Downloads', count: counts.downloads, iconName: 'download' },
    { label: 'Wallpapers', path: 'C:\\Users\\GoogleDesigner\\Pictures\\Wallpapers', count: 3, iconName: 'wallpaper' },
    { label: 'Desktop', path: 'C:\\Users\\GoogleDesigner\\Desktop', count: 4, iconName: 'desktop_windows' },
    { label: 'Music', path: 'C:\\Users\\GoogleDesigner\\Music', count: counts.audio, iconName: 'music_note' },
  ];

  const primaryDrive = storageData?.drives[0];
  const usedPercent = primaryDrive ? Math.round((primaryDrive.usedBytes / primaryDrive.totalBytes) * 100) : 33;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 max-w-6xl mx-auto select-none font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-neutral-800 dark:text-neutral-100 font-display">
          Files
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Recent media, storage overview, and quick folder shortcuts
        </p>
      </div>

      {/* Material 3 Elevated Category Tiles with Tactile Shadows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {quickCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onNavigate(cat.view, cat.path)}
            className="flex items-center justify-between p-4 rounded-2xl bg-[#f0f4f9] dark:bg-[#1e1f20] hover:bg-[#e7ecf2] dark:hover:bg-[#282a2c] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-left border border-neutral-200/60 dark:border-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.45)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.65)] group cursor-pointer"
          >
            <div className="space-y-1 min-w-0">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 block truncate">
                {cat.label}
              </span>
              <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 block font-display">
                {cat.count}
              </span>
            </div>
            <div className="w-11 h-11 rounded-full bg-white dark:bg-[#131314] text-[#0b57d0] dark:text-[#a8c7fa] flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.08)] group-hover:bg-[#c2e7ff] group-hover:text-[#001d35] transition-colors shrink-0">
              <MaterialIcon name={cat.iconName} size={22} />
            </div>
          </button>
        ))}
      </div>

      {/* Storage Progress Card (Clean Google One / Files M3 Style) */}
      {primaryDrive && (
        <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] p-5 md:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-all">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f0f4f9] dark:bg-[#131314] text-[#0b57d0] dark:text-[#a8c7fa] flex items-center justify-center shadow-xs">
                <MaterialIcon name="hard_drive" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm font-display">
                  {primaryDrive.name}
                </h3>
                <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
                  {formatFileSize(primaryDrive.usedBytes)} used of {formatFileSize(primaryDrive.totalBytes)} ({usedPercent}%)
                </span>
              </div>
            </div>
            
            {/* Manage Action */}
            <button
              onClick={() => onNavigate('storage')}
              className="text-xs font-medium text-[#0b57d0] dark:text-[#a8c7fa] hover:underline flex items-center gap-0.5 px-3 py-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span>Manage</span>
              <MaterialIcon name="chevron_right" size={16} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-[#f0f4f9] dark:bg-[#131314] rounded-full overflow-hidden">
            <div
              className="bg-[#0b57d0] dark:bg-[#a8c7fa] h-full rounded-full transition-all duration-500"
              style={{ width: `${usedPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>{formatFileSize(primaryDrive.freeBytes)} available</span>
            <span>NTFS</span>
          </div>
        </div>
      )}

      {/* Locations */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Quick Access
          </h2>
          <button
            onClick={() => onNavigate('explorer', 'C:\\Users\\GoogleDesigner')}
            className="text-xs text-[#0b57d0] dark:text-[#a8c7fa] hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
          >
            <span>User Profile</span>
            <MaterialIcon name="chevron_right" size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          {pinnedLocations.map((loc) => (
            <button
              key={loc.label}
              onClick={() => onNavigate('explorer', loc.path)}
              className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-left shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.09)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_6px_16px_rgba(0,0,0,0.5)] group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#f0f4f9] dark:bg-[#131314] text-neutral-600 dark:text-neutral-300 flex items-center justify-center mb-3 group-hover:text-[#0b57d0] group-hover:bg-[#c2e7ff] transition-colors shadow-2xs">
                <MaterialIcon name={loc.iconName} size={19} />
              </div>
              <div className="font-medium text-neutral-800 dark:text-neutral-200 text-xs truncate">
                {loc.label}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                {loc.count} items
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Files */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Recent Files
          </h2>
          <button
            onClick={() => onNavigate('photos')}
            className="text-xs text-[#0b57d0] dark:text-[#a8c7fa] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>View All</span>
            <MaterialIcon name="arrow_forward" size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {recentFiles.slice(0, 8).map((file) => (
            <div
              key={file.id}
              onClick={() => onOpenFile(file)}
              className="group p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.09)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_6px_16px_rgba(0,0,0,0.5)] flex items-center gap-3.5"
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                {file.category === 'photo' && file.mediaUrl ? (
                  <img
                    src={file.mediaUrl}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <MaterialIcon
                    name={
                      file.category === 'photo' ? 'image' :
                      file.category === 'video' ? 'movie' :
                      file.category === 'audio' ? 'music_note' :
                      'description'
                    }
                    size={22}
                    className="text-neutral-500 dark:text-neutral-400"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-800 dark:text-neutral-200 text-xs truncate group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa] transition-colors">
                  {file.name}
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-1">
                  <span>{formatFileSize(file.size)}</span>
                  <span>·</span>
                  <span className="truncate">{formatDate(file.mtime)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
