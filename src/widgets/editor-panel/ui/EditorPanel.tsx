'use client';

import {CodeEditor, EditorTabs} from '@/features/code-editor';
import type {FileItem} from '@/entities/file-tree';
import type {EditorSettings} from '@/features/settings';

interface EditorPanelProps {
  openFiles: FileItem[];
  activeFileId: string | null;
  activeFile: FileItem | null;
  editorSettings: EditorSettings;
  onTabClick: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onContentChange: (newContent: string) => void;
}

export function EditorPanel({openFiles, activeFileId, activeFile, editorSettings, onTabClick, onCloseTab, onContentChange}: EditorPanelProps) {
  return (
    <>
      <EditorTabs openFiles={openFiles} activeFileId={activeFileId} onTabClick={onTabClick} onCloseTab={onCloseTab} />
      <CodeEditor
        activeFile={activeFile}
        onContentChange={onContentChange}
        options={{
          fontSize: editorSettings.fontSize,
          wordWrap: editorSettings.wordWrap,
        }}
      />
    </>
  );
}
