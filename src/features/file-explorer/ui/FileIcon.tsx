import type {FileItem} from '@/entities/file-tree';
import {Folder, FileText, Braces, Code2, Palette, FileJson2, File, Package, Wind, Settings2 as ConfigIcon, FileLock2, ImageIcon} from 'lucide-react';

interface FileIconProps {
  item: FileItem;
  isOpen?: boolean;
}

export const FileIcon = ({item, isOpen}: FileIconProps) => {
  const iconProps = {className: 'h-4 w-4 mr-2 shrink-0'};

  if (item.type === 'folder') {
    return isOpen ? <Folder {...iconProps} className={`${iconProps.className} text-accent`} /> : <Folder {...iconProps} className={`${iconProps.className} text-muted-foreground`} />;
  }

  if (item.name === 'package.json') return <Package {...iconProps} className={`${iconProps.className} text-purple-400`} />;
  if (item.name === 'tailwind.config.js' || item.name === 'tailwind.config.ts') return <Wind {...iconProps} className={`${iconProps.className} text-teal-400`} />;
  if (item.name === 'next.config.js' || item.name === 'next.config.ts') return <ConfigIcon {...iconProps} className={`${iconProps.className} text-sky-400`} />;
  if (item.name === '.env') return <FileLock2 {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
  if (item.name === 'favicon.ico') return <ImageIcon {...iconProps} className={`${iconProps.className} text-pink-400`} />;

  const extension = item.name.split('.').pop()?.toLowerCase();
  switch (item.language || extension) {
    case 'javascript':
    case 'js':
      return <Braces {...iconProps} className={`${iconProps.className} text-yellow-400`} />;
    case 'typescript':
    case 'ts':
    case 'tsx':
      return <Braces {...iconProps} className={`${iconProps.className} text-blue-500`} />;
    case 'html':
      return <Code2 {...iconProps} className={`${iconProps.className} text-orange-500`} />;
    case 'css':
      return <Palette {...iconProps} className={`${iconProps.className} text-sky-500`} />;
    case 'json':
      return <FileJson2 {...iconProps} className={`${iconProps.className} text-lime-500`} />;
    case 'markdown':
    case 'md':
      return <File {...iconProps} className={`${iconProps.className} text-slate-400`} />;
    default:
      return <FileText {...iconProps} className={`${iconProps.className} text-slate-300`} />;
  }
};
