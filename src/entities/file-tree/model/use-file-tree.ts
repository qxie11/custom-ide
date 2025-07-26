'use client';

import {useState, useCallback} from 'react';
import type {FileItem} from './types';
import {mockFiles as initialMockFiles} from './mock-files';
import {useToast} from '@/shared/ui/use-toast';
import {findItemByIdRecursive, generateId, deepCloneFiles} from '../lib/utils';

export function useFileTree() {
  const [files, setFiles] = useState<FileItem[]>(initialMockFiles);
  const {toast} = useToast();

  const handleRenameItem = useCallback(
    (itemId: string, newName: string) => {
      if (!newName.trim() || newName.includes('/') || newName.includes('\\')) {
        toast({title: 'Invalid Name', description: 'File/folder name cannot be empty or contain slashes.', variant: 'destructive'});
        return;
      }

      let originalName = '';
      const findAndRename = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === itemId) {
            originalName = item.name;
            return {...item, name: newName};
          }
          if (item.children) {
            return {...item, children: findAndRename(item.children)};
          }
          return item;
        });
      };

      const updatedFiles = findAndRename(deepCloneFiles(files));

      // Check for duplicates at the same level
      const parentId = findParentIdOfItem(updatedFiles, itemId);
      const parent = parentId ? findItemByIdRecursive(updatedFiles, parentId) : null;
      const siblings = parent ? parent.children : updatedFiles.filter(f => !findParentIdOfItem(updatedFiles, f.id));

      if (siblings?.some(item => item.id !== itemId && item.name === newName)) {
        const location = parent ? `in folder "${parent.name}"` : 'at the root';
        toast({title: 'Duplicate Name', description: `An item named "${newName}" already exists ${location}.`, variant: 'destructive'});
        return;
      }

      setFiles(updatedFiles);
      if (originalName && originalName !== newName) {
        toast({title: 'Renamed', description: `"${originalName}" renamed to "${newName}".`});
      }
    },
    [files, toast]
  );

  const findParentIdOfItem = (items: FileItem[], id: string, parentId: string | null = null): string | null => {
    for (const item of items) {
      if (item.id === id) return parentId;
      if (item.children) {
        const foundParentId = findParentIdOfItem(item.children, id, item.id);
        if (foundParentId !== null) return foundParentId;
      }
    }
    return null;
  };

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      const itemToDelete = findItemByIdRecursive(files, itemId);
      if (!itemToDelete) return;

      const deleteRecursively = (items: FileItem[], idToDelete: string): FileItem[] => {
        return items.filter(item => {
          if (item.id === idToDelete) {
            return false;
          }
          if (item.children) {
            item.children = deleteRecursively(item.children, idToDelete);
          }
          return true;
        });
      };

      setFiles(prevFiles => deleteRecursively([...prevFiles], itemId));
      toast({title: 'Deleted', description: `Item "${itemToDelete.name}" deleted.`});
    },
    [files, toast]
  );

  const handleAddItem = useCallback(
    (name: string, type: 'file' | 'folder', parentId: string | null) => {
      if (!name.trim() || name.includes('/') || name.includes('\\')) {
        toast({title: 'Invalid Name', description: 'Name cannot be empty or contain slashes.', variant: 'destructive'});
        return;
      }

      const newItem: FileItem = {
        id: generateId(),
        name,
        type,
        content: type === 'file' ? '' : undefined,
        language: type === 'file' ? ('plaintext' as any) : undefined,
        children: type === 'folder' ? [] : undefined,
      };

      if (type === 'file') {
        const ext = name.split('.').pop()?.toLowerCase();
        switch (ext) {
          case 'js':
            newItem.language = 'javascript';
            break;
          case 'ts':
          case 'tsx':
            newItem.language = 'typescript';
            break;
          case 'css':
            newItem.language = 'css';
            break;
          case 'json':
            newItem.language = 'json';
            break;
          case 'html':
            newItem.language = 'html';
            break;
          case 'md':
            newItem.language = 'markdown';
            break;
          default:
            newItem.language = 'plaintext';
        }
      }

      setFiles(prevFiles => {
        const newFiles = deepCloneFiles(prevFiles);
        if (parentId === null) {
          if (newFiles.some(item => item.name === name)) {
            toast({title: 'Duplicate Name', description: `An item named "${name}" already exists at the root.`, variant: 'destructive'});
            return prevFiles;
          }
          newFiles.push(newItem);
          newFiles.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          const parentFolder = findItemByIdRecursive(newFiles, parentId);
          if (parentFolder && parentFolder.type === 'folder') {
            if (parentFolder.children?.some(child => child.name === name)) {
              toast({title: 'Duplicate Name', description: `An item named "${name}" already exists in "${parentFolder.name}".`, variant: 'destructive'});
              return prevFiles;
            }
            parentFolder.children = [...(parentFolder.children || []), newItem];
            parentFolder.children.sort((a, b) => a.name.localeCompare(b.name));
          }
        }
        toast({title: 'Created', description: `${type === 'file' ? 'File' : 'Folder'} "${name}" created.`});
        return newFiles;
      });
    },
    [toast]
  );

  const handleMoveItem = useCallback(
    (itemId: string, targetFolderId: string | null) => {
      const clonedFiles = deepCloneFiles(files);
      let itemToMove: FileItem | null = null;
      let sourceFolder: FileItem[] | null = null;

      const removeItem = (items: FileItem[], id: string): FileItem[] => {
        const newItems = [];
        for (const item of items) {
          if (item.id === id) {
            itemToMove = item;
            sourceFolder = items;
          } else {
            if (item.children) {
              item.children = removeItem(item.children, id);
            }
            newItems.push(item);
          }
        }
        return newItems;
      };

      const filesAfterRemoval = removeItem(clonedFiles, itemId);

      if (!itemToMove) return;

      if (itemId === targetFolderId) return; // Can't move into itself

      const isMovingIntoDescendant = (movingItemId: string, currentTargetId: string | null): boolean => {
        if (!currentTargetId) return false;
        let parent = findParentIdOfItem(files, currentTargetId);
        while (parent) {
          if (parent === movingItemId) return true;
          parent = findParentIdOfItem(files, parent);
        }
        return false;
      };
      
      if (isMovingIntoDescendant(itemId, targetFolderId)){
        toast({title: 'Invalid Move', description: 'Cannot move a folder into one of its subfolders.', variant: 'destructive'});
        return
      }

      if (targetFolderId === null) {
        if (filesAfterRemoval.some(item => item.name === itemToMove!.name)) {
          toast({title: 'Duplicate Name', description: `An item named "${itemToMove!.name}" already exists at the root.`, variant: 'destructive'});
          return;
        }
        filesAfterRemoval.push(itemToMove);
        filesAfterRemoval.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        const targetFolder = findItemByIdRecursive(filesAfterRemoval, targetFolderId);
        if (targetFolder && targetFolder.type === 'folder') {
          if (targetFolder.children?.some(child => child.name === itemToMove!.name)) {
            toast({
              title: 'Duplicate Name',
              description: `An item named "${itemToMove!.name}" already exists in "${targetFolder.name}".`,
              variant: 'destructive',
            });
            return;
          }
          targetFolder.children = [...(targetFolder.children || []), itemToMove];
          targetFolder.children.sort((a, b) => a.name.localeCompare(b.name));
        } else {
          return; // Invalid target
        }
      }

      setFiles(filesAfterRemoval);
      toast({title: 'Moved', description: `Item "${itemToMove.name}" moved successfully.`});
    },
    [files, toast]
  );

  const updateFileContent = useCallback((fileId: string, newContent: string) => {
    const updateRecursively = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === fileId) {
          if (item.type === 'file') {
            return {...item, content: newContent};
          }
        }
        if (item.children) {
          return {...item, children: updateRecursively(item.children)};
        }
        return item;
      });
    };
    setFiles(prev => updateRecursively(prev));
  }, []);

  return {
    files,
    handleRenameItem,
    handleDeleteItem,
    handleAddItem,
    handleMoveItem,
    updateFileContent,
  };
}
