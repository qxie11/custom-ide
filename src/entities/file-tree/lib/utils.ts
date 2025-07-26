import type {FileItem} from '../model/types';

export const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

export const deepCloneFiles = (files: FileItem[]): FileItem[] => JSON.parse(JSON.stringify(files));

export const findItemByIdRecursive = (filesToSearch: FileItem[], id: string): FileItem | null => {
  for (const file of filesToSearch) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findItemByIdRecursive(file.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const findParentIdOfItem = (items: FileItem[], id: string, parentId: string | null = null): string | null => {
  for (const item of items) {
    if (item.id === id) return parentId;
    if (item.children) {
      const foundParentId = findParentIdOfItem(item.children, id, item.id);
      if (foundParentId !== null) return foundParentId;
    }
  }
  return null;
};

export const findFirstFile = (items: FileItem[]): FileItem | null => {
  for (const item of items) {
    if (item.type === 'file') return item;
    if (item.children) {
      const found = findFirstFile(item.children);
      if (found) return found;
    }
  }
  return null;
};
