import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { formatFileSize, formatDuration } from '../../utils/fileSystemLogic';

interface VideosViewProps {
  videos: FileItem[];
  currentSubCategory: string;
  onChangeSubCategory: (sub: string) => void;
  onOpenVideo: (video: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
}

export const VideosView: React.FC<VideosViewProps> = ({
  videos,
  currentSubCategory,
  onChangeSubCategory,
  onOpenVideo,
  onContextMenu,
}) => {
  const subCategories = [
    { id: 'all', label: 'All Videos', iconName: 'movie' },
    { id: 'recording', label: 'Screen Recordings', iconName: 'screenshot_monitor' },
    { id: 'camera', label: 'Camera Recordings', iconName: 'photo_camera' },
    { id: 'download', label: 'Downloads', iconName: 'download' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none bg-neutral-50/50 dark:bg-[#191c1e] font-sans">
      {/* Subcategory tabs */}
      <div className="px-6 py-2.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-[#1e2124]/70 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
          {subCategories.map((sub) => {
            const isActive = currentSubCategory === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onChangeSubCategory(sub.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium font-sans transition-all ${
                  isActive
                    ? 'bg-[#fef7e0] dark:bg-[#332400] text-[#b06000] dark:text-[#fdd663] font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <MaterialIcon
                  name={sub.iconName}
                  size={18}
                  className={isActive ? 'text-[#b06000] dark:text-[#fdd663]' : 'text-neutral-400'}
                />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-xs text-neutral-400 font-sans">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </span>
      </div>

      {/* Main Videos Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {videos.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400">
            <MaterialIcon name="movie" size={48} className="text-neutral-300 dark:text-neutral-700 mb-2" />
            <h3 className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm font-sans">
              No videos found in this category
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Videos found across configured folders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => onOpenVideo(video)}
                onContextMenu={(e) => onContextMenu(e, video)}
                className="group relative rounded-3xl overflow-hidden cursor-pointer border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1e2124] hover:shadow-lg transition-all hover:scale-[1.01]"
              >
                {/* Video Card Poster */}
                <div className="w-full aspect-video bg-neutral-900 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Play Button Icon with Material Symbol */}
                  <div className="w-12 h-12 rounded-full bg-amber-500/90 group-hover:bg-amber-500 text-white flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 z-10">
                    <MaterialIcon name="play_arrow" fill size={28} className="text-white ml-0.5" />
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[11px] font-mono text-white">
                    {formatDuration(video.duration || 30)}
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3.5">
                  <h4 className="font-semibold text-xs text-neutral-800 dark:text-neutral-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-sans">
                    {video.name}
                  </h4>
                  <div className="text-[11px] text-neutral-400 flex items-center justify-between mt-1.5 font-sans">
                    <span>{formatFileSize(video.size)}</span>
                    <span className="font-mono text-[10px]">1080p · MP4</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
