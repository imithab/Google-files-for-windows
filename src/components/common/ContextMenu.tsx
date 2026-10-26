import React from 'react';
import { MaterialIcon } from './MaterialIcon';
import { FileItem } from '../../types';

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  item?: FileItem;
  isWorkspaceBlank?: boolean;
}

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onOpen: (item: FileItem) => void;
  onCut?: (item: FileItem) => void;
  onCopy?: (item: FileItem) => void;
  onPaste?: () => void;
  canPaste?: boolean;
  onRename?: (item: FileItem) => void;
  onDelete?: (item: FileItem) => void;
  onToggleFavourite?: (item: FileItem) => void;
  onAddToCollection?: (item: FileItem) => void;
  onRevealInFolder?: (item: FileItem) => void;
  onProperties?: (item: FileItem) => void;
  onNewFolder?: () => void;
  onRefresh?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  state,
  onClose,
  onOpen,
  onCut,
  onCopy,
  onPaste,
  canPaste,
  onRename,
  onDelete,
  onToggleFavourite,
  onAddToCollection,
  onRevealInFolder,
  onProperties,
  onNewFolder,
  onRefresh,
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!state.visible) return null;

  const x = Math.min(state.x, window.innerWidth - 230);
  const y = Math.min(state.y, window.innerHeight - 330);
  const item = state.item;

  return (
    <div
      ref={menuRef}
      style={{ left: `${x}px`, top: `${y}px` }}
      className="fixed z-50 w-56 rounded-2xl shadow-2xl bg-white/95 dark:bg-[#1e2124]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700/80 p-2 text-xs text-neutral-800 dark:text-neutral-100 select-none animate-in fade-in zoom-in-95 duration-100 font-sans"
    >
      {state.isWorkspaceBlank ? (
        <div className="space-y-1">
          {onNewFolder && (
            <button
              onClick={() => { onNewFolder(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MaterialIcon name="create_new_folder" size={18} className="text-blue-600 dark:text-blue-400" />
              <span>New Folder</span>
            </button>
          )}
          {canPaste && onPaste && (
            <button
              onClick={() => { onPaste(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MaterialIcon name="content_paste" size={18} className="text-neutral-500" />
              <span>Paste Here</span>
            </button>
          )}
          {onRefresh && (
            <button
              onClick={() => { onRefresh(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MaterialIcon name="refresh" size={18} className="text-neutral-500" />
              <span>Refresh</span>
            </button>
          )}
        </div>
      ) : item ? (
        <div className="space-y-1">
          <button
            onClick={() => { onOpen(item); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium transition-colors"
          >
            <MaterialIcon name="open_in_new" size={18} className="text-blue-600 dark:text-blue-400" />
            <span>Open</span>
          </button>

          {!item.isFolder && onRevealInFolder && (
            <button
              onClick={() => { onRevealInFolder(item); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MaterialIcon name="folder_open" size={18} className="text-neutral-500" />
              <span>Reveal in Folder</span>
            </button>
          )}

          <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

          {onCopy && (
            <button
              onClick={() => { onCopy(item); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MaterialIcon name="content_copy" size={18} className="text-neutral-500" />
              <span>Copy</span>
            </button>
          )}

          {onCut && (
            <button
              onClick={() => { onCut(item); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MaterialIcon name="content_cut" size={18} className="text-neutral-500" />
              <span>Cut</span>
            </button>
          )}

          {onRename && (
            <button
              onClick={() => { onRename(item); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MaterialIcon name="edit" size={18} className="text-neutral-500" />
              <span>Rename</span>
            </button>
          )}

          <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

          {onToggleFavourite && (
            <button
              onClick={() => { onToggleFavourite(item); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MaterialIcon
                name="star"
                fill={item.isFavourite}
                size={18}
                className={item.isFavourite ? 'text-amber-400' : 'text-neutral-500'}
              />
              <span>{item.isFavourite ? 'Remove from Favourites' : 'Add to Favourites'}</span>
            </button>
          )}

          {onAddToCollection && (
            <button
              onClick={() => { onAddToCollection(item); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MaterialIcon name="auto_stories" size={18} className="text-rose-500" />
              <span>Add to Collection</span>
            </button>
          )}

          <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

          {onDelete && (
            <button
              onClick={() => { onDelete(item); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
            >
              <MaterialIcon name="delete" size={18} />
              <span>Delete</span>
            </button>
          )}

          {onProperties && (
            <button
              onClick={() => { onProperties(item); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MaterialIcon name="info" size={18} className="text-neutral-500" />
              <span>Properties</span>
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};
