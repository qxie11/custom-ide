'use client';

import type {FileItem} from '@/entities/file-tree';
import React, {useState, useCallback, useEffect} from 'react';
import {FolderPlus, FilePlus} from 'lucide-react';
import {Button} from '@/shared/ui/button';
import {Input} from '@/shared/ui/input';
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose} from '@/shared/ui/dialog';
import {Label} from '@/shared/ui/label';
import {cn} from '@/shared/lib/utils';
import {FileExplorerItemComponent} from './FileExplorerItem';
import {findItemByIdRecursive, findParentIdOfItem} from '@/entities/file-tree/lib/utils';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  selectedFileId: string | null;
  onRenameItem: (itemId: string, newName: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
  onMoveItem: (itemId: string, targetFolderId: string | null) => void;
}

export function FileExplorer({files, onFileSelect, selectedFileId, onRenameItem, onDeleteItem, onAddItem, onMoveItem}: FileExplorerProps) {
  const [newItemName, setNewItemName] = useState('');
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const [draggedItemIdState, setDraggedItemIdState] = useState<string | null>(null);
  const [dragOverFolderIdState, setDragOverFolderIdState] = useState<string | null>(null);
  const [isDraggingOverRoot, setIsDraggingOverRoot] = useState(false);

  const handleStartRename = useCallback((item: FileItem) => {
    setRenamingItemId(item.id);
    setEditText(item.name);
  }, []);

  const handleConfirmRename = useCallback(
    (itemId: string) => {
      if (renamingItemId === itemId) {
        const originalItem = findItemByIdRecursive(files, itemId);
        if (editText.trim() && originalItem && editText.trim() !== originalItem.name) {
          onRenameItem(itemId, editText.trim());
        }
      }
      setRenamingItemId(null);
      setEditText('');
    },
    [renamingItemId, editText, files, onRenameItem]
  );

  const handleCancelRename = useCallback(() => {
    setRenamingItemId(null);
    setEditText('');
  }, []);

  const getParentIdForNewItem = (): string | null => {
    if (!selectedFileId || renamingItemId) return null;

    const selectedItem = findItemByIdRecursive(files, selectedFileId);
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
    if (draggedItemIdState && dragOverFolderIdState === null) {
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
    if (dragOverFolderIdState) {
      return;
    }
    const droppedItemId = e.dataTransfer.getData('text/plain');
    const parentId = findParentIdOfItem(files, droppedItemId);

    if (droppedItemId && parentId !== null) {
      onMoveItem(droppedItemId, null);
    }
    setDraggedItemIdState(null);
  };

  useEffect(() => {
    if (renamingItemId && selectedFileId !== renamingItemId) {
      handleCancelRename();
    }
  }, [selectedFileId, renamingItemId, handleCancelRename]);

  return (
    <div className={cn('h-full overflow-y-auto p-1', isDraggingOverRoot && 'bg-accent/10')} onDragOver={handleDragOverRoot} onDragLeave={handleDragLeaveRoot} onDrop={handleDropOnRoot}>
      <div className="p-2 text-xs font-semibold text-foreground/60 uppercase tracking-wider flex justify-between items-center">
        <span>Explorer</span>
        <div className="flex space-x-1">
          <Dialog
            onOpenChange={isOpen => {
              if (!isOpen) setNewItemName('');
            }}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5" title="New File" disabled={!!renamingItemId}>
                <FilePlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
                <DialogDescription>Enter the name for the new file. It will be created in the currently selected folder or at the root.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-file-name" className="text-right">
                    Name
                  </Label>
                  <Input id="new-file-name" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="col-span-3" placeholder="e.g., component.tsx" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit" onClick={() => handleAddNewItem('file')}>
                    Create File
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            onOpenChange={isOpen => {
              if (!isOpen) setNewItemName('');
            }}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5" title="New Folder" disabled={!!renamingItemId}>
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>Enter the name for the new folder. It will be created in the currently selected folder or at the root.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-folder-name" className="text-right">
                    Name
                  </Label>
                  <Input id="new-folder-name" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="col-span-3" placeholder="e.g., utils" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="submit" onClick={() => handleAddNewItem('folder')}>
                    Create Folder
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {files.map(item => (
        <FileExplorerItemComponent
          key={item.id}
          item={item}
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
