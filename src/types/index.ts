import { FileCategory } from '../utils/fileSystemLogic';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  size: number;
  extension: string;
  category: FileCategory;
  subCategory?: 'camera' | 'screenshot' | 'download' | 'recording' | 'album';
  mtime: number;
  birthtime: number;
  isFavourite?: boolean;
  thumbnailUrl?: string;
  mediaUrl?: string;
  url?: string;
  duration?: number; // for audio/video in seconds
  dimensions?: { width: number; height: number }; // for photos/videos
  exif?: {
    cameraModel?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    exposure?: string;
    dateTaken?: string;
    focalLength?: string;
  };
  artist?: string;
  album?: string;
  title?: string;
  itemCount?: number; // for folders
}

export type ViewMode = 'grid' | 'list' | 'compact';
export type SortField = 'name' | 'mtime' | 'size' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface TabInfo {
  id: string;
  title: string;
  path: string;
  history: string[];
  historyIndex: number;
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
}

export interface DriveInfo {
  id: string;
  letter: string;
  name: string;
  path: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  isRemovable?: boolean;
}

export interface StorageCategoryBreakdown {
  category: FileCategory;
  label: string;
  bytes: number;
  fileCount: number;
  color: string;
}

export interface StorageAnalysisData {
  drives: DriveInfo[];
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  breakdown: StorageCategoryBreakdown[];
  largestFiles: FileItem[];
  duplicateGroups: {
    size: number;
    items: FileItem[];
    potentialReclaimBytes: number;
  }[];
  cleanupCandidates: {
    id: string;
    title: string;
    description: string;
    reclaimBytes: number;
    items: FileItem[];
    type: 'temporary' | 'duplicates' | 'old_downloads' | 'large_unused';
  }[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  itemPaths: string[];
  createdAt: number;
  updatedAt: number;
  coverImage?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: 'emerald' | 'google-blue' | 'coral' | 'amber' | 'purple';
  thumbnailSize: 'small' | 'medium' | 'large';
  showFileExtensions: boolean;
  showHiddenFiles: boolean;
  confirmDelete: boolean;
  enableDualPane: boolean;
  indexedFolders: string[];
  excludedFolders: string[];
}

export interface OperationProgress {
  id: string;
  type: 'copy' | 'move' | 'delete' | 'scan';
  status: 'running' | 'completed' | 'cancelled' | 'error';
  totalItems: number;
  processedItems: number;
  currentItemName?: string;
  percentage: number;
  error?: string;
}
