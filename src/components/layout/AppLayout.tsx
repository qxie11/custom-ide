
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FileItem } from '@/lib/mock-data';
import { mockFiles as initialMockFiles } from '@/lib/mock-data';
import { ActivityBar } from '@/components/activity-bar/ActivityBar';
import { FileExplorer } from '@/components/file-explorer/FileExplorer';
import { SearchPanel } from '@/components/search-panel/SearchPanel';
import { SettingsPanel } from '@/components/settings-panel/SettingsPanel';
import { EditorTabs } from '@/components/code-editor/EditorTabs';
import { CodeEditor } from '@/components/code-editor/CodeEditor';
import { StatusBar } from '@/components/status-bar/StatusBar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from '@/hooks/use-toast';
import type { EditorSettings, ThemeType } from '@/components/settings-panel/SettingsPanel';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// Helper to deep clone file structure
const deepCloneFiles = (files: FileItem[]): FileItem[] => JSON.parse(JSON.stringify(files));

export default function AppLayout() {
  const [activePanel, setActivePanel] = useState('explorer'); 
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<FileItem['language']>('javascript');
  const [mockFiles, setMockFiles] = useState<FileItem[]>(initialMockFiles); 
  const { toast } = useToast();

  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    fontSize: 14,
    autoSave: true,
    wordWrap: 'off',
    formatOnSave: true,
    theme: 'dark-plus',
  });

  const findFileByIdRecursive = useCallback((filesToSearch: FileItem[], id: string): FileItem | null => {
    for (const file of filesToSearch) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFileByIdRecursive(file.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);
  
  const updateFileContentInMock = (files: FileItem[], id: string, newContent: string): FileItem[] => {
    return files.map(file => {
      if (file.id === id) {
        return { ...file, content: newContent };
      }
      if (file.children) {
        return { ...file, children: updateFileContentInMock(file.children, id, newContent) };
      }
      return file;
    });
  };

  const handleRenameItem = useCallback((itemId: string, newName: string) => {
    if (!newName.trim() || newName.includes('/') || newName.includes('\\')) {
      toast({ title: "Invalid Name", description: "File/folder name cannot be empty or contain slashes.", variant: "destructive" });
      return;
    }

    const renameRecursively = (items: FileItem[], currentPathParentId: string | null = null): FileItem[] => {
      // Check for duplicate names within the same directory
      const parentItems = currentPathParentId === null 
        ? items 
        : findFileByIdRecursive(mockFiles, currentPathParentId)?.children;

      if (parentItems?.some(item => item.id !== itemId && item.name === newName)) {
          const parentFolder = currentPathParentId ? findFileByIdRecursive(mockFiles, currentPathParentId) : null;
          const location = parentFolder ? `in folder "${parentFolder.name}"` : "at the root";
          toast({ title: "Duplicate Name", description: `An item named "${newName}" already exists ${location}.`, variant: "destructive" });
          return items; // Return original items to prevent rename
      }
      
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, name: newName };
        }
        if (item.children) {
          return { ...item, children: renameRecursively(item.children, item.id) };
        }
        return item;
      });
    };
    
    let originalName = "";
    const findOriginalName = (items: FileItem[]): string | undefined => {
        for (const item of items) {
            if (item.id === itemId) return item.name;
            if (item.children) {
                const name = findOriginalName(item.children);
                if (name) return name;
            }
        }
        return undefined;
    }
    originalName = findOriginalName(mockFiles) || "";


    setMockFiles(prevMockFiles => {
        const updatedFiles = renameRecursively(prevMockFiles);
        if (JSON.stringify(updatedFiles) !== JSON.stringify(prevMockFiles)) { // Check if actual change occurred
             setOpenFiles(prevOpenFiles =>
                prevOpenFiles.map(file =>
                    file.id === itemId ? { ...file, name: newName } : file
                )
            );
            if (originalName !== newName) { // Only toast if name actually changed
              toast({ title: "Renamed", description: `"${originalName}" renamed to "${newName}".` });
            }
        }
        return updatedFiles;
    });
  }, [toast, mockFiles, findFileByIdRecursive]);

  const handleDeleteItem = useCallback((itemId: string) => {
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

    const itemToDelete = findFileByIdRecursive(mockFiles, itemId);
    setMockFiles(prevMockFiles => deleteRecursively(prevMockFiles, itemId));

    if (itemToDelete) {
      if (itemToDelete.type === 'file') {
        setOpenFiles(prevOpenFiles => {
          const newOpenFiles = prevOpenFiles.filter(f => f.id !== itemId);
          if (activeFileId === itemId) {
            if (newOpenFiles.length > 0) {
              const newActiveFile = newOpenFiles[newOpenFiles.length - 1];
              setActiveFileId(newActiveFile.id);
              setEditorContent(newActiveFile.content || '');
              setCurrentLanguage(newActiveFile.language || 'javascript');
            } else {
              setActiveFileId(null);
              setEditorContent('');
              setCurrentLanguage('javascript');
            }
          }
          return newOpenFiles;
        });
      }
      toast({ title: "Deleted", description: `Item "${itemToDelete.name}" deleted.` });
    }
  }, [activeFileId, mockFiles, findFileByIdRecursive, toast]);

  const handleAddItem = useCallback((name: string, type: 'file' | 'folder', parentId: string | null) => {
    if (!name.trim() || name.includes('/') || name.includes('\\')) {
      toast({ title: "Invalid Name", description: "Name cannot be empty or contain slashes.", variant: "destructive" });
      return;
    }

    const newItem: FileItem = {
      id: generateId(), name, type,
      content: type === 'file' ? '' : undefined,
      language: type === 'file' ? 'plaintext' as any : undefined,
      children: type === 'folder' ? [] : undefined,
    };

    if (type === 'file') {
        const ext = name.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js': newItem.language = 'javascript'; break;
            case 'ts': case 'tsx': newItem.language = 'typescript'; break;
            case 'css': newItem.language = 'css'; break;
            case 'json': newItem.language = 'json'; break;
            case 'html': newItem.language = 'html'; break;
            case 'md': newItem.language = 'markdown'; break;
            default: newItem.language = 'plaintext';
        }
    }

    const addRecursively = (items: FileItem[], currentFilesRef: FileItem[]): FileItem[] => {
      if (parentId === null) {
        if (items.some(item => item.name === name)) {
            toast({ title: "Duplicate Name", description: `An item named "${name}" already exists at the root.`, variant: "destructive" });
            return currentFilesRef; 
        }
        return [...items, newItem].sort((a,b) => a.name.localeCompare(b.name));
      }
      return items.map(item => {
        if (item.id === parentId && item.type === 'folder') {
          if (item.children?.some(child => child.name === name)) {
            toast({ title: "Duplicate Name", description: `An item named "${name}" already exists in "${item.name}".`, variant: "destructive" });
            return item;
          }
          return { ...item, children: [...(item.children || []), newItem].sort((a,b) => a.name.localeCompare(b.name)) };
        }
        if (item.children) {
          return { ...item, children: addRecursively(item.children, currentFilesRef) };
        }
        return item;
      });
    };

    setMockFiles(prevMockFiles => {
        const updatedFiles = addRecursively(prevMockFiles, prevMockFiles);
        if (JSON.stringify(updatedFiles) !== JSON.stringify(prevMockFiles)) {
             toast({ title: "Created", description: `${type === 'file' ? 'File' : 'Folder'} "${name}" created.` });
        }
        return updatedFiles;
    });
  }, [toast]);

  const handleMoveItem = useCallback((itemId: string, targetFolderId: string | null) => {
    const clonedFiles = deepCloneFiles(mockFiles);
    let itemToMove: FileItem | null = null;

    const removeItem = (items: FileItem[], id: string): { removed: FileItem | null, newItems: FileItem[] } => { 
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
      return { removed: found, newItems: filteredItems };
    };

    const isMovingIntoSelfOrDescendant = ( movingItemId: string, currentTargetFolderId: string | null): boolean => {
      if (currentTargetFolderId === null) return false;
      if (movingItemId === currentTargetFolderId) return true;

      const movingItem = findFileByIdRecursive(clonedFiles, movingItemId);
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
      toast({ title: "Invalid Move", description: "Cannot move a folder into itself or one of its subfolders.", variant: "destructive" });
      return;
    }
    
    const { removed, newItems: filesAfterRemoval } = removeItem(clonedFiles, itemId);
    itemToMove = removed;

    if (!itemToMove) {
      toast({ title: "Error", description: "Item to move not found.", variant: "destructive" });
      return; // Item not found
    }

    const addItem = (items: FileItem[], parentId: string | null, itemToAdd: FileItem): { updatedItems: FileItem[], success: boolean } => {
      if (parentId === null) { // Add to root
        if (items.some(item => item.name === itemToAdd.name && item.id !== itemToAdd.id)) {
           toast({ title: "Duplicate Name", description: `An item named "${itemToAdd.name}" already exists at the root. Move cancelled.`, variant: "destructive" });
           return { updatedItems: mockFiles, success: false }; 
        }
        return { updatedItems: [...items, itemToAdd].sort((a,b) => a.name.localeCompare(b.name)), success: true };
      }
      let success = true;
      const mappedItems = items.map(item => {
        if (item.id === parentId && item.type === 'folder') {
          if (item.children?.some(child => child.name === itemToAdd.name && child.id !== itemToAdd.id)) {
            toast({ title: "Duplicate Name", description: `An item named "${itemToAdd.name}" already exists in "${item.name}". Move cancelled.`, variant: "destructive" });
            success = false;
            return item; 
          }
          return { ...item, children: [...(item.children || []), itemToAdd].sort((a,b) => a.name.localeCompare(b.name)) };
        }
        if (item.children) {
          const childResult = addItem(item.children, parentId, itemToAdd);
           if (!childResult.success) success = false;
          return { ...item, children: childResult.updatedItems };
        }
        return item;
      });
      return { updatedItems: mappedItems, success };
    };

    const { updatedItems: finalFiles, success: moveSuccess } = addItem(filesAfterRemoval, targetFolderId, itemToMove);

    if (moveSuccess) {
      setMockFiles(finalFiles);
      toast({ title: "Moved", description: `Item "${itemToMove.name}" moved successfully.` });
    } else {
      // If move failed due to duplicate name, mockFiles wasn't set with finalFiles
      // but itemToMove was already 'removed' from the clone.
      // The original mockFiles is still intact due to cloning.
      // No need to revert setMockFiles as it wasn't called with bad data.
    }

  }, [mockFiles, toast, findFileByIdRecursive]);


  const handleFileSelect = useCallback((fileToOpen: FileItem) => {
    if (fileToOpen.type !== 'file') return;
    const freshFileToOpen = findFileByIdRecursive(mockFiles, fileToOpen.id) || fileToOpen;
    const existingFile = openFiles.find(f => f.id === freshFileToOpen.id);
    if (!existingFile) {
      setOpenFiles(prev => [...prev, freshFileToOpen]);
    }
    setActiveFileId(freshFileToOpen.id);
    setEditorContent(freshFileToOpen.content || '');
    setCurrentLanguage(freshFileToOpen.language || 'javascript');
  }, [openFiles, mockFiles, findFileByIdRecursive]);

  const handleTabClick = useCallback((fileId: string) => {
    const fileToActivate = openFiles.find(f => f.id === fileId) || findFileByIdRecursive(mockFiles, fileId);
    if (fileToActivate && fileToActivate.type === 'file') {
      setActiveFileId(fileId);
      setEditorContent(fileToActivate.content || '');
      setCurrentLanguage(fileToActivate.language || 'javascript');
    }
  }, [openFiles, mockFiles, findFileByIdRecursive]);

  const handleCloseTab = useCallback((fileIdToClose: string) => {
    setOpenFiles(prevOpenFiles => {
      const updatedOpenFiles = prevOpenFiles.filter(f => f.id !== fileIdToClose);
      if (activeFileId === fileIdToClose) {
        if (updatedOpenFiles.length > 0) {
          const newActiveFile = updatedOpenFiles[updatedOpenFiles.length - 1]; 
          const freshNewActiveFile = findFileByIdRecursive(mockFiles, newActiveFile.id) || newActiveFile;
          setActiveFileId(freshNewActiveFile.id);
          setEditorContent(freshNewActiveFile.content || '');
          setCurrentLanguage(freshNewActiveFile.language || 'javascript');
        } else {
          setActiveFileId(null);
          setEditorContent('');
          setCurrentLanguage('javascript');
        }
      }
      return updatedOpenFiles;
    });
  }, [activeFileId, mockFiles, findFileByIdRecursive]); 
  
  const handleEditorContentChange = useCallback((newContent: string) => {
    setEditorContent(newContent);
    if(activeFileId) {
      setOpenFiles(prevOpenFiles => 
        prevOpenFiles.map(file => 
          file.id === activeFileId ? { ...file, content: newContent } : file
        )
      );
      setMockFiles(prevMockFiles => updateFileContentInMock(prevMockFiles, activeFileId, newContent));
    }
  }, [activeFileId]);

  const handleApplySettings = useCallback((newSettings: EditorSettings) => {
    setEditorSettings(newSettings);
    toast({ title: "Settings Applied", description: "Your editor settings have been updated." });
  }, [toast]);
  
  useEffect(() => {
    document.documentElement.classList.remove('theme-dark-plus', 'theme-light-plus', 'theme-monokai', 'dark', 'light');
    document.documentElement.classList.add(`theme-${editorSettings.theme}`);
    if (editorSettings.theme.includes('dark') || editorSettings.theme.includes('monokai')) {
      document.documentElement.classList.add('dark');
    } else {
       document.documentElement.classList.add('light');
    }
  }, [editorSettings.theme]);

  useEffect(() => {
     const findFirstFile = (items: FileItem[]): FileItem | null => {
      for (const item of items) {
        if (item.type === 'file') return item;
        if (item.children) {
          const found = findFirstFile(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    if (mockFiles.length > 0 && openFiles.length === 0 && !activeFileId) {
        const firstFile = findFirstFile(mockFiles);
        if (firstFile) {
            handleFileSelect(firstFile);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const currentActiveFile = openFiles.find(f => f.id === activeFileId) || (activeFileId ? findFileByIdRecursive(mockFiles, activeFileId) : null) ;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <ActivityBar activePanel={activePanel} setActivePanel={setActivePanel} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={18} minSize={10} maxSize={30} className="bg-sidebar-background border-r border-border min-w-[200px]">
            {activePanel === 'explorer' && 
              <FileExplorer 
                files={mockFiles} 
                onFileSelect={handleFileSelect} 
                selectedFileId={activeFileId} 
                onRenameItem={handleRenameItem}
                onDeleteItem={handleDeleteItem}
                onAddItem={handleAddItem}
                onMoveItem={handleMoveItem}
              />}
            {activePanel === 'search' && 
              <SearchPanel 
                allFiles={mockFiles}
                onFileSelect={handleFileSelect}
              />}
            {activePanel === 'settings' && 
              <SettingsPanel 
                settings={editorSettings} 
                onApply={handleApplySettings} 
              />}
            {activePanel !== 'explorer' && activePanel !== 'settings' && activePanel !== 'search' && (
              <div className="p-4 text-muted-foreground text-sm">Panel: {activePanel}</div>
            )}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={82} className="flex flex-col">
          <EditorTabs
            openFiles={openFiles}
            activeFileId={activeFileId}
            onTabClick={handleTabClick}
            onCloseTab={handleCloseTab}
          />
          <CodeEditor
            key={activeFileId || 'empty-editor'}
            fileName={currentActiveFile?.name || (openFiles.length > 0 ? 'Select a file' : 'No file open')}
            content={editorContent}
            language={currentLanguage}
            onContentChange={handleEditorContentChange}
            options={{
              fontSize: editorSettings.fontSize,
              wordWrap: editorSettings.wordWrap,
            }}
          />
          <StatusBar />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
