
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
  File,        // For Markdown (replaced FileMarkdown2)
  Package,     // For package.json
  Wind,        // For Tailwind config
  Settings2,   // For general config files
  FileLock2,   // For .env
  Image        // For image files like favicon
} from 'lucide-react';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  selectedFileId: string | null;
}

interface FileExplorerItemProps {
  item: FileItem;
  onFileSelect: (file: FileItem) => void;
  selectedFileId: string | null;
  level: number;
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
    case 'json': // Handles other JSON files if package.json isn't matched by name
      return <FileJson2 className={iconClassName} />;
    case 'markdown':
      return <File className={iconClassName} />; // Changed from FileMarkdown2
    default:
      return <FileText className={iconClassName} />;
  }
};

function FileExplorerItem({ item, onFileSelect, selectedFileId, level }: FileExplorerItemProps) {
  const [isOpen, setIsOpen] = useState(true); // Default open for demo

  const handleToggle = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = () => {
    if (item.type === 'file') {
      onFileSelect(item);
    } else {
      handleToggle(); // Also toggle folder on click
    }
  };

  const isSelected = item.type === 'file' && item.id === selectedFileId;

  return (
    <div className="text-sm">
      <div
        className={`flex items-center p-1.5 rounded-sm cursor-pointer hover:bg-accent/10 ${isSelected ? 'bg-accent/20 text-accent-foreground' : 'text-foreground/80'}`}
        style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
        onClick={handleSelect}
      >
        {item.type === 'folder' ? (
          isOpen ? <ChevronDown className="h-4 w-4 mr-1 shrink-0" /> : <ChevronRight className="h-4 w-4 mr-1 shrink-0" />
        ) : (
          <span className="w-4 mr-1 shrink-0"></span> // Placeholder for alignment
        )}
        {getFileIcon(item, item.type === 'folder' ? isOpen : undefined)}
        <span className="truncate">{item.name}</span>
      </div>
      {item.type === 'folder' && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileExplorerItem key={child.id} item={child} onFileSelect={onFileSelect} selectedFileId={selectedFileId} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, onFileSelect, selectedFileId }: FileExplorerProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 text-xs font-semibold text-foreground/60 uppercase tracking-wider">Explorer</div>
      {files.map((item) => (
        <FileExplorerItem key={item.id} item={item} onFileSelect={onFileSelect} selectedFileId={selectedFileId} level={0} />
      ))}
    </div>
  );
}
