import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { FileItem } from '../../types';
import { formatFileSize, formatDate } from '../../utils/fileSystemLogic';

// --- Conflict Resolution Dialog ---
interface ConflictDialogProps {
  isOpen: boolean;
  fileName: string;
  onResolve: (rule: 'replace' | 'skip' | 'rename') => void;
  onCancel: () => void;
}

export const ConflictDialog: React.FC<ConflictDialogProps> = ({
  isOpen,
  fileName,
  onResolve,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 text-xs select-none animate-in fade-in font-sans">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1e2124] p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <MaterialIcon name="warning" fill size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              File Already Exists
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
              The destination folder already contains a file named <span className="font-semibold text-neutral-700 dark:text-neutral-200">{fileName}</span>.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => onResolve('replace')}
            className="w-full text-left p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="font-semibold text-neutral-800 dark:text-neutral-100">
              Replace existing file
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Overwrite the existing destination file with the incoming one.
            </div>
          </button>

          <button
            onClick={() => onResolve('rename')}
            className="w-full text-left p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="font-semibold text-neutral-800 dark:text-neutral-100">
              Keep both (Rename incoming)
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Append a suffix like &quot;example_copy.png&quot; so both files are preserved.
            </div>
          </button>

          <button
            onClick={() => onResolve('skip')}
            className="w-full text-left p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="font-semibold text-neutral-800 dark:text-neutral-100">
              Skip this file
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Do not transfer this file and continue the operation.
            </div>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Delete Confirmation Dialog ---
interface DeleteDialogProps {
  isOpen: boolean;
  itemCount: number;
  itemName?: string;
  onConfirm: (permanent: boolean) => void;
  onCancel: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  itemCount,
  itemName,
  onConfirm,
  onCancel,
}) => {
  const [permanent, setPermanent] = React.useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 text-xs select-none animate-in fade-in font-sans">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1e2124] p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
            <MaterialIcon name="delete" fill size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              {itemCount > 1 ? `Delete ${itemCount} items?` : `Delete "${itemName}"?`}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
              {permanent
                ? 'This action will permanently delete these items from the disk.'
                : 'These items will be moved to the Recycle Bin.'}
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300 select-none">
          <input
            type="checkbox"
            checked={permanent}
            onChange={(e) => setPermanent(e.target.checked)}
            className="w-4 h-4 accent-red-600 rounded"
          />
          <span>Permanently delete (skip Recycle Bin)</span>
        </label>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(permanent)}
            className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-xs"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- New Folder Dialog ---
interface NewFolderDialogProps {
  isOpen: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const NewFolderDialog: React.FC<NewFolderDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const [folderName, setFolderName] = React.useState('New folder');

  React.useEffect(() => {
    if (isOpen) setFolderName('New folder');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onConfirm(folderName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 text-xs select-none animate-in fade-in font-sans">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1e2124] p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <MaterialIcon name="create_new_folder" fill size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              New Folder
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
              Enter a name for the new folder
            </p>
          </div>
        </div>

        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          onFocus={(e) => e.target.select()}
          autoFocus
          className="w-full px-3.5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500 font-medium"
        />

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-xs"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Rename Dialog ---
interface RenameDialogProps {
  isOpen: boolean;
  currentName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
  isOpen,
  currentName,
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = React.useState(currentName);

  React.useEffect(() => {
    if (isOpen) setName(currentName);
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== currentName) {
      onConfirm(name.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 text-xs select-none animate-in fade-in font-sans">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1e2124] p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <MaterialIcon name="edit" fill size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
              Rename Item
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
              Enter a new name
            </p>
          </div>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.target.select()}
          autoFocus
          className="w-full px-3.5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-blue-500 font-medium"
        />

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-xs"
          >
            Rename
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Properties Inspector Dialog ---
interface PropertiesModalProps {
  item: FileItem | null;
  onClose: () => void;
}

export const PropertiesModal: React.FC<PropertiesModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 text-xs select-none animate-in fade-in font-sans">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1e2124] p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
              <MaterialIcon name={item.isFolder ? 'folder' : 'info'} fill size={22} className={item.isFolder ? 'text-amber-500' : 'text-blue-500'} />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm truncate max-w-xs font-sans">
                {item.name}
              </h3>
              <div className="text-[11px] text-neutral-500 capitalize">
                {item.isFolder ? 'File Folder' : `${item.extension.toUpperCase()} File (${item.category})`}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200">
            <MaterialIcon name="close" size={18} />
          </button>
        </div>

        <div className="space-y-3 py-1 text-neutral-700 dark:text-neutral-300">
          <div>
            <div className="text-neutral-400 font-medium mb-1">Location</div>
            <div className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800/80 p-2.5 rounded-xl break-all">
              {item.path}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-neutral-400 font-medium">Size</div>
              <div className="font-semibold mt-0.5">{formatFileSize(item.size)}</div>
            </div>
            <div>
              <div className="text-neutral-400 font-medium">Size on Disk</div>
              <div className="font-semibold mt-0.5">{formatFileSize(Math.ceil(item.size / 4096) * 4096)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-neutral-400 font-medium">Created</div>
              <div className="mt-0.5">{formatDate(item.birthtime)}</div>
            </div>
            <div>
              <div className="text-neutral-400 font-medium">Modified</div>
              <div className="mt-0.5">{formatDate(item.mtime)}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
