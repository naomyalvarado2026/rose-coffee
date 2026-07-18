-- =======================================================
-- MIGRACIÓN: TABLA site_config PARA CONFIGURACIÓN GLOBAL
-- Usar para almacenar colores del tema, configuraciones de UI, etc.
-- EJECUTAR EN EL SQL EDITOR DE SUPABASE
-- =======================================================

CREATE TABLE IF NOT EXISTS public.site_config (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: lectura pública, escritura solo admins
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_config_public_read" ON public.site_config;
CREATE POLICY "site_config_public_read"
  ON public.site_config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "site_config_admin_write" ON public.site_config;
CREATE POLICY "site_config_admin_write"
  ON public.site_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Valores por defecto para colores del tema (modo claro)
INSERT INTO public.site_config (key, value) VALUES (
  'theme_colors_light',
  '{
    "brand-base": "#faf2e7",
    "primary": "#021a54",
    "coffee": "#6b3a0e",
    "coffee-dark": "#4d2607",
    "gold": "#c8922a",
    "cream": "#fdf6ee",
    "warm-stone": "#f5ebe0",
    "accent-red": "#DC2626",
    "accent-purple": "#7C3AED",
    "accent-blue": "#0EA5E9"
  }'
) ON CONFLICT (key) DO NOTHING;

-- Valores por defecto para colores del tema (modo oscuro)
INSERT INTO public.site_config (key, value) VALUES (
  'theme_colors_dark',
  '{
    "brand-base": "#0c0a09",
    "primary": "#021a54",
    "coffee": "#8b5e3c",
    "coffee-dark": "#6b3a0e",
    "gold": "#d4a843",
    "cream": "#1c1917",
    "warm-stone": "#292524",
    "accent-red": "#EF4444",
    "accent-purple": "#A855F7",
    "accent-blue": "#38BDF8"
  }'
) ON CONFLICT (key) DO NOTHING;
