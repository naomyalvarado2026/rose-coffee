import { useEffect } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useThemeStore();

  // Initialize theme on first mount
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (useThemeStore.getState().theme === 'system') {
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gold/50 ${className || 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'}`}
      aria-label="Alternar tema"
      title={theme === 'light' ? 'Modo Claro' : theme === 'dark' ? 'Modo Oscuro' : 'Modo Sistema'}
    >
      {theme === 'light' && <Sun size={20} />}
      {theme === 'dark' && <Moon size={20} />}
      {theme === 'system' && <Laptop size={20} />}
    </button>
  );
}
