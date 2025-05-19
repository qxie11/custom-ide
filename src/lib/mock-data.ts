export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: 'javascript' | 'typescript' | 'html' | 'css' | 'json' | 'markdown';
  content?: string;
  children?: FileItem[];
}

export const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'public',
    type: 'folder',
    children: [
      { id: '2', name: 'index.html', type: 'file', language: 'html', content: '<h1>Hello World</h1>' },
      { id: '3', name: 'favicon.ico', type: 'file', content: '' },
    ],
  },
  {
    id: '4',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: '5',
        name: 'components',
        type: 'folder',
        children: [
          { id: '6', name: 'Button.tsx', type: 'file', language: 'typescript', content: 'export function Button() {}' },
        ],
      },
      { id: '7', name: 'App.tsx', type: 'file', language: 'typescript', content: 'function App() { return <div>App</div> }' },
      { id: '8', name: 'index.css', type: 'file', language: 'css', content: 'body { margin: 0; }' },
    ],
  },
  { id: '9', name: 'package.json', type: 'file', language: 'json', content: '{ "name": "my-app" }' },
  { id: '10', name: 'README.md', type: 'file', language: 'markdown', content: '# My App Readme' },
];
