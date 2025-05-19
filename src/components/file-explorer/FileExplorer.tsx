"use client";

import type { FileItem } from '@/lib/mock-data';
import { useState } from 'react';
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react';

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
        {item.type === 'folder' ? (
          <Folder className={`h-4 w-4 mr-2 shrink-0 ${isOpen ? 'text-accent' : ''}`} />
        ) : (
          <FileText className="h-4 w-4 mr-2 shrink-0" />
        )}
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
