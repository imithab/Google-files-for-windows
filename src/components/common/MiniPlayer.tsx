import React from 'react';
import { MaterialIcon } from './MaterialIcon';
import { FileItem } from '../../types';
import { formatDuration } from '../../utils/fileSystemLogic';

interface MiniPlayerProps {
  currentTrack: FileItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onChangeVolume: (vol: number) => void;
  onToggleMute: () => void;
  onClose: () => void;
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
  onChangeVolume,
  onToggleMute,
  onClose,
  onExpand,
}) => {
  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 rounded-3xl shadow-2xl bg-white/95 dark:bg-[#1e2124]/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-700/80 p-3.5 select-none animate-in slide-in-from-bottom-4 duration-200 font-sans">
      {/* Top row: Artwork, Title, Window controls */}
      <div className="flex items-center gap-3">
        {/* Animated vinyl / artwork badge */}
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shrink-0 shadow-md ${
          isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''
        }`}>
          <MaterialIcon name="album" size={24} className="text-white" />
        </div>

        {/* Track Title & Artist info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-neutral-800 dark:text-neutral-100 text-xs truncate font-sans">
            {currentTrack.title || currentTrack.name.replace(/\.[^/.]+$/, '')}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1.5 mt-0.5 font-sans">
            <span>{currentTrack.artist || 'Files Studio Audio Engine'}</span>
            <span>·</span>
            <span className="uppercase text-[10px]">{currentTrack.extension}</span>
          </div>
        </div>

        {/* Expand & Close controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onExpand}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Expand Full Player"
          >
            <MaterialIcon name="open_in_full" size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Close Player"
          >
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      </div>

      {/* Scrubber progress slider */}
      <div className="mt-2.5">
        <div
          className="relative h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            onSeek(clickPos * duration);
          }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full group-hover:bg-emerald-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-1">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Playback Controls & Volume Slider */}
      <div className="flex items-center justify-between mt-1">
        {/* Play/Pause/Prev/Next buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            title="Previous"
          >
            <MaterialIcon name="skip_previous" size={18} />
          </button>
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} fill size={20} className={isPlaying ? '' : 'ml-0.5'} />
          </button>
          <button
            onClick={onNext}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            title="Next"
          >
            <MaterialIcon name="skip_next" size={18} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <MaterialIcon name={isMuted || volume === 0 ? 'volume_off' : 'volume_up'} size={18} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-16 h-1 accent-emerald-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
