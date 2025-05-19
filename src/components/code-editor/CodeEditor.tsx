
"use client";

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { FileItem } from '@/lib/mock-data'; // Ensure FileItem is imported for language prop type

interface CodeEditorProps {
  fileName: string;
  content: string;
  language: FileItem['language'];
  onContentChange: (newContent: string) => void;
}

export function CodeEditor({ fileName, content, language, onContentChange }: CodeEditorProps) {
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
      <div className="flex-1 overflow-hidden"> {/* Added overflow-hidden here */}
        <Editor
          height="100%"
          language={language || 'plaintext'}
          value={editorValue}
          theme="vs-dark" // Standard dark theme for Monaco
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on', // Enable line numbers
            scrollBeyondLastLine: false,
            automaticLayout: true, // Ensures editor resizes correctly
            glyphMargin: true, // Good for breakpoints, folding, etc.
          }}
          onMount={(editor, monaco) => {
            // You can access editor and monaco instances here
            // For example, to register custom themes or languages
            editor.focus();
          }}
          placeholder={fileName ? `// ${fileName} - Start typing your code here...` : "// Open a file to start editing"}
        />
      </div>
    </div>
  );
}
