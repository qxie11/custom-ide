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

      const renameRecursively = (items: FileItem[], currentPathParentId: string | null = null): FileItem[] => {
        const parentItems = currentPathParentId === null ? items : findItemByIdRecursive(files, currentPathParentId)?.children;

        if (parentItems?.some(item => item.id !== itemId && item.name === newName)) {
          const parentFolder = currentPathParentId ? findItemByIdRecursive(files, currentPathParentId) : null;
          const location = parentFolder ? `in folder "${parentFolder.name}"` : 'at the root';
          toast({title: 'Duplicate Name', description: `An item named "${newName}" already exists ${location}.`, variant: 'destructive'});
          return items;
        }

        return items.map(item => {
          if (item.id === itemId) {
            return {...item, name: newName};
          }
          if (item.children) {
            return {...item, children: renameRecursively(item.children, item.id)};
          }
          return item;
        });
      };

      let originalName = '';
      const findOriginalName = (items: FileItem[]): string | undefined => {
        for (const item of items) {
          if (item.id === itemId) return item.name;
          if (item.children) {
            const name = findOriginalName(item.children);
            if (name) return name;
          }
        }
        return undefined;
      };
      originalName = findOriginalName(files) || '';

      setFiles(prevFiles => {
        const updatedFiles = renameRecursively(prevFiles);
        if (JSON.stringify(updatedFiles) !== JSON.stringify(prevFiles)) {
          if (originalName !== newName) {
            toast({title: 'Renamed', description: `"${originalName}" renamed to "${newName}".`});
          }
        }
        return updatedFiles;
      });
    },
    [toast, files]
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
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

      const itemToDelete = findItemByIdRecursive(files, itemId);
      setFiles(prevFiles => deleteRecursively([...prevFiles], itemId));

      if (itemToDelete) {
        toast({title: 'Deleted', description: `Item "${itemToDelete.name}" deleted.`});
      }
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

      const addRecursively = (items: FileItem[], currentFilesRef: FileItem[]): FileItem[] => {
        if (parentId === null) {
          if (items.some(item => item.name === name)) {
            toast({title: 'Duplicate Name', description: `An item named "${name}" already exists at the root.`, variant: 'destructive'});
            return currentFilesRef;
          }
          return [...items, newItem].sort((a, b) => a.name.localeCompare(b.name));
        }
        return items.map(item => {
          if (item.id === parentId && item.type === 'folder') {
            if (item.children?.some(child => child.name === name)) {
              toast({title: 'Duplicate Name', description: `An item named "${name}" already exists in "${item.name}".`, variant: 'destructive'});
              return item;
            }
            return {...item, children: [...(item.children || []), newItem].sort((a, b) => a.name.localeCompare(b.name))};
          }
          if (item.children) {
            return {...item, children: addRecursively(item.children, currentFilesRef)};
          }
          return item;
        });
      };

      setFiles(prevFiles => {
        const updatedFiles = addRecursively(prevFiles, prevFiles);
        if (JSON.stringify(updatedFiles) !== JSON.stringify(prevFiles)) {
          toast({title: 'Created', description: `${type === 'file' ? 'File' : 'Folder'} "${name}" created.`});
        }
        return updatedFiles;
      });
    },
    [toast]
  );

  const handleMoveItem = useCallback(
    (itemId: string, targetFolderId: string | null) => {
      const clonedFiles = deepCloneFiles(files);
      let itemToMove: FileItem | null = null;

      const removeItem = (items: FileItem[], id: string): {removed: FileItem | null; newItems: FileItem[]} => {
        let found: FileItem | null = null;
        const filteredItems = items.filter(item => {
          if (item.id === id) {
            found = item;
            return false;
          }
          if (item.children) {
            const childResult = removeItem(item.children, id);
            if (childResult.removed) {
              found = childResult.removed;
              item.children = childResult.newItems;
            }
          }
          return true;
        });
        return {removed: found, newItems: filteredItems};
      };

      const isMovingIntoSelfOrDescendant = (movingItemId: string, currentTargetFolderId: string | null): boolean => {
        if (currentTargetFolderId === null) return false;
        if (movingItemId === currentTargetFolderId) return true;

        const movingItem = findItemByIdRecursive(clonedFiles, movingItemId);
        if (!movingItem || movingItem.type !== 'folder') return false;

        const checkDescendants = (folder: FileItem): boolean => {
          if (!folder.children) return false;
          for (const child of folder.children) {
            if (child.id === currentTargetFolderId) return true;
            if (child.type === 'folder' && checkDescendants(child)) return true;
          }
          return false;
        };
        return checkDescendants(movingItem);
      };

      if (isMovingIntoSelfOrDescendant(itemId, targetFolderId)) {
        toast({title: 'Invalid Move', description: 'Cannot move a folder into itself or one of its subfolders.', variant: 'destructive'});
        return;
      }

      const {removed, newItems: filesAfterRemoval} = removeItem(clonedFiles, itemId);
      itemToMove = removed;

      if (!itemToMove) {
        toast({title: 'Error', description: 'Item to move not found.', variant: 'destructive'});
        return;
      }

      const addItem = (items: FileItem[], parentId: string | null, itemToAdd: FileItem): {updatedItems: FileItem[]; success: boolean} => {
        if (parentId === null) {
          if (items.some(item => item.name === itemToAdd.name && item.id !== itemToAdd.id)) {
            toast({
              title: 'Duplicate Name',
              description: `An item named "${itemToAdd.name}" already exists at the root. Move cancelled.`,
              variant: 'destructive',
            });
            return {updatedItems: files, success: false};
          }
          return {updatedItems: [...items, itemToAdd].sort((a, b) => a.name.localeCompare(b.name)), success: true};
        }
        let success = true;
        const mappedItems = items.map(item => {
          if (item.id === parentId && item.type === 'folder') {
            if (item.children?.some(child => child.name === itemToAdd.name && child.id !== itemToAdd.id)) {
              toast({
                title: 'Duplicate Name',
                description: `An item named "${itemToAdd.name}" already exists in "${item.name}". Move cancelled.`,
                variant: 'destructive',
              });
              success = false;
              return item;
            }
            return {...item, children: [...(item.children || []), itemToAdd].sort((a, b) => a.name.localeCompare(b.name))};
          }
          if (item.children) {
            const childResult = addItem(item.children, parentId, itemToAdd);
            if (!childResult.success) success = false;
            return {...item, children: childResult.updatedItems};
          }
          return item;
        });
        return {updatedItems: mappedItems, success};
      };

      const {updatedItems: finalFiles, success: moveSuccess} = addItem(filesAfterRemoval, targetFolderId, itemToMove);

      if (moveSuccess) {
        setFiles(finalFiles);
        toast({title: 'Moved', description: `Item "${itemToMove.name}" moved successfully.`});
      }
    },
    [files, toast]
  );

  const updateFileContent = useCallback((fileId: string, newContent: string) => {
    const updateRecursively = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === fileId) {
          return {...item, content: newContent};
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
