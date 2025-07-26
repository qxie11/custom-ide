'use client';

import {useState} from 'react';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/shared/ui/resizable';
import {ActivityBar} from '@/widgets/activity-bar';
import {Sidebar} from '@/widgets/sidebar';
import {EditorPanel} from '@/widgets/editor-panel';
import {StatusBar} from '@/widgets/status-bar';
import {useFileTree} from '@/entities/file-tree';
import {useEditor} from '@/features/code-editor';
import {useSettings} from '@/features/settings';

export default function AppLayout() {
  const [activePanel, setActivePanel] = useState('explorer');

  const {files, handleRenameItem, handleDeleteItem, handleAddItem, handleMoveItem, updateFileContent} = useFileTree();

  const {editorSettings, handleApplySettings} = useSettings();

  const {openFiles, activeFileId, activeFile, handleFileSelect, handleTabClick, handleCloseTab, handleEditorContentChange} = useEditor(files, updateFileContent);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <ActivityBar activePanel={activePanel} setActivePanel={setActivePanel} />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={18} minSize={10} maxSize={30} className="bg-sidebar-background border-r border-border min-w-[200px]">
          <Sidebar
            activePanel={activePanel}
            files={files}
            onFileSelect={handleFileSelect}
            selectedFileId={activeFileId}
            onRenameItem={handleRenameItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onMoveItem={handleMoveItem}
            settings={editorSettings}
            onApplySettings={handleApplySettings}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={82} className="flex flex-col">
          <EditorPanel
            openFiles={openFiles}
            activeFileId={activeFileId}
            activeFile={activeFile}
            editorSettings={editorSettings}
            onTabClick={handleTabClick}
            onCloseTab={handleCloseTab}
            onContentChange={handleEditorContentChange}
          />
          <StatusBar />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
