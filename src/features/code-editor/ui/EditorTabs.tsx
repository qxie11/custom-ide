'use client';

import type {FileItem} from '@/entities/file-tree';
import {X} from 'lucide-react';
import {Button} from '@/shared/ui/button';

interface EditorTabsProps {
  openFiles: FileItem[];
  activeFileId: string | null;
  onTabClick: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
}

export function EditorTabs({openFiles, activeFileId, onTabClick, onCloseTab}: EditorTabsProps) {
  if (openFiles.length === 0) {
    return (
      <div className="h-10 flex items-center px-4 border-b border-tab-border bg-tab-inactive-background">
        <span className="text-xs text-muted-foreground">No file open</span>
      </div>
    );
  }

  return (
    <div className="flex h-10 border-b border-tab-border bg-tab-inactive-background select-none">
      {openFiles.map(file => (
        <div
          key={file.id}
          onClick={() => onTabClick(file.id)}
          className={`flex items-center justify-between pl-3 pr-1.5 py-2 border-r border-tab-border cursor-pointer text-xs min-w-[120px] max-w-[200px]
            ${activeFileId === file.id ? 'bg-tab-active-background text-foreground' : 'text-foreground/70 hover:bg-tab-hover-background'}`}
        >
          <span className="truncate" title={file.name}>
            {file.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 ml-2 p-0.5 rounded-sm hover:bg-accent/20"
            onClick={e => {
              e.stopPropagation(); // Prevent tab click when closing
              onCloseTab(file.id);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <div className="flex-grow border-r border-tab-border"></div> {/* Fill remaining space */}
    </div>
  );
}
