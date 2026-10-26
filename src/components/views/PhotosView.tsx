import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { formatFileSize } from '../../utils/fileSystemLogic';
import { api } from '../../services/api';

interface PhotosViewProps {
  photos: FileItem[];
  currentSubCategory: string;
  onChangeSubCategory: (sub: string) => void;
  onOpenPhoto: (photo: FileItem) => void;
  onToggleFavourite: (photo: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  selectedIds: string[];
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onRefreshData?: () => void;
}

export const PhotosView: React.FC<PhotosViewProps> = ({
  photos,
  currentSubCategory,
  onChangeSubCategory,
  onOpenPhoto,
  onToggleFavourite,
  onContextMenu,
  selectedIds,
  onToggleSelect,
  onRefreshData,
}) => {
  const [gridSize, setGridSize] = React.useState<'small' | 'medium' | 'large'>('medium');
  const [groupByDate, setGroupByDate] = React.useState(true);
  const [cropMode, setCropMode] = React.useState<'cover' | 'contain'>('cover');

  // Custom User-Created Folders / Albums on this bar
  const [customFolders, setCustomFolders] = React.useState<string[]>(['Wallpapers']);
  const [showNewFolderModal, setShowNewFolderModal] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState('');
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);
  const [folderError, setFolderError] = React.useState<string | null>(null);

  const defaultCategories = [
    { id: 'all', label: 'All Photos', iconName: 'photo_library' },
    { id: 'camera', label: 'Camera', iconName: 'photo_camera' },
    { id: 'screenshot', label: 'Screenshots', iconName: 'screenshot_monitor' },
    { id: 'download', label: 'Downloads', iconName: 'download' },
    { id: 'recent', label: 'Recently Added', iconName: 'schedule' },
    { id: 'favourites', label: 'Favourites', iconName: 'star' },
  ];

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    setIsCreatingFolder(true);
    setFolderError(null);
    try {
      await api.createFolder('C:\\Users\\GoogleDesigner\\Pictures', trimmed);
      if (!customFolders.includes(trimmed)) {
        setCustomFolders((prev) => [...prev, trimmed]);
      }
      onChangeSubCategory(trimmed.toLowerCase());
      setNewFolderName('');
      setShowNewFolderModal(false);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFolderError(err.message || 'Could not create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const filteredPhotos = React.useMemo(() => {
    if (currentSubCategory === 'all') return photos;
    if (currentSubCategory === 'favourites') return photos.filter((p) => p.isFavourite);
    if (currentSubCategory === 'camera' || currentSubCategory === 'screenshot' || currentSubCategory === 'download') {
      return photos.filter((p) => p.subCategory === currentSubCategory);
    }
    // Check against custom folder name
    return photos.filter(
      (p) =>
        p.path.toLowerCase().includes(currentSubCategory.toLowerCase()) ||
        p.subCategory === currentSubCategory
    );
  }, [photos, currentSubCategory]);

  const groupedPhotos = React.useMemo(() => {
    if (!groupByDate) return { 'All Photos': filteredPhotos };
    const groups: Record<string, FileItem[]> = {};
    for (const p of filteredPhotos) {
      const d = new Date(p.mtime);
      const dateKey = d.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
        day: 'numeric',
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(p);
    }
    return groups;
  }, [filteredPhotos, groupByDate]);

  const gridColsClass =
    gridSize === 'small'
      ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5'
      : gridSize === 'large'
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';

