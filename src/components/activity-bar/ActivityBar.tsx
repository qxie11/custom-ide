"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Files, Settings2, GitFork, Search, Puzzle, UserCircle, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BrandIcon } from '@/components/icons/BrandIcon';

interface ActivityBarProps {
  activePanel: string;
  setActivePanel: Dispatch<SetStateAction<string>>;
}

const topIcons = [
  { name: 'explorer', label: 'Explorer', icon: Files },
  { name: 'search', label: 'Search', icon: Search },
  { name: 'source-control', label: 'Source Control', icon: GitFork },
  { name: 'extensions', label: 'Extensions', icon: Puzzle },
];

const bottomIcons = [
 { name: 'account', label: 'Account', icon: UserCircle },
 { name: 'settings', label: 'Manage', icon: Settings2 },
];


export function ActivityBar({ activePanel, setActivePanel }: ActivityBarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col justify-between items-center w-12 py-2 bg-activity-bar-background text-foreground/70 border-r border-border">
        <div className="flex flex-col items-center space-y-1">
          <div className="p-2 mb-2">
            <BrandIcon className="h-6 w-6 text-accent" />
          </div>
          {topIcons.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-none ${
                    activePanel === item.name ? 'text-accent bg-accent/10 border-l-2 border-accent' : 'hover:bg-accent/5'
                  }`}
                  onClick={() => setActivePanel(item.name)}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground border-border text-xs">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex flex-col items-center space-y-1">
           {bottomIcons.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-10 w-10 rounded-none ${
                    activePanel === item.name ? 'text-accent bg-accent/10 border-l-2 border-accent' : 'hover:bg-accent/5'
                  }`}
                  onClick={() => setActivePanel(item.name)}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground border-border text-xs">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
