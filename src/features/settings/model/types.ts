export type ThemeType = 'dark-plus' | 'light-plus' | 'monokai';

export interface EditorSettings {
  fontSize: number;
  autoSave: boolean;
  wordWrap: 'on' | 'off';
  formatOnSave: boolean;
  theme: ThemeType;
}
