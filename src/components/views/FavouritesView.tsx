import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { formatFileSize, formatDate } from '../../utils/fileSystemLogic';

interface FavouritesViewProps {
  favourites: FileItem[];
  onOpenFile: (file: FileItem) => void;
  onRevealInFolder: (file: FileItem) => void;
  onRemoveFavourite: (file: FileItem) => void;
}

export const FavouritesView: React.FC<FavouritesViewProps> = ({
  favourites,
  onOpenFile,
  onRevealInFolder,
  onRemoveFavourite,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto space-y-6 select-none font-sans">
      <div>
        <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-50 flex items-center gap-2.5">
          <MaterialIcon name="star" fill={true} size={28} className="text-[#f9ab00]" />
          <span>Starred Favourites</span>
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Quickly access your most valued files and folders. Starred items remain in their original folders.
        </p>
      </div>

      {favourites.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400">
          <div className="w-16 h-16 rounded-full bg-[#fef7e0] dark:bg-[#7c4a00]/30 flex items-center justify-center mb-3">
            <MaterialIcon name="star" size={32} className="text-[#f9ab00]" />
          </div>
          <h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">
            No favourites starred yet
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Click the star icon on any photo, video, song, document, or folder to add it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favourites.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenFile(item)}
              className="group p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.category === 'photo' && item.mediaUrl ? (
                      <img src={item.mediaUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : item.category === 'video' ? (
                      <MaterialIcon name="movie" size={24} className="text-amber-500" />
                    ) : item.category === 'audio' ? (
                      <MaterialIcon name="music_note" size={24} className="text-emerald-500" />
                    ) : (
                      <MaterialIcon name="description" size={24} className="text-[#0b57d0]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-xs text-neutral-800 dark:text-neutral-100 truncate group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa] transition-colors">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-neutral-400 capitalize">
                      {item.category} · {formatFileSize(item.size)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavourite(item);
                  }}
                  className="p-1.5 rounded-full text-[#f9ab00] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Remove from Favourites"
                >
                  <MaterialIcon name="star" fill={true} size={20} className="text-[#f9ab00]" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="font-mono truncate max-w-[200px]">{item.path}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevealInFolder(item);
                  }}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-200"
                  title="Reveal in Folder"
                >
                  <MaterialIcon name="folder_open" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

