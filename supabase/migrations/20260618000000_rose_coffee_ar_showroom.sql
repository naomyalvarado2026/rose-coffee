-- Migración para Rose Coffee AR Showroom
-- 1. Crear Enums si no existen
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ar_experience_type') THEN
        CREATE TYPE public.ar_experience_type AS ENUM ('MODEL_3D', 'VIDEO_AR', 'MIXED_EXPERIENCE');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ar_experience_category') THEN
        CREATE TYPE public.ar_experience_category AS ENUM ('PRODUCT', 'VIDEO', 'ANIMATION');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Crear Tabla ar_experiences
CREATE TABLE IF NOT EXISTS public.ar_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type public.ar_experience_type NOT NULL,
  category public.ar_experience_category NOT NULL,
  preview_image TEXT,
  model_url TEXT,
  video_url TEXT,
  scale JSONB DEFAULT '{"x": 1, "y": 1, "z": 1}'::jsonb,
  position JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,
  rotation TEXT DEFAULT '0deg 0deg 0deg',
  animation_settings JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN DEFAULT true,
  product_id UUID,
  views_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  purchase_clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Actualizar la Tabla products para soportar enlace a experiencias AR
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='ar_enabled') THEN
    ALTER TABLE public.products ADD COLUMN ar_enabled BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='ar_experience_id') THEN
    ALTER TABLE public.products ADD COLUMN ar_experience_id UUID REFERENCES public.ar_experiences(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Añadir FK a ar_experiences si no existiera
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ar_experiences_product_id_fkey'
  ) THEN
    ALTER TABLE public.ar_experiences 
    ADD CONSTRAINT ar_experiences_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. RLS para ar_experiences
ALTER TABLE public.ar_experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública de experiencias AR" ON public.ar_experiences;
CREATE POLICY "Permitir lectura pública de experiencias AR" 
  ON public.ar_experiences FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir escritura de experiencias AR a administradores" ON public.ar_experiences;
CREATE POLICY "Permitir escritura de experiencias AR a administradores" 
  ON public.ar_experiences FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. RPC para incremento seguro de métricas analíticas (desde el lado público)
CREATE OR REPLACE FUNCTION public.increment_ar_metric(experience_id UUID, metric_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF metric_name = 'views' THEN
    UPDATE public.ar_experiences
    SET views_count = views_count + 1
    WHERE id = experience_id;
  ELSIF metric_name = 'interactions' THEN
    UPDATE public.ar_experiences
    SET interaction_count = interaction_count + 1
    WHERE id = experience_id;
  ELSIF metric_name = 'purchases' THEN
    UPDATE public.ar_experiences
    SET purchase_clicks_count = purchase_clicks_count + 1
    WHERE id = experience_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_ar_metric(UUID, TEXT) TO anon, authenticated;
