import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('rose-theme-preference') as 'light' | 'dark' | 'system') || 'system',
  setTheme: (theme) => {
    localStorage.setItem('rose-theme-preference', theme);
    set({ theme });
    
    // Apply immediately to HTML tag
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  },
}));
