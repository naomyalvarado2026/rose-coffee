-- Migración para WebAR en Rose Coffee

-- 1. Tabla para modelos 3D asociados a productos
CREATE TABLE IF NOT EXISTS public.product_ar_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL UNIQUE,
  glb_url TEXT NOT NULL,
  usdz_url TEXT,
  ar_scale TEXT DEFAULT 'fixed' CHECK (ar_scale IN ('fixed', 'auto')),
  shadow_intensity NUMERIC(3,2) DEFAULT 1.0,
  xr_environment BOOLEAN DEFAULT true,
  auto_rotate BOOLEAN DEFAULT true,
  camera_controls BOOLEAN DEFAULT true,
  hotspots JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  video_target_material TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para product_ar_models
ALTER TABLE public.product_ar_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública de modelos AR" ON public.product_ar_models;
CREATE POLICY "Permitir lectura pública de modelos AR" 
  ON public.product_ar_models FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir escritura de modelos AR a administradores" ON public.product_ar_models;
CREATE POLICY "Permitir escritura de modelos AR a administradores" 
  ON public.product_ar_models FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Tabla para archivos de objetivos de MindAR (.mind)
CREATE TABLE IF NOT EXISTS public.ar_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mind_file_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para ar_targets
ALTER TABLE public.ar_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública de objetivos AR" ON public.ar_targets;
CREATE POLICY "Permitir lectura pública de objetivos AR" 
  ON public.ar_targets FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir escritura de objetivos AR a administradores" ON public.ar_targets;
CREATE POLICY "Permitir escritura de objetivos AR a administradores" 
  ON public.ar_targets FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Tabla de mapeos de marcadores a productos o videos interactivos
CREATE TABLE IF NOT EXISTS public.ar_target_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id UUID REFERENCES public.ar_targets(id) ON DELETE CASCADE NOT NULL,
  target_index INTEGER NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  video_url TEXT,
  video_chromakey BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (target_id, target_index)
);

-- RLS para ar_target_mappings
ALTER TABLE public.ar_target_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura pública de mapeos AR" ON public.ar_target_mappings;
CREATE POLICY "Permitir lectura pública de mapeos AR" 
  ON public.ar_target_mappings FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Permitir escritura de mapeos AR a administradores" ON public.ar_target_mappings;
CREATE POLICY "Permitir escritura de mapeos AR a administradores" 
  ON public.ar_target_mappings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Crear bucket de storage para modelos y marcadores AR
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-models', 'product-models', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas RLS para el bucket 'product-models' en storage.objects
DROP POLICY IF EXISTS "Permitir acceso de lectura pública a modelos AR" ON storage.objects;
CREATE POLICY "Permitir acceso de lectura pública a modelos AR"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-models');

DROP POLICY IF EXISTS "Permitir inserción de modelos AR a administradores" ON storage.objects;
CREATE POLICY "Permitir inserción de modelos AR a administradores"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-models'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Permitir actualización de modelos AR a administradores" ON storage.objects;
CREATE POLICY "Permitir actualización de modelos AR a administradores"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-models'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Permitir eliminación de modelos AR a administradores" ON storage.objects;
CREATE POLICY "Permitir eliminación de modelos AR a administradores"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-models'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
