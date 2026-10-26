/**
 * Files Studio - Desktop File Manager
 * Inspired by Google Files for Android & Google Material Design
 */

import React from 'react';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { CommandBar } from './components/layout/CommandBar';
import { HomeDashboard } from './components/views/HomeDashboard';
import { PhotosView } from './components/views/PhotosView';
import { VideosView } from './components/views/VideosView';
import { AudioView } from './components/views/AudioView';
import { DocumentsView } from './components/views/DocumentsView';
import { FileExplorerView } from './components/views/FileExplorerView';
import { SearchView } from './components/views/SearchView';
import { StorageView } from './components/views/StorageView';
import { FavouritesView } from './components/views/FavouritesView';
import { CollectionsView } from './components/views/CollectionsView';
import { SettingsView } from './components/views/SettingsView';

import { ContextMenu, ContextMenuState } from './components/common/ContextMenu';
import { MiniPlayer } from './components/common/MiniPlayer';
import { ProgressBarToast } from './components/common/ProgressBarToast';

import { PhotoViewerModal } from './components/modals/PhotoViewerModal';
import { VideoPlayerModal } from './components/modals/VideoPlayerModal';
import { DocumentViewerModal } from './components/modals/DocumentViewerModal';
import { FullAudioPlayerModal } from './components/modals/FullAudioPlayerModal';
import {
  ConflictDialog,
  DeleteDialog,
  NewFolderDialog,
  RenameDialog,
  PropertiesModal,
} from './components/modals/Dialogs';

