'use client';

import {useState, useCallback} from 'react';
import type {EditorSettings} from './types';
import {useToast} from '@/shared/ui/use-toast';
import {useTheme} from '@/app/providers/theme-provider';

export function useSettings() {
  const {setTheme: applyTheme} = useTheme();
  const {toast} = useToast();

  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    fontSize: 14,
    autoSave: true,
    wordWrap: 'off',
    formatOnSave: true,
    theme: 'dark-plus',
  });

  const handleApplySettings = useCallback(
    (newSettings: EditorSettings) => {
      setEditorSettings(newSettings);
      applyTheme(newSettings.theme);
      toast({title: 'Settings Applied', description: 'Your editor settings have been updated.'});
    },
    [toast, applyTheme]
  );

  return {
    editorSettings,
    handleApplySettings,
  };
}
