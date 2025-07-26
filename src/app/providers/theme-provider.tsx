'use client';

import {createContext, useContext, useState, useEffect, useMemo} from 'react';
import type {ThemeType} from '@/features/settings';

interface ThemeProviderState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'dark-plus',
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeType;
}) {
  const [theme, setTheme] = useState<ThemeType>(defaultTheme);

  useEffect(() => {
    document.documentElement.classList.remove('theme-dark-plus', 'theme-light-plus', 'theme-monokai', 'dark', 'light');
    document.documentElement.classList.add(`theme-${theme}`);
    if (theme.includes('dark') || theme.includes('monokai')) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const value = useMemo(() => ({theme, setTheme}), [theme]);

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