import { api } from './services/api';
import {
  FileItem,
  TabInfo,
  ViewMode,
  SortField,
  SortOrder,
  StorageAnalysisData,
  Collection,
  AppSettings,
  OperationProgress,
} from './types';
import { getParentPath, normalizeWindowsPath } from './utils/fileSystemLogic';

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = React.useState<string>('home');
  const [currentPath, setCurrentPath] = React.useState<string>('C:\\Users\\GoogleDesigner\\Pictures');
  const [history, setHistory] = React.useState<string[]>(['C:\\Users\\GoogleDesigner\\Pictures']);
  const [historyIndex, setHistoryIndex] = React.useState<number>(0);

  // Tabs for Explorer
  const [tabs, setTabs] = React.useState<TabInfo[]>([
    {
      id: 'tab_1',
      title: 'Pictures',
      path: 'C:\\Users\\GoogleDesigner\\Pictures',
      history: ['C:\\Users\\GoogleDesigner\\Pictures'],
      historyIndex: 0,
      viewMode: 'grid',
      sortField: 'name',
      sortOrder: 'asc',
    },
  ]);
  const [activeTabId, setActiveTabId] = React.useState<string>('tab_1');

  // Dual Pane
  const [dualPaneEnabled, setDualPaneEnabled] = React.useState<boolean>(false);
  const [secondaryPath, setSecondaryPath] = React.useState<string>('C:\\Users\\GoogleDesigner\\Downloads');
  const [secondaryItems, setSecondaryItems] = React.useState<FileItem[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [searchResults, setSearchResults] = React.useState<FileItem[]>([]);

  // View Options & Sorting
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc');

  // Selections & Clipboard
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [clipboard, setClipboard] = React.useState<{ action: 'copy' | 'cut'; items: FileItem[] } | null>(null);

  // Real Data Collections
  const [allPhotos, setAllPhotos] = React.useState<FileItem[]>([]);
  const [photoSubCategory, setPhotoSubCategory] = React.useState<string>('all');
  const [allVideos, setAllVideos] = React.useState<FileItem[]>([]);
  const [videoSubCategory, setVideoSubCategory] = React.useState<string>('all');
  const [allAudio, setAllAudio] = React.useState<FileItem[]>([]);
  const [audioSubCategory, setAudioSubCategory] = React.useState<string>('all');
  const [allDocuments, setAllDocuments] = React.useState<FileItem[]>([]);
  const [explorerItems, setExplorerItems] = React.useState<FileItem[]>([]);
  const [recentFiles, setRecentFiles] = React.useState<FileItem[]>([]);
  const [favourites, setFavourites] = React.useState<FileItem[]>([]);
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [storageData, setStorageData] = React.useState<StorageAnalysisData | null>(null);

  // App Settings
  const [settings, setSettings] = React.useState<AppSettings>({
    theme: 'light',
    accentColor: 'emerald',
    thumbnailSize: 'medium',
    showFileExtensions: true,
    showHiddenFiles: false,
    confirmDelete: true,
    enableDualPane: false,
    indexedFolders: ['C:\\Users\\GoogleDesigner\\Pictures', 'C:\\Users\\GoogleDesigner\\Documents'],
    excludedFolders: [],
  });

  // Indexing status
  const [isScanning, setIsScanning] = React.useState(false);
  const [operationProgress, setOperationProgress] = React.useState<OperationProgress | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Audio Player State & Audio Element
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = React.useState<FileItem | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(0.85);
  const [isMuted, setIsMuted] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [isShuffle, setIsShuffle] = React.useState(false);
  const [repeatMode, setRepeatMode] = React.useState<'off' | 'all' | 'one'>('all');
  const [isFullAudioOpen, setIsFullAudioOpen] = React.useState(false);

  // Modals
  const [activePhoto, setActivePhoto] = React.useState<FileItem | null>(null);
  const [activeVideo, setActiveVideo] = React.useState<FileItem | null>(null);
  const [activeDocument, setActiveDocument] = React.useState<FileItem | null>(null);
  const [conflictModal, setConflictModal] = React.useState<{
    isOpen: boolean;
    fileName: string;
    onResolve: (rule: 'replace' | 'skip' | 'rename') => void;
  } | null>(null);
  const [deleteModal, setDeleteModal] = React.useState<{ isOpen: boolean; items: FileItem[] } | null>(null);
  const [propertiesItem, setPropertiesItem] = React.useState<FileItem | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = React.useState(false);
  const [renameItem, setRenameItem] = React.useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = React.useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
  });

  // Apply Theme to document root
  React.useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Audio Element Setup
  React.useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    audio.onended = () => {
      setIsPlaying(false);
      handleNextTrack();
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [allAudio]);

  // Initial Load: Fetch settings, all media, storage, favourites
  const loadInitialData = React.useCallback(async () => {
    try {
      const [sets, photoRes, videoRes, audioRes, docRes, favRes, colRes, storRes] = await Promise.all([
        api.getSettings(),
        api.getMediaFiles('photo'),
        api.getMediaFiles('video'),
        api.getMediaFiles('audio'),
        api.getMediaFiles('document'),
        api.getFavourites(),
        api.getCollections(),
        api.getStorageAnalysis(),
      ]);

      setSettings(sets);
      setAllPhotos(photoRes.items);
      setAllVideos(videoRes.items);
      setAllAudio(audioRes.items);
      setAllDocuments(docRes.items);
      setRecentFiles([...photoRes.items, ...docRes.items].sort((a, b) => b.mtime - a.mtime));
      setFavourites(favRes.items);
      setCollections(colRes.collections);
      setStorageData(storRes);
    } catch (err) {
      console.error('Failed to load initial filesystem data:', err);
    }
  }, []);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Browse Directory for Explorer
  const loadDirectory = React.useCallback(async (p: string) => {
    try {
      const res = await api.browseDirectory(p);
      setExplorerItems(res.items);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Error browsing directory:', err.message);
    }
  }, []);

  React.useEffect(() => {
    if (currentView === 'explorer') {
      loadDirectory(currentPath);
    }
  }, [currentPath, currentView, loadDirectory]);

  // Browse secondary directory if dual pane enabled
  React.useEffect(() => {
    if (dualPaneEnabled && secondaryPath) {
      api.browseDirectory(secondaryPath).then((res) => setSecondaryItems(res.items)).catch(() => {});
    }
  }, [dualPaneEnabled, secondaryPath]);

  // Perform instant fast-path search + deep background search
  React.useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }

    // Instant local memory filter (< 2ms) across all loaded media and explorer items
    const localPool = [...allPhotos, ...allVideos, ...allAudio, ...allDocuments, ...explorerItems];
    const seen = new Set<string>();
    const instantMatches = localPool.filter((f) => {
      if (seen.has(f.path)) return false;
      seen.add(f.path);
      return f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q);
    });

    setSearchResults(instantMatches);
    if (currentView !== 'search') {
      setCurrentView('search');
    }

    // Concurrent deep server query for complete recursive index
    const timer = setTimeout(() => {
      api.searchFiles(searchQuery).then((res) => {
        setSearchResults((prev) => {
          // Merge unique items from server
          const combined = [...res.items];
          const serverPaths = new Set(res.items.map((i) => i.path));
          for (const item of prev) {
            if (!serverPaths.has(item.path)) combined.push(item);
          }
          return combined;
        });
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [searchQuery, allPhotos, allVideos, allAudio, allDocuments, explorerItems]);

  // Navigation handlers
  const handleNavigate = (view: string, path?: string) => {
    setCurrentView(view);
    if (path) {
      handleNavigatePath(path);
    }
  };

  const handleNavigatePath = (path: string) => {
    const norm = normalizeWindowsPath(path);
    setCurrentPath(norm);
    setCurrentView('explorer');
    setSearchQuery('');

    // Update history
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(norm);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);

    // Update active tab
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              path: norm,
              title: norm.split('\\').filter(Boolean).pop() || 'Local Disk (C:)',
            }
          : t
      )
    );
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentPath(history[newIdx]);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentPath(history[newIdx]);
    }
  };

  const handleGoUp = () => {
    const parent = getParentPath(currentPath);
    if (parent) handleNavigatePath(parent);
  };

  // Tab management
  const handleNewTab = () => {
    const newId = `tab_${Date.now()}`;
    const newTab: TabInfo = {
      id: newId,
      title: 'Local Disk (C:)',
      path: 'C:\\',
      history: ['C:\\'],
      historyIndex: 0,
      viewMode: 'grid',
      sortField: 'name',
      sortOrder: 'asc',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setCurrentPath('C:\\');
    setCurrentView('explorer');
  };

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      const nextActive = remaining[remaining.length - 1];
      setActiveTabId(nextActive.id);
      setCurrentPath(nextActive.path);
    }
  };

  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
    const tab = tabs.find((t) => t.id === id);
    if (tab) {
      setCurrentPath(tab.path);
      setCurrentView('explorer');
    }
  };

  // Sorting
  const sortedItems = (items: FileItem[]) => {
    return [...items].sort((a, b) => {
      // Folders always first
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;

      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Opening files according to media type
  const handleOpenFile = (file: FileItem) => {
    if (file.isFolder) {
      handleNavigatePath(file.path);
      return;
    }
    if (file.category === 'photo') {
      setActivePhoto(file);
    } else if (file.category === 'video') {
      setActiveVideo(file);
    } else if (file.category === 'audio') {
      handlePlayTrack(file);
    } else if (file.category === 'document' || file.category === 'code') {
      setActiveDocument(file);
    } else {
      // General file properties or preview
      setPropertiesItem(file);
    }
  };

  // Reveal file in folder
  const handleRevealInFolder = (file: FileItem) => {
    const parent = getParentPath(file.path);
    handleNavigatePath(parent);
    setSelectedIds([file.id]);
  };

  // Favourites
  const handleToggleFavourite = async (file: FileItem) => {
    try {
      const res = await api.toggleFavourite(file.path);
      // Update local state
      const updateList = (list: FileItem[]) =>
        list.map((item) => (item.path === file.path ? { ...item, isFavourite: res.isFavourite } : item));

      setAllPhotos(updateList);
      setAllVideos(updateList);
      setAllAudio(updateList);
      setAllDocuments(updateList);
      setExplorerItems(updateList);

      const favRes = await api.getFavourites();
      setFavourites(favRes.items);
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
    }
  };

  // Audio Controls
  const handlePlayTrack = (track: FileItem) => {
    if (!audioRef.current) return;
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      audioRef.current.src = track.mediaUrl || `/api/media/content?path=${encodeURIComponent(track.path)}`;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (!currentTrack || allAudio.length === 0) return;
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }
    if (isShuffle) {
      const rand = Math.floor(Math.random() * allAudio.length);
      handlePlayTrack(allAudio[rand]);
      return;
    }
    const idx = allAudio.findIndex((t) => t.id === currentTrack.id);
    if (idx === allAudio.length - 1 && repeatMode === 'off') {
      setIsPlaying(false);
      return;
    }
    const nextIdx = (idx + 1) % allAudio.length;
    handlePlayTrack(allAudio[nextIdx]);
  };

  const handlePrevTrack = () => {
    if (!currentTrack || allAudio.length === 0) return;
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      return;
    }
    const idx = allAudio.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = (idx - 1 + allAudio.length) % allAudio.length;
    handlePlayTrack(allAudio[prevIdx]);
  };

  // Multi-Selection
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    } else {
      setSelectedIds([id]);
    }
  };

  // Context Menu Handler
  const handleContextMenu = (e: React.MouseEvent, item?: FileItem) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
      isWorkspaceBlank: !item,
    });
  };

  // Real File Operations
  const handleCreateFolder = async (name: string) => {
    setIsNewFolderOpen(false);
    try {
      await api.createFolder(currentPath, name);
      loadDirectory(currentPath);
    } catch (err: any) {
      setOperationProgress({
        id: `err_${Date.now()}`,
        type: 'move',
        currentItemName: `Failed to create folder: ${err.message}`,
        totalItems: 1,
        processedItems: 0,
        percentage: 0,
        status: 'error',
        error: err.message,
      });
      setTimeout(() => setOperationProgress(null), 3000);
    }
  };

  const handleRename = async (newName: string) => {
    if (!renameItem) return;
    setRenameItem(null);
    try {
      await api.renameItem(renameItem.path, newName);
      loadDirectory(currentPath);
      loadInitialData();
    } catch (err: any) {
      setOperationProgress({
        id: `err_${Date.now()}`,
        type: 'move',
        currentItemName: `Failed to rename item: ${err.message}`,
        totalItems: 1,
        processedItems: 0,
        percentage: 0,
        status: 'error',
        error: err.message,
      });
      setTimeout(() => setOperationProgress(null), 3000);
    }
  };

  const handleDelete = async (permanent: boolean) => {
    if (!deleteModal) return;
    const itemsToDelete = deleteModal.items;
    setDeleteModal(null);

    setOperationProgress({
      id: 'op_del',
      type: 'delete',
      status: 'running',
      totalItems: itemsToDelete.length,
      processedItems: 0,
      percentage: 0,
    });

    let count = 0;
    for (const item of itemsToDelete) {
      try {
        await api.deleteItem(item.path, permanent);
        count++;
        setOperationProgress((prev) =>
          prev
            ? {
                ...prev,
                processedItems: count,
                percentage: Math.round((count / itemsToDelete.length) * 100),
                currentItemName: item.name,
              }
            : null
        );
      } catch (err) {
        console.error('Delete error for item:', item.name);
      }
    }

    setOperationProgress((prev) => (prev ? { ...prev, status: 'completed' } : null));
    setTimeout(() => setOperationProgress(null), 2000);

    loadDirectory(currentPath);
    loadInitialData();
  };

  // Copy / Cut / Paste Operations
  const handleCopySelected = () => {
    const items = explorerItems.filter((i) => selectedIds.includes(i.id));
    if (items.length > 0) setClipboard({ action: 'copy', items });
  };

  const handleCutSelected = () => {
    const items = explorerItems.filter((i) => selectedIds.includes(i.id));
    if (items.length > 0) setClipboard({ action: 'cut', items });
  };

  const handlePaste = async () => {
    if (!clipboard || clipboard.items.length === 0) return;

    setOperationProgress({
      id: 'op_paste',
      type: clipboard.action === 'cut' ? 'move' : 'copy',
      status: 'running',
      totalItems: clipboard.items.length,
      processedItems: 0,
      percentage: 0,
    });

    let count = 0;
    for (const item of clipboard.items) {
      try {
        if (clipboard.action === 'copy') {
          await api.copyItem(item.path, currentPath);
        } else {
          await api.moveItem(item.path, currentPath);
        }
        count++;
        setOperationProgress((prev) =>
          prev
            ? {
                ...prev,
                processedItems: count,
                percentage: Math.round((count / clipboard.items.length) * 100),
                currentItemName: item.name,
              }
            : null
        );
      } catch (err: any) {
        // If conflict error, offer conflict dialog
        if (err.message?.includes('already exists')) {
          setConflictModal({
            isOpen: true,
            fileName: item.name,
            onResolve: async (rule) => {
              setConflictModal(null);
              if (clipboard.action === 'copy') {
                await api.copyItem(item.path, currentPath, rule);
              } else {
                await api.moveItem(item.path, currentPath, rule);
              }
              loadDirectory(currentPath);
            },
          });
        }
      }
    }

    if (clipboard.action === 'cut') setClipboard(null);
    setOperationProgress((prev) => (prev ? { ...prev, status: 'completed' } : null));
    setTimeout(() => setOperationProgress(null), 2000);

    loadDirectory(currentPath);
    loadInitialData();
  };

  // Keyboard Shortcuts Listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        handleCopySelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        handleCutSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        handlePaste();
      } else if (e.key === 'F2') {
        const item = explorerItems.find((i) => selectedIds.includes(i.id));
        if (item) setRenameItem(item);
      } else if (e.key === 'Delete') {
        const items = explorerItems.filter((i) => selectedIds.includes(i.id));
        if (items.length > 0) setDeleteModal({ isOpen: true, items });
      } else if (e.altKey && e.key === 'ArrowLeft') {
        handleGoBack();
      } else if (e.altKey && e.key === 'ArrowRight') {
        handleGoForward();
      } else if (e.altKey && e.key === 'ArrowUp') {
        handleGoUp();
      } else if (e.key === 'F5') {
        e.preventDefault();
        loadDirectory(currentPath);
        loadInitialData();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, explorerItems, clipboard, currentPath, historyIndex]);

  // Indexing Rescan Trigger
  const handleTriggerRescan = async () => {
    setIsScanning(true);
    try {
      await api.triggerIndexingRescan();
      await loadInitialData();
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Current items for explorer view sorted
  const currentExplorerItems = sortedItems(explorerItems);

  // Counts for sidebar badges
  const sidebarCounts = {
    photos: allPhotos.length,
    videos: allVideos.length,
    audio: allAudio.length,
    documents: allDocuments.length,
    downloads: explorerItems.filter((i) => i.path.toLowerCase().includes('download')).length || 4,
    favourites: favourites.length,
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-sans text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-950 transition-colors">
      {/* 1. Custom Title Bar */}
      <TitleBar
        currentView={currentView}
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        theme={settings.theme}
        onToggleTheme={() => {
          const next = settings.theme === 'light' ? 'dark' : 'light';
          setSettings((prev) => ({ ...prev, theme: next }));
          api.updateSettings({ theme: next });
        }}
      />

      {/* 2. Top Command & Action Bar */}
      <CommandBar
        currentView={currentView}
        currentPath={currentPath}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onGoUp={handleGoUp}
        onNavigatePath={handleNavigatePath}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        sortField={sortField}
        sortOrder={sortOrder}
        onChangeSort={(f, o) => {
          setSortField(f);
          setSortOrder(o);
        }}
        onRefresh={() => {
          loadDirectory(currentPath);
          loadInitialData();
        }}
        onNewFolder={currentView === 'explorer' ? () => setIsNewFolderOpen(true) : undefined}
        selectedCount={selectedIds.length}
        onDeleteSelected={() => {
          const items = explorerItems.filter((i) => selectedIds.includes(i.id));
          if (items.length > 0) setDeleteModal({ isOpen: true, items });
        }}
        onCopySelected={handleCopySelected}
        onCutSelected={handleCutSelected}
        canPaste={!!clipboard && clipboard.items.length > 0}
        onPaste={handlePaste}
        onShowProperties={() => {
          const item = explorerItems.find((i) => selectedIds.includes(i.id));
          if (item) setPropertiesItem(item);
        }}
        dualPaneEnabled={dualPaneEnabled}
        onToggleDualPane={() => setDualPaneEnabled(!dualPaneEnabled)}
      />

      {/* 3. Main Body: Sidebar + Active Workspace View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Multi-Group Sidebar */}
        <Sidebar
          currentView={currentView}
          currentPath={currentPath}
          onNavigate={handleNavigate}
          counts={sidebarCounts}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Primary View Router */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {currentView === 'home' && (
            <HomeDashboard
              onNavigate={handleNavigate}
              onOpenFile={handleOpenFile}
              recentFiles={recentFiles}
              storageData={storageData}
              counts={sidebarCounts}
              onTriggerRescan={handleTriggerRescan}
              isScanning={isScanning}
            />
          )}

          {currentView === 'photos' && (
            <PhotosView
              photos={allPhotos}
              currentSubCategory={photoSubCategory}
              onChangeSubCategory={setPhotoSubCategory}
              onOpenPhoto={handleOpenFile}
              onToggleFavourite={handleToggleFavourite}
              onContextMenu={handleContextMenu}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onRefreshData={loadInitialData}
            />
          )}

          {currentView === 'videos' && (
            <VideosView
              videos={
                videoSubCategory === 'all'
                  ? allVideos
                  : allVideos.filter((v) => v.subCategory === videoSubCategory)
              }
              currentSubCategory={videoSubCategory}
              onChangeSubCategory={setVideoSubCategory}
              onOpenVideo={handleOpenFile}
              onContextMenu={handleContextMenu}
            />
          )}

          {currentView === 'audio' && (
            <AudioView
              audioFiles={
                audioSubCategory === 'all'
                  ? allAudio
                  : allAudio.filter((a) => a.subCategory === audioSubCategory)
              }
              currentSubCategory={audioSubCategory}
              onChangeSubCategory={setAudioSubCategory}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onContextMenu={handleContextMenu}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsView
              documents={allDocuments}
              onOpenDocument={handleOpenFile}
              onContextMenu={handleContextMenu}
            />
          )}

          {currentView === 'explorer' && (
            <FileExplorerView
              currentPath={currentPath}
              items={currentExplorerItems}
              viewMode={viewMode}
              onNavigatePath={handleNavigatePath}
              onOpenFile={handleOpenFile}
              onContextMenu={handleContextMenu}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              dualPaneEnabled={dualPaneEnabled}
              secondaryPath={secondaryPath}
              secondaryItems={secondaryItems}
              onNavigateSecondaryPath={setSecondaryPath}
            />
          )}

          {currentView === 'search' && (
            <SearchView
              query={searchQuery}
              results={searchResults}
              onOpenFile={handleOpenFile}
              onRevealInFolder={handleRevealInFolder}
              onSelectQueryHint={(hint) => setSearchQuery((prev) => `${prev} ${hint}`.trim())}
            />
          )}

          {currentView === 'storage' && (
            <StorageView
              storageData={storageData}
              onOpenFile={handleOpenFile}
              onRevealInFolder={handleRevealInFolder}
              onCleanStorage={async (paths) => {
                await api.cleanStorage(paths);
                loadInitialData();
              }}
            />
          )}

          {currentView === 'favourites' && (
            <FavouritesView
              favourites={favourites}
              onOpenFile={handleOpenFile}
              onRevealInFolder={handleRevealInFolder}
              onRemoveFavourite={handleToggleFavourite}
            />
          )}

          {currentView === 'collections' && (
            <CollectionsView
              collections={collections}
              onCreateCollection={async (name, desc) => {
                await api.createCollection(name, desc);
                loadInitialData();
              }}
              onDeleteCollection={async (id) => {
                await api.deleteCollection(id);
                loadInitialData();
              }}
              onOpenCollection={(col) => {
                // Filter and show items
                setCurrentView('photos');
              }}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={async (newSets) => {
                const updated = await api.updateSettings(newSets);
                setSettings(updated);
              }}
              onTriggerRescan={handleTriggerRescan}
              isScanning={isScanning}
            />
          )}
        </main>
      </div>

      {/* 4. Global Modals and Overlays */}
      {/* Photo Viewer Modal */}
      <PhotoViewerModal
        currentPhoto={activePhoto}
        allPhotos={allPhotos}
        onClose={() => setActivePhoto(null)}
        onNavigatePhoto={setActivePhoto}
        onToggleFavourite={handleToggleFavourite}
        onRevealInFolder={handleRevealInFolder}
        onDelete={(p) => setDeleteModal({ isOpen: true, items: [p] })}
      />

      {/* Video Player Modal with Playlist & PiP */}
      <VideoPlayerModal
        currentVideo={activeVideo}
        allVideos={allVideos}
        onNavigateVideo={(v) => setActiveVideo(v)}
        onClose={() => setActiveVideo(null)}
        onRevealInFolder={handleRevealInFolder}
      />

      {/* Integrated Multi-Format Document Reader Modal */}
      <DocumentViewerModal
        currentDocument={activeDocument}
        onClose={() => setActiveDocument(null)}
        onRevealInFolder={handleRevealInFolder}
      />

      {/* Full Immersive Audio Studio Player Modal */}
      <FullAudioPlayerModal
        isOpen={isFullAudioOpen}
        currentTrack={currentTrack}
        allTracks={allAudio}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        playbackRate={playbackRate}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onTogglePlay={() => {
          if (audioRef.current) {
            if (isPlaying) {
              audioRef.current.pause();
              setIsPlaying(false);
            } else {
              audioRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          }
        }}
        onSeek={(time) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
          }
        }}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        onSelectTrack={(track) => handlePlayTrack(track)}
        onChangeVolume={(vol) => {
          setVolume(vol);
          if (audioRef.current) {
            audioRef.current.volume = vol;
            audioRef.current.muted = vol === 0;
            setIsMuted(vol === 0);
          }
        }}
        onToggleMute={() => {
          if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
          }
        }}
        onChangePlaybackRate={(rate) => {
          setPlaybackRate(rate);
          if (audioRef.current) audioRef.current.playbackRate = rate;
        }}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        onCycleRepeat={() => {
          setRepeatMode((prev) => (prev === 'all' ? 'one' : prev === 'one' ? 'off' : 'all'));
        }}
        onRevealInFolder={handleRevealInFolder}
        onClose={() => setIsFullAudioOpen(false)}
      />

      {/* Properties Inspector Modal */}
      <PropertiesModal
        item={propertiesItem}
        onClose={() => setPropertiesItem(null)}
      />

      {/* New Folder Dialog */}
      <NewFolderDialog
        isOpen={isNewFolderOpen}
        onConfirm={handleCreateFolder}
        onCancel={() => setIsNewFolderOpen(false)}
      />

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={!!renameItem}
        currentName={renameItem?.name || ''}
        onConfirm={handleRename}
        onCancel={() => setRenameItem(null)}
      />

      {/* Conflict Resolution Dialog */}
      {conflictModal && (
        <ConflictDialog
          isOpen={conflictModal.isOpen}
          fileName={conflictModal.fileName}
          onResolve={conflictModal.onResolve}
          onCancel={() => setConflictModal(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteModal && (
        <DeleteDialog
          isOpen={deleteModal.isOpen}
          itemCount={deleteModal.items.length}
          itemName={deleteModal.items[0]?.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}

      {/* Right-Click Windows Context Menu */}
      <ContextMenu
        state={contextMenu}
        onClose={() => setContextMenu({ visible: false, x: 0, y: 0 })}
        onOpen={handleOpenFile}
        onCut={(item) => setClipboard({ action: 'cut', items: [item] })}
        onCopy={(item) => setClipboard({ action: 'copy', items: [item] })}
        canPaste={!!clipboard && clipboard.items.length > 0}
        onPaste={handlePaste}
        onRename={(item) => setRenameItem(item)}
        onDelete={(item) => setDeleteModal({ isOpen: true, items: [item] })}
        onToggleFavourite={handleToggleFavourite}
        onRevealInFolder={handleRevealInFolder}
        onProperties={(item) => setPropertiesItem(item)}
        onNewFolder={currentView === 'explorer' ? () => setIsNewFolderOpen(true) : undefined}
        onRefresh={() => {
          loadDirectory(currentPath);
          loadInitialData();
        }}
      />

      {/* Persistent Mini Audio Player */}
      <MiniPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        repeatMode={repeatMode}
        onCycleRepeat={() => {
          setRepeatMode((prev) => (prev === 'all' ? 'one' : prev === 'one' ? 'off' : 'all'));
        }}
        onTogglePlay={() => {
          if (audioRef.current) {
            if (isPlaying) {
              audioRef.current.pause();
              setIsPlaying(false);
            } else {
              audioRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          }
        }}
        onSeek={(time) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
          }
        }}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        onChangeVolume={(vol) => {
          setVolume(vol);
          if (audioRef.current) {
            audioRef.current.volume = vol;
            audioRef.current.muted = vol === 0;
            setIsMuted(vol === 0);
          }
        }}
        onToggleMute={() => {
          if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
          }
        }}
        onClose={() => {
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
          setCurrentTrack(null);
        }}
        onExpand={() => setIsFullAudioOpen(true)}
      />

      {/* File Operation Progress Toast */}
      <ProgressBarToast
        progress={operationProgress}
        onDismiss={() => setOperationProgress(null)}
      />
    </div>
  );
}
