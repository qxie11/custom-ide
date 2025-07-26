'use client';

import Editor from '@monaco-editor/react';
import type {FileItem} from '@/entities/file-tree';
import type {EditorSettings} from '@/features/settings';

interface CodeEditorProps {
  activeFile: FileItem | null;
  onContentChange: (newContent: string) => void;
  options?: Pick<EditorSettings, 'fontSize' | 'wordWrap'>;
}

export function CodeEditor({activeFile, onContentChange, options}: CodeEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || '';
    onContentChange(newValue);
  };

  return (
    <div className="flex flex-col h-full bg-editor-background">
      <div className="flex-1 overflow-hidden">
        <Editor
          key={activeFile?.id}
          height="100%"
          language={activeFile?.language || 'plaintext'}
          value={activeFile?.content || ''}
          theme="vs-dark" // Standard dark theme for Monaco
          onChange={handleEditorChange}
          options={{
            minimap: {enabled: true},
            fontSize: options?.fontSize || 14,
            wordWrap: options?.wordWrap || 'off',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            glyphMargin: true,
          }}
          onMount={editor => {
            editor.focus();
          }}
          path={activeFile?.name}
          placeholder={activeFile?.name ? `// ${activeFile.name} - Start typing your code here...` : '// Open a file to start editing'}
        />
      </div>
    </div>
  );
}
