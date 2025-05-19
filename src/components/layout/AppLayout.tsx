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


  const handleFileSelect = useCallback((fileToOpen: FileItem) => {
    if (fileToOpen.type !== 'file') return;

    const existingFile = openFiles.find(f => f.id === fileToOpen.id);
    if (!existingFile) {
      setOpenFiles(prev => [...prev, fileToOpen]);
    }
    setActiveFileId(fileToOpen.id);
    setEditorContent(fileToOpen.content || '');
    setCurrentLanguage(fileToOpen.language || 'javascript');
  }, [openFiles]);

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
          setActiveFileId(newActiveFile.id);
          setEditorContent(newActiveFile.content || '');
          setCurrentLanguage(newActiveFile.language || 'javascript');
        } else {
          setActiveFileId(null);
          setEditorContent('');
          setCurrentLanguage('javascript');
        }
      }
      return updatedOpenFiles;
    });
  }, [activeFileId]);
  
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
    const firstFile = mockFiles.flatMap(f => f.type === 'file' ? [f] : (f.children?.filter(c => c.type === 'file') || [])).find(Boolean);
    if (firstFile && openFiles.length === 0) {
      handleFileSelect(firstFile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockFiles]); // Only on initial mockFiles load

  const currentActiveFile = openFiles.find(f => f.id === activeFileId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <ActivityBar activePanel={activePanel} setActivePanel={setActivePanel} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={18} minSize={10} maxSize={30} className="bg-sidebar-background border-r border-border min-w-[200px]">
            {activePanel === 'explorer' && <FileExplorer files={mockFiles} onFileSelect={handleFileSelect} selectedFileId={activeFileId} />}
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
