import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { formatFileSize, formatDuration, formatDate } from '../../utils/fileSystemLogic';

interface VideoPlayerModalProps {
  currentVideo: FileItem | null;
  onClose: () => void;
  onRevealInFolder: (video: FileItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  currentVideo,
  onClose,
  onRevealInFolder,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(0.9);
  const [isMuted, setIsMuted] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState(1);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  if (!currentVideo) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col text-white select-none animate-in fade-in duration-150 font-sans">
      {/* Top Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 bg-neutral-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <MaterialIcon name="close" size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-medium truncate max-w-md">{currentVideo.name}</h2>
            <div className="text-[11px] text-neutral-400">
              {formatFileSize(currentVideo.size)} · {formatDate(currentVideo.mtime)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRevealInFolder(currentVideo)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-neutral-200 transition-colors"
          >
            <MaterialIcon name="folder_open" size={16} />
            <span>Reveal in Folder</span>
          </button>
        </div>
      </div>

      {/* Main Video Surface */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        <video
          ref={videoRef}
          src={currentVideo.mediaUrl || `/api/media/content?path=${encodeURIComponent(currentVideo.path)}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current?.duration) setDuration(videoRef.current.duration);
          }}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          className="max-h-[75vh] max-w-[85vw] rounded-2xl shadow-2xl bg-black cursor-pointer"
        />

        {/* Video play overlay if paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-full bg-[#0b57d0]/90 group-hover:bg-[#0b57d0] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110">
              <MaterialIcon name="play_arrow" fill={true} size={40} className="ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="p-4 bg-gradient-to-t from-black/90 to-transparent">
        <div className="max-w-4xl mx-auto bg-neutral-900/90 border border-white/15 rounded-3xl p-3.5 shadow-2xl backdrop-blur-md">
          {/* Progress Slider */}
          <div
            className="relative h-2 bg-white/20 hover:h-2.5 rounded-full cursor-pointer group transition-all"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              handleSeek(clickPos * (duration || 30));
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-[#a8c7fa] rounded-full group-hover:bg-[#d3e3fd]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white flex items-center justify-center transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} fill={true} size={20} className={!isPlaying ? 'ml-0.5' : ''} />
              </button>
              <button
                onClick={() => handleSeek(Math.max(0, currentTime - 5))}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300"
                title="Rewind 5s"
              >
                <MaterialIcon name="replay_5" size={18} />
              </button>

              <div className="text-neutral-300 font-mono text-[11px]">
                <span>{formatDuration(currentTime)}</span>
                <span className="mx-1 text-neutral-500">/</span>
                <span>{formatDuration(duration || 30)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Playback rate selector */}
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                      playbackRate === rate ? 'bg-[#0b57d0] text-white' : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Volume */}
              <div className="flex items-center gap-1.5">
                <button onClick={toggleMute} className="p-1 hover:text-white text-neutral-300">
                  <MaterialIcon name={isMuted || volume === 0 ? 'volume_off' : 'volume_up'} size={18} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 accent-[#a8c7fa] cursor-pointer"
                />
              </div>

              <button
                onClick={handleFullscreen}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white"
                title="Fullscreen"
              >
                <MaterialIcon name="fullscreen" size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