  return (
    <div className="flex-1 flex flex-col overflow-hidden select-none bg-[#f8fafd] dark:bg-[#131314] font-sans">
      {/* Sub-category Filter Bar with + Add Folder Button */}
      <div className="px-6 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1e1f20] flex items-center justify-between gap-4 overflow-x-auto no-scrollbar shadow-2xs">
        <div className="flex items-center gap-1.5 shrink-0">
          {defaultCategories.map((sub) => {
            const isActive = currentSubCategory === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onChangeSubCategory(sub.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff]'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]'
                }`}
              >
                <MaterialIcon
                  name={sub.iconName}
                  fill={isActive || sub.id === 'favourites'}
                  size={17}
                  className={isActive ? 'text-[#001d35] dark:text-[#c2e7ff]' : 'text-neutral-500'}
                />
                <span>{sub.label}</span>
              </button>
            );
          })}

          {/* User Custom Folders Chips */}
          {customFolders.map((folderName) => {
            const isActive = currentSubCategory === folderName.toLowerCase();
            return (
              <button
                key={folderName}
                onClick={() => onChangeSubCategory(folderName.toLowerCase())}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isActive
                    ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] border-transparent'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-[#f0f4f9] dark:hover:bg-[#282a2c]'
                }`}
              >
                <MaterialIcon name="folder" fill={isActive} size={15} />
                <span>{folderName}</span>
              </button>
            );
          })}

          {/* User-requested: + Add Folder directly on this bar */}
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-[#0b57d0] hover:bg-[#e8f0fe] dark:hover:bg-[#004a77]/30 text-neutral-700 dark:text-neutral-300 hover:text-[#0b57d0] dark:hover:text-[#a8c7fa] text-xs font-medium transition-colors ml-1"
            title="Add New Folder or Album"
          >
            <MaterialIcon name="add" size={16} />
            <span>New Folder</span>
          </button>
        </div>

        {/* Display Adjusters: Grid size, Date Grouping, Aspect ratio */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <button
            onClick={() => setGroupByDate(!groupByDate)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
              groupByDate
                ? 'bg-[#e8f0fe] dark:bg-[#004a77]/50 border-[#aecbfa] dark:border-[#004a77] text-[#0b57d0] dark:text-[#a8c7fa] font-medium'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Group by Date"
          >
            <MaterialIcon name="calendar_month" size={15} />
            <span className="hidden sm:inline">Date</span>
          </button>

          <button
            onClick={() => setCropMode(cropMode === 'cover' ? 'contain' : 'cover')}
            className="px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium"
            title="Toggle Square Crop vs Full Ratio"
          >
            {cropMode === 'cover' ? 'Square' : 'Full'}
          </button>

          {/* Size buttons */}
          <div className="flex items-center bg-[#f0f4f9] dark:bg-[#131314] p-0.5 rounded-full border border-neutral-200 dark:border-neutral-700">
            {(['small', 'medium', 'large'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setGridSize(s)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize transition-all ${
                  gridSize === s
                    ? 'bg-white dark:bg-[#1e1f20] text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {s[0].toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Gallery Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {filteredPhotos.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400">
            <MaterialIcon name="photo_library" size={40} className="text-neutral-300 dark:text-neutral-700 mb-2" />
            <h3 className="font-medium text-neutral-700 dark:text-neutral-300 text-sm">
              No photos found in this category
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Use "New Folder" on the bar above to add an album, or copy images into Pictures.
            </p>
          </div>
        ) : (
          Object.entries(groupedPhotos).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-3">
              {groupByDate && (
                <div className="sticky top-0 z-10 py-1 bg-[#f8fafd]/95 dark:bg-[#131314]/95 backdrop-blur-md flex items-center justify-between">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-xs">
                    {dateLabel}
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    {items.length} {items.length === 1 ? 'photo' : 'photos'}
                  </span>
                </div>
              )}

              <div className={`grid ${gridColsClass}`}>
                {items.map((photo) => {
                  const isSelected = selectedIds.includes(photo.id);
                  return (
                    <div
                      key={photo.id}
                      onClick={() => onOpenPhoto(photo)}
                      onContextMenu={(e) => onContextMenu(e, photo)}
                      className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all ${
                        isSelected
                          ? 'border-[#0b57d0] ring-3 ring-[#0b57d0]/20 shadow-md'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md'
                      } bg-white dark:bg-[#1e1f20]`}>
                      {/* Image Thumbnail */}
                      <div className="w-full aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-850 flex items-center justify-center">
                        <img
                          src={photo.mediaUrl || `/api/media/content?path=${encodeURIComponent(photo.path)}`}
                          alt={photo.name}
                          loading="lazy"
                          className={`w-full h-full ${
                            cropMode === 'cover' ? 'object-cover' : 'object-contain'
                          } group-hover:scale-105 transition-transform duration-300`}
                        />
                      </div>

                      {/* Select Checkbox */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelect(photo.id, e);
                        }}
                        className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#0b57d0] text-white shadow-md'
                            : 'opacity-0 group-hover:opacity-100 bg-black/50 hover:bg-black/70 text-white'
                        }`}
                        title="Select"
                      >
                        {isSelected && <MaterialIcon name="check" size={15} className="text-white font-bold" />}
                      </div>

                      {/* Favourite Star button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavourite(photo);
                        }}
                        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all ${
                          photo.isFavourite
                            ? 'bg-black/50 text-[#f9ab00]'
                            : 'opacity-0 group-hover:opacity-100 bg-black/50 hover:bg-black/70 text-white'
                        }`}
                        title="Favourite"
                      >
                        <MaterialIcon name="star" fill={photo.isFavourite} size={17} className={photo.isFavourite ? 'text-[#f9ab00]' : 'text-white'} />
                      </button>

                      {/* Bottom Info Bar on hover */}
                      <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px]">
                        <div className="truncate font-medium">{photo.name}</div>
                        <div className="text-[10px] text-neutral-300 flex items-center gap-1.5 mt-0.5">
                          <span>{formatFileSize(photo.size)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Folder Modal for Photos View */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 text-xs select-none">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1e1f20] p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] flex items-center justify-center">
                <MaterialIcon name="create_new_folder" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                  Add Folder / Album
                </h3>
                <p className="text-neutral-500 text-[11px]">
                  Creates a folder in Pictures for organizing photos
                </p>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  if (folderError) setFolderError(null);
                }}
                placeholder="Folder name (e.g. Vacation 2026)"
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#0b57d0] font-medium"
              />
              {folderError && (
                <p className="text-xs text-red-500 font-medium mt-1.5 px-1">{folderError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingFolder || !newFolderName.trim()}
                className="px-5 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] disabled:opacity-50 text-white font-medium transition-colors shadow-xs"
              >
                {isCreatingFolder ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
