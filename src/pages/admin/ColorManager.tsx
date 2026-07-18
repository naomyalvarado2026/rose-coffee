import { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Save, RotateCcw, Loader2, Eye } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'sonner';
import { supabase } from '../../config/supabase';
import { applyThemeColors, type ThemeColorMap } from '../../hooks/useThemeColors';

// ────────────────────────────────────────────────────────────
// Default color palettes (mirrors values in index.css @theme)
// ────────────────────────────────────────────────────────────
const DEFAULT_LIGHT: ThemeColorMap = {
  'brand-base': '#faf2e7',
  'primary': '#021a54',
  'coffee': '#6b3a0e',
  'coffee-dark': '#4d2607',
  'gold': '#c8922a',
  'cream': '#fdf6ee',
  'warm-stone': '#f5ebe0',
  'accent-red': '#DC2626',
  'accent-purple': '#7C3AED',
  'accent-blue': '#0EA5E9',
};

const DEFAULT_DARK: ThemeColorMap = {
  'brand-base': '#0c0a09',
  'primary': '#021a54',
  'coffee': '#8b5e3c',
  'coffee-dark': '#6b3a0e',
  'gold': '#d4a843',
  'cream': '#1c1917',
  'warm-stone': '#292524',
  'accent-red': '#EF4444',
  'accent-purple': '#A855F7',
  'accent-blue': '#38BDF8',
};

// Human-readable labels for each CSS var token
const COLOR_LABELS: Record<string, { label: string; description: string }> = {
  'brand-base':    { label: 'Fondo Base',      description: 'Color principal del fondo de la página' },
  'primary':       { label: 'Azul Primario',   description: 'Color de la barra de navegación, sidebar y encabezados' },
  'coffee':        { label: 'Café Principal',  description: 'Color de botones primarios, acentos y precio' },
  'coffee-dark':   { label: 'Café Oscuro',     description: 'Color de hover en botones café' },
  'gold':          { label: 'Dorado',          description: 'Color del logotipo, badges y elementos especiales' },
  'cream':         { label: 'Crema',           description: 'Fondos de tarjetas y paneles secundarios' },
  'warm-stone':    { label: 'Piedra Cálida',   description: 'Fondos alternos, divisores sutiles' },
  'accent-red':    { label: 'Acento Rojo',     description: 'Alertas, eliminaciones, errores' },
  'accent-purple': { label: 'Acento Morado',   description: 'Badges de premium, rose club' },
  'accent-blue':   { label: 'Acento Azul',     description: 'Links, indicadores de información' },
};

type TabMode = 'light' | 'dark';

