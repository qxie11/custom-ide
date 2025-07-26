
"use client";

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { FileItem } from '@/lib/mock-data'; 

interface CodeEditorProps {
  fileName: string;
  content: string;
  language: FileItem['language'];
  onContentChange: (newContent: string) => void;
  options?: {
    fontSize: number;
    wordWrap: 'on' | 'off';
  };
}

export function CodeEditor({ fileName, content, language, onContentChange, options }: CodeEditorProps) {
  const [editorValue, setEditorValue] = useState(content);

  useEffect(() => {
    setEditorValue(content);
  }, [content]);

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || '';
    setEditorValue(newValue);
    onContentChange(newValue);
  };

  return (
    <div className="flex flex-col h-full bg-editor-background">
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language || 'plaintext'}
          value={editorValue}
          theme="vs-dark" // Standard dark theme for Monaco
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: true },
            fontSize: options?.fontSize || 14,
            wordWrap: options?.wordWrap || 'off',
            lineNumbers: 'on', 
            scrollBeyondLastLine: false,
            automaticLayout: true,
            glyphMargin: true, 
          }}
          onMount={(editor, monaco) => {
            editor.focus();
          }}
          placeholder={fileName ? `// ${fileName} - Start typing your code here...` : "// Open a file to start editing"}
        />
      </div>
    </div>
  );
}
