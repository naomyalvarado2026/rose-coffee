/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowUp, ArrowDown, Save, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SectionConfig {
  id: string;
  visible: boolean;
  order: number;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'home_hero', visible: true, order: 0 },
  { id: 'marquee', visible: true, order: 1 },
  { id: 'home_welcome', visible: true, order: 2 },
  { id: 'home_gallery', visible: true, order: 3 },
  { id: 'home_journey', visible: true, order: 4 },
  { id: 'products', visible: true, order: 5 },
  { id: 'home_events', visible: true, order: 6 },
  { id: 'home_origin', visible: true, order: 7 },
  { id: 'sourdough', visible: true, order: 8 },
  { id: 'home_roseclub_module', visible: true, order: 9 },
  { id: 'home_subscriptions', visible: true, order: 10 },
  { id: 'home_birthdays', visible: true, order: 11 },
  { id: 'home_sermons', visible: true, order: 12 },
  { id: 'home_schedules', visible: false, order: 13 }
];

const SECTION_NAMES: Record<string, string> = {
  home_hero: 'Sección Principal (Héroe)',
  marquee: 'Banner Deslizante (Marquee)',
  home_welcome: 'Nuestros Pilares',
  home_gallery: 'Galería de Imágenes',
  home_journey: 'Del Grano a la Taza (Línea de tiempo)',
  products: 'Catálogo / Productos Destacados',
  home_events: 'Próximas Degustaciones',
  home_origin: 'Nuestro Café Tiene Historia (Origen)',
  sourdough: 'Beneficios Masa Madre',
  home_roseclub_module: 'Programa de Fidelidad (Rose Club)',
  home_subscriptions: 'Suscripciones / Membresías',
  home_birthdays: 'Clientes Destacados (Testimonios)',
  home_sermons: 'Artículos del Blog',
  home_schedules: 'Horarios de Atención (Ubicación)'
};

const DEFAULT_GALLERY = [
  { id: 'img-1', url: '/productos/sourdough_crumb_1782575620063.webp', caption: 'Textura perfecta de nuestra miga de masa madre' },
  { id: 'img-2', url: '/productos/latte_art_closeup_1782575630550.webp', caption: 'El arte de un buen latte' },
  { id: 'img-3', url: '/productos/roasted_coffee_beans_1782575641834.webp', caption: 'Granos de especialidad recién tostados' },
  { id: 'img-4', url: '/productos/bread_and_coffee_1782575652616.webp', caption: 'Nuestra especialidad: Café y Pan' },
  { id: 'img-5', url: '/productos/barista_extraction_1782575662454.webp', caption: 'Extracción perfecta de espresso' },
  { id: 'img-6', url: '/productos/sourdough_scoring_1782575673375.webp', caption: 'Preparando la masa madre' },
  { id: 'img-7', url: '/productos/coffee_pouring_1782575682967.webp', caption: 'Pasión en cada taza' },
  { id: 'img-8', url: '/productos/artisan_pastry_1782575693686.webp', caption: 'Acompañamientos perfectos' }
];

export default function HomeSectionManager() {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingGallery, setSyncingGallery] = useState(false);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .eq('id', 'home_section_config')
        .maybeSingle();

      if (error) throw error;

      if (data && data.content_blocks) {
        // Merge with defaults in case new sections were added
        const loaded: SectionConfig[] = data.content_blocks;
        const merged = DEFAULT_SECTIONS.map(def => {
          const found = loaded.find(l => l.id === def.id);
          return found ? { ...def, visible: found.visible, order: found.order } : def;
        }).sort((a, b) => a.order - b.order);
        
        setSections(merged);
      } else {
        setSections([...DEFAULT_SECTIONS]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error al cargar la configuración de secciones');
      setSections([...DEFAULT_SECTIONS]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Ensure orders are sequential
      const toSave = sections.map((s, idx) => ({ ...s, order: idx }));
      
      const { error } = await supabase
        .from('page_contents')
        .upsert({
          id: 'home_section_config',
          page: 'home',
          section: 'system',
          name: 'Configuración de Secciones',
          title: 'Config',
          subtitle: '',
          content_blocks: toSave,
          section_type: 'system_config'
        });

      if (error) throw error;
      toast.success('Configuración guardada correctamente');
      setSections(toSave);
    } catch (err: any) {
      console.error(err);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncGallery = async () => {
    setSyncingGallery(true);
    try {
      const { error } = await supabase
        .from('page_contents')
        .upsert({
          id: 'home_gallery',
          page: 'home',
          section: 'home_gallery',
          name: 'Galería de Imágenes',
          title: 'Nuestros Productos en Imágenes',
          subtitle: 'Momentos especiales de nuestro proceso artesanal y productos de Rose Coffee.',
          content_blocks: DEFAULT_GALLERY,
          section_type: 'system_gallery'
        });

      if (error) throw error;
      toast.success('Galería sincronizada con las nuevas imágenes en Supabase');
    } catch (err: any) {
      console.error(err);
      toast.error('Error al sincronizar la galería');
    } finally {
      setSyncingGallery(false);
    }
  };

  const toggleVisibility = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    setSections(newSections);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    setSections(newSections);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-coffee dark:text-gold" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-800 rounded-3xl p-8 border border-stone-200 dark:border-stone-700 shadow-sm space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-primary">Visibilidad y Orden de Secciones</h3>
          <p className="text-stone-500 text-sm mt-1">
            Activa, oculta y reordena las secciones de la página de inicio.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSyncGallery}
            disabled={syncingGallery}
            className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {syncingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            Sincronizar Galería a BD
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-coffee hover:bg-coffee-dark text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Configuración
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <motion.div
            layout
            key={section.id}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
              section.visible ? 'bg-stone-50 border-stone-200' : 'bg-stone-50/50 border-stone-100 opacity-60'
            }`}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleVisibility(section.id)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  section.visible ? 'text-coffee dark:text-gold hover:bg-coffee/10' : 'text-stone-400 hover:bg-stone-200'
                }`}
                title={section.visible ? 'Ocultar sección' : 'Mostrar sección'}
              >
                {section.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              <div>
                <p className="font-bold text-primary">{SECTION_NAMES[section.id] || section.id}</p>
                <p className="text-xs text-stone-500 font-mono">{section.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-2 text-stone-400 hover:text-coffee dark:text-gold hover:bg-coffee/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-400 transition-colors cursor-pointer"
                title="Subir"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === sections.length - 1}
                className="p-2 text-stone-400 hover:text-coffee dark:text-gold hover:bg-coffee/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-400 transition-colors cursor-pointer"
                title="Bajar"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