export default function ColorManager() {
  const [activeTab, setActiveTab] = useState<TabMode>('light');
  const [lightColors, setLightColors] = useState<ThemeColorMap>({ ...DEFAULT_LIGHT });
  const [darkColors, setDarkColors] = useState<ThemeColorMap>({ ...DEFAULT_DARK });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLive, setPreviewLive] = useState(false);

  // ─── Load from Supabase ──────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      setLoading(true);
      try {
        const { data } = await supabase
          .from('site_config')
          .select('key, value')
          .in('key', ['theme_colors_light', 'theme_colors_dark']);

        if (data && mounted) {
          const lightEntry = data.find(d => d.key === 'theme_colors_light');
          const darkEntry = data.find(d => d.key === 'theme_colors_dark');
          if (lightEntry?.value) setLightColors({ ...DEFAULT_LIGHT, ...(lightEntry.value as ThemeColorMap) });
          if (darkEntry?.value) setDarkColors({ ...DEFAULT_DARK, ...(darkEntry.value as ThemeColorMap) });
        }
      } catch (err) {
        console.error('Error loading colors:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  // ─── Live preview ────────────────────────────────────────
  useEffect(() => {
    if (previewLive) {
      applyThemeColors(lightColors, darkColors);
    }
  }, [lightColors, darkColors, previewLive]);

  // ─── Handlers ────────────────────────────────────────────
  const updateColor = (mode: TabMode, key: string, value: string) => {
    if (mode === 'light') setLightColors(prev => ({ ...prev, [key]: value }));
    else setDarkColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ops = [
        supabase.from('site_config').upsert({ key: 'theme_colors_light', value: lightColors, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
        supabase.from('site_config').upsert({ key: 'theme_colors_dark', value: darkColors, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      ];
      await Promise.all(ops);
      applyThemeColors(lightColors, darkColors);
      toast.success('Paleta de colores guardada exitosamente ✨');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar los colores');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (activeTab === 'light') {
      setLightColors({ ...DEFAULT_LIGHT });
      if (previewLive) applyThemeColors(DEFAULT_LIGHT, darkColors);
    } else {
      setDarkColors({ ...DEFAULT_DARK });
      if (previewLive) applyThemeColors(lightColors, DEFAULT_DARK);
    }
    toast.info(`Colores del modo ${activeTab === 'light' ? 'claro' : 'oscuro'} restaurados a defaults`);
  };

  const activeColors = activeTab === 'light' ? lightColors : darkColors;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="animate-spin text-coffee dark:text-gold" size={30} />
        <p className="text-sm text-stone-500">Cargando paleta de colores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader
        title="Gestor de Colores"
        description="Personaliza la paleta de colores de Rose Coffee para modo claro y oscuro. Los cambios se aplican en tiempo real."
      />

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Mode tabs */}
        <div className="flex bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-1 rounded-xl gap-1 text-xs font-bold select-none">
          <button
            onClick={() => setActiveTab('light')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'light' ? 'bg-white dark:bg-stone-600 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <Sun size={14} />
            Modo Claro
          </button>
          <button
            onClick={() => setActiveTab('dark')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'dark' ? 'bg-white dark:bg-stone-600 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <Moon size={14} />
            Modo Oscuro
          </button>
        </div>

        {/* Live preview toggle */}
        <button
          onClick={() => setPreviewLive(p => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${previewLive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-gold/50'}`}
        >
          <Eye size={14} />
          {previewLive ? 'Preview activo' : 'Activar preview'}
        </button>

        <div className="flex-1" />

        {/* Reset */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-coffee dark:hover:text-gold hover:border-coffee/30 transition-all cursor-pointer bg-white dark:bg-stone-800"
        >
          <RotateCcw size={14} />
          Restaurar Defaults
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-coffee hover:bg-coffee-dark disabled:bg-stone-300 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Guardando...' : 'Guardar Paleta'}
        </button>
      </div>

      {/* Info banner */}
      {previewLive && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
          <Eye size={14} />
          Preview en vivo activo — los cambios se aplican instantáneamente en la página sin guardar.
        </div>
      )}

      {/* Color grid */}
      <div className="bg-white dark:bg-stone-800 border border-coffee/10 rounded-3xl p-6 shadow-2xs">
        <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-200 flex items-center gap-2 mb-5 pb-3 border-b border-stone-100 dark:border-stone-700">
          <Palette size={16} className="text-gold" />
          {activeTab === 'light' ? '☀️ Paleta Modo Claro' : '🌙 Paleta Modo Oscuro'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(DEFAULT_LIGHT).map((colorKey) => {
            const meta = COLOR_LABELS[colorKey];
            const currentValue = activeColors[colorKey] ?? '#000000';
            return (
              <div
                key={colorKey}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-stone-100 dark:border-stone-700 hover:border-gold/40 transition-all duration-200 hover:shadow-sm bg-stone-50/50 dark:bg-stone-900/30"
              >
                {/* Color swatch + picker */}
                <div className="relative shrink-0">
                  <div
                    className="w-14 h-14 rounded-xl border-2 border-white shadow-md cursor-pointer group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: currentValue }}
                  />
                  <input
                    type="color"
                    value={currentValue}
                    onChange={(e) => updateColor(activeTab, colorKey, e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-xl"
                    title={`Cambiar ${meta?.label}`}
                    aria-label={`Color picker para ${meta?.label}`}
                  />
                </div>

                {/* Info + text input */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-stone-800 dark:text-stone-200 truncate">{meta?.label}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5 mb-2 leading-snug">{meta?.description}</p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#([0-9A-Fa-f]{0,6})$/.test(val)) updateColor(activeTab, colorKey, val);
                      }}
                      maxLength={7}
                      className="w-24 text-xs font-mono px-2 py-1.5 border border-stone-200 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
                      aria-label={`Valor hex de ${meta?.label}`}
                    />
                    <span className="text-[9px] text-stone-400 font-mono">--color-{colorKey}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview section */}
      <div className="bg-white dark:bg-stone-800 border border-coffee/10 rounded-3xl p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-200 flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-700">
          <Eye size={16} className="text-gold" />
          Vista Previa de Componentes
        </h3>
        <div className="flex flex-wrap gap-3 items-center">
          <button className="px-5 py-2.5 bg-coffee text-white rounded-xl text-sm font-bold shadow-md">Botón Café</button>
          <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md">Botón Primario</button>
          <span className="px-3 py-1 bg-gold/20 text-gold border border-gold/30 rounded-full text-xs font-bold">Badge Dorado</span>
          <span className="px-3 py-1 bg-accent-red/10 text-accent-red border border-accent-red/20 rounded-full text-xs font-bold">Alerta</span>
          <span className="px-3 py-1 bg-accent-purple/10 text-accent-purple border border-accent-purple/20 rounded-full text-xs font-bold">Premium</span>
          <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue border border-accent-blue/20 rounded-full text-xs font-bold">Info</span>
        </div>
        <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--color-brand-base)' }}>
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Este panel usa el color <code className="text-xs font-mono bg-stone-100 dark:bg-stone-700 px-1.5 py-0.5 rounded">--color-brand-base</code> como fondo.</p>
        </div>
      </div>

    </div>
  );
}
