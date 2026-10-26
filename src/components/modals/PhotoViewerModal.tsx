import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { formatFileSize, formatDate } from '../../utils/fileSystemLogic';

interface PhotoViewerModalProps {
  currentPhoto: FileItem | null;
  allPhotos: FileItem[];
  onClose: () => void;
  onNavigatePhoto: (photo: FileItem) => void;
  onToggleFavourite: (photo: FileItem) => void;
  onRevealInFolder: (photo: FileItem) => void;
  onDelete: (photo: FileItem) => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  currentPhoto,
  allPhotos,
  onClose,
  onNavigatePhoto,
  onToggleFavourite,
  onRevealInFolder,
  onDelete,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [flipH, setFlipH] = React.useState(false);
  const [flipV, setFlipV] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isSlideshow, setIsSlideshow] = React.useState(false);

  // Pan state for when zoomed in
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPan({ x: 0, y: 0 });
  }, [currentPhoto?.id]);

  // Slideshow timer
  React.useEffect(() => {
    if (!isSlideshow || !currentPhoto || allPhotos.length <= 1) return;
    const timer = setInterval(() => {
      const idx = allPhotos.findIndex((p) => p.path === currentPhoto.path);
      const nextIdx = (idx + 1) % allPhotos.length;
      onNavigatePhoto(allPhotos[nextIdx]);
    }, 3500);
    return () => clearInterval(timer);
  }, [isSlideshow, currentPhoto, allPhotos]);

  // Fullscreen listener
  React.useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const currentIndex = allPhotos.findIndex((p) => p.path === currentPhoto?.path);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < allPhotos.length - 1;

  const handlePrev = () => {
    if (canGoPrev) onNavigatePhoto(allPhotos[currentIndex - 1]);
    else if (allPhotos.length > 1) onNavigatePhoto(allPhotos[allPhotos.length - 1]);
  };

  const handleNext = () => {
    if (canGoNext) onNavigatePhoto(allPhotos[currentIndex + 1]);
    else if (allPhotos.length > 1) onNavigatePhoto(allPhotos[0]);
  };

  // Keyboard Navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(z + 0.25, 4));
      } else if (e.key === '-') {
        setZoom((z) => Math.max(z - 0.25, 0.5));
      } else if (e.key === '0') {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'i') {
        setShowInfo((prev) => !prev);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsSlideshow((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPhoto, allPhotos, currentIndex, isFullscreen]);

  if (!currentPhoto) return null;

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(z + 0.15, 4));
    } else {
      setZoom((z) => {
        const next = Math.max(z - 0.15, 0.5);
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleDownload = () => {
    const url = currentPhoto.mediaUrl || `/api/media/content?path=${encodeURIComponent(currentPhoto.path)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = currentPhoto.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
            aria-label="Close photo viewer"
          >
            <MaterialIcon name="close" size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-neutral-100 truncate max-w-md font-display">
              {currentPhoto.name}
            </h2>
            <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
              <span>{currentIndex + 1} of {allPhotos.length}</span>
              <span>·</span>
              <span>{formatFileSize(currentPhoto.size)}</span>
              {currentPhoto.dimensions && (
                <>
                  <span>·</span>
                  <span>{currentPhoto.dimensions.width} × {currentPhoto.dimensions.height}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1">
          {/* Slideshow button */}
          <button
            onClick={() => setIsSlideshow(!isSlideshow)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              isSlideshow ? 'bg-[#0b57d0] text-white shadow-xs' : 'text-neutral-300 hover:bg-white/10 hover:text-white'
            }`}
            title="Toggle Slideshow (Space)"
          >
            <MaterialIcon name={isSlideshow ? 'pause' : 'slideshow'} size={17} />
            <span className="hidden sm:inline">{isSlideshow ? 'Pause Slideshow' : 'Slideshow'}</span>
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <MaterialIcon name="zoom_in" size={20} />
          </button>
          <button
            onClick={() => {
              setZoom((z) => {
                const next = Math.max(z - 0.25, 0.5);
                if (next <= 1) setPan({ x: 0, y: 0 });
                return next;
              });
            }}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <MaterialIcon name="zoom_out" size={20} />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="px-2.5 py-1 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            title="Reset Zoom (0)"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Rotate & Flip */}
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Rotate 90°"
          >
            <MaterialIcon name="rotate_right" size={20} />
          </button>
          <button
            onClick={() => setFlipH(!flipH)}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
              flipH ? 'bg-white/20 text-white' : 'text-neutral-300 hover:text-white'
            }`}
            title="Flip Horizontal"
          >
            <MaterialIcon name="flip" size={20} />
          </button>

          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* Favourite */}
          <button
            onClick={() => onToggleFavourite(currentPhoto)}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
              currentPhoto.isFavourite ? 'text-amber-400' : 'text-neutral-300 hover:text-white'
            }`}
            title="Toggle Favourite"
          >
            <MaterialIcon name="star" fill={currentPhoto.isFavourite} size={20} />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Download Image"
          >
            <MaterialIcon name="download" size={20} />
          </button>

          {/* Reveal in folder */}
          <button
            onClick={() => onRevealInFolder(currentPhoto)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Reveal in Folder"
          >
            <MaterialIcon name="folder_open" size={20} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Fullscreen (F)"
          >
            <MaterialIcon name={isFullscreen ? 'fullscreen_exit' : 'fullscreen'} size={20} />
          </button>

          {/* Info Drawer Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer ${
              showInfo ? 'bg-white/20 text-white' : 'text-neutral-300 hover:text-white'
            }`}
            title="Image Info & EXIF (I)"
          >
            <MaterialIcon name="info" size={20} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(currentPhoto)}
            className="p-2 rounded-full hover:bg-red-500/20 text-neutral-300 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete Photo"
          >
            <MaterialIcon name="delete" size={20} />
          </button>
        </div>
      </div>

      {/* Main Viewing Canvas */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-black/60 hover:bg-black/85 text-white transition-all backdrop-blur-md shadow-xl border border-white/10 cursor-pointer hover:scale-105 active:scale-95"
          title="Previous Photo (Left Arrow)"
        >
          <MaterialIcon name="arrow_back" size={24} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-black/60 hover:bg-black/85 text-white transition-all backdrop-blur-md shadow-xl border border-white/10 cursor-pointer hover:scale-105 active:scale-95"
          title="Next Photo (Right Arrow)"
        >
          <MaterialIcon name="arrow_forward" size={24} />
        </button>

        {/* Center Canvas */}
        <div
          className={`flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden ${
            zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            className="transition-transform duration-100 ease-out select-none shadow-2xl rounded-2xl overflow-hidden origin-center max-w-full max-h-full flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
            }}
          >
            <img
              src={currentPhoto.mediaUrl || `/api/media/content?path=${encodeURIComponent(currentPhoto.path)}`}
              alt={currentPhoto.name}
              draggable={false}
              className="max-h-[72vh] max-w-[82vw] object-contain rounded-xl pointer-events-none"
            />
          </div>
        </div>

        {/* EXIF / Info Side Drawer */}
        {showInfo && (
          <div className="w-84 border-l border-white/10 bg-[#16181c]/95 backdrop-blur-xl p-5 text-xs overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200 font-sans shrink-0">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-medium text-neutral-100 text-sm font-display">
                Image Properties
              </h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>

            <div>
              <div className="text-neutral-400 mb-1">File Name</div>
              <div className="font-medium text-neutral-100 break-words">{currentPhoto.name}</div>
            </div>

            <div>
              <div className="text-neutral-400 mb-1">Original Path</div>
              <div className="font-mono text-[11px] text-neutral-300 break-all bg-black/40 p-2.5 rounded-xl border border-white/5">
                {currentPhoto.path}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="text-neutral-400 text-[11px]">File Size</div>
                <div className="font-medium text-sm mt-0.5">{formatFileSize(currentPhoto.size)}</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="text-neutral-400 text-[11px]">Dimensions</div>
                <div className="font-medium text-sm mt-0.5">
                  {currentPhoto.dimensions ? `${currentPhoto.dimensions.width} × ${currentPhoto.dimensions.height}` : '1920 × 1080'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-neutral-400">Date Modified</div>
                <div className="font-medium mt-0.5">{formatDate(currentPhoto.mtime)}</div>
              </div>
              <div>
                <div className="text-neutral-400">Extension</div>
                <div className="font-medium uppercase mt-0.5">{currentPhoto.extension}</div>
              </div>
            </div>

            {currentPhoto.exif && (
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="text-neutral-400 font-medium uppercase text-[10px] tracking-wider">
                  Camera EXIF
                </div>
                <div>
                  <div className="text-neutral-400">Device</div>
                  <div className="font-medium text-blue-400">{currentPhoto.exif.cameraModel}</div>
                </div>
                {currentPhoto.exif.lens && (
                  <div>
                    <div className="text-neutral-400">Lens</div>
                    <div className="font-medium">{currentPhoto.exif.lens}</div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 text-center bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <div>
                    <div className="text-[10px] text-neutral-400">ISO</div>
                    <div className="font-semibold text-xs mt-0.5">{currentPhoto.exif.iso}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400">Aperture</div>
                    <div className="font-semibold text-xs mt-0.5">{currentPhoto.exif.aperture}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400">Exposure</div>
                    <div className="font-semibold text-xs mt-0.5">{currentPhoto.exif.exposure}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Filmstrip Carousel */}
      <div className="h-20 px-4 py-2 border-t border-white/10 bg-[#16181c]/80 backdrop-blur-md flex items-center justify-center shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-4xl py-1">
          {allPhotos.map((photo, idx) => {
            const isSelected = photo.path === currentPhoto.path;
            return (
              <button
                key={photo.id || photo.path}
                onClick={() => onNavigatePhoto(photo)}
                className={`relative h-14 w-14 rounded-xl overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                  isSelected
                    ? 'border-[#0b57d0] ring-2 ring-[#0b57d0]/50 scale-105 shadow-md'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                title={photo.name}
              >
                <img
                  src={photo.mediaUrl || `/api/media/content?path=${encodeURIComponent(photo.path)}`}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0.5 right-1 text-[9px] text-white/90 bg-black/60 px-1 rounded-xs font-mono">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
