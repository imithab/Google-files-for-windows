import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { Collection } from '../../types';
import { formatDate } from '../../utils/fileSystemLogic';

interface CollectionsViewProps {
  collections: Collection[];
  onCreateCollection: (name: string, description?: string) => void;
  onDeleteCollection: (id: string) => void;
  onOpenCollection: (collection: Collection) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  onCreateCollection,
  onDeleteCollection,
  onOpenCollection,
}) => {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateCollection(name.trim(), desc.trim());
      setName('');
      setDesc('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto space-y-6 select-none font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-neutral-900 dark:text-neutral-50 flex items-center gap-2.5">
            <MaterialIcon name="auto_stories" size={28} className="text-[#b3261e] dark:text-[#f2b8b5]" />
            <span>Virtual Collections & Albums</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Organise files across your computer into custom albums without creating duplicate copies on disk.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-medium shadow-xs transition-colors"
        >
          <MaterialIcon name="add" size={18} />
          <span>New Collection</span>
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400">
          <div className="w-16 h-16 rounded-full bg-[#fce8e6] dark:bg-[#601410]/30 flex items-center justify-center mb-3">
            <MaterialIcon name="layers" size={32} className="text-[#b3261e]" />
          </div>
          <h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">
            No custom collections created yet
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Create collections for project assets, holiday albums, or receipt archives.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => onOpenCollection(col)}
              className="group p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-[#fce8e6] dark:bg-[#601410]/30 text-[#b3261e] dark:text-[#f2b8b5]">
                    <MaterialIcon name="auto_stories" size={22} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCollection(col.id);
                    }}
                    className="p-1.5 rounded-full text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Delete Collection"
                  >
                    <MaterialIcon name="delete" size={18} />
                  </button>
                </div>

                <h3 className="font-medium text-sm text-neutral-800 dark:text-neutral-100 group-hover:text-[#0b57d0] dark:group-hover:text-[#a8c7fa] transition-colors">
                  {col.name}
                </h3>
                {col.description && (
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {col.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                <span>{col.itemPaths.length} items</span>
                <span>Created {formatDate(col.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 text-xs select-none">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-850 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fce8e6] dark:bg-[#601410]/40 text-[#b3261e] dark:text-[#f2b8b5] flex items-center justify-center">
                <MaterialIcon name="auto_stories" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                  Create Collection
                </h3>
                <p className="text-neutral-500 text-[11px]">
                  Virtual album referencing your existing files
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-neutral-600 dark:text-neutral-300 font-medium mb-1 block">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Project Assets"
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#0b57d0] font-medium"
                />
              </div>

              <div>
                <label className="text-neutral-600 dark:text-neutral-300 font-medium mb-1 block">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Brief note about this album"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-[#0b57d0]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium transition-colors shadow-xs"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

