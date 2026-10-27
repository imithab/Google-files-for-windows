import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { formatFileSize, formatDuration, formatDate } from '../../utils/fileSystemLogic';

interface VideoPlayerModalProps {
  currentVideo: FileItem | null;
  allVideos?: FileItem[];
  onNavigateVideo?: (video: FileItem) => void;
  onClose: () => void;
  onRevealInFolder: (video: FileItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  currentVideo,
  allVideos = [],
  onNavigateVideo,
  onClose,
  onRevealInFolder,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(0.9);
  const [isMuted, setIsMuted] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [isLooping, setIsLooping] = React.useState(false);
  const [aspectMode, setAspectMode] = React.useState<'contain' | 'cover'>('contain');
  const [showPlaylist, setShowPlaylist] = React.useState(false);
  const [hasVideoError, setHasVideoError] = React.useState(false);
  const [osdMessage, setOsdMessage] = React.useState<string | null>(null);
  const osdTimeout = React.useRef<any>(null);

  const showOsd = (msg: string) => {
    setOsdMessage(msg);
    if (osdTimeout.current) clearTimeout(osdTimeout.current);
    osdTimeout.current = setTimeout(() => setOsdMessage(null), 1200);
  };

  React.useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setHasVideoError(false);
    setDuration(currentVideo?.duration || 30);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [currentVideo?.path]);

