/**
 * Pure filesystem & media classification logic
 * Decoupled from DOM and UI for deterministic testing and reliability
 */

export type FileCategory = 'photo' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'application' | 'other';

export interface ParsedSearchQuery {
  keywords: string[];
  typeFilter?: FileCategory | string;
  nameFilter?: string;
  minSizeBytes?: number;
  maxSizeBytes?: number;
  afterDate?: Date;
  beforeDate?: Date;
  raw: string;
}

/**
 * Normalizes Windows-style and Unix-style paths to consistent Windows presentation
 */
export function normalizeWindowsPath(filePath: string): string {
  if (!filePath) return 'C:\\';
  if (filePath === 'This PC') return 'This PC';
  // Replace forward slashes with backslashes
  let p = filePath.replace(/\//g, '\\');
  // Handle root or relative
  if (!p.includes(':') && !p.startsWith('\\\\')) {
    if (p.startsWith('\\')) {
      p = `C:${p}`;
    } else {
      p = `C:\\${p}`;
    }
  }
  // Remove trailing slash unless it's drive root like C:\
  if (p.length > 3 && p.endsWith('\\')) {
    p = p.slice(0, -1);
  }
  return p;
}

/**
 * Returns parent path for a given path
 */
export function getParentPath(filePath: string): string {
  const norm = normalizeWindowsPath(filePath);
  if (/^[A-Za-z]:\\?$/.test(norm)) {
    return 'This PC';
  }
  const lastSlash = norm.lastIndexOf('\\');
  if (lastSlash === -1) return 'This PC';
  const parent = norm.substring(0, lastSlash);
  if (/^[A-Za-z]:$/.test(parent)) {
    return `${parent}\\`;
  }
  return parent;
}

/**
 * Breaks a path down into clickable breadcrumb segments
 */
export function getBreadcrumbSegments(filePath: string): { label: string; path: string }[] {
  if (!filePath || filePath === 'This PC') {
    return [{ label: 'This PC', path: 'This PC' }];
  }
  const norm = normalizeWindowsPath(filePath);
  const parts = norm.split('\\').filter(Boolean);
  const segments: { label: string; path: string }[] = [{ label: 'This PC', path: 'This PC' }];

  let current = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === 0) {
      current = `${part}\\`;
      segments.push({ label: `Local Disk (${part})`, path: current });
    } else {
      current = current.endsWith('\\') ? `${current}${part}` : `${current}\\${part}`;
      segments.push({ label: part, path: current });
    }
  }
  return segments;
}

/**
 * Classifies a file by extension and path into a Google Files category
 */
export function classifyFile(filename: string, fullPath: string = ''): {
  category: FileCategory;
  subCategory?: 'camera' | 'screenshot' | 'download' | 'recording' | 'album';
} {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const lowerPath = fullPath.toLowerCase();

  // Photo extensions
  const photoExts = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg', 'heic', 'avif', 'ico']);
  // Video extensions
  const videoExts = new Set(['mp4', 'mkv', 'mov', 'webm', 'avi', 'wmv', 'flv', 'm4v']);
  // Audio extensions
  const audioExts = new Set(['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus']);
  // Document extensions
  const docExts = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv', 'epub']);
  // Archive extensions
  const archiveExts = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz']);
  // Code extensions
  const codeExts = new Set(['ts', 'tsx', 'js', 'jsx', 'json', 'html', 'css', 'py', 'java', 'c', 'cpp', 'rs', 'go', 'sh', 'md', 'sql']);
  // App extensions
  const appExts = new Set(['exe', 'msi', 'bat', 'cmd', 'ps1', 'dll']);

  if (photoExts.has(ext)) {
    let subCategory: 'camera' | 'screenshot' | 'download' | undefined;
    if (lowerPath.includes('screenshot') || filename.toLowerCase().includes('screenshot')) {
      subCategory = 'screenshot';
    } else if (lowerPath.includes('camera') || lowerPath.includes('dcim') || filename.startsWith('IMG_') || filename.startsWith('DSC_')) {
      subCategory = 'camera';
    } else if (lowerPath.includes('download')) {
      subCategory = 'download';
    }
    return { category: 'photo', subCategory };
  }

  if (videoExts.has(ext)) {
    let subCategory: 'camera' | 'screenshot' | 'download' | 'recording' | undefined;
    if (lowerPath.includes('screen') || filename.toLowerCase().includes('screencast') || filename.toLowerCase().includes('recording')) {
      subCategory = 'recording';
    } else if (lowerPath.includes('camera') || lowerPath.includes('dcim')) {
      subCategory = 'camera';
    } else if (lowerPath.includes('download')) {
      subCategory = 'download';
    }
    return { category: 'video', subCategory };
  }

  if (audioExts.has(ext)) {
    let subCategory: 'recording' | 'download' | undefined;
    if (lowerPath.includes('voice') || lowerPath.includes('recording') || filename.toLowerCase().includes('rec_')) {
      subCategory = 'recording';
    } else if (lowerPath.includes('download')) {
      subCategory = 'download';
    }
    return { category: 'audio', subCategory };
  }

  if (docExts.has(ext)) return { category: 'document' };
  if (archiveExts.has(ext)) return { category: 'archive' };
  if (codeExts.has(ext)) return { category: 'code' };
  if (appExts.has(ext)) return { category: 'application' };

  return { category: 'other' };
}

