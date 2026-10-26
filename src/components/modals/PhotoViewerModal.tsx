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
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [showInfo, setShowInfo] = React.useState(false);

  React.useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [currentPhoto?.id]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPhoto, allPhotos]);

  if (!currentPhoto) return null;

  const currentIndex = allPhotos.findIndex((p) => p.path === currentPhoto.path);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < allPhotos.length - 1;

  const handlePrev = () => {
    if (canGoPrev) onNavigatePhoto(allPhotos[currentIndex - 1]);
  };

  const handleNext = () => {
    if (canGoNext) onNavigatePhoto(allPhotos[currentIndex + 1]);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex flex-col text-white select-none animate-in fade-in duration-150 font-sans">
      {/* Top Header Bar */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 bg-neutral-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <MaterialIcon name="close" size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold truncate max-w-md font-sans">{currentPhoto.name}</h2>
            <div className="text-[11px] text-neutral-400">
              {currentIndex + 1} of {allPhotos.length} · {formatFileSize(currentPhoto.size)}
            </div>
          </div>
        </div>

        {/* Toolbar Controls with Material Symbols */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <MaterialIcon name="zoom_in" size={20} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <MaterialIcon name="zoom_out" size={20} />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2.5 py-1 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white text-xs transition-colors font-mono"
            title="Actual Size / Reset"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleRotate}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Rotate 90°"
          >
            <MaterialIcon name="rotate_right" size={20} />
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          <button
            onClick={() => onToggleFavourite(currentPhoto)}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              currentPhoto.isFavourite ? 'text-amber-400' : 'text-neutral-300 hover:text-white'
            }`}
            title="Toggle Favourite"
          >
            <MaterialIcon name="star" fill={currentPhoto.isFavourite} size={20} className={currentPhoto.isFavourite ? 'text-amber-400' : ''} />
          </button>

          <button
            onClick={() => onRevealInFolder(currentPhoto)}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Reveal in Folder"
          >
            <MaterialIcon name="folder_open" size={20} />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              showInfo ? 'bg-white/20 text-white' : 'text-neutral-300 hover:text-white'
            }`}
            title="Photo Info & EXIF"
          >
            <MaterialIcon name="info" size={20} />
          </button>

          <button
            onClick={() => onDelete(currentPhoto)}
            className="p-2 rounded-full hover:bg-red-500/20 text-neutral-300 hover:text-red-400 transition-colors"
            title="Delete Photo"
          >
            <MaterialIcon name="delete" size={20} />
          </button>
        </div>
      </div>

      {/* Main Photo Viewing Canvas & Side Drawer */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Navigation Arrows */}
        {canGoPrev && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all backdrop-blur-md shadow-lg"
            title="Previous Photo (Left Arrow)"
          >
            <MaterialIcon name="arrow_back" size={24} />
          </button>
        )}
        {canGoNext && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all backdrop-blur-md shadow-lg"
            title="Next Photo (Right Arrow)"
          >
            <MaterialIcon name="arrow_forward" size={24} />
          </button>
        )}

        {/* Center Image Container */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div
            className="transition-transform duration-200 ease-out origin-center select-none shadow-2xl rounded-2xl overflow-hidden"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={currentPhoto.mediaUrl || `/api/media/content?path=${encodeURIComponent(currentPhoto.path)}`}
              alt={currentPhoto.name}
              className="max-h-[82vh] max-w-[85vw] object-contain rounded-xl"
            />
          </div>
        </div>

        {/* EXIF / Info Side Drawer */}
        {showInfo && (
          <div className="w-80 border-l border-white/10 bg-neutral-900/90 backdrop-blur-md p-5 text-xs overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200 font-sans">
            <h3 className="font-semibold text-neutral-100 text-sm border-b border-white/10 pb-2">
              Image Details
            </h3>

            <div>
              <div className="text-neutral-400 mb-1">File Name</div>
              <div className="font-medium text-neutral-100 break-words">{currentPhoto.name}</div>
            </div>

            <div>
              <div className="text-neutral-400 mb-1">Original Path</div>
              <div className="font-mono text-[11px] text-neutral-300 break-all bg-black/40 p-2.5 rounded-xl">
                {currentPhoto.path}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-neutral-400">File Size</div>
                <div className="font-medium">{formatFileSize(currentPhoto.size)}</div>
              </div>
              <div>
                <div className="text-neutral-400">Dimensions</div>
                <div className="font-medium">
                  {currentPhoto.dimensions ? `${currentPhoto.dimensions.width} × ${currentPhoto.dimensions.height}` : '1920 × 1080'}
                </div>
              </div>
            </div>

            <div>
              <div className="text-neutral-400 mb-1">Modified Date</div>
              <div className="font-medium">{formatDate(currentPhoto.mtime)}</div>
            </div>

            {currentPhoto.exif && (
              <div className="pt-2 border-t border-white/10 space-y-2.5">
                <div className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                  Camera EXIF Metadata
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
                <div className="grid grid-cols-3 gap-2 text-center bg-white/5 p-2 rounded-xl">
                  <div>
                    <div className="text-[10px] text-neutral-400">ISO</div>
                    <div className="font-semibold text-xs">{currentPhoto.exif.iso}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400">Aperture</div>
                    <div className="font-semibold text-xs">{currentPhoto.exif.aperture}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400">Exposure</div>
                    <div className="font-semibold text-xs">{currentPhoto.exif.exposure}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
