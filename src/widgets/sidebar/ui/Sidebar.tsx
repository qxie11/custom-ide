'use client';

import {FileExplorer} from '@/features/file-explorer';
import {SearchPanel} from '@/features/search';
import {SettingsPanel, type EditorSettings} from '@/features/settings';
import type {FileItem} from '@/entities/file-tree';

interface SidebarProps {
  activePanel: string;
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  selectedFileId: string | null;
  onRenameItem: (itemId: string, newName: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
  onMoveItem: (itemId: string, targetFolderId: string | null) => void;
  settings: EditorSettings;
  onApplySettings: (newSettings: EditorSettings) => void;
}

export function Sidebar({activePanel, files, onFileSelect, selectedFileId, onRenameItem, onDeleteItem, onAddItem, onMoveItem, settings, onApplySettings}: SidebarProps) {
  if (activePanel === 'explorer') {
    return <FileExplorer files={files} onFileSelect={onFileSelect} selectedFileId={selectedFileId} onRenameItem={onRenameItem} onDeleteItem={onDeleteItem} onAddItem={onAddItem} onMoveItem={onMoveItem} />;
  }
  if (activePanel === 'search') {
    return <SearchPanel allFiles={files} onFileSelect={onFileSelect} />;
  }
  if (activePanel === 'settings') {
    return <SettingsPanel settings={settings} onApply={onApplySettings} />;
  }
  return (
    <div className="p-4 text-muted-foreground text-sm">
      Panel: {activePanel}
    </div>
  );
}
