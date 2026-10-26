import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  classifyFile,
  normalizeWindowsPath,
  parseSearchSyntax,
  matchesSearchCriteria,
  identifyDuplicateCandidates,
  FileCategory
} from '../src/utils/fileSystemLogic';
import { seedFilesystem } from './seedData';

export interface StorageMetadata {
  favourites: string[]; // list of normalized paths
  collections: {
    id: string;
    name: string;
    description?: string;
    itemPaths: string[];
    createdAt: number;
    updatedAt: number;
    coverImage?: string;
  }[];
  recentActivity: {
    path: string;
    action: string;
    timestamp: number;
  }[];
  settings: {
    theme: 'light' | 'dark' | 'system';
    accentColor: 'emerald' | 'google-blue' | 'coral' | 'amber' | 'purple';
    thumbnailSize: 'small' | 'medium' | 'large';
    showFileExtensions: boolean;
    showHiddenFiles: boolean;
    confirmDelete: boolean;
    enableDualPane: boolean;
    indexedFolders: string[];
    excludedFolders: string[];
  };
}

export class StorageEngine {
  private baseDir: string;
  private metaPath: string;
  private meta: StorageMetadata;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'data', 'drive_c');
    this.metaPath = path.resolve(process.cwd(), 'data', 'app_metadata.json');

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }

    // Seed realistic Windows directory structure and media files
    seedFilesystem(this.baseDir);

    this.meta = this.loadMetadata();
  }

  private loadMetadata(): StorageMetadata {
    const defaultMeta: StorageMetadata = {
      favourites: [
        'C:\\Users\\GoogleDesigner\\Pictures\\Camera\\IMG_20261025_142318.svg',
        'C:\\Users\\GoogleDesigner\\Music\\Ambient_Dawn_Harmony.wav',
        'C:\\Users\\GoogleDesigner\\Documents\\Google_Design_Library_Material_You_2026.md'
      ],
      collections: [
        {
          id: 'col_1',
          name: 'Material You 2026',
          description: 'Design system assets and tokens curated for Files Studio',
          itemPaths: [
            'C:\\Users\\GoogleDesigner\\Pictures\\Screenshots\\Screenshot_2026-10-25_DesignTokens.svg',
            'C:\\Users\\GoogleDesigner\\Documents\\Google_Design_Library_Material_You_2026.md'
          ],
          createdAt: Date.now() - 86400000 * 2,
          updatedAt: Date.now() - 86400000 * 2,
          coverImage: 'C:\\Users\\GoogleDesigner\\Pictures\\Screenshots\\Screenshot_2026-10-25_DesignTokens.svg'
        },
        {
          id: 'col_2',
          name: 'Scenic Wallpapers',
          description: 'High-res desktop backgrounds',
          itemPaths: [
            'C:\\Users\\GoogleDesigner\\Pictures\\Wallpapers\\Cyberpunk_Neon_Metropolis.svg',
            'C:\\Users\\GoogleDesigner\\Pictures\\Wallpapers\\Minimalist_Desert_Dunes.svg'
          ],
          createdAt: Date.now() - 86400000 * 5,
          updatedAt: Date.now() - 86400000 * 5,
          coverImage: 'C:\\Users\\GoogleDesigner\\Pictures\\Wallpapers\\Cyberpunk_Neon_Metropolis.svg'
        }
      ],
      recentActivity: [],
      settings: {
        theme: 'light',
        accentColor: 'emerald',
        thumbnailSize: 'medium',
        showFileExtensions: true,
        showHiddenFiles: false,
        confirmDelete: true,
        enableDualPane: false,
        indexedFolders: [
          'C:\\Users\\GoogleDesigner\\Pictures',
          'C:\\Users\\GoogleDesigner\\Documents',
          'C:\\Users\\GoogleDesigner\\Downloads',
          'C:\\Users\\GoogleDesigner\\Music',
          'C:\\Users\\GoogleDesigner\\Videos',
          'C:\\Users\\GoogleDesigner\\Desktop'
        ],
        excludedFolders: [
          'C:\\Windows\\Temp',
          'C:\\$Recycle.Bin'
        ]
      }
    };

    if (fs.existsSync(this.metaPath)) {
      try {
        const raw = fs.readFileSync(this.metaPath, 'utf8');
        return { ...defaultMeta, ...JSON.parse(raw) };
      } catch {
        return defaultMeta;
      }
    }
    this.saveMetadata(defaultMeta);
    return defaultMeta;
  }

  public saveMetadata(data?: StorageMetadata) {
    if (data) this.meta = data;
    const dir = path.dirname(this.metaPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.metaPath, JSON.stringify(this.meta, null, 2), 'utf8');
  }

  /**
   * Converts virtual Windows path (e.g. C:\Users\GoogleDesigner\Pictures)
   * into local filesystem path on the host
   */
  public toPhysicalPath(virtualPath: string): string {
    const norm = normalizeWindowsPath(virtualPath);
    // Strip drive letter C:\ or D:\
    let relative = norm.replace(/^[A-Za-z]:\\?/, '');
    // Convert all backslashes to forward slashes for Linux filesystem
    const forwardSlash = relative.replace(/\\/g, '/');
    const safePath = path.normalize(forwardSlash).replace(/^(\.\.[\/\\])+/, '');
    return path.join(this.baseDir, safePath);
  }

  /**
   * Converts local physical path back into virtual Windows path
   */
  public toVirtualPath(physicalPath: string): string {
    const relative = path.relative(this.baseDir, physicalPath);
    if (relative === '') return 'C:\\';
    return `C:\\${relative.replace(/\//g, '\\')}`;
  }

  public getDrives() {
    return [
      {
        id: 'drive_c',
        letter: 'C',
        name: 'Local Disk (C:)',
        path: 'C:\\',
        totalBytes: 512 * 1024 * 1024 * 1024, // 512 GB
        usedBytes: 168 * 1024 * 1024 * 1024, // 168 GB
        freeBytes: 344 * 1024 * 1024 * 1024,
        isRemovable: false
      },
      {
        id: 'drive_d',
        letter: 'D',
        name: 'External Drive (D:)',
        path: 'D:\\',
        totalBytes: 1024 * 1024 * 1024 * 1024, // 1 TB
        usedBytes: 312 * 1024 * 1024 * 1024,
        freeBytes: 712 * 1024 * 1024 * 1024,
        isRemovable: true
      }
    ];
  }

  /**
   * Browse a single directory
   */
  public browseDirectory(virtualPath: string) {
    if (virtualPath === 'This PC') {
      return {
        path: 'This PC',
        isThisPC: true,
        items: this.getDrives().map(d => ({
          id: d.id,
          name: d.name,
          path: d.path,
          isFolder: true,
          size: d.usedBytes,
          extension: '',
          category: 'other' as FileCategory,
          mtime: Date.now(),
          birthtime: Date.now(),
          isDrive: true,
          freeBytes: d.freeBytes,
          totalBytes: d.totalBytes
        }))
      };
    }

    const physical = this.toPhysicalPath(virtualPath);
    if (!fs.existsSync(physical)) {
      throw new Error(`Path does not exist: ${virtualPath}`);
    }

    const stat = fs.statSync(physical);
    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${virtualPath}`);
    }

    const entries = fs.readdirSync(physical, { withFileTypes: true });
    const items = [];

    for (const ent of entries) {
      if (!this.meta.settings.showHiddenFiles && ent.name.startsWith('.')) {
        continue;
      }
      const itemPhys = path.join(physical, ent.name);
      try {
        const itemStat = fs.statSync(itemPhys);
        const itemVirt = this.toVirtualPath(itemPhys);
        const classification = classifyFile(ent.name, itemVirt);

        let itemCount: number | undefined;
        if (ent.isDirectory()) {
          try {
            itemCount = fs.readdirSync(itemPhys).length;
          } catch {
            itemCount = 0;
          }
        }

        const isFav = this.meta.favourites.includes(itemVirt);

        items.push({
          id: Buffer.from(itemVirt).toString('base64url'),
          name: ent.name,
          path: itemVirt,
          isFolder: ent.isDirectory(),
          size: itemStat.size,
          extension: ent.name.includes('.') ? ent.name.split('.').pop()?.toLowerCase() || '' : '',
          category: ent.isDirectory() ? 'other' : classification.category,
          subCategory: classification.subCategory,
          mtime: itemStat.mtimeMs,
          birthtime: itemStat.birthtimeMs,
          isFavourite: isFav,
          itemCount,
          mediaUrl: !ent.isDirectory() ? `/api/media/content?path=${encodeURIComponent(itemVirt)}` : undefined,
          duration: classification.category === 'audio' ? 15 : classification.category === 'video' ? 30 : undefined,
          dimensions: classification.category === 'photo' ? { width: 1920, height: 1080 } : undefined,
          exif: classification.subCategory === 'camera' ? {
            cameraModel: 'Google Pixel 9 Pro',
            lens: '24mm f/1.68 Main Camera',
            iso: 100,
            aperture: 'f/1.68',
            exposure: '1/250s',
            dateTaken: new Date(itemStat.mtimeMs).toLocaleDateString(),
            focalLength: '24mm'
          } : undefined
        });
      } catch {
        // Skip unreadable files
      }
    }

    return {
      path: normalizeWindowsPath(virtualPath),
      items
    };
  }

  /**
   * Recursively crawls directories to index files for Photos, Videos, Audio, Documents, etc.
   */
  public getAllIndexedFiles(category?: FileCategory, subCategory?: string) {
    const allFiles: any[] = [];

    const crawl = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const ent of entries) {
          const fullPhys = path.join(dir, ent.name);
          const fullVirt = this.toVirtualPath(fullPhys);

          if (ent.isDirectory()) {
            // Check exclusions
            const isExcluded = this.meta.settings.excludedFolders.some(ex =>
              fullVirt.toLowerCase().startsWith(ex.toLowerCase())
            );
            if (!isExcluded) {
              crawl(fullPhys);
            }
          } else {
            const classification = classifyFile(ent.name, fullVirt);
            if (category && classification.category !== category) {
              continue;
            }
            if (subCategory && subCategory !== 'all') {
              if (subCategory === 'favourites') {
                if (!this.meta.favourites.includes(fullVirt)) continue;
              } else if (subCategory === 'recent') {
                // Last 7 days
                const stat = fs.statSync(fullPhys);
                if (Date.now() - stat.mtimeMs > 7 * 86400000) continue;
              } else if (classification.subCategory !== subCategory) {
                continue;
              }
            }

            const stat = fs.statSync(fullPhys);
            const isFav = this.meta.favourites.includes(fullVirt);

            allFiles.push({
              id: Buffer.from(fullVirt).toString('base64url'),
              name: ent.name,
              path: fullVirt,
              isFolder: false,
              size: stat.size,
              extension: ent.name.includes('.') ? ent.name.split('.').pop()?.toLowerCase() || '' : '',
              category: classification.category,
              subCategory: classification.subCategory,
              mtime: stat.mtimeMs,
              birthtime: stat.birthtimeMs,
              isFavourite: isFav,
              mediaUrl: `/api/media/content?path=${encodeURIComponent(fullVirt)}`,
              duration: classification.category === 'audio' ? 15 : classification.category === 'video' ? 30 : undefined,
              dimensions: classification.category === 'photo' ? { width: 1920, height: 1080 } : undefined,
              exif: classification.subCategory === 'camera' ? {
                cameraModel: 'Google Pixel 9 Pro',
                lens: '24mm f/1.68 Main Camera',
                iso: 100,
                aperture: 'f/1.68',
                exposure: '1/250s',
                dateTaken: new Date(stat.mtimeMs).toLocaleDateString(),
                focalLength: '24mm'
              } : undefined
            });
          }
        }
      } catch {
        // ignore errors on unreadable directories
      }
    };

    crawl(this.baseDir);
    return allFiles;
  }

  /**
   * Search across all indexed files using syntax queries
   */
  public search(rawQuery: string, scopeCategory?: FileCategory) {
    const parsed = parseSearchSyntax(rawQuery);
    if (scopeCategory) {
      parsed.typeFilter = scopeCategory;
    }
    const all = this.getAllIndexedFiles();
    const results = all.filter(f => matchesSearchCriteria(f, parsed));
    return results;
  }

  /**
   * Performs deep storage breakdown and duplicate file detection
   */
  public getStorageAnalysis() {
    const files = this.getAllIndexedFiles();

    let photoBytes = 0;
    let photoCount = 0;
    let videoBytes = 0;
    let videoCount = 0;
    let audioBytes = 0;
    let audioCount = 0;
    let docBytes = 0;
    let docCount = 0;
    let archiveBytes = 0;
    let archiveCount = 0;
    let codeBytes = 0;
    let codeCount = 0;
    let appBytes = 0;
    let appCount = 0;
    let otherBytes = 0;
    let otherCount = 0;

    for (const f of files) {
      switch (f.category) {
        case 'photo': photoBytes += f.size; photoCount++; break;
        case 'video': videoBytes += f.size; videoCount++; break;
        case 'audio': audioBytes += f.size; audioCount++; break;
        case 'document': docBytes += f.size; docCount++; break;
        case 'archive': archiveBytes += f.size; archiveCount++; break;
        case 'code': codeBytes += f.size; codeCount++; break;
        case 'application': appBytes += f.size; appCount++; break;
        default: otherBytes += f.size; otherCount++; break;
      }
    }

    const totalUsed = photoBytes + videoBytes + audioBytes + docBytes + archiveBytes + codeBytes + appBytes + otherBytes;

    const breakdown = [
      { category: 'photo' as FileCategory, label: 'Photos & Images', bytes: photoBytes, fileCount: photoCount, color: '#ea4335' },
      { category: 'video' as FileCategory, label: 'Videos & Movies', bytes: videoBytes, fileCount: videoCount, color: '#f29900' },
      { category: 'audio' as FileCategory, label: 'Audio & Music', bytes: audioBytes, fileCount: audioCount, color: '#0f9d58' },
      { category: 'document' as FileCategory, label: 'Documents & PDFs', bytes: docBytes, fileCount: docCount, color: '#1a73e8' },
      { category: 'archive' as FileCategory, label: 'Archives & ZIPs', bytes: archiveBytes, fileCount: archiveCount, color: '#a142f4' },
      { category: 'application' as FileCategory, label: 'Apps & Installers', bytes: appBytes, fileCount: appCount, color: '#64748b' },
      { category: 'code' as FileCategory, label: 'Code & Dev', bytes: codeBytes, fileCount: codeCount, color: '#0284c7' },
      { category: 'other' as FileCategory, label: 'System & Other', bytes: otherBytes, fileCount: otherCount, color: '#80868b' }
    ].filter(b => b.fileCount > 0);

    // Largest files
    const largestFiles = [...files].sort((a, b) => b.size - a.size).slice(0, 10);

    // Duplicate detection
    const duplicateCandidates = identifyDuplicateCandidates(files);

    // Safe cleanup candidates
    const cleanupCandidates = [];

    // 1. Temporary files
    const tempFiles = files.filter(f => f.path.toLowerCase().includes('\\temp\\') || f.name.endsWith('.tmp'));
    if (tempFiles.length > 0) {
      const bytes = tempFiles.reduce((acc, curr) => acc + curr.size, 0);
      cleanupCandidates.push({
        id: 'clean_temp',
        title: 'Temporary & Cache Files',
        description: 'Cached preview thumbnails and temporary installer leftovers',
        reclaimBytes: bytes,
        items: tempFiles,
        type: 'temporary' as const
      });
    }

    // 2. Duplicate copies
    if (duplicateCandidates.length > 0) {
      const dupItems: any[] = [];
      let reclaim = 0;
      for (const group of duplicateCandidates) {
        reclaim += group.potentialReclaimBytes;
        // Keep original, flag copies
        dupItems.push(...group.items.slice(1));
      }
      cleanupCandidates.push({
        id: 'clean_duplicates',
        title: 'Duplicate File Copies',
        description: 'Redundant copies discovered in Downloads and media folders',
        reclaimBytes: reclaim,
        items: dupItems,
        type: 'duplicates' as const
      });
    }

    // 3. Old downloads
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const oldDownloads = files.filter(f => f.path.toLowerCase().includes('\\downloads\\') && f.mtime < thirtyDaysAgo);
    if (oldDownloads.length > 0) {
      const bytes = oldDownloads.reduce((acc, curr) => acc + curr.size, 0);
      cleanupCandidates.push({
        id: 'clean_downloads',
        title: 'Older Downloaded Files',
        description: 'Files downloaded more than 30 days ago that have not been modified',
        reclaimBytes: bytes,
        items: oldDownloads,
        type: 'old_downloads' as const
      });
    }

    return {
      drives: this.getDrives(),
      totalBytes: 512 * 1024 * 1024 * 1024,
      usedBytes: totalUsed + 40 * 1024 * 1024 * 1024, // include simulated OS base
      freeBytes: (512 * 1024 * 1024 * 1024) - (totalUsed + 40 * 1024 * 1024 * 1024),
      breakdown,
      largestFiles,
      duplicateGroups: duplicateCandidates,
      cleanupCandidates
    };
  }

  // --- Real File Operations ---

  public createFolder(parentVirtualPath: string, folderName: string) {
    const parentPhys = this.toPhysicalPath(parentVirtualPath);
    const newFolderPhys = path.join(parentPhys, folderName);
    if (fs.existsSync(newFolderPhys)) {
      throw new Error(`A folder named "${folderName}" already exists.`);
    }
    fs.mkdirSync(newFolderPhys, { recursive: true });
    return this.toVirtualPath(newFolderPhys);
  }

  public rename(targetVirtualPath: string, newName: string) {
    const targetPhys = this.toPhysicalPath(targetVirtualPath);
    if (!fs.existsSync(targetPhys)) {
      throw new Error(`Item not found: ${targetVirtualPath}`);
    }
    const dir = path.dirname(targetPhys);
    const newPhys = path.join(dir, newName);
    if (fs.existsSync(newPhys)) {
      throw new Error(`An item named "${newName}" already exists in this folder.`);
    }
    fs.renameSync(targetPhys, newPhys);
    const newVirt = this.toVirtualPath(newPhys);

    // Update favourites if present
    const favIdx = this.meta.favourites.indexOf(targetVirtualPath);
    if (favIdx !== -1) {
      this.meta.favourites[favIdx] = newVirt;
      this.saveMetadata();
    }

    return newVirt;
  }

  public deleteItem(targetVirtualPath: string, permanent = false) {
    const targetPhys = this.toPhysicalPath(targetVirtualPath);
    if (!fs.existsSync(targetPhys)) {
      throw new Error(`Item not found: ${targetVirtualPath}`);
    }

    const stat = fs.statSync(targetPhys);
    if (permanent) {
      if (stat.isDirectory()) {
        fs.rmSync(targetPhys, { recursive: true, force: true });
      } else {
        fs.unlinkSync(targetPhys);
      }
    } else {
      // Move to virtual Recycle Bin
      const recyclePhys = path.join(this.baseDir, '$Recycle.Bin');
      if (!fs.existsSync(recyclePhys)) fs.mkdirSync(recyclePhys, { recursive: true });
      const dest = path.join(recyclePhys, `${Date.now()}_${path.basename(targetPhys)}`);
      fs.renameSync(targetPhys, dest);
    }

    // Remove from favourites if present
    this.meta.favourites = this.meta.favourites.filter(p => p !== targetVirtualPath);
    this.saveMetadata();
    return true;
  }

  public copyItem(srcVirtualPath: string, destFolderVirtualPath: string, conflictRule?: 'replace' | 'skip' | 'rename') {
    const srcPhys = this.toPhysicalPath(srcVirtualPath);
    const destFolderPhys = this.toPhysicalPath(destFolderVirtualPath);
    if (!fs.existsSync(srcPhys)) throw new Error(`Source not found: ${srcVirtualPath}`);
    if (!fs.existsSync(destFolderPhys)) throw new Error(`Destination directory not found: ${destFolderVirtualPath}`);

    const baseName = path.basename(srcPhys);
    let destPhys = path.join(destFolderPhys, baseName);

    if (fs.existsSync(destPhys)) {
      if (conflictRule === 'skip') {
        return { status: 'skipped', path: this.toVirtualPath(destPhys) };
      }
      if (conflictRule === 'rename') {
        const ext = path.extname(baseName);
        const nameWithoutExt = path.basename(baseName, ext);
        destPhys = path.join(destFolderPhys, `${nameWithoutExt}_copy${ext}`);
      }
      // if replace, overwrite
    }

    const stat = fs.statSync(srcPhys);
    if (stat.isDirectory()) {
      fs.cpSync(srcPhys, destPhys, { recursive: true });
    } else {
      fs.copyFileSync(srcPhys, destPhys);
    }

    return { status: 'copied', path: this.toVirtualPath(destPhys) };
  }

  public moveItem(srcVirtualPath: string, destFolderVirtualPath: string, conflictRule?: 'replace' | 'skip' | 'rename') {
    const srcPhys = this.toPhysicalPath(srcVirtualPath);
    const destFolderPhys = this.toPhysicalPath(destFolderVirtualPath);
    if (!fs.existsSync(srcPhys)) throw new Error(`Source not found: ${srcVirtualPath}`);
    if (!fs.existsSync(destFolderPhys)) throw new Error(`Destination directory not found: ${destFolderVirtualPath}`);

    const baseName = path.basename(srcPhys);
    let destPhys = path.join(destFolderPhys, baseName);

    if (fs.existsSync(destPhys)) {
      if (conflictRule === 'skip') {
        return { status: 'skipped', path: this.toVirtualPath(destPhys) };
      }
      if (conflictRule === 'rename') {
        const ext = path.extname(baseName);
        const nameWithoutExt = path.basename(baseName, ext);
        destPhys = path.join(destFolderPhys, `${nameWithoutExt}_moved${ext}`);
      }
    }

    fs.renameSync(srcPhys, destPhys);
    return { status: 'moved', path: this.toVirtualPath(destPhys) };
  }

  public duplicateItem(targetVirtualPath: string) {
    const targetPhys = this.toPhysicalPath(targetVirtualPath);
    if (!fs.existsSync(targetPhys)) throw new Error(`Target not found: ${targetVirtualPath}`);

    const dir = path.dirname(targetPhys);
    const baseName = path.basename(targetPhys);
    const ext = path.extname(baseName);
    const nameWithoutExt = path.basename(baseName, ext);
    const dupPhys = path.join(dir, `${nameWithoutExt} - Copy${ext}`);

    const stat = fs.statSync(targetPhys);
    if (stat.isDirectory()) {
      fs.cpSync(targetPhys, dupPhys, { recursive: true });
    } else {
      fs.copyFileSync(targetPhys, dupPhys);
    }
    return this.toVirtualPath(dupPhys);
  }

  // --- Favourites & Collections ---

  public toggleFavourite(virtualPath: string) {
    const idx = this.meta.favourites.indexOf(virtualPath);
    let isFav = false;
    if (idx === -1) {
      this.meta.favourites.push(virtualPath);
      isFav = true;
    } else {
      this.meta.favourites.splice(idx, 1);
      isFav = false;
    }
    this.saveMetadata();
    return { path: virtualPath, isFavourite: isFav };
  }

  public getFavourites() {
    const all = this.getAllIndexedFiles();
    return all.filter(f => this.meta.favourites.includes(f.path));
  }

  public getCollections() {
    return this.meta.collections;
  }

  public createCollection(name: string, description?: string) {
    const col = {
      id: `col_${Date.now()}`,
      name,
      description,
      itemPaths: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.meta.collections.push(col);
    this.saveMetadata();
    return col;
  }

  public addToCollection(collectionId: string, itemPath: string) {
    const col = this.meta.collections.find(c => c.id === collectionId);
    if (!col) throw new Error('Collection not found');
    if (!col.itemPaths.includes(itemPath)) {
      col.itemPaths.push(itemPath);
      if (!col.coverImage) col.coverImage = itemPath;
      col.updatedAt = Date.now();
      this.saveMetadata();
    }
    return col;
  }

  public removeFromCollection(collectionId: string, itemPath: string) {
    const col = this.meta.collections.find(c => c.id === collectionId);
    if (!col) throw new Error('Collection not found');
    col.itemPaths = col.itemPaths.filter(p => p !== itemPath);
    col.updatedAt = Date.now();
    this.saveMetadata();
    return col;
  }

  public deleteCollection(collectionId: string) {
    this.meta.collections = this.meta.collections.filter(c => c.id !== collectionId);
    this.saveMetadata();
    return true;
  }

  public getSettings() {
    return this.meta.settings;
  }

  public updateSettings(newSettings: Partial<StorageMetadata['settings']>) {
    this.meta.settings = { ...this.meta.settings, ...newSettings };
    this.saveMetadata();
    return this.meta.settings;
  }
}

export const storageEngine = new StorageEngine();