/**
 * Format bytes to readable human strings (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0));
  return `${val} ${sizes[i]}`;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Formats timestamp to human relative or readable date
 */
export function formatDate(timestamp: number | string | Date): string {
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays === 1) {
    return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Advanced search syntax parser (type:image, name:vacation, size:>10mb, etc.)
 */
export function parseSearchSyntax(rawQuery: string): ParsedSearchQuery {
  const result: ParsedSearchQuery = {
    keywords: [],
    raw: rawQuery.trim(),
  };

  const tokens = rawQuery.trim().split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith('type:')) {
      const typeVal = token.slice(5).toLowerCase();
      if (['image', 'images', 'photo', 'photos'].includes(typeVal)) result.typeFilter = 'photo';
      else if (['video', 'videos', 'movie'].includes(typeVal)) result.typeFilter = 'video';
      else if (['audio', 'music', 'song'].includes(typeVal)) result.typeFilter = 'audio';
      else if (['doc', 'document', 'pdf', 'documents'].includes(typeVal)) result.typeFilter = 'document';
      else if (['archive', 'zip'].includes(typeVal)) result.typeFilter = 'archive';
      else result.typeFilter = typeVal;
    } else if (token.startsWith('name:')) {
      result.nameFilter = token.slice(5).toLowerCase();
    } else if (token.startsWith('size:')) {
      const sizeSpec = token.slice(5).toLowerCase();
      if (sizeSpec === 'large' || sizeSpec === '>100mb') {
        result.minSizeBytes = 100 * 1024 * 1024;
      } else if (sizeSpec === 'medium' || sizeSpec === '10mb-100mb') {
        result.minSizeBytes = 10 * 1024 * 1024;
        result.maxSizeBytes = 100 * 1024 * 1024;
      } else if (sizeSpec === 'small' || sizeSpec === '<10mb') {
        result.maxSizeBytes = 10 * 1024 * 1024;
      }
    } else if (token.startsWith('after:')) {
      const dateStr = token.slice(6);
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) result.afterDate = parsed;
    } else if (token.startsWith('before:')) {
      const dateStr = token.slice(7);
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) result.beforeDate = parsed;
    } else {
      result.keywords.push(token.toLowerCase());
    }
  }

  return result;
}

/**
 * Filter items according to parsed search query
 */
export function matchesSearchCriteria(
  file: { name: string; path: string; size: number; category: FileCategory; mtime?: number },
  query: ParsedSearchQuery
): boolean {
  if (query.typeFilter && file.category !== query.typeFilter) {
    // Check if typeFilter is extension (e.g. pdf)
    if (!file.name.toLowerCase().endsWith(`.${query.typeFilter}`)) {
      return false;
    }
  }

  if (query.nameFilter && !file.name.toLowerCase().includes(query.nameFilter)) {
    return false;
  }

  if (query.minSizeBytes !== undefined && file.size < query.minSizeBytes) {
    return false;
  }

  if (query.maxSizeBytes !== undefined && file.size > query.maxSizeBytes) {
    return false;
  }

  if (query.afterDate && file.mtime && file.mtime < query.afterDate.getTime()) {
    return false;
  }

  if (query.beforeDate && file.mtime && file.mtime > query.beforeDate.getTime()) {
    return false;
  }

  if (query.keywords.length > 0) {
    const haystack = `${file.name} ${file.path}`.toLowerCase();
    for (const kw of query.keywords) {
      if (!haystack.includes(kw)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Duplicate files detector: groups items with matching sizes and hashes
 */
export function identifyDuplicateCandidates<T extends { path: string; name: string; size: number; hash?: string }>(
  files: T[]
): { size: number; items: T[]; potentialReclaimBytes: number }[] {
  // First group by exact file size (greater than 1KB)
  const sizeMap = new Map<number, T[]>();
  for (const f of files) {
    if (f.size > 1024) {
      const group = sizeMap.get(f.size) || [];
      group.push(f);
      sizeMap.set(f.size, group);
    }
  }

  const duplicates: { size: number; items: T[]; potentialReclaimBytes: number }[] = [];

  for (const [size, group] of sizeMap.entries()) {
    if (group.length > 1) {
      // If hashes exist, compare by hash; otherwise flag size match
      const hashGroups = new Map<string, T[]>();
      for (const item of group) {
        const key = item.hash || `${item.name.toLowerCase()}_${item.size}`;
        const hGroup = hashGroups.get(key) || [];
        hGroup.push(item);
        hashGroups.set(key, hGroup);
      }

      for (const hGroup of hashGroups.values()) {
        if (hGroup.length > 1) {
          duplicates.push({
            size,
            items: hGroup,
            potentialReclaimBytes: size * (hGroup.length - 1),
          });
        }
      }
    }
  }

  return duplicates.sort((a, b) => b.potentialReclaimBytes - a.potentialReclaimBytes);
}
