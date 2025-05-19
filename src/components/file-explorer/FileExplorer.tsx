
"use client";

import type { FileItem } from '@/lib/mock-data';
import { useState } from 'react';
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Braces,      // For JS/TS
  Code2,       // For HTML/XML
  Palette,     // For CSS
  FileJson2,   // For JSON
  File,        // For Markdown
  Package,     // For package.json
  Wind,        // For Tailwind config
  Settings2,   // For general config files
  FileLock2,   // For .env
  Image,       // For image files like favicon
  Pencil       // For rename action
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  selectedFileId: string | null;
  onRenameItem: (itemId: string, newName: string) => void;
}

interface FileExplorerItemProps {
  item: FileItem;
  onFileSelect: (file: FileItem) => void;
  selectedFileId: string | null;
  level: number;
  onRenameItem: (itemId: string, newName: string) => void;
}

const getFileIcon = (item: FileItem, isFolderOpen?: boolean) => {
  const iconClassName = "h-4 w-4 mr-2 shrink-0";
  
  if (item.type === 'folder') {
    return <Folder className={`${iconClassName} ${isFolderOpen ? 'text-accent' : ''}`} />;
  }

  // Specific file names
  if (item.name === 'package.json') return <Package className={iconClassName} />;
  if (item.name === 'tailwind.config.js' || item.name === 'tailwind.config.ts') return <Wind className={iconClassName} />;
  if (item.name === 'next.config.js' || item.name === 'next.config.ts') return <Settings2 className={iconClassName} />;
  if (item.name === '.env') return <FileLock2 className={iconClassName} />;
  if (item.name === 'favicon.ico') return <Image className={iconClassName} />;
  
  // By language
  switch (item.language) {
    case 'javascript':
    case 'typescript':
      return <Braces className={iconClassName} />;
    case 'html':
      return <Code2 className={iconClassName} />;
    case 'css':
      return <Palette className={iconClassName} />;
    case 'json': 
      return <FileJson2 className={iconClassName} />;
    case 'markdown':
      return <File className={iconClassName} />; 
    default:
      return <FileText className={iconClassName} />;
  }
};

function FileExplorerItem({ item, onFileSelect, selectedFileId, level, onRenameItem }: FileExplorerItemProps) {
  const [isOpen, setIsOpen] = useState(true); // Default open for demo

  const handleToggle = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'file') {
      onFileSelect(item);
    } else {
      handleToggle(); 
    }
  };
  
  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection or toggle
    const newName = window.prompt(`Enter new name for "${item.name}":`, item.name);
    if (newName && newName.trim() !== '' && newName.trim() !== item.name) {
      onRenameItem(item.id, newName.trim());
    }
  };

  const isSelected = item.type === 'file' && item.id === selectedFileId;

  return (
    <div className="text-sm">
      <div
        className={`flex items-center justify-between p-1.5 rounded-sm group hover:bg-accent/10 ${isSelected ? 'bg-accent/20 text-accent' : 'text-foreground/80'}`}
        style={{ paddingLeft: `${level * 1 + 0.35}rem` }} // Adjusted padding for icon button space
      >
        <div className="flex items-center truncate cursor-pointer" onClick={handleSelect}>
          {item.type === 'folder' ? (
            isOpen ? <ChevronDown className="h-4 w-4 mr-1 shrink-0" /> : <ChevronRight className="h-4 w-4 mr-1 shrink-0" />
          ) : (
            <span className="w-4 mr-1 shrink-0"></span> 
          )}
          {getFileIcon(item, item.type === 'folder' ? isOpen : undefined)}
          <span className="truncate ml-0.5">{item.name}</span>
        </div>
        <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0.5 rounded-sm opacity-0 group-hover:opacity-60 hover:!opacity-100 focus:opacity-100 shrink-0"
            onClick={handleRename}
            aria-label={`Rename ${item.name}`}
            title={`Rename ${item.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
      {item.type === 'folder' && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileExplorerItem 
              key={child.id} 
              item={child} 
              onFileSelect={onFileSelect} 
              selectedFileId={selectedFileId} 
              level={level + 1}
              onRenameItem={onRenameItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, onFileSelect, selectedFileId, onRenameItem }: FileExplorerProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 text-xs font-semibold text-foreground/60 uppercase tracking-wider">Explorer</div>
      {files.map((item) => (
        <FileExplorerItem 
          key={item.id} 
          item={item} 
          onFileSelect={onFileSelect} 
          selectedFileId={selectedFileId} 
          level={0} 
          onRenameItem={onRenameItem}
        />
      ))}
    </div>
  );
}

    