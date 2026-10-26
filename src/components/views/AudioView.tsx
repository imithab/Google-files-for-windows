import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem, ViewMode } from '../../types';
import { formatFileSize, formatDuration } from '../../utils/fileSystemLogic';

interface AudioViewProps {
  audioFiles: FileItem[];
  currentSubCategory: string;
  onChangeSubCategory: (sub: string) => void;
  currentTrack: FileItem | null;
  isPlaying: boolean;
  onPlayTrack: (track: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
}

export const AudioView: React.FC<AudioViewProps> = ({
  audioFiles,
  currentSubCategory,
  onChangeSubCategory,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onContextMenu,
}) => {
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');

  const subCategories = [
    { id: 'all', label: 'All Audio', iconName: 'music_note' },
    { id: 'recording', label: 'Voice Recordings', iconName: 'mic' },
    { id: 'download', label: 'Downloads', iconName: 'download' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none bg-neutral-50/50 dark:bg-[#191c1e] font-sans">
      {/* Header bar */}
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
                    ? 'bg-[#e6f4ea] dark:bg-[#0c2b18] text-[#137333] dark:text-[#81c995] font-semibold shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <MaterialIcon
                  name={sub.iconName}
                  size={18}
                  className={isActive ? 'text-[#137333] dark:text-[#81c995]' : 'text-neutral-400'}
                />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs font-sans">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Toggle List/Grid"
          >
            <MaterialIcon name={viewMode === 'list' ? 'grid_view' : 'format_list_bulleted'} size={18} />
          </button>
          <span className="text-neutral-400">
            {audioFiles.length} {audioFiles.length === 1 ? 'track' : 'tracks'}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {audioFiles.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400">
            <MaterialIcon name="music_note" size={48} className="text-neutral-300 dark:text-neutral-700 mb-2" />
            <h3 className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm font-sans">
              No audio files found
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Music and recordings from your device will appear here automatically.
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-[#1e2124]/80 overflow-hidden shadow-2xs divide-y divide-neutral-100 dark:divide-neutral-800">
            {audioFiles.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const playing = isCurrent && isPlaying;
              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  onContextMenu={(e) => onContextMenu(e, track)}
                  className={`group px-4 py-3 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-[#e6f4ea]/70 dark:bg-[#0c2b18]/40'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Play/Pause indicator button with Material Symbols */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(track);
                      }}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 group-hover:bg-emerald-600 group-hover:text-white text-neutral-500'
                      }`}
                    >
                      <MaterialIcon
                        name={playing ? 'pause' : 'play_arrow'}
                        fill={true}
                        size={22}
                        className={isCurrent ? 'text-white' : ''}
                      />
                    </button>

                    <div className="min-w-0">
                      <div className={`font-semibold text-xs truncate font-sans ${
                        isCurrent ? 'text-emerald-700 dark:text-emerald-300' : 'text-neutral-800 dark:text-neutral-100'
                      }`}>
                        {track.title || track.name.replace(/\.[^/.]+$/, '')}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate flex items-center gap-1.5 mt-0.5 font-sans">
                        <span>{track.artist || 'Local Audio File'}</span>
                        <span>·</span>
                        <span>{track.extension.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-400 font-sans">
                    <span className="hidden sm:inline">{formatFileSize(track.size)}</span>
                    <span className="font-mono text-[11px]">{formatDuration(track.duration || 15)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {audioFiles.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const playing = isCurrent && isPlaying;
              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  onContextMenu={(e) => onContextMenu(e, track)}
                  className="group p-3.5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1e2124] hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-full aspect-square rounded-2xl bg-gradient-to-tr from-emerald-600/80 to-teal-500/80 flex items-center justify-center relative overflow-hidden mb-2.5 shadow-xs">
                    <MaterialIcon name="album" size={44} className={`text-white/90 ${playing ? 'animate-[spin_6s_linear_infinite]' : ''}`} />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-md">
                        <MaterialIcon name={playing ? 'pause' : 'play_arrow'} fill size={26} />
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-xs text-neutral-800 dark:text-neutral-100 truncate font-sans">
                    {track.name}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                    {formatDuration(track.duration || 15)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
