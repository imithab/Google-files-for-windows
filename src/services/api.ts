import {
  FileItem,
  DriveInfo,
  StorageAnalysisData,
  Collection,
  AppSettings
} from '../types';
import { FileCategory } from '../utils/fileSystemLogic';

export const api = {
  async getDrives(): Promise<{ drives: DriveInfo[] }> {
    const res = await fetch('/api/system/drives');
    if (!res.ok) throw new Error('Failed to fetch drives');
    return res.json();
  },

  async browseDirectory(virtualPath: string): Promise<{ path: string; items: FileItem[]; isThisPC?: boolean }> {
    const res = await fetch(`/api/fs/browse?path=${encodeURIComponent(virtualPath)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to browse directory');
    }
    return res.json();
  },

  async createFolder(parentPath: string, name: string): Promise<{ success: boolean; path: string }> {
    const res = await fetch('/api/fs/create-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentPath, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create folder');
    }
    return res.json();
  },

  async renameItem(targetPath: string, newName: string): Promise<{ success: boolean; path: string }> {
    const res = await fetch('/api/fs/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPath, newName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to rename item');
    }
    return res.json();
  },

  async deleteItem(targetPath: string, permanent = false): Promise<{ success: boolean }> {
    const res = await fetch('/api/fs/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPath, permanent }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete item');
    }
    return res.json();
  },

  async copyItem(srcPath: string, destFolder: string, conflictRule?: 'replace' | 'skip' | 'rename') {
    const res = await fetch('/api/fs/copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ srcPath, destFolder, conflictRule }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to copy item');
    }
    return res.json();
  },

  async moveItem(srcPath: string, destFolder: string, conflictRule?: 'replace' | 'skip' | 'rename') {
    const res = await fetch('/api/fs/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ srcPath, destFolder, conflictRule }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to move item');
    }
    return res.json();
  },

  async duplicateItem(targetPath: string): Promise<{ success: boolean; path: string }> {
    const res = await fetch('/api/fs/duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPath }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to duplicate item');
    }
    return res.json();
  },

  async getMediaFiles(category?: FileCategory, subCategory?: string): Promise<{ count: number; items: FileItem[] }> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (subCategory) params.set('subCategory', subCategory);
    const res = await fetch(`/api/media/all?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load media files');
    return res.json();
  },

  async getTextContent(path: string): Promise<string> {
    const res = await fetch(`/api/media/text?path=${encodeURIComponent(path)}`);
    if (!res.ok) throw new Error('Failed to read file text');
    const data = await res.json();
    return data.content;
  },

  async searchFiles(query: string, category?: FileCategory): Promise<{ count: number; items: FileItem[] }> {
    const params = new URLSearchParams({ q: query });
    if (category) params.set('category', category);
    const res = await fetch(`/api/search?${params.toString()}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  async getStorageAnalysis(): Promise<StorageAnalysisData> {
    const res = await fetch('/api/storage/analyze');
    if (!res.ok) throw new Error('Failed to load storage analysis');
    return res.json();
  },

  async cleanStorage(itemPaths: string[]): Promise<{ success: boolean; freedBytes: number }> {
    const res = await fetch('/api/storage/clean', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemPaths }),
    });
    if (!res.ok) throw new Error('Cleanup failed');
    return res.json();
  },

  async getFavourites(): Promise<{ count: number; items: FileItem[] }> {
    const res = await fetch('/api/favourites');
    if (!res.ok) throw new Error('Failed to load favourites');
    return res.json();
  },

  async toggleFavourite(path: string): Promise<{ path: string; isFavourite: boolean }> {
    const res = await fetch('/api/favourites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (!res.ok) throw new Error('Failed to update favourite');
    return res.json();
  },

  async getCollections(): Promise<{ collections: Collection[] }> {
    const res = await fetch('/api/collections');
    if (!res.ok) throw new Error('Failed to load collections');
    return res.json();
  },

  async createCollection(name: string, description?: string): Promise<Collection> {
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) throw new Error('Failed to create collection');
    return res.json();
  },

  async addToCollection(collectionId: string, itemPath: string): Promise<Collection> {
    const res = await fetch(`/api/collections/${collectionId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemPath }),
    });
    if (!res.ok) throw new Error('Failed to add to collection');
    return res.json();
  },

  async removeFromCollection(collectionId: string, itemPath: string): Promise<Collection> {
    const res = await fetch(`/api/collections/${collectionId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemPath }),
    });
    if (!res.ok) throw new Error('Failed to remove from collection');
    return res.json();
  },

  async deleteCollection(collectionId: string): Promise<void> {
    const res = await fetch(`/api/collections/${collectionId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete collection');
  },

  async getSettings(): Promise<AppSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  },

  async triggerIndexingRescan(): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/indexing/scan', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to rescan index');
    return res.json();
  }
};
