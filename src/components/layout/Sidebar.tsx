import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';

export interface NavItem {
  id: string;
  label: string;
  iconName: string;
  count?: number;
  view: string;
  path?: string;
}

interface SidebarProps {
  currentView: string;
  currentPath: string;
  onNavigate: (view: string, path?: string) => void;
  counts: {
    photos: number;
    videos: number;
    audio: number;
    documents: number;
    downloads: number;
    favourites: number;
  };
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenEngines?: () => void;
  onOpenMountStorage?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  currentPath,
  onNavigate,
  counts,
  isCollapsed,
  onToggleCollapse,
  onOpenEngines,
  onOpenMountStorage,
}) => {
  const [openSections, setOpenSections] = React.useState({
    main: true,
    personal: true,
    locations: true,
    storage: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const mainNavItems: NavItem[] = [
    { id: 'home', label: 'Home', iconName: 'home', view: 'home' },
    { id: 'photos', label: 'Photos', iconName: 'photo_library', count: counts.photos, view: 'photos' },
    { id: 'videos', label: 'Videos', iconName: 'movie', count: counts.videos, view: 'videos' },
    { id: 'audio', label: 'Audio', iconName: 'music_note', count: counts.audio, view: 'audio' },
    { id: 'documents', label: 'Documents', iconName: 'description', count: counts.documents, view: 'documents' },
    { id: 'downloads', label: 'Downloads', iconName: 'download', count: counts.downloads, view: 'explorer', path: 'C:\\Users\\GoogleDesigner\\Downloads' },
  ];

  const personalItems: NavItem[] = [
    { id: 'recent', label: 'Recent', iconName: 'schedule', view: 'home' },
    { id: 'favourites', label: 'Favourites', iconName: 'star', count: counts.favourites, view: 'favourites' },
    { id: 'collections', label: 'Collections', iconName: 'auto_stories', view: 'collections' },
  ];

  const locationItems: NavItem[] = [
    { id: 'loc_desktop', label: 'Desktop', iconName: 'desktop_windows', view: 'explorer', path: 'C:\\Users\\GoogleDesigner\\Desktop' },
    { id: 'loc_documents', label: 'Documents', iconName: 'folder', view: 'explorer', path: 'C:\\Users\\GoogleDesigner\\Documents' },
    { id: 'loc_downloads', label: 'Downloads', iconName: 'download', view: 'explorer', path: 'C:\\Users\\GoogleDesigner\\Downloads' },
    { id: 'loc_pictures', label: 'Pictures', iconName: 'photo_library', view: 'explorer', path: 'C:\\Users\\GoogleDesigner\\Pictures' },
    { id: 'loc_music', label: 'Music', iconName: 'music_note', view: 'explorer', path: 'C:\\Users\\GoogleDesigner\\Music' },
    { id: 'loc_videos', label: 'Videos', iconName: 'movie', view: 'explorer', path: 'C:\\Users\\GoogleDesigner\\Videos' },
  ];

  const storageItems: NavItem[] = [
    { id: 'this_pc', label: 'This PC', iconName: 'computer', view: 'explorer', path: 'This PC' },
    { id: 'drive_c', label: 'Local Disk (C:)', iconName: 'hard_drive', view: 'explorer', path: 'C:\\' },
    { id: 'storage_analysis', label: 'Storage', iconName: 'pie_chart', view: 'storage' },
  ];

  const renderNavList = (items: NavItem[]) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive =
          (item.view === currentView && !item.path) ||
          (currentView === 'explorer' && item.path && currentPath.toLowerCase() === item.path.toLowerCase());

        return (
          <li key={item.id}>
            <button
              onClick={() => onNavigate(item.view, item.path)}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-full text-xs font-sans transition-all duration-150 ${
                isActive
                  ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff] font-medium shadow-2xs'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 font-normal'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-3 min-w-0">
                <MaterialIcon
                  name={item.iconName}
                  fill={isActive || (item.id === 'favourites' && counts.favourites > 0)}
                  size={19}
                  className={
                    isActive
                      ? 'text-[#001d35] dark:text-[#c2e7ff]'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>
              {!isCollapsed && item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[11px] font-sans px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#a8c7fa]/60 text-[#001d35] dark:bg-[#0842a0] dark:text-[#c2e7ff] font-medium'
                      : 'text-neutral-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav
      className={`border-r border-neutral-200 dark:border-neutral-800 bg-[#f8fafd] dark:bg-[#131314] flex flex-col justify-between shrink-0 transition-all duration-200 font-sans ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="Main Navigation"
    >
      {/* Top Header / Collapse Toggle */}
      <div className="p-3 pb-2 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-[11px] font-medium tracking-wider text-neutral-400 uppercase px-2">
            Categories
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors ml-auto"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <MaterialIcon name={isCollapsed ? 'menu_open' : 'menu'} size={19} />
        </button>
      </div>

      {/* Nav List with quiet M3 hierarchy */}
      <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-4 text-xs no-scrollbar">
        {/* Section: Main Navigation */}
        <div>
          {renderNavList(mainNavItems)}
        </div>

        {/* Section: Personal */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          {!isCollapsed && (
            <div
              onClick={() => toggleSection('personal')}
              className="flex items-center justify-between px-3 py-1 text-[11px] font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer select-none"
            >
              <span>Personal</span>
              <MaterialIcon name={openSections.personal ? 'expand_more' : 'chevron_right'} size={16} />
            </div>
          )}
          {(openSections.personal || isCollapsed) && renderNavList(personalItems)}
        </div>

        {/* Section: Locations */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          {!isCollapsed && (
            <div
              onClick={() => toggleSection('locations')}
              className="flex items-center justify-between px-3 py-1 text-[11px] font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer select-none"
            >
              <span>Locations</span>
              <MaterialIcon name={openSections.locations ? 'expand_more' : 'chevron_right'} size={16} />
            </div>
          )}
          {(openSections.locations || isCollapsed) && renderNavList(locationItems)}
        </div>

        {/* Section: Storage */}
        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
          {!isCollapsed && (
            <div
              onClick={() => toggleSection('storage')}
              className="flex items-center justify-between px-3 py-1 text-[11px] font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer select-none"
            >
              <span>Storage & Engines</span>
              <MaterialIcon name={openSections.storage ? 'expand_more' : 'chevron_right'} size={16} />
            </div>
          )}
          {(openSections.storage || isCollapsed) && (
            <div className="space-y-1">
              {renderNavList(storageItems)}
              {onOpenMountStorage && (
                <button
                  onClick={onOpenMountStorage}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-sans text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  title="Mount Laptop Folder or Drive"
                >
                  <MaterialIcon name="storage" size={19} className="text-emerald-600 dark:text-emerald-400" />
                  {!isCollapsed && <span className="font-medium truncate">Connect Laptop Disk</span>}
                </button>
              )}
              {onOpenEngines && (
                <button
                  onClick={onOpenEngines}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-sans text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  title="Google Core Engineering Engines"
                >
                  <MaterialIcon name="terminal" size={19} className="text-blue-600 dark:text-blue-400" />
                  {!isCollapsed && <span className="font-medium truncate">Core Engines</span>}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Settings */}
      <div className="p-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
            currentView === 'settings'
              ? 'bg-[#c2e7ff] text-[#001d35] dark:bg-[#004a77] dark:text-[#c2e7ff]'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
          }`}
          title="Settings"
        >
          <MaterialIcon name="settings" fill={currentView === 'settings'} size={19} className="text-neutral-500" />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>
    </nav>
  );
};
