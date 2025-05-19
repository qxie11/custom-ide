
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
  Settings2 as ConfigIcon, // Renamed to avoid conflict with SettingsPanel
  FileLock2,   // For .env
  ImageIcon, // Renamed from Image
  Pencil,      // For rename action
  Trash2,      // For delete action
  FolderPlus,  // For New Folder
  FilePlus     // For New File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  selectedFileId: string | null;
  onRenameItem: (itemId: string, newName: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
  // onMoveItem: (itemId: string, targetFolderId: string | null) => void; // For D&D later
}

interface FileExplorerItemProps {
  item: FileItem;
  onFileSelect: (file: FileItem) => void;
  selectedFileId: string | null;
  level: number;
  onRenameItem: (itemId: string, newName: string) => void;
  onDeleteItem: (itemId: string) => void;
  // onMoveItem: (itemId: string, targetFolderId: string | null) => void; // For D&D later
  // setDragOverFolder: (folderId: string | null) => void; // For D&D visual feedback
  // dragOverFolder: string | null; // For D&D visual feedback
}

const getFileIcon = (item: FileItem, isFolderOpen?: boolean) => {
  const iconProps = { className: "h-4 w-4 mr-2 shrink-0" };
  
  if (item.type === 'folder') {
    return isFolderOpen 
      ? <Folder {...iconProps} className={`${iconProps.className} text-accent`} /> 
      : <Folder {...iconProps} className={`${iconProps.className} text-muted-foreground`} />;
  }

  // Specific file names
  if (item.name === 'package.json') return <Package {...iconProps} className={`${iconProps.className} text-purple-400`} />;
  if (item.name === 'tailwind.config.js' || item.name === 'tailwind.config.ts') return <Wind {...iconProps} className={`${iconProps.className} text-teal-400`} />;
  if (item.name === 'next.config.js' || item.name === 'next.config.ts') return <ConfigIcon {...iconProps} className={`${iconProps.className} text-sky-400`} />;
  if (item.name === '.env') return <FileLock2 {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
  if (item.name === 'favicon.ico') return <ImageIcon {...iconProps} className={`${iconProps.className} text-pink-400`} />;
  
  // By language or extension
  const extension = item.name.split('.').pop()?.toLowerCase();
  switch (item.language || extension) {
    case 'javascript':
    case 'js':
      return <Braces {...iconProps} className={`${iconProps.className} text-yellow-400`} />;
    case 'typescript':
    case 'ts':
    case 'tsx':
      return <Braces {...iconProps} className={`${iconProps.className} text-blue-500`} />;
    case 'html':
      return <Code2 {...iconProps} className={`${iconProps.className} text-orange-500`} />;
    case 'css':
      return <Palette {...iconProps} className={`${iconProps.className} text-sky-500`} />;
    case 'json': 
      return <FileJson2 {...iconProps} className={`${iconProps.className} text-lime-500`} />;
    case 'markdown':
    case 'md':
      return <File {...iconProps} className={`${iconProps.className} text-slate-400`} />; 
    default:
      return <FileText {...iconProps} className={`${iconProps.className} text-slate-300`} />;
  }
};

function FileExplorerItem({ 
  item, 
  onFileSelect, 
  selectedFileId, 
  level, 
  onRenameItem,
  onDeleteItem,
  // onMoveItem,
  // setDragOverFolder,
  // dragOverFolder
}: FileExplorerItemProps) {
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
    e.stopPropagation(); 
    const newName = window.prompt(`Enter new name for "${item.name}":`, item.name);
    if (newName && newName.trim() !== '' && newName.trim() !== item.name) {
      onRenameItem(item.id, newName.trim());
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteItem(item.id);
  };

  // Drag and Drop handlers (to be implemented later)
  // const handleDragStart = (e: React.DragEvent) => {
  //   e.stopPropagation();
  //   e.dataTransfer.setData('text/plain', item.id);
  //   e.dataTransfer.effectAllowed = 'move';
  // };

  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   if (item.type === 'folder') {
  //     // setDragOverFolder(item.id);
  //     e.dataTransfer.dropEffect = 'move';
  //   } else {
  //     e.dataTransfer.dropEffect = 'none';
  //   }
  // };

  // const handleDragLeave = (e: React.DragEvent) => {
  //   e.stopPropagation();
  //   // setDragOverFolder(null);
  // };

  // const handleDrop = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   // setDragOverFolder(null);
  //   if (item.type === 'folder') {
  //     const draggedItemId = e.dataTransfer.getData('text/plain');
  //     if (draggedItemId && draggedItemId !== item.id) {
  //       // onMoveItem(draggedItemId, item.id);
  //     }
  //   }
  // };

  const isSelected = item.type === 'file' && item.id === selectedFileId;
  // const isDragOver = item.type === 'folder' && dragOverFolder === item.id;

  return (
    <div 
      className="text-sm"
      // draggable // Enable for D&D
      // onDragStart={handleDragStart}
      // onDragOver={handleDragOver}
      // onDragLeave={handleDragLeave}
      // onDrop={handleDrop}
    >
      <div
        className={`flex items-center justify-between p-1.5 rounded-sm group hover:bg-accent/10 
                    ${isSelected ? 'bg-accent/20 text-accent font-medium' : 'text-foreground/80'}
                    `}
                    // ${isDragOver ? 'bg-blue-500/30' : ''}
        style={{ paddingLeft: `${level * 1 + 0.35}rem` }} 
      >
        <div className="flex items-center truncate cursor-pointer flex-grow min-w-0" onClick={handleSelect}>
          {item.type === 'folder' ? (
            isOpen ? <ChevronDown className="h-4 w-4 mr-1 shrink-0" /> : <ChevronRight className="h-4 w-4 mr-1 shrink-0" />
          ) : (
            <span className="w-4 mr-1 shrink-0"></span> 
          )}
          {getFileIcon(item, item.type === 'folder' ? isOpen : undefined)}
          <span className="truncate ml-0.5" title={item.name}>{item.name}</span>
        </div>
        <div className="flex items-center shrink-0 ml-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 focus-within:!opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0.5 rounded-sm"
            onClick={handleRename}
            aria-label={`Rename ${item.name}`}
            title={`Rename ${item.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0.5 rounded-sm"
                onClick={(e) => e.stopPropagation()} // Prevent selection/toggle
                aria-label={`Delete ${item.name}`}
                title={`Delete ${item.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete "{item.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
              onDeleteItem={onDeleteItem}
              // onMoveItem={onMoveItem}
              // setDragOverFolder={setDragOverFolder}
              // dragOverFolder={dragOverFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}


export function FileExplorer({ files, onFileSelect, selectedFileId, onRenameItem, onDeleteItem, onAddItem }: FileExplorerProps) {
  const [newItemName, setNewItemName] = useState('');
  // const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const getParentIdForNewItem = (): string | null => {
    if (selectedFileId) {
      const findParent = (items: FileItem[], targetId: string): string | null => {
        for (const item of items) {
          if (item.id === targetId && item.type === 'folder') return item.id;
          if (item.id === targetId && item.type === 'file') {
             // find parent of this file
            const findFileParent = (searchItems: FileItem[], fileId: string, currentParentId: string | null = null): string | null => {
                for(const sItem of searchItems) {
                    if (sItem.id === fileId) return currentParentId;
                    if (sItem.children) {
                        const foundParent = findFileParent(sItem.children, fileId, sItem.id);
                        if (foundParent) return foundParent;
                    }
                }
                return null;
            }
            return findFileParent(files, targetId);
          }
          if (item.children) {
            const found = findParent(item.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };
      const parent = findParent(files, selectedFileId);
      if (parent) return parent; // If selected is a folder, add to it
      
      // If selected is a file, find its parent folder
      const findFileParentRecursive = (items: FileItem[], fileId: string): string | null => {
        for (const item of items) {
          if (item.type === 'folder' && item.children?.some(child => child.id === fileId)) {
            return item.id;
          }
          if (item.children) {
            const foundParent = findFileParentRecursive(item.children, fileId);
            if (foundParent) return foundParent;
          }
        }
        return null;
      };
      return findFileParentRecursive(files, selectedFileId);
    }
    return null; // Add to root
  };


  const handleAddNewItem = (type: 'file' | 'folder') => {
    if (newItemName.trim()) {
      const parentId = getParentIdForNewItem();
      onAddItem(newItemName.trim(), type, parentId);
      setNewItemName(''); // Reset input
      // Close dialog: Need to manage dialog open state or use DialogClose
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 text-xs font-semibold text-foreground/60 uppercase tracking-wider flex justify-between items-center">
        <span>Explorer</span>
        <div className="flex space-x-1">
          <Dialog onOpenChange={(isOpen) => !isOpen && setNewItemName('')}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5" title="New File">
                <FilePlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
                <DialogDescription>Enter the name for the new file.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-file-name" className="text-right">Name</Label>
                  <Input 
                    id="new-file-name" 
                    value={newItemName} 
                    onChange={(e) => setNewItemName(e.target.value)} 
                    className="col-span-3" 
                    placeholder="e.g., component.tsx"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit" onClick={() => handleAddNewItem('file')}>Create File</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog onOpenChange={(isOpen) => !isOpen && setNewItemName('')}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5" title="New Folder">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>Enter the name for the new folder.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-folder-name" className="text-right">Name</Label>
                  <Input 
                    id="new-folder-name" 
                    value={newItemName} 
                    onChange={(e) => setNewItemName(e.target.value)} 
                    className="col-span-3"
                    placeholder="e.g., utils"
                  />
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                <DialogClose asChild>
                  <Button type="submit" onClick={() => handleAddNewItem('folder')}>Create Folder</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {files.map((item) => (
        <FileExplorerItem 
          key={item.id} 
          item={item} 
          onFileSelect={onFileSelect} 
          selectedFileId={selectedFileId} 
          level={0} 
          onRenameItem={onRenameItem}
          onDeleteItem={onDeleteItem}
          // onMoveItem={onMoveItem}
          // setDragOverFolder={setDragOverFolder}
          // dragOverFolder={dragOverFolder}
        />
      ))}
    </div>
  );
}

    