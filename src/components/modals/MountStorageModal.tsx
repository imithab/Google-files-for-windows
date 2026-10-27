import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { api } from '../../services/api';

interface MountStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMountPath: (path: string, isHost?: boolean) => void;
  onMountDirectoryHandle?: (handle: FileSystemDirectoryHandle) => void;
}

export const MountStorageModal: React.FC<MountStorageModalProps> = ({
  isOpen,
  onClose,
  onMountPath,
  onMountDirectoryHandle,
}) => {
  const [hostDrives, setHostDrives] = React.useState<any[]>([]);
  const [customPath, setCustomPath] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      loadDrives();
    }
  }, [isOpen]);

  const loadDrives = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getHostDrives();
      setHostDrives(res.drives || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickNativeDirectory = async () => {
    try {
      // If running inside packaged Electron desktop application (.exe)
      if ((window as any).electronAPI?.selectDirectory) {
        const result = await (window as any).electronAPI.selectDirectory();
        if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
          onMountPath(result.filePaths[0], true);
          onClose();
          return;
        }
      }

      // If running in browser environment with HTML5 File System Access API
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
        });
        if (dirHandle) {
          if (onMountDirectoryHandle) {
            onMountDirectoryHandle(dirHandle);
          } else {
            onMountPath(`Local Mount: ${dirHandle.name}`, true);
          }
          onClose();
          return;
        }
      } else {
        setErrorMsg('Native directory picker is not supported in this browser. Please enter a disk path below.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorMsg(err.message || 'Could not access the selected directory.');
      }
    }
  };

  const handleMountCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPath.trim()) return;
    onMountPath(customPath.trim(), true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans animate-fade-in">
      <div className="bg-white dark:bg-[#1e1f20] w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MaterialIcon name="storage" size={24} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                Connect Laptop Internal & External Storage
              </h2>
              <p className="text-xs text-neutral-500">
                Access your actual computer drives, USB storage, and user directories directly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            aria-label="Close dialog"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900 flex items-center gap-2">
              <MaterialIcon name="error" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Action: Modern System Folder Chooser */}
          <div className="p-5 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-800/80 bg-blue-50/40 dark:bg-blue-950/20 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-300">
              <MaterialIcon name="folder_open" size={26} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Mount Real Folder from Your Computer
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto mt-0.5">
                Picks any folder on your laptop or connected USB drive (e.g., Downloads, Pictures, external flash drive).
              </p>
            </div>
            <button
              onClick={handlePickNativeDirectory}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-medium transition-all shadow-xs flex items-center gap-2 mx-auto"
            >
              <MaterialIcon name="upload" size={18} />
              <span>Open System Folder Picker</span>
            </button>
          </div>

          {/* Section: Detected Laptop Storage Drives */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Detected Laptop Drives & Mount Points
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hostDrives.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    onMountPath(d.mountPoint, true);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-[#1a1c1e] hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:text-emerald-600 transition-colors">
                    <MaterialIcon
                      name={d.isRemovable ? 'usb' : d.type === 'user' ? 'folder_special' : 'hard_drive'}
                      size={20}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono truncate">
                      {d.mountPoint}
                    </div>
                  </div>
                  <MaterialIcon name="arrow_forward" size={16} className="text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Direct Path Input */}
          <form onSubmit={handleMountCustom} className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Or Enter Direct Laptop Storage Path
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="e.g. C:\Users\YourName\Documents or /home/username"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:hover:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-medium transition-colors"
              >
                Browse Path
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 flex items-center justify-between text-xs text-neutral-500">
          <span>Files Studio Internal & External Storage Bridge</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
