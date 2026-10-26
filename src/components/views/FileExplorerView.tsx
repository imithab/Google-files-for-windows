import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem, ViewMode } from '../../types';
import { formatFileSize, formatDate } from '../../utils/fileSystemLogic';

interface FileExplorerViewProps {
  currentPath: string;
  items: FileItem[];
  viewMode: ViewMode;
  onNavigatePath: (path: string) => void;
  onOpenFile: (file: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item?: FileItem) => void;
  selectedIds: string[];
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  dualPaneEnabled: boolean;
  secondaryPath?: string;
  secondaryItems?: FileItem[];
  onNavigateSecondaryPath?: (path: string) => void;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({
  currentPath,
  items,
  viewMode,
  onNavigatePath,
  onOpenFile,
  onContextMenu,
  selectedIds,
  onToggleSelect,
  dualPaneEnabled,
  secondaryPath,
  secondaryItems,
  onNavigateSecondaryPath,
}) => {
  const getFileIcon = (item: FileItem) => {
    if (item.isFolder) {
      if ((item as any).isDrive) return <MaterialIcon name="hard_drive" fill size={22} className="text-blue-500" />;
      return <MaterialIcon name="folder" fill size={22} className="text-amber-500" />;
    }
    switch (item.category) {
      case 'photo':
        return <MaterialIcon name="photo_library" fill size={22} className="text-rose-500" />;
      case 'video':
        return <MaterialIcon name="movie" fill size={22} className="text-amber-500" />;
      case 'audio':
        return <MaterialIcon name="music_note" fill size={22} className="text-emerald-500" />;
      case 'document':
        return <MaterialIcon name="description" fill size={22} className="text-blue-500" />;
      case 'archive':
        return <MaterialIcon name="folder_zip" fill size={22} className="text-purple-500" />;
      case 'code':
        return <MaterialIcon name="code" size={22} className="text-teal-500" />;
      default:
        return <MaterialIcon name="draft" size={22} className="text-neutral-400" />;
    }
  };

  const renderPane = (panePath: string, paneItems: FileItem[], onNavigate: (p: string) => void) => {
    if (paneItems.length === 0) {
      return (
        <div
          onContextMenu={(e) => onContextMenu(e)}
          className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-400 select-none min-h-[300px]"
        >
          <MaterialIcon name="folder_open" size={48} className="text-neutral-300 dark:text-neutral-700 mb-2" />
          <h3 className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm font-sans">
            This folder is empty
          </h3>
          <p className="text-xs text-neutral-500 mt-1 font-sans">
            Right-click or click &apos;New Folder&apos; above to create items.
          </p>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div
          onContextMenu={(e) => onContextMenu(e)}
          className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 select-none font-sans"
        >
          {paneItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.isFolder) {
                    onNavigate(item.path);
                  } else {
                    onOpenFile(item);
                  }
                }}
                onContextMenu={(e) => {
                  e.stopPropagation();
                  onContextMenu(e, item);
                }}
                className={`group p-3.5 rounded-3xl border transition-all cursor-pointer flex flex-col items-center text-center relative ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                    : 'border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-[#1e2124] hover:bg-neutral-50 dark:hover:bg-[#282b2e] hover:shadow-xs'
                }`}
              >
                {/* Select indicator */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(item.id, e);
                  }}
                  className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'opacity-0 group-hover:opacity-100 bg-neutral-200 dark:bg-neutral-700 text-neutral-600'
                  }`}
                >
                  {isSelected && <MaterialIcon name="check" size={14} className="text-white" />}
                </div>

                {/* Media thumbnail or icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  {item.category === 'photo' && item.mediaUrl ? (
                    <img src={item.mediaUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    getFileIcon(item)
                  )}
                </div>

                <div className="w-full">
                  <div className="font-semibold text-xs text-neutral-800 dark:text-neutral-100 truncate font-sans" title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 font-sans">
                    {item.isFolder ? (item.itemCount !== undefined ? `${item.itemCount} items` : 'Folder') : formatFileSize(item.size)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // List & Compact View
    return (
      <div
        onContextMenu={(e) => onContextMenu(e)}
        className="w-full overflow-x-auto select-none font-sans"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium">
              <th className="py-2.5 px-4 w-8"></th>
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3">Date Modified</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-4 text-right">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {paneItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <tr
                  key={item.id}
                  onClick={() => {
                    if (item.isFolder) {
                      onNavigate(item.path);
                    } else {
                      onOpenFile(item);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.stopPropagation();
                    onContextMenu(e, item);
                  }}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <td className="py-2.5 px-4">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(item.id, e);
                      }}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                    >
                      {isSelected && <MaterialIcon name="check" size={12} className="text-white" />}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5 font-medium text-neutral-800 dark:text-neutral-100">
                      {getFileIcon(item)}
                      <span className="truncate max-w-md">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-500">{formatDate(item.mtime)}</td>
                  <td className="py-2.5 px-3 text-neutral-400 capitalize">
                    {item.isFolder ? 'Folder' : `${item.extension.toUpperCase()} File`}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-neutral-500">
                    {item.isFolder ? '-' : formatFileSize(item.size)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-neutral-50/50 dark:bg-[#191c1e] font-sans">
      {/* Primary Pane */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {renderPane(currentPath, items, onNavigatePath)}
      </div>

      {/* Optional Split-Pane / Dual-Pane */}
      {dualPaneEnabled && secondaryPath && onNavigateSecondaryPath && (
        <div className="flex-1 flex flex-col overflow-y-auto border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-[#191c1e]/30">
          <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-500 font-mono">
            {secondaryPath}
          </div>
          {renderPane(secondaryPath, secondaryItems || [], onNavigateSecondaryPath)}
        </div>
      )}
    </div>
  );
};