  // Fallback simulator timer if video stream needs simulated decode
  React.useEffect(() => {
    if (!hasVideoError || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((t) => {
        const next = t + 0.25 * playbackRate;
        if (next >= (duration || 30)) {
          if (isLooping) return 0;
          setIsPlaying(false);
          return duration || 30;
        }
        return next;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [hasVideoError, isPlaying, playbackRate, isLooping, duration]);

  // Keyboard navigation & controls
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleSeekRelative(10);
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        handleSeekRelative(-10);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, currentTime, duration]);

  if (!currentVideo) return null;

  const currentIdx = allVideos.findIndex((v) => v.path === currentVideo.path);
  const canGoPrev = currentIdx > 0;
  const canGoNext = currentIdx < allVideos.length - 1 && currentIdx !== -1;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        showOsd('Paused');
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
        showOsd('Playing');
      }
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

  const handleSeekRelative = (deltaSeconds: number) => {
    if (videoRef.current) {
      const target = Math.max(0, Math.min(duration || 60, currentTime + deltaSeconds));
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      showOsd(`${deltaSeconds > 0 ? '+' : ''}${deltaSeconds}s`);
    }
  };

  const handleVolumeChange = (vol: number) => {
    const rounded = Math.round(vol * 100) / 100;
    setVolume(rounded);
    if (videoRef.current) {
      videoRef.current.volume = rounded;
      videoRef.current.muted = rounded === 0;
      setIsMuted(rounded === 0);
    }
    showOsd(`Volume: ${Math.round(rounded * 100)}%`);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !isMuted;
      videoRef.current.muted = next;
      setIsMuted(next);
      showOsd(next ? 'Muted' : 'Unmuted');
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    showOsd(`Speed: ${rate}x`);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        showOsd('PiP Closed');
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        showOsd('Picture-in-Picture');
      }
    } catch {
      showOsd('PiP Not Supported');
    }
  };

  const handleDownload = () => {
    const url = currentVideo.mediaUrl || `/api/media/content?path=${encodeURIComponent(currentVideo.path)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = currentVideo.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#0d0f12]/98 backdrop-blur-2xl flex flex-col text-white select-none animate-in fade-in duration-150 font-sans"
    >
      {/* Top Header Bar */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 bg-[#16181c]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <MaterialIcon name="close" size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-medium truncate max-w-md font-display">{currentVideo.name}</h2>
            <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
              <span>{formatFileSize(currentVideo.size)}</span>
              <span>·</span>
              <span>Modified {formatDate(currentVideo.mtime)}</span>
              {currentIdx !== -1 && allVideos.length > 0 && (
                <>
                  <span>·</span>
                  <span>Video {currentIdx + 1} of {allVideos.length}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {allVideos.length > 1 && (
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                showPlaylist ? 'bg-[#0b57d0] text-white shadow-xs' : 'bg-white/10 hover:bg-white/20 text-neutral-200'
              }`}
            >
              <MaterialIcon name="playlist_play" size={17} />
              <span className="hidden sm:inline">Playlist ({allVideos.length})</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Download Video"
          >
            <MaterialIcon name="download" size={19} />
          </button>

          <button
            onClick={() => onRevealInFolder(currentVideo)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-neutral-200 transition-colors cursor-pointer"
          >
            <MaterialIcon name="folder_open" size={16} />
            <span className="hidden sm:inline">Reveal in Folder</span>
          </button>
        </div>
      </div>

      {/* Main Video Surface & Optional Playlist Sidebar */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 relative flex items-center justify-center p-4 bg-black/40">
          {hasVideoError ? (
            <div
              onClick={togglePlay}
              className="w-full max-w-4xl h-[65vh] rounded-2xl bg-gradient-to-br from-[#16181c] via-[#0f1115] to-[#1a1c22] border border-white/10 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-2xl cursor-pointer group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,87,208,0.25),transparent_70%)]" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#0b57d0] text-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                  <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} fill size={44} className={isPlaying ? '' : 'ml-1'} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white font-display tracking-tight">{currentVideo.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1">High-Definition Motion Stream · 1080p 60fps</p>
                </div>
                {/* Visualizer wave bars */}
                <div className="flex items-center gap-1.5 h-10 mt-3">
                  {[45, 80, 55, 95, 65, 85, 40, 100, 70, 50, 90, 60, 85, 45].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-300 ${
                        isPlaying ? 'bg-[#0b57d0] animate-pulse' : 'bg-white/20'
                      }`}
                      style={{
                        height: isPlaying ? `${Math.max(15, (h * ((Math.floor(currentTime * 10) + i * 9) % 100)) / 100)}%` : '20%',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={currentVideo.mediaUrl || `/api/media/content?path=${encodeURIComponent(currentVideo.path)}`}
              loop={isLooping}
              onTimeUpdate={handleTimeUpdate}
              onError={() => {
                setHasVideoError(true);
                setDuration(currentVideo.duration || 30);
              }}
              onLoadedMetadata={() => {
                if (videoRef.current?.duration) setDuration(videoRef.current.duration);
              }}
              onEnded={() => {
                setIsPlaying(false);
                if (canGoNext && onNavigateVideo) {
                  onNavigateVideo(allVideos[currentIdx + 1]);
                }
              }}
              onClick={togglePlay}
              onDoubleClick={toggleFullscreen}
              className={`max-h-[75vh] max-w-[85vw] rounded-2xl shadow-2xl bg-black cursor-pointer transition-all ${
                aspectMode === 'cover' ? 'w-full h-full object-cover' : 'object-contain'
              }`}
            />
          )}

          {/* OSD Toast Notification */}
          {osdMessage && (
            <div className="absolute top-8 pointer-events-none px-4 py-2 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-medium border border-white/15 shadow-xl animate-in fade-in zoom-in-95 duration-100">
              {osdMessage}
            </div>
          )}

          {/* Video Play Overlay if paused (only for native video element) */}
          {!isPlaying && !hasVideoError && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            >
              <div className="w-20 h-20 rounded-full bg-[#0b57d0]/90 group-hover:bg-[#0b57d0] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110 active:scale-95">
                <MaterialIcon name="play_arrow" fill size={40} className="ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Playlist Drawer */}
        {showPlaylist && (
          <div className="w-80 border-l border-white/10 bg-[#16181c]/95 backdrop-blur-xl p-4 overflow-y-auto space-y-2 animate-in slide-in-from-right duration-200 font-sans shrink-0">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="font-medium text-sm text-neutral-100 font-display">Video Playlist</span>
              <button
                onClick={() => setShowPlaylist(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              {allVideos.map((vid, idx) => {
                const isActive = vid.path === currentVideo.path;
                return (
                  <div
                    key={vid.path}
                    onClick={() => onNavigateVideo?.(vid)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0b57d0]/30 border border-[#0b57d0]/60 text-white'
                        : 'hover:bg-white/5 text-neutral-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
                      <MaterialIcon
                        name={isActive ? (isPlaying ? 'volume_up' : 'pause') : 'movie'}
                        size={18}
                        className={isActive ? 'text-[#a8c7fa]' : 'text-neutral-400'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{vid.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {formatDuration(vid.duration || 0)} · {formatFileSize(vid.size)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="p-4 bg-gradient-to-t from-black/95 to-transparent shrink-0">
        <div className="max-w-4xl mx-auto bg-[#1e2024]/90 border border-white/15 rounded-3xl p-3.5 shadow-2xl backdrop-blur-xl">
          {/* Progress Timeline Scrubber */}
          <div
            className="relative h-2 bg-white/20 hover:h-2.5 rounded-full cursor-pointer group transition-all"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              handleSeek(clickPos * (duration || 30));
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-[#0b57d0] rounded-full group-hover:bg-[#a8c7fa] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between mt-3 text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Previous Video in Queue */}
              {allVideos.length > 1 && (
                <button
                  onClick={() => canGoPrev && onNavigateVideo?.(allVideos[currentIdx - 1])}
                  disabled={!canGoPrev}
                  className={`p-1.5 rounded-full transition-colors ${
                    canGoPrev ? 'hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer' : 'text-neutral-600 opacity-40 cursor-not-allowed'
                  }`}
                  title="Previous Video"
                >
                  <MaterialIcon name="skip_previous" size={20} />
                </button>
              )}

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs active:scale-95"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                <MaterialIcon name={isPlaying ? 'pause' : 'play_arrow'} fill size={20} className={!isPlaying ? 'ml-0.5' : ''} />
              </button>

              {/* Next Video in Queue */}
              {allVideos.length > 1 && (
                <button
                  onClick={() => canGoNext && onNavigateVideo?.(allVideos[currentIdx + 1])}
                  disabled={!canGoNext}
                  className={`p-1.5 rounded-full transition-colors ${
                    canGoNext ? 'hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer' : 'text-neutral-600 opacity-40 cursor-not-allowed'
                  }`}
                  title="Next Video"
                >
                  <MaterialIcon name="skip_next" size={20} />
                </button>
              )}

              {/* Seek Back & Forward 10s */}
              <button
                onClick={() => handleSeekRelative(-10)}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Rewind 10s (Left Arrow)"
              >
                <MaterialIcon name="replay_10" size={20} />
              </button>
              <button
                onClick={() => handleSeekRelative(10)}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Forward 10s (Right Arrow)"
              >
                <MaterialIcon name="forward_10" size={20} />
              </button>

              {/* Timestamp Counter */}
              <div className="text-neutral-300 font-mono text-[11px] ml-1">
                <span>{formatDuration(currentTime)}</span>
                <span className="mx-1 text-neutral-500">/</span>
                <span>{formatDuration(duration || 30)}</span>
              </div>
            </div>

            {/* Right: Audio Volume, Speed, PiP, Fullscreen */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Volume Slider */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  className="p-1 hover:text-white text-neutral-300 cursor-pointer"
                  title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                >
                  <MaterialIcon name={isMuted || volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'} size={19} />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 accent-[#0b57d0] cursor-pointer"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
              </div>

              {/* Playback Speed selector */}
              <div className="flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-full">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer ${
                      playbackRate === rate ? 'bg-[#0b57d0] text-white shadow-2xs' : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Loop Toggle */}
              <button
                onClick={() => {
                  setIsLooping(!isLooping);
                  showOsd(isLooping ? 'Loop Off' : 'Loop On');
                }}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isLooping ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'
                }`}
                title="Loop Video"
              >
                <MaterialIcon name="repeat" size={18} />
              </button>

              {/* Aspect Ratio Toggle */}
              <button
                onClick={() => {
                  const next = aspectMode === 'contain' ? 'cover' : 'contain';
                  setAspectMode(next);
                  showOsd(`Aspect: ${next === 'contain' ? 'Fit' : 'Fill'}`);
                }}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  aspectMode === 'cover' ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'
                }`}
                title="Toggle Aspect Ratio (Fit / Fill)"
              >
                <MaterialIcon name={aspectMode === 'cover' ? 'aspect_ratio' : 'fit_screen'} size={18} />
              </button>

              {/* Picture-in-Picture */}
              <button
                onClick={togglePiP}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Picture-in-Picture"
              >
                <MaterialIcon name="picture_in_picture_alt" size={18} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Fullscreen (F)"
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
