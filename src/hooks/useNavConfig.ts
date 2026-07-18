import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import type { NavItem } from '../config/navConfig';
import { DEFAULT_NAV_ITEMS } from '../config/navConfig';

export const useNavConfig = () => {
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNavSettings = async () => {
      try {
        const cachedNav = localStorage.getItem('rose_coffee_nav_settings');
        if (cachedNav) {
          try {
            setNavItems(JSON.parse(cachedNav));
          } catch (e) {
             console.warn('Failed to parse cached nav:', e);
          }
        }

        const { data, error } = await supabase
          .from('page_contents')
          .select('*')
          .eq('id', 'nav_settings')
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
           throw error;
        }

        if (data && data.content_blocks && data.content_blocks[0]) {
          const fetchedItems = data.content_blocks[0].items;
          if (fetchedItems && Array.isArray(fetchedItems)) {
            setNavItems(fetchedItems);
            localStorage.setItem('rose_coffee_nav_settings', JSON.stringify(fetchedItems));
          }
        }
      } catch (err) {
        console.error('Error fetching nav settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNavSettings();
  }, []);

  const updateNavItems = async (newItems: NavItem[]) => {
    setNavItems(newItems);
    localStorage.setItem('rose_coffee_nav_settings', JSON.stringify(newItems));
    
    try {
      await supabase
        .from('page_contents')
        .upsert({
          id: 'nav_settings',
          page: 'settings',
          section: 'navigation',
          name: 'Configuración de Navegación',
          title: 'Configuración de Navegación',
          subtitle: 'Menú principal',
          content_blocks: [{ items: newItems }],
          updated_at: new Date().toISOString()
        });
    } catch (err) {
      console.error('Failed to update nav in Supabase:', err);
      throw err;
    }
  };

  return { navItems, updateNavItems, loading };
};
