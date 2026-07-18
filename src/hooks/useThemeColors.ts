import { useEffect } from 'react';
import { supabase } from '../config/supabase';

export type ThemeColorMap = Record<string, string>;

const CSS_VAR_PREFIX = '--color-';

/** Apply a color map as CSS custom properties on :root */
export function applyThemeColors(light: ThemeColorMap, dark: ThemeColorMap) {
  const root = document.documentElement;

  // Apply light mode colors always (they act as base)
  Object.entries(light).forEach(([key, value]) => {
    if (value) root.style.setProperty(`${CSS_VAR_PREFIX}${key}`, value);
  });

  // If currently in dark mode, also override with dark colors
  if (root.classList.contains('dark')) {
    Object.entries(dark).forEach(([key, value]) => {
      if (value) root.style.setProperty(`${CSS_VAR_PREFIX}${key}`, value);
    });
  }
}

/** Hook: loads theme colors from Supabase and applies them on mount */
export function useThemeColors() {
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('site_config')
        .select('key, value')
        .in('key', ['theme_colors_light', 'theme_colors_dark']);

      if (error || !data) return;

      const lightEntry = data.find(d => d.key === 'theme_colors_light');
      const darkEntry = data.find(d => d.key === 'theme_colors_dark');

      const light: ThemeColorMap = (lightEntry?.value as ThemeColorMap) ?? {};
      const dark: ThemeColorMap = (darkEntry?.value as ThemeColorMap) ?? {};

      applyThemeColors(light, dark);
    };

    load();
  }, []);
}
