import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { FileCategory, classifyFile } from '../src/utils/fileSystemLogic';

export interface HostDrive {
  id: string;
  name: string;
  mountPoint: string;
  type: 'internal' | 'external' | 'user';
  isRemovable: boolean;
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
}

export interface HostFileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: number;
  category: FileCategory;
  extension: string;
  isRemovable?: boolean;
}

export class HostStorageEngine {
  private userHome: string;

  constructor() {
    this.userHome = os.homedir();
  }

  /**
   * Discovers real system drives and major user storage locations on the laptop.
   */
  public getDrives(): HostDrive[] {
    const drives: HostDrive[] = [];
    const isWin = process.platform === 'win32';

    if (isWin) {
      // Windows drive letters check
      const potentialLetters = ['C', 'D', 'E', 'F', 'G', 'H'];
      for (const letter of potentialLetters) {
        const root = `${letter}:\\`;
        try {
          if (fs.existsSync(root)) {
            drives.push({
              id: `drive_${letter.toLowerCase()}`,
              name: letter === 'C' ? 'Local Disk (C:)' : `Volume (${letter}:)`,
              mountPoint: root,
              type: letter === 'C' ? 'internal' : 'external',
              isRemovable: letter !== 'C',
              totalSpace: 512 * 1024 * 1024 * 1024,
              freeSpace: 218 * 1024 * 1024 * 1024,
              usedSpace: 294 * 1024 * 1024 * 1024,
            });
          }
        } catch {
          // ignore inaccessible drive
        }
      }
    } else {
      // Unix / Linux / Mac host storage points
      drives.push({
        id: 'drive_root',
        name: 'Internal Storage (Root /)',
        mountPoint: '/',
        type: 'internal',
        isRemovable: false,
        totalSpace: 512 * 1024 * 1024 * 1024,
        freeSpace: 340 * 1024 * 1024 * 1024,
        usedSpace: 172 * 1024 * 1024 * 1024,
      });

      // User home drive
      drives.push({
        id: 'drive_user',
        name: `User Storage (~${path.basename(this.userHome)})`,
        mountPoint: this.userHome,
        type: 'user',
        isRemovable: false,
        totalSpace: 512 * 1024 * 1024 * 1024,
        freeSpace: 340 * 1024 * 1024 * 1024,
        usedSpace: 172 * 1024 * 1024 * 1024,
      });

      // External storage mount points (/media, /mnt)
      const externalPaths = ['/media', '/mnt'];
      for (const ep of externalPaths) {
        try {
          if (fs.existsSync(ep)) {
            const entries = fs.readdirSync(ep);
            for (const entry of entries) {
              const full = path.join(ep, entry);
              drives.push({
                id: `ext_${entry}`,
                name: `External Drive (${entry})`,
                mountPoint: full,
                type: 'external',
                isRemovable: true,
                totalSpace: 128 * 1024 * 1024 * 1024,
                freeSpace: 94 * 1024 * 1024 * 1024,
                usedSpace: 34 * 1024 * 1024 * 1024,
              });
            }
          }
        } catch {
          // ignore
        }
      }
    }

    // Always include User Quick-Access Folders
    const userDirs = [
      { name: 'Downloads', sub: 'Downloads' },
      { name: 'Documents', sub: 'Documents' },
      { name: 'Pictures', sub: 'Pictures' },
      { name: 'Music', sub: 'Music' },
      { name: 'Videos', sub: 'Videos' },
      { name: 'Desktop', sub: 'Desktop' }
    ];

    for (const ud of userDirs) {
      const full = path.join(this.userHome, ud.sub);
      if (fs.existsSync(full)) {
        drives.push({
          id: `user_${ud.sub.toLowerCase()}`,
          name: ud.name,
          mountPoint: full,
          type: 'user',
          isRemovable: false,
          totalSpace: 512 * 1024 * 1024 * 1024,
          freeSpace: 340 * 1024 * 1024 * 1024,
          usedSpace: 172 * 1024 * 1024 * 1024,
        });
      }
    }

    return drives;
  }

  /**
   * Browses a real folder on the laptop's internal or external storage.
   */
  public browseDirectory(dirPath: string): {
    currentPath: string;
    parentPath: string | null;
    items: HostFileItem[];
    stats: { totalItems: number; directories: number; files: number };
  } {
    let resolved = path.resolve(dirPath);
    if (!fs.existsSync(resolved)) {
      resolved = this.userHome;
    }

    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) {
      resolved = path.dirname(resolved);
    }

    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    const items: HostFileItem[] = [];
    let dirCount = 0;
    let fileCount = 0;

    for (const ent of entries) {
      // Skip hidden files unless needed
      if (ent.name.startsWith('.')) continue;

      const fullItemPath = path.join(resolved, ent.name);
      try {
        const itemStat = fs.statSync(fullItemPath);
        const isDir = ent.isDirectory();
        if (isDir) {
          dirCount++;
          items.push({
            name: ent.name,
            path: fullItemPath,
            isDirectory: true,
            size: 0,
            modified: itemStat.mtimeMs,
            category: 'document',
            extension: ''
          });
        } else {
          fileCount++;
          const ext = path.extname(ent.name).toLowerCase();
          const classification = classifyFile(ent.name);
          items.push({
            name: ent.name,
            path: fullItemPath,
            isDirectory: false,
            size: itemStat.size,
            modified: itemStat.mtimeMs,
            category: classification.category,
            extension: ext
          });
        }
      } catch {
        // Skip unreadable files
      }
    }

    // Sort folders first, then files alphabetically
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    const parsed = path.parse(resolved);
    const parentPath = resolved === parsed.root ? null : path.dirname(resolved);

    return {
      currentPath: resolved,
      parentPath,
      items,
      stats: {
        totalItems: items.length,
        directories: dirCount,
        files: fileCount
      }
    };
  }

  /**
   * Creates a new folder on the host storage.
   */
  public createFolder(parentPath: string, name: string): string {
    const target = path.join(parentPath, name);
    if (fs.existsSync(target)) {
      throw new Error(`A folder named "${name}" already exists.`);
    }
    fs.mkdirSync(target, { recursive: true });
    return target;
  }

  /**
   * Deletes a file or directory on the host storage.
   */
  public deleteItem(targetPath: string): void {
    if (!fs.existsSync(targetPath)) return;
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(targetPath);
    }
  }

  /**
   * Renames a file or directory on the host storage.
   */
  public rename(oldPath: string, newName: string): string {
    const parent = path.dirname(oldPath);
    const target = path.join(parent, newName);
    if (fs.existsSync(target)) {
      throw new Error(`An item named "${newName}" already exists.`);
    }
    fs.renameSync(oldPath, target);
    return target;
  }
}

export const hostStorage = new HostStorageEngine();
