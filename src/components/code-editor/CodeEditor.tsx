"use client";

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2 } from 'lucide-react';
import { formatCode, type FormatCodeInput } from '@/ai/flows/code-formatter';

interface CodeEditorProps {
  fileName: string;
  content: string;
  language: FormatCodeInput['language'];
  onContentChange: (newContent: string) => void;
}

export function CodeEditor({ fileName, content, language, onContentChange }: CodeEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Local state for textarea to allow direct editing
  const [editorValue, setEditorValue] = useState(content);

  useEffect(() => {
    setEditorValue(content);
  }, [content]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorValue(event.target.value);
    onContentChange(event.target.value); // Propagate change upwards
  };

  const handleFormatCode = async () => {
    if (!editorValue || !language) {
      toast({ title: "Cannot Format", description: "No content or language specified.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await formatCode({ code: editorValue, language });
      setEditorValue(result.formattedCode);
      onContentChange(result.formattedCode); // Propagate formatted code
      toast({ title: "Code Formatted", description: `${fileName} formatted successfully.` });
    } catch (error) {
      console.error("Failed to format code:", error);
      toast({ title: "Formatting Error", description: "Could not format the code.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-editor-background">
      <div className="p-2 flex justify-end items-center border-b border-tab-border">
        {fileName && (
          <Button onClick={handleFormatCode} variant="ghost" size="sm" disabled={isLoading} className="text-xs">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Format Code
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 p-1">
        <Textarea
          value={editorValue}
          onChange={handleInputChange}
          placeholder={fileName ? `// ${fileName} - Start typing your code here...` : "// Open a file to start editing"}
          className="w-full h-full min-h-[calc(100vh-160px)] p-4 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-card text-base leading-relaxed"
          aria-label="Code Editor"
          spellCheck="false"
        />
      </ScrollArea>
      <div className="p-2 text-xs text-muted-foreground">
        This is a basic textarea acting as a placeholder for a Monaco-based code editor. Features like syntax highlighting and advanced IntelliSense would be part of a full Monaco integration.
      </div>
    </div>
  );
}
