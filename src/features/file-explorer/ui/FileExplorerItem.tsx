'use client';

import type {FileItem} from '@/entities/file-tree';
import React, {useState} from 'react';
import {ChevronRight, ChevronDown, Pencil, Trash2} from 'lucide-react';
import {Button} from '@/shared/ui/button';
import {Input} from '@/shared/ui/input';
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '@/shared/ui/alert-dialog';
import {cn} from '@/shared/lib/utils';
import {FileIcon} from './FileIcon';

interface FileExplorerItemComponentProps {
  item: FileItem;
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

export function FileExplorerItemComponent({
  item,
  onFileSelect,
  selectedFileId,
  level,
  renamingItemId,
  editText,
  onStartRename,
  onConfirmRename,
  onCancelRename,
  setEditTextLocal,
  onDeleteItem,
  onMoveItem,
  draggedItemIdState,
  setDraggedItemIdState,
  dragOverFolderIdState,
  setDragOverFolderIdState,
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
      setDragOverFolderIdState(null);
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
    <div className="text-sm" draggable={!isBeingRenamed} onDragStart={isBeingRenamed ? undefined : handleDragStart}>
      <div
        className={cn(
          `flex items-center justify-between p-1.5 rounded-sm group`,
          isSelected ? 'bg-accent/20 text-accent font-medium' : 'text-foreground/80',
          isDragOver ? 'bg-accent/30 ring-1 ring-accent' : '',
          isBeingRenamed ? 'bg-input' : 'hover:bg-accent/10'
        )}
        style={{paddingLeft: `${level * 1 + 0.35}rem`}}
        onClick={isBeingRenamed ? e => e.stopPropagation() : handleSelect}
        onDragOver={isBeingRenamed ? undefined : handleDragOver}
        onDragLeave={isBeingRenamed ? undefined : handleDragLeave}
        onDrop={isBeingRenamed ? undefined : handleDrop}
      >
        <div className="flex items-center truncate flex-grow min-w-0">
          {item.type === 'folder' ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4 mr-1 shrink-0" onClick={(e)=>{e.stopPropagation(); handleToggle();}} />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1 shrink-0" onClick={(e)=>{e.stopPropagation(); handleToggle();}} />
            )
          ) : (
            <span className="w-4 mr-1 shrink-0"></span>
          )}
          <FileIcon item={item} isOpen={item.type === 'folder' ? isOpen : undefined} />
          {isBeingRenamed ? (
            <Input
              type="text"
              value={editText}
              onChange={e => setEditTextLocal(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              autoFocus
              className="h-6 text-sm p-1 bg-card border-accent focus:ring-accent w-full"
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
            />
          ) : (
            <span className="truncate ml-0.5" title={item.name} onDoubleClick={() => onStartRename(item)}>
              {item.name}
            </span>
          )}
        </div>
        {!isBeingRenamed && (
          <div className="flex items-center shrink-0 ml-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 focus-within:!opacity-100">
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5 rounded-sm" onClick={e => {e.stopPropagation();onStartRename(item);}} aria-label={`Rename ${item.name}`} title={`Rename ${item.name}`}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5 rounded-sm" onClick={e => e.stopPropagation()} aria-label={`Delete ${item.name}`} title={`Delete ${item.name}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete "{item.name}".</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={e => e.stopPropagation()}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      {item.type === 'folder' && isOpen && item.children && !isBeingRenamed && (
        <div>
          {item.children.map(child => (
            <FileExplorerItemComponent
              key={child.id}
              item={{...child, parentId: item.id} as FileItem & {parentId?: string}} // Pass parentId
              onFileSelect={onFileSelect}
              selectedFileId={selectedFileId}
              level={level + 1}
              renamingItemId={renamingItemId}
              editText={editText}
              onStartRename={onStartRename}
              onConfirmRename={onConfirmRename}
              onCancelRename={onCancelRename}
              setEditTextLocal={setEditTextLocal}
              onDeleteItem={onDeleteItem}
              onMoveItem={onMoveItem}
              draggedItemIdState={draggedItemIdState}
              setDraggedItemIdState={setDraggedItemIdState}
              dragOverFolderIdState={dragOverFolderIdState}
              setDragOverFolderIdState={setDragOverFolderIdState}
            />
          ))}
        </div>
      )}
    </div>
  );
}
