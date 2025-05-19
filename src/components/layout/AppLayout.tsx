
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FileItem } from '@/lib/mock-data';
import { mockFiles as initialMockFiles } from '@/lib/mock-data';
import { ActivityBar } from '@/components/activity-bar/ActivityBar';
import { FileExplorer } from '@/components/file-explorer/FileExplorer';
import { SettingsPanel } from '@/components/settings-panel/SettingsPanel';
import { EditorTabs } from '@/components/code-editor/EditorTabs';
import { CodeEditor } from '@/components/code-editor/CodeEditor';
import { StatusBar } from '@/components/status-bar/StatusBar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from '@/hooks/use-toast'; // For notifications

// Helper to generate unique IDs
const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

export default function AppLayout() {
  const [activePanel, setActivePanel] = useState('explorer'); 
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<FileItem['language']>('javascript');
  const [mockFiles, setMockFiles] = useState<FileItem[]>(initialMockFiles); 
  const { toast } = useToast();

  const findFileById = useCallback((files: FileItem[], id: string): FileItem | null => {
    for (const file of files) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFileById(file.children, id);
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
    const renameRecursively = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          // Basic validation: prevent empty names or names with slashes
          if (!newName.trim() || newName.includes('/') || newName.includes('\\')) {
            toast({ title: "Invalid Name", description: "File/folder name cannot be empty or contain slashes.", variant: "destructive" });
            return item; // Return original item if name is invalid
          }
          // Check for duplicate names within the same directory
          // This is a simplified check; a more robust one would traverse up to find siblings
          // For now, we assume names are unique globally for simplicity in this mock
          return { ...item, name: newName };
        }
        if (item.children) {
          return { ...item, children: renameRecursively(item.children) };
        }
        return item;
      });
    };

    setMockFiles(prevMockFiles => renameRecursively(prevMockFiles));
    setOpenFiles(prevOpenFiles =>
      prevOpenFiles.map(file =>
        file.id === itemId ? { ...file, name: newName } : file
      )
    );
    toast({ title: "Renamed", description: `Item renamed to "${newName}".` });
  }, [toast]);

  const handleDeleteItem = useCallback((itemId: string) => {
    const deleteRecursively = (items: FileItem[], idToDelete: string): FileItem[] => {
      return items.filter(item => {
        if (item.id === idToDelete) {
          return false; // Remove item
        }
        if (item.children) {
          item.children = deleteRecursively(item.children, idToDelete);
        }
        return true;
      });
    };

    const itemToDelete = findFileById(mockFiles, itemId);
    setMockFiles(prevMockFiles => deleteRecursively(prevMockFiles, itemId));

    // Close tab if deleted file was open
    if (itemToDelete && itemToDelete.type === 'file') {
      setOpenFiles(prevOpenFiles => prevOpenFiles.filter(f => f.id !== itemId));
      if (activeFileId === itemId) {
        const newOpenFiles = openFiles.filter(f => f.id !== itemId);
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
    }
    toast({ title: "Deleted", description: `Item "${itemToDelete?.name || 'Item'}" deleted.` });
  }, [activeFileId, openFiles, mockFiles, findFileById, toast]);

  const handleAddItem = useCallback((name: string, type: 'file' | 'folder', parentId: string | null) => {
    // Basic validation
    if (!name.trim() || name.includes('/') || name.includes('\\')) {
      toast({ title: "Invalid Name", description: "Name cannot be empty or contain slashes.", variant: "destructive" });
      return;
    }

    const newItem: FileItem = {
      id: generateId(),
      name,
      type,
      content: type === 'file' ? '' : undefined,
      language: type === 'file' ? 'plaintext' as any : undefined, // Default language, can be improved
      children: type === 'folder' ? [] : undefined,
    };

    // Determine language for file based on extension
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


    const addRecursively = (items: FileItem[]): FileItem[] => {
      if (parentId === null) { // Add to root
        // Check for duplicate name in root
        if (items.some(item => item.name === name && (parentId === null))) {
            toast({ title: "Duplicate Name", description: `An item named "${name}" already exists at the root.`, variant: "destructive" });
            return items; 
        }
        return [...items, newItem];
      }
      return items.map(item => {
        if (item.id === parentId && item.type === 'folder') {
          // Check for duplicate name in this folder
          if (item.children?.some(child => child.name === name)) {
            toast({ title: "Duplicate Name", description: `An item named "${name}" already exists in "${item.name}".`, variant: "destructive" });
            return item;
          }
          return { ...item, children: [...(item.children || []), newItem] };
        }
        if (item.children) {
          return { ...item, children: addRecursively(item.children) };
        }
        return item;
      });
    };

    setMockFiles(prevMockFiles => {
        const updatedFiles = addRecursively(prevMockFiles);
        // Check if the structure actually changed to prevent unnecessary toast for duplicates
        if (JSON.stringify(updatedFiles) !== JSON.stringify(prevMockFiles)) {
             toast({ title: "Created", description: `${type === 'file' ? 'File' : 'Folder'} "${name}" created.` });
        }
        return updatedFiles;
    });

    if (type === 'file') {
      // Optionally open the new file
      // handleFileSelect(newItem); 
    }
  }, [toast]);


  const handleFileSelect = useCallback((fileToOpen: FileItem) => {
    if (fileToOpen.type !== 'file') return;

    const freshFileToOpen = findFileById(mockFiles, fileToOpen.id) || fileToOpen;

    const existingFile = openFiles.find(f => f.id === freshFileToOpen.id);
    if (!existingFile) {
      setOpenFiles(prev => [...prev, freshFileToOpen]);
    }
    setActiveFileId(freshFileToOpen.id);
    setEditorContent(freshFileToOpen.content || '');
    setCurrentLanguage(freshFileToOpen.language || 'javascript');
  }, [openFiles, mockFiles, findFileById]);

  const handleTabClick = useCallback((fileId: string) => {
    const fileToActivate = openFiles.find(f => f.id === fileId) || findFileById(mockFiles, fileId);
    if (fileToActivate && fileToActivate.type === 'file') {
      setActiveFileId(fileId);
      setEditorContent(fileToActivate.content || '');
      setCurrentLanguage(fileToActivate.language || 'javascript');
    }
  }, [openFiles, mockFiles, findFileById]);

  const handleCloseTab = useCallback((fileIdToClose: string) => {
    setOpenFiles(prevOpenFiles => {
      const updatedOpenFiles = prevOpenFiles.filter(f => f.id !== fileIdToClose);
      if (activeFileId === fileIdToClose) {
        if (updatedOpenFiles.length > 0) {
          const newActiveFile = updatedOpenFiles[updatedOpenFiles.length - 1]; 
          const freshNewActiveFile = findFileById(mockFiles, newActiveFile.id) || newActiveFile;
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
  }, [activeFileId, mockFiles, findFileById, openFiles]); // Added openFiles to dependency array
  
  const handleEditorContentChange = useCallback((newContent: string) => {
    setEditorContent(newContent);
    setOpenFiles(prevOpenFiles => 
      prevOpenFiles.map(file => 
        file.id === activeFileId ? { ...file, content: newContent } : file
      )
    );
    if(activeFileId) {
      setMockFiles(prevMockFiles => updateFileContentInMock(prevMockFiles, activeFileId, newContent));
    }
  }, [activeFileId]);


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
    const firstFile = findFirstFile(mockFiles);
    if (firstFile && openFiles.length === 0 && !activeFileId) {
      handleFileSelect(firstFile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to load initial file


  const currentActiveFile = openFiles.find(f => f.id === activeFileId) || (activeFileId ? findFileById(mockFiles, activeFileId) : null) ;

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
              />}
            {activePanel === 'settings' && <SettingsPanel />}
            {activePanel !== 'explorer' && activePanel !== 'settings' && (
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
          />
          <StatusBar />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

    