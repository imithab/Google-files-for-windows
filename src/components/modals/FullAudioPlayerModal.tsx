import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { formatFileSize, formatDuration } from '../../utils/fileSystemLogic';

interface FullAudioPlayerModalProps {
  isOpen: boolean;
  currentTrack: FileItem | null;
  allTracks: FileItem[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectTrack: (track: FileItem) => void;
  onChangeVolume: (vol: number) => void;
  onToggleMute: () => void;
  onChangePlaybackRate: (rate: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onRevealInFolder: (track: FileItem) => void;
  onClose: () => void;
}

export const FullAudioPlayerModal: React.FC<FullAudioPlayerModalProps> = ({
  isOpen,
  currentTrack,
  allTracks,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  isShuffle,
  repeatMode,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
  onSelectTrack,
  onChangeVolume,
  onToggleMute,
  onChangePlaybackRate,
  onToggleShuffle,
  onCycleRepeat,
  onRevealInFolder,
  onClose,
}) => {
  const [showQueue, setShowQueue] = React.useState(true);
  const [searchQueue, setSearchQueue] = React.useState('');

  // Handle keyboard events
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onSeek(Math.min(duration || 30, currentTime + 5));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onSeek(Math.max(0, currentTime - 5));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onChangeVolume(Math.min(1, volume + 0.1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onChangeVolume(Math.max(0, volume - 0.1));
      } else if (e.key.toLowerCase() === 'm') {
        onToggleMute();
      } else if (e.key.toLowerCase() === 's') {
        onToggleShuffle();
      } else if (e.key.toLowerCase() === 'r') {
        onCycleRepeat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, currentTime, duration, volume, isMuted]);

  if (!isOpen || !currentTrack) return null;

  const filteredQueue = allTracks.filter((t) =>
    t.name.toLowerCase().includes(searchQueue.toLowerCase()) ||
    (t.artist && t.artist.toLowerCase().includes(searchQueue.toLowerCase()))
  );

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0f12]/98 backdrop-blur-2xl flex flex-col text-white select-none animate-in fade-in duration-200 font-sans">
      {/* Top Header */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-white/10 bg-[#16181c]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Minimize to Mini Player (Esc)"
          >
            <MaterialIcon name="expand_more" size={24} />
          </button>
          <div>
            <h2 className="text-sm font-medium text-neutral-100 font-display">Audio Studio</h2>
            <div className="text-[11px] text-neutral-400">Files Studio High-Fidelity Audio Engine</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRevealInFolder(currentTrack)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-neutral-200 transition-colors cursor-pointer"
          >
            <MaterialIcon name="folder_open" size={16} />
            <span className="hidden sm:inline">Reveal in Folder</span>
          </button>

          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              showQueue ? 'bg-[#0b57d0] text-white shadow-xs' : 'bg-white/10 hover:bg-white/20 text-neutral-200'
            }`}
          >
            <MaterialIcon name="queue_music" size={17} />
            <span className="hidden sm:inline">Queue ({allTracks.length})</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Vinyl/Art/Waveform + Right Queue Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Player Stage */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
          {/* Ambient Colorful Glow */}
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-[#0b57d0]/20 to-[#a8c7fa]/20 blur-3xl pointer-events-none" />

          {/* Vinyl Record Display */}
          <div className="relative mb-8">
            <div
              className={`w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-900 border-4 border-neutral-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center relative overflow-hidden ${
                isPlaying ? 'animate-[spin_9s_linear_infinite]' : ''
              }`}
            >
              {/* Concentric vinyl groove rings */}
              <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-5 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-9 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-13 rounded-full border border-white/5 pointer-events-none" />
              <div className="absolute inset-17 rounded-full border border-white/5 pointer-events-none" />

              {/* Center Record Label */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0b57d0] to-[#004a77] border-2 border-white/20 flex flex-col items-center justify-center shadow-inner text-center p-2">
                <MaterialIcon name="music_note" size={24} className="text-white" />
                <span className="text-[9px] font-bold text-white uppercase tracking-wider mt-0.5">
                  {currentTrack.extension}
                </span>
                <div className="w-4 h-4 rounded-full bg-[#0d0f12] mt-1 border border-white/20" />
              </div>
            </div>
          </div>

          {/* Track Title & Artist */}
          <div className="text-center max-w-lg space-y-1 mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-100 font-display truncate">
              {currentTrack.title || currentTrack.name.replace(/\.[^/.]+$/, '')}
            </h1>
            <p className="text-sm text-neutral-400 font-sans">
              {currentTrack.artist || 'Files Studio Media Engine'}
            </p>
          </div>

          {/* Equalizer Visualizer Spectrum */}
          <div className="flex items-end justify-center gap-1.5 h-12 mb-6 px-4">
            {[35, 60, 45, 80, 95, 65, 40, 75, 90, 50, 70, 85, 45, 60, 30].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-[#0b57d0] to-[#a8c7fa] rounded-full transition-all duration-150"
                style={{
                  height: isPlaying ? `${Math.max(12, (h * (Math.sin((currentTime * 3) + i) + 1.2)) / 2)}%` : '8px',
                  opacity: isPlaying ? 0.9 : 0.3,
                }}
              />
            ))}
          </div>

          {/* Timeline Scrubber */}
          <div className="w-full max-w-lg mb-6">
            <div
              className="relative h-2 bg-white/20 hover:h-2.5 rounded-full cursor-pointer group transition-all"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickPos = (e.clientX - rect.left) / rect.width;
                onSeek(clickPos * (duration || 30));
              }}
            >
              <div
                className="absolute top-0 left-0 h-full bg-[#0b57d0] rounded-full group-hover:bg-[#a8c7fa] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mt-2">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration || 30)}</span>
            </div>
          </div>

          {/* Core Transport Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Shuffle */}
            <button
              onClick={onToggleShuffle}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isShuffle ? 'bg-[#0b57d0]/30 text-[#a8c7fa] border border-[#0b57d0]/60' : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title={isShuffle ? 'Shuffle On (S)' : 'Shuffle Off (S)'}
            >
              <MaterialIcon name="shuffle" size={20} />
            </button>

            {/* Skip -10s */}
            <button
              onClick={() => onSeek(Math.max(0, currentTime - 10))}
              className="p-2.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Rewind 10s"
            >
              <MaterialIcon name="replay_10" size={22} />
            </button>

            {/* Previous */}
            <button
              onClick={onPrev}
              className="p-3 rounded-full hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
              title="Previous Track"
            >
              <MaterialIcon name="skip_previous" size={26} />
            </button>

            {/* Play / Pause Giant Button */}
            <button
              onClick={onTogglePlay}
              className="w-16 h-16 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white flex items-center justify-center shadow-xl transition-transform active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} fill size={36} className={!isPlaying ? 'ml-1' : ''} />
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              className="p-3 rounded-full hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer"
              title="Next Track"
            >
              <MaterialIcon name="skip_next" size={26} />
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => onSeek(Math.min(duration || 30, currentTime + 10))}
              className="p-2.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Forward 10s"
            >
              <MaterialIcon name="forward_10" size={22} />
            </button>

            {/* Repeat */}
            <button
              onClick={onCycleRepeat}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                repeatMode !== 'off' ? 'bg-[#0b57d0]/30 text-[#a8c7fa] border border-[#0b57d0]/60' : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title={`Repeat: ${repeatMode} (R)`}
            >
              <MaterialIcon name={repeatMode === 'one' ? 'repeat_one' : 'repeat'} size={20} />
            </button>
          </div>

          {/* Bottom Secondary Controls: Volume & Speed */}
          <div className="flex items-center justify-center gap-6 text-xs mt-2">
            {/* Speed pills */}
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              {[0.75, 1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => onChangePlaybackRate(rate)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                    playbackRate === rate ? 'bg-[#0b57d0] text-white shadow-2xs' : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={onToggleMute} className="p-1 text-neutral-300 hover:text-white cursor-pointer">
                <MaterialIcon name={isMuted || volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'} size={20} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                className="w-24 h-1 accent-[#0b57d0] cursor-pointer"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
              <span className="font-mono text-[11px] text-neutral-400 w-8">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Playlist Queue & Track Info Drawer */}
        {showQueue && (
          <div className="w-84 sm:w-96 border-l border-white/10 bg-[#16181c]/95 backdrop-blur-xl p-5 flex flex-col font-sans shrink-0 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <h3 className="font-medium text-neutral-100 text-sm font-display">Play Queue</h3>
              <span className="text-[11px] text-neutral-400 font-mono">
                {allTracks.length} tracks
              </span>
            </div>

            {/* Queue Search Input */}
            <div className="relative mb-3">
              <MaterialIcon name="search" size={17} className="absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Filter tracks..."
                value={searchQueue}
                onChange={(e) => setSearchQueue(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-[#0b57d0]"
              />
            </div>

            {/* Track List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar pr-1">
              {filteredQueue.map((track) => {
                const isActive = track.id === currentTrack.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => onSelectTrack(track)}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0b57d0]/25 border border-[#0b57d0]/60 text-white shadow-xs'
                        : 'hover:bg-white/5 text-neutral-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center shrink-0">
                      <MaterialIcon
                        name={isActive ? (isPlaying ? 'volume_up' : 'pause') : 'music_note'}
                        size={19}
                        className={isActive ? 'text-[#a8c7fa]' : 'text-neutral-400'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate font-display">{track.name}</div>
                      <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {track.artist || 'Audio Track'} · {formatDuration(track.duration || 180)}
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#a8c7fa] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Track Specs footer */}
            <div className="pt-3 border-t border-white/10 mt-3 text-[11px] text-neutral-400 space-y-1">
              <div className="flex justify-between">
                <span>File Size:</span>
                <span className="font-mono text-neutral-200">{formatFileSize(currentTrack.size)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sample Rate:</span>
                <span className="font-mono text-neutral-200">44.1 kHz · 24-bit</span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="uppercase font-mono text-neutral-200">{currentTrack.extension}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
