
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


export default function AppLayout() {
  const [activePanel, setActivePanel] = useState('explorer'); // 'explorer', 'settings', 'search', etc.
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<FileItem['language']>('javascript');
  const [mockFiles, setMockFiles] = useState<FileItem[]>(initialMockFiles); // To allow content modification

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
    // Note: If the activeFileId points to the renamed file, its name will be updated
    // because currentActiveFile is derived from openFiles which now has the new name.
  }, []);


  const handleFileSelect = useCallback((fileToOpen: FileItem) => {
    if (fileToOpen.type !== 'file') return;

    // Ensure the file reflects the latest state from mockFiles (e.g., after a rename)
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
          const newActiveFile = updatedOpenFiles[updatedOpenFiles.length - 1]; // Or find in mockFiles
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
  }, [activeFileId, mockFiles, findFileById]);
  
  const handleEditorContentChange = useCallback((newContent: string) => {
    setEditorContent(newContent);
    // Update content in openFiles state
    setOpenFiles(prevOpenFiles => 
      prevOpenFiles.map(file => 
        file.id === activeFileId ? { ...file, content: newContent } : file
      )
    );
    // Update content in the main mockFiles structure (for persistence if needed, or if reopened)
    if(activeFileId) {
      setMockFiles(prevMockFiles => updateFileContentInMock(prevMockFiles, activeFileId, newContent));
    }
  }, [activeFileId]);


  // Effect to load the first file by default or a specific file
  useEffect(() => {
    // Find the first actual file to open
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
    if (firstFile && openFiles.length === 0 && !activeFileId) { // Ensure not to override if a file is already active
      handleFileSelect(firstFile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockFiles]); // Only on initial mockFiles load (or when mockFiles structure changes significantly)


  const currentActiveFile = openFiles.find(f => f.id === activeFileId) || (activeFileId ? findFileById(mockFiles, activeFileId) : null) ;


  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <ActivityBar activePanel={activePanel} setActivePanel={setActivePanel} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={18} minSize={10} maxSize={30} className="bg-sidebar-background border-r border-border min-w-[200px]">
            {activePanel === 'explorer' && <FileExplorer files={mockFiles} onFileSelect={handleFileSelect} selectedFileId={activeFileId} onRenameItem={handleRenameItem} />}
            {activePanel === 'settings' && <SettingsPanel />}
            {/* Placeholder for other panels like search, git, etc. */}
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

    