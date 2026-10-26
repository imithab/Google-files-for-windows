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
  isShuffle?: boolean;
  onToggleShuffle?: () => void;
  repeatMode?: 'off' | 'all' | 'one';
  onCycleRepeat?: () => void;
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
  isShuffle = false,
  onToggleShuffle,
  repeatMode = 'all',
  onCycleRepeat,
}) => {
  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.7)] bg-white/95 dark:bg-[#1e2024]/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-700/80 p-3.5 select-none animate-in slide-in-from-bottom-4 duration-200 font-sans">
      {/* Top row: Artwork, Title, Window controls */}
      <div className="flex items-center gap-3">
        {/* Animated vinyl / artwork badge */}
        <div
          onClick={onExpand}
          className={`w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0b57d0] to-[#004a77] flex items-center justify-center shrink-0 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95 group relative ${
            isPlaying ? 'animate-[spin_7s_linear_infinite]' : ''
          }`}
          title="Click to expand player"
        >
          <MaterialIcon name="album" size={24} className="text-white" />
          {/* Subtle center hole */}
          <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-[#1e2024] shadow-xs" />
        </div>

        {/* Track Title & Artist info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onExpand}>
          <div className="font-semibold text-neutral-800 dark:text-neutral-100 text-xs truncate font-display">
            {currentTrack.title || currentTrack.name.replace(/\.[^/.]+$/, '')}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1.5 mt-0.5 font-sans">
            <span className="truncate">{currentTrack.artist || 'Files Studio Music'}</span>
            <span>·</span>
            <span className="uppercase text-[9px] font-mono tracking-wider">{currentTrack.extension}</span>
          </div>
        </div>

        {/* Mini Equalizer Pulse Animation */}
        {isPlaying && (
          <div className="flex items-end gap-0.5 h-4 px-1 shrink-0" title="Audio playing">
            <div className="w-0.5 bg-[#0b57d0] dark:bg-[#a8c7fa] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
            <div className="w-0.5 bg-[#0b57d0] dark:bg-[#a8c7fa] rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.2s] h-4" />
            <div className="w-0.5 bg-[#0b57d0] dark:bg-[#a8c7fa] rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.4s] h-2.5" />
            <div className="w-0.5 bg-[#0b57d0] dark:bg-[#a8c7fa] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.1s] h-3.5" />
          </div>
        )}

        {/* Expand & Close controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onExpand}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Expand Full Studio Player"
          >
            <MaterialIcon name="open_in_full" size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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
            onSeek(clickPos * (duration || 30));
          }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-[#0b57d0] dark:bg-[#a8c7fa] rounded-full group-hover:brightness-110 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-1">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration || 30)}</span>
        </div>
      </div>

      {/* Playback Controls & Volume Slider */}
      <div className="flex items-center justify-between mt-1">
        {/* Play/Pause/Prev/Next buttons */}
        <div className="flex items-center gap-1">
          {onToggleShuffle && (
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isShuffle ? 'text-[#0b57d0] dark:text-[#a8c7fa]' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
            >
              <MaterialIcon name="shuffle" size={16} />
            </button>
          )}

          <button
            onClick={onPrev}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            title="Previous Track"
          >
            <MaterialIcon name="skip_previous" size={19} />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} fill size={20} className={isPlaying ? '' : 'ml-0.5'} />
          </button>

          <button
            onClick={onNext}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            title="Next Track"
          >
            <MaterialIcon name="skip_next" size={19} />
          </button>

          {onCycleRepeat && (
            <button
              onClick={onCycleRepeat}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                repeatMode !== 'off' ? 'text-[#0b57d0] dark:text-[#a8c7fa]' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              <MaterialIcon name={repeatMode === 'one' ? 'repeat_one' : 'repeat'} size={16} />
            </button>
          )}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <MaterialIcon name={isMuted || volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'} size={17} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-16 h-1 accent-[#0b57d0] cursor-pointer"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
};
