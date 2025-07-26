'use client';

import {useState, useCallback, useEffect} from 'react';
import type {FileItem} from '@/entities/file-tree';
import {findItemByIdRecursive, findFirstFile} from '@/entities/file-tree/lib/utils';

export function useEditor(
  files: FileItem[],
  updateFileContent: (fileId: string, newContent: string) => void
) {
  const [openFiles, setOpenFiles] = useState<FileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (fileToOpen: FileItem) => {
      if (fileToOpen.type !== 'file') return;
      const freshFileToOpen = findItemByIdRecursive(files, fileToOpen.id) || fileToOpen;
      const existingFile = openFiles.find(f => f.id === freshFileToOpen.id);
      if (!existingFile) {
        setOpenFiles(prev => [...prev, freshFileToOpen]);
      }
      setActiveFileId(freshFileToOpen.id);
    },
    [openFiles, files]
  );

  const handleTabClick = useCallback(
    (fileId: string) => {
      const fileToActivate = openFiles.find(f => f.id === fileId) || findItemByIdRecursive(files, fileId);
      if (fileToActivate && fileToActivate.type === 'file') {
        setActiveFileId(fileId);
      }
    },
    [openFiles, files]
  );

  const handleCloseTab = useCallback(
    (fileIdToClose: string) => {
      setOpenFiles(prevOpenFiles => {
        const updatedOpenFiles = prevOpenFiles.filter(f => f.id !== fileIdToClose);
        if (activeFileId === fileIdToClose) {
          if (updatedOpenFiles.length > 0) {
            const newActiveFile = updatedOpenFiles[updatedOpenFiles.length - 1];
            setActiveFileId(newActiveFile.id);
          } else {
            setActiveFileId(null);
          }
        }
        return updatedOpenFiles;
      });
    },
    [activeFileId]
  );

  const handleEditorContentChange = useCallback(
    (newContent: string) => {
      if (activeFileId) {
        setOpenFiles(prevOpenFiles =>
          prevOpenFiles.map(file => (file.id === activeFileId ? {...file, content: newContent} : file))
        );
        updateFileContent(activeFileId, newContent);
      }
    },
    [activeFileId, updateFileContent]
  );

  // Effect to update open file names if they are renamed
  useEffect(() => {
    setOpenFiles(prevOpenFiles =>
      prevOpenFiles.map(of => {
        const updatedFile = findItemByIdRecursive(files, of.id);
        return updatedFile ? {...updatedFile, content: of.content} : of;
      })
    );
  }, [files]);
  
  // Effect to handle file deletion
  useEffect(() => {
    openFiles.forEach(openedFile => {
      if (!findItemByIdRecursive(files, openedFile.id)) {
        handleCloseTab(openedFile.id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  // Effect to open the first file on initial load
  useEffect(() => {
    if (files.length > 0 && openFiles.length === 0 && !activeFileId) {
      const firstFile = findFirstFile(files);
      if (firstFile) {
        handleFileSelect(firstFile);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeFile = activeFileId ? findItemByIdRecursive(files, activeFileId) : null;

  return {
    openFiles,
    activeFileId,
    activeFile,
    handleFileSelect,
    handleTabClick,
    handleCloseTab,
    handleEditorContentChange,
  };
}
