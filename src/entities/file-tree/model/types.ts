export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: 'javascript' | 'typescript' | 'html' | 'css' | 'json' | 'markdown' | 'plaintext';
  content?: string;
  children?: FileItem[];
}
