
"use client";

import type { FileItem } from '@/lib/mock-data';
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Braces,
  Code2,
  Palette,
  FileJson2,
  File,
  Package,
  Wind,
  Settings2 as ConfigIcon,
  FileLock2,
  ImageIcon,
  Pencil,
  Trash2,
  FolderPlus,
  FilePlus
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
import { cn } from '@/lib/utils';


interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  selectedFileId: string | null;
  onRenameItem: (itemId: string, newName: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
  onMoveItem: (itemId: string, targetFolderId: string | null) => void;
}

const getFileIcon = (item: FileItem, isFolderOpen?: boolean) => {
  const iconProps = { className: "h-4 w-4 mr-2 shrink-0" };
  
  if (item.type === 'folder') {
    return isFolderOpen 
      ? <Folder {...iconProps} className={`${iconProps.className} text-accent`} /> 
      : <Folder {...iconProps} className={`${iconProps.className} text-muted-foreground`} />;
  }

  if (item.name === 'package.json') return <Package {...iconProps} className={`${iconProps.className} text-purple-400`} />;
  if (item.name === 'tailwind.config.js' || item.name === 'tailwind.config.ts') return <Wind {...iconProps} className={`${iconProps.className} text-teal-400`} />;
  if (item.name === 'next.config.js' || item.name === 'next.config.ts') return <ConfigIcon {...iconProps} className={`${iconProps.className} text-sky-400`} />;
  if (item.name === '.env') return <FileLock2 {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
  if (item.name === 'favicon.ico') return <ImageIcon {...iconProps} className={`${iconProps.className} text-pink-400`} />;
  
  const extension = item.name.split('.').pop()?.toLowerCase();
  switch (item.language || extension) {
    case 'javascript': case 'js': return <Braces {...iconProps} className={`${iconProps.className} text-yellow-400`} />;
    case 'typescript': case 'ts': case 'tsx': return <Braces {...iconProps} className={`${iconProps.className} text-blue-500`} />;
    case 'html': return <Code2 {...iconProps} className={`${iconProps.className} text-orange-500`} />;
    case 'css': return <Palette {...iconProps} className={`${iconProps.className} text-sky-500`} />;
    case 'json': return <FileJson2 {...iconProps} className={`${iconProps.className} text-lime-500`} />;
    case 'markdown': case 'md': return <File {...iconProps} className={`${iconProps.className} text-slate-400`} />; 
    default: return <FileText {...iconProps} className={`${iconProps.className} text-slate-300`} />;
  }
};

interface FileExplorerItemComponentProps {
  item: FileItem;
  allItems: FileItem[];
  onFileSelect: (file: FileItem) => void;
  selectedFileId: string | null;
  level: number;
  renamingItemId: string | null;
  editText: string;
  onStartRename: (item: FileItem) => void;
  onConfirmRename: (itemId: string) => void;
  onCancelRename: () => void;
  setEditTextLocal: (value: string) => void;
  onDeleteItem: (itemId: string) => void;
  onMoveItem: (itemId: string, targetFolderId: string | null) => void;
  draggedItemIdState: string | null;
  setDraggedItemIdState: (id: string | null) => void;
  dragOverFolderIdState: string | null;
  setDragOverFolderIdState: (id: string | null) => void;
}

function FileExplorerItemComponent({
  item, allItems, onFileSelect, selectedFileId, level,
  renamingItemId, editText, onStartRename, onConfirmRename, onCancelRename, setEditTextLocal,
  onDeleteItem, onMoveItem,
  draggedItemIdState, setDraggedItemIdState,
  dragOverFolderIdState, setDragOverFolderIdState
}: FileExplorerItemComponentProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    if (item.type === 'folder') setIsOpen(!isOpen);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'file') {
      if (renamingItemId !== item.id) onFileSelect(item);
    } else {
      handleToggle();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteItem(item.id);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onConfirmRename(item.id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancelRename();
    }
  };

  const handleInputBlur = () => {
    onConfirmRename(item.id);
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemIdState(item.id);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.type === 'folder' && draggedItemIdState && item.id !== draggedItemIdState) {
        setDragOverFolderIdState(item.id);
        e.dataTransfer.dropEffect = 'move';
    } else {
        e.dataTransfer.dropEffect = 'none';
        setDragOverFolderIdState(null); // Clear if not over a valid folder
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDragOverFolderIdState(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderIdState(null);
    const droppedItemId = e.dataTransfer.getData('text/plain');
    if (item.type === 'folder' && droppedItemId && droppedItemId !== item.id) {
      onMoveItem(droppedItemId, item.id);
    }
    setDraggedItemIdState(null);
  };

  const isSelected = item.type === 'file' && item.id === selectedFileId && renamingItemId !== item.id;
  const isBeingRenamed = renamingItemId === item.id;
  const isDragOver = item.type === 'folder' && dragOverFolderIdState === item.id && draggedItemIdState !== item.id;
  
  return (
    <div
      className="text-sm"
      draggable={!isBeingRenamed}
      onDragStart={isBeingRenamed ? undefined : handleDragStart}
    >
      <div
        className={cn(`flex items-center justify-between p-1.5 rounded-sm group`,
            isSelected ? 'bg-accent/20 text-accent font-medium' : 'text-foreground/80',
            isDragOver ? 'bg-accent/30 ring-1 ring-accent' : '',
            isBeingRenamed ? 'bg-input' : 'hover:bg-accent/10',
        )}
        style={{ paddingLeft: `${level * 1 + 0.35}rem` }}
        onClick={isBeingRenamed ? (e) => e.stopPropagation() : handleSelect}
        onDragOver={isBeingRenamed ? undefined : handleDragOver}
        onDragLeave={isBeingRenamed ? undefined : handleDragLeave}
        onDrop={isBeingRenamed ? undefined : handleDrop}
      >
        <div className="flex items-center truncate flex-grow min-w-0">
          {item.type === 'folder' ? (
            isOpen ? <ChevronDown className="h-4 w-4 mr-1 shrink-0" onClick={(e)=>{e.stopPropagation(); handleToggle();}} /> : <ChevronRight className="h-4 w-4 mr-1 shrink-0" onClick={(e)=>{e.stopPropagation(); handleToggle();}} />
          ) : (
            <span className="w-4 mr-1 shrink-0"></span>
          )}
          {getFileIcon(item, item.type === 'folder' ? isOpen : undefined)}
          {isBeingRenamed ? (
            <Input
              type="text"
              value={editText}
              onChange={(e) => setEditTextLocal(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              autoFocus
              className="h-6 text-sm p-1 bg-card border-accent focus:ring-accent w-full"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()} 
            />
          ) : (
            <span className="truncate ml-0.5" title={item.name} onDoubleClick={() => onStartRename(item)}>{item.name}</span>
          )}
        </div>
        {!isBeingRenamed && (
          <div className="flex items-center shrink-0 ml-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 focus-within:!opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0.5 rounded-sm"
              onClick={(e) => { e.stopPropagation(); onStartRename(item); }}
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
                  onClick={(e) => e.stopPropagation()}
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
        )}
      </div>
      {item.type === 'folder' && isOpen && item.children && !isBeingRenamed && (
        <div>
          {item.children.map((child) => (
            <FileExplorerItemComponent
              key={child.id} item={{...child, parentId: item.id} as FileItem & {parentId?: string}} // Pass parentId
              allItems={allItems}
              onFileSelect={onFileSelect} selectedFileId={selectedFileId} level={level + 1}
              renamingItemId={renamingItemId} editText={editText} onStartRename={onStartRename}
              onConfirmRename={onConfirmRename} onCancelRename={onCancelRename} setEditTextLocal={setEditTextLocal}
              onDeleteItem={onDeleteItem} onMoveItem={onMoveItem}
              draggedItemIdState={draggedItemIdState} setDraggedItemIdState={setDraggedItemIdState}
              dragOverFolderIdState={dragOverFolderIdState} setDragOverFolderIdState={setDragOverFolderIdState}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, onFileSelect, selectedFileId, onRenameItem, onDeleteItem, onAddItem, onMoveItem }: FileExplorerProps) {
  const [newItemName, setNewItemName] = useState('');
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  const [draggedItemIdState, setDraggedItemIdState] = useState<string | null>(null);
  const [dragOverFolderIdState, setDragOverFolderIdState] = useState<string | null>(null);
  const [isDraggingOverRoot, setIsDraggingOverRoot] = useState(false);

  const findItemById = useCallback((items: FileItem[], id: string): FileItem | null => {
    for (const file of items) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findItemById(file.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const findParentIdOfItem = useCallback((items: FileItem[], id: string, parentId: string | null = null): string | null => {
    for (const item of items) {
        if (item.id === id) return parentId;
        if (item.children) {
            const foundParentId = findParentIdOfItem(item.children, id, item.id);
            if (foundParentId !== null) return foundParentId;
        }
    }
    return null;
  }, []);

  const handleStartRename = useCallback((item: FileItem) => {
    setRenamingItemId(item.id);
    setEditText(item.name);
  }, []);

  const handleConfirmRename = useCallback((itemId: string) => {
    if (renamingItemId === itemId) { 
      const originalItem = findItemById(files, itemId);
      if (editText.trim() && originalItem && editText.trim() !== originalItem.name) {
        onRenameItem(itemId, editText.trim());
      }
    }
    setRenamingItemId(null);
    setEditText('');
  }, [renamingItemId, editText, files, onRenameItem, findItemById]);

  const handleCancelRename = useCallback(() => {
    setRenamingItemId(null);
    setEditText('');
  }, []);

  const getParentIdForNewItem = (): string | null => {
    if (!selectedFileId || renamingItemId) return null;
    
    const selectedItem = findItemById(files, selectedFileId);
    if (!selectedItem) return null;

    if (selectedItem.type === 'folder') {
        return selectedItem.id;
    }
    
    return findParentIdOfItem(files, selectedFileId);
  };

  const handleAddNewItem = (type: 'file' | 'folder') => {
    if (newItemName.trim()) {
      const parentId = getParentIdForNewItem();
      onAddItem(newItemName.trim(), type, parentId);
      setNewItemName('');
    }
  };
  
  const handleDragOverRoot = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if(draggedItemIdState && dragOverFolderIdState === null) {
      setIsDraggingOverRoot(true);
    }
  };

  const handleDragLeaveRoot = (e: React.DragEvent<HTMLDivElement>) => {
      setIsDraggingOverRoot(false);
  };
  
  const handleDropOnRoot = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverRoot(false);
    if(dragOverFolderIdState) { // If dropping on a folder, let that handler take it
      return;
    }
    const droppedItemId = e.dataTransfer.getData('text/plain');
    const parentId = findParentIdOfItem(files, droppedItemId);

    if (droppedItemId && parentId !== null) { // only move if it's not already at root
        onMoveItem(droppedItemId, null);
    }
    setDraggedItemIdState(null);
  };

  useEffect(() => {
    if (renamingItemId && selectedFileId !== renamingItemId) {
       // Renaming is cancelled if selection changes
       handleCancelRename();
    }
  }, [selectedFileId, renamingItemId, handleCancelRename]);


  return (
    <div 
      className={cn("h-full overflow-y-auto p-1", isDraggingOverRoot && "bg-accent/10")}
      onDragOver={handleDragOverRoot}
      onDragLeave={handleDragLeaveRoot}
      onDrop={handleDropOnRoot}
    >
      <div className="p-2 text-xs font-semibold text-foreground/60 uppercase tracking-wider flex justify-between items-center">
        <span>Explorer</span>
        <div className="flex space-x-1">
          <Dialog onOpenChange={(isOpen) => { if (!isOpen) setNewItemName(''); }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5" title="New File" disabled={!!renamingItemId}>
                <FilePlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Create New File</DialogTitle><DialogDescription>Enter the name for the new file. It will be created in the currently selected folder or at the root.</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-file-name" className="text-right">Name</Label>
                  <Input id="new-file-name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="col-span-3" placeholder="e.g., component.tsx"/>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild><Button type="submit" onClick={() => handleAddNewItem('file')}>Create File</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog onOpenChange={(isOpen) => { if (!isOpen) setNewItemName(''); }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5" title="New Folder" disabled={!!renamingItemId}>
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Create New Folder</DialogTitle><DialogDescription>Enter the name for the new folder. It will be created in the currently selected folder or at the root.</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-folder-name" className="text-right">Name</Label>
                  <Input id="new-folder-name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="col-span-3" placeholder="e.g., utils"/>
                </div>
              </div>
              <DialogFooter>
                 <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild><Button type="submit" onClick={() => handleAddNewItem('folder')}>Create Folder</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {files.map((item) => (
        <FileExplorerItemComponent
          key={item.id}
          item={item}
          allItems={files}
          onFileSelect={onFileSelect}
          selectedFileId={selectedFileId}
          level={0}
          renamingItemId={renamingItemId}
          editText={editText}
          onStartRename={handleStartRename}
          onConfirmRename={handleConfirmRename}
  onCancelRename={handleCancelRename}
          setEditTextLocal={setEditText}
          onDeleteItem={onDeleteItem}
          onMoveItem={onMoveItem}
          draggedItemIdState={draggedItemIdState}
          setDraggedItemIdState={setDraggedItemIdState}
          dragOverFolderIdState={dragOverFolderIdState}
          setDragOverFolderIdState={setDragOverFolderIdState}
        />
      ))}
    </div>
  );
}
