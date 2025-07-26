
"use client";

import { useState, useMemo, useCallback } from 'react';
import type { FileItem } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CaseSensitive, WholeWord, Regex, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';


interface SearchPanelProps {
  allFiles: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

interface SearchResult {
  file: FileItem;
  matches: {
    line: number;
    content: string;
  }[];
}

export function SearchPanel({ allFiles, onFileSelect }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [filesToInclude, setFilesToInclude] = useState('');
  const [filesToExclude, setFilesToExclude] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isWholeWord, setIsWholeWord] = useState(false);
  const [isRegex, setIsRegex] = useState(false);

  const performSearch = useCallback((): SearchResult[] => {
    if (!query) return [];

    const results: SearchResult[] = [];
    const searchFlags = isCaseSensitive ? 'g' : 'gi';
    let searchRegex: RegExp;

    try {
        if (isRegex) {
            searchRegex = new RegExp(query, searchFlags);
        } else {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = isWholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
            searchRegex = new RegExp(pattern, searchFlags);
        }
    } catch (e) {
        // Invalid regex
        return [];
    }
    
    const traverse = (items: FileItem[]) => {
      for (const item of items) {
        if (item.type === 'file' && item.content) {
          const fileMatches: SearchResult['matches'] = [];
          const lines = item.content.split('\n');
          lines.forEach((lineContent, lineIndex) => {
            if (lineContent.match(searchRegex)) {
              fileMatches.push({ line: lineIndex + 1, content: lineContent.trim() });
            }
          });

          if (fileMatches.length > 0) {
            results.push({ file: item, matches: fileMatches });
          }
        } else if (item.type === 'folder' && item.children) {
          traverse(item.children);
        }
      }
    };

    traverse(allFiles);
    return results;
  }, [query, allFiles, isCaseSensitive, isWholeWord, isRegex]);

  const searchResults = useMemo(() => performSearch(), [performSearch]);
  
  const handleResultClick = (file: FileItem) => {
    onFileSelect(file);
    // Potentially navigate to the specific line in the editor in a future enhancement
  };

  return (
    <div className="p-2 space-y-3 h-full overflow-y-auto text-sm">
      <div className="relative">
         <Input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-20 bg-input"
        />
        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex space-x-0.5">
            <Button variant={isCaseSensitive ? 'secondary' : 'ghost'} size="icon" className="h-6 w-6" onClick={() => setIsCaseSensitive(!isCaseSensitive)} title="Match Case">
                <CaseSensitive className="h-4 w-4" />
            </Button>
            <Button variant={isWholeWord ? 'secondary' : 'ghost'} size="icon" className="h-6 w-6" onClick={() => setIsWholeWord(!isWholeWord)} title="Match Whole Word">
                <WholeWord className="h-4 w-4" />
            </Button>
            <Button variant={isRegex ? 'secondary' : 'ghost'} size="icon" className="h-6 w-6" onClick={() => setIsRegex(!isRegex)} title="Use Regular Expression">
                <Regex className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <div>
        <Input
            placeholder="files to include"
            value={filesToInclude}
            onChange={(e) => setFilesToInclude(e.target.value)}
            className="bg-input text-xs h-8"
        />
        <Input
            placeholder="files to exclude"
            value={filesToExclude}
            onChange={(e) => setFilesToExclude(e.target.value)}
            className="bg-input text-xs h-8 mt-1"
        />
      </div>

      <div className="text-xs text-muted-foreground">
        {searchResults.length > 0 
          ? `${searchResults.reduce((sum, r) => sum + r.matches.length, 0)} results in ${searchResults.length} files`
          : 'No results found.'
        }
      </div>

      <Accordion type="multiple" className="w-full">
        {searchResults.map(({ file, matches }) => (
          <AccordionItem key={file.id} value={file.id} className="border-b-0">
            <AccordionTrigger className="text-xs py-1.5 hover:bg-accent/10 rounded-sm px-1">
              <div className="flex items-center">
                 <ChevronRight className="h-4 w-4 mr-1 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                 <span className="truncate" title={file.name}>{file.name}</span>
                 <span className="ml-2 text-muted-foreground bg-muted/50 rounded-full px-1.5 text-[10px]">{matches.length}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4 text-xs">
              {matches.map((match, index) => (
                <div 
                  key={`${file.id}-${match.line}-${index}`}
                  className="flex py-1 hover:bg-accent/10 rounded-sm cursor-pointer"
                  onClick={() => handleResultClick(file)}
                >
                  <span className="w-10 text-right pr-2 text-muted-foreground/70">{match.line}</span>
                  <span className="truncate text-foreground/80">{match.content}</span>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

    