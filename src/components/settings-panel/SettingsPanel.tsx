
"use client";

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface EditorSettings {
  fontSize: number;
  autoSave: boolean;
  wordWrap: 'on' | 'off';
  formatOnSave: boolean;
}

interface SettingsPanelProps {
  settings: EditorSettings;
  onApply: (newSettings: EditorSettings) => void;
}

export function SettingsPanel({ settings, onApply }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<EditorSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleApplyClick = () => {
    onApply(localSettings);
  };

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto text-sm">
      <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>
      
      <div className="space-y-2">
        <h3 className="text-md font-medium text-foreground/90">Editor</h3>
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/5">
          <Label htmlFor="font-size" className="text-foreground/80">Font Size</Label>
          <Input 
            id="font-size" 
            type="number" 
            value={localSettings.fontSize}
            onChange={(e) => setLocalSettings(s => ({ ...s, fontSize: parseInt(e.target.value, 10) || 14 }))}
            className="w-20 h-8 text-xs bg-input" 
          />
        </div>
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/5">
          <Label htmlFor="auto-save" className="text-foreground/80">Auto Save</Label>
          <Switch 
            id="auto-save" 
            checked={localSettings.autoSave}
            onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, autoSave: checked }))}
          />
        </div>
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/5">
          <Label htmlFor="word-wrap" className="text-foreground/80">Word Wrap</Label>
          <Switch 
            id="word-wrap" 
            checked={localSettings.wordWrap === 'on'}
            onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, wordWrap: checked ? 'on' : 'off' }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-md font-medium text-foreground/90">Theme</h3>
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/5">
          <Label htmlFor="color-theme" className="text-foreground/80">Color Theme</Label>
          <Select defaultValue="dark-plus">
            <SelectTrigger className="w-40 h-8 text-xs bg-input">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark-plus">Dark+ (Default Dark)</SelectItem>
              <SelectItem value="light-plus">Light+ (Default Light)</SelectItem>
              <SelectItem value="monokai">Monokai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-md font-medium text-foreground/90">Formatting</h3>
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/5">
          <Label htmlFor="format-on-save" className="text-foreground/80">Format On Save</Label>
          <Switch 
            id="format-on-save" 
            checked={localSettings.formatOnSave}
            onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, formatOnSave: checked }))}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button 
          size="sm" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleApplyClick}
        >
          Apply Settings
        </Button>
      </div>
    </div>
  );
}
