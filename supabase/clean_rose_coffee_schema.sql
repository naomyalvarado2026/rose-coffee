-- ==============================================================================
-- SCRIPT DE INICIALIZACIÓN Y LIMPIEZA DE BASE DE DATOS: ROSE COFFEE
-- COPIAR Y PEGAR ESTE CONTENIDO COMPLETO EN EL SQL EDITOR DE SUPABASE Y CORRERLO
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ELIMINAR TODAS LAS TABLAS OBSOLETAS DE LA IGLESIA Y ESQUEMAS PREVIOS
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS public.petition_categories CASCADE;
DROP TABLE IF EXISTS public.petitions CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.form_responses CASCADE;
DROP TABLE IF EXISTS public.logos CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.product_digital_assets CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.ar_target_mappings CASCADE;
DROP TABLE IF EXISTS public.ar_targets CASCADE;
DROP TABLE IF EXISTS public.product_ar_models CASCADE;
DROP TABLE IF EXISTS public.ar_experiences CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.service_areas CASCADE;
DROP TABLE IF EXISTS public.talents CASCADE;
DROP TABLE IF EXISTS public.spiritual_gifts CASCADE;
DROP TABLE IF EXISTS public.member_service_areas CASCADE;
DROP TABLE IF EXISTS public.member_talents CASCADE;
DROP TABLE IF EXISTS public.member_spiritual_gifts CASCADE;
DROP TABLE IF EXISTS public.member_emails CASCADE;
DROP TABLE IF EXISTS public.sermons CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.donation_categories CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.ministries CASCADE;
DROP TABLE IF EXISTS public.song_types CASCADE;
DROP TABLE IF EXISTS public.song_styles CASCADE;
DROP TABLE IF EXISTS public.songs CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.program_lessons CASCADE;
DROP TABLE IF EXISTS public.program_modules CASCADE;
DROP TABLE IF EXISTS public.catalog_roles CASCADE;
DROP TABLE IF EXISTS public.page_contents CASCADE;
DROP TABLE IF EXISTS public.careers CASCADE;
DROP TABLE IF EXISTS public.denominations CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.zones CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.cells CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.inventory_categories CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;
DROP TABLE IF EXISTS public.notification_logs CASCADE;
DROP TABLE IF EXISTS public.reading_plans CASCADE;
DROP TABLE IF EXISTS public.user_reading_progress CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_participants CASCADE;
DROP TABLE IF EXISTS public.church_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Desactivar el trigger anterior si existía para evitar colisiones
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ------------------------------------------------------------------------------
-- 2. RECREACIÓN DE LA TABLA DE PERFILES (PROFILES) SIMPLIFICADA
-- ------------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,
  email text,
  photo_url text,
  banned boolean DEFAULT false NOT NULL,
  role text DEFAULT 'customer' NOT NULL CHECK (role IN ('admin', 'customer', 'editor', 'staff')),
  permissions_override jsonb DEFAULT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. TABLA DE PERMISOS POR ROL (ROLE_PERMISSIONS)
-- ------------------------------------------------------------------------------
CREATE TABLE public.role_permissions (
  role text PRIMARY KEY CHECK (role IN ('admin', 'customer', 'editor', 'staff')),
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. TABLA DE MINISTERIOS (COMPATIBILIDAD CON FRONTEND COMPILADO)
-- ------------------------------------------------------------------------------
-- Esta tabla se mantiene únicamente para evitar que las queries en logos/media
-- fallen por falta de relación física.
CREATE TABLE public.ministries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  image_url text,
  theme_color varchar(7) DEFAULT '#8C5E58',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. TABLAS DEL E-COMMERCE (PRODUCTS, VARIANTS, DIGITAL ASSETS, ORDERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ar_experiences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('MODEL_3D', 'VIDEO_AR', 'MIXED_EXPERIENCE')),
  category text NOT NULL CHECK (category IN ('PRODUCT', 'VIDEO', 'ANIMATION')),
  preview_image text,
  model_url text,
  video_url text,
  scale jsonb DEFAULT '{"x": 1, "y": 1, "z": 1}'::jsonb,
  position jsonb DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,
  rotation text DEFAULT '0deg 0deg 0deg',
  animation_settings jsonb DEFAULT '{}'::jsonb,
  enabled boolean DEFAULT true,
  product_id uuid, -- FK added after products is created
  views_count integer DEFAULT 0,
  interaction_count integer DEFAULT 0,
  purchase_clicks_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  image_url text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category text NOT NULL DEFAULT 'café',
  type text DEFAULT 'physical' NOT NULL CHECK (type IN ('physical', 'digital')),
  features jsonb DEFAULT '[]'::jsonb,
  cover_image_url text,
  ar_model_url text,
  ar_poster_url text,
  ar_enabled boolean DEFAULT false NOT NULL,
  ar_experience_id uuid REFERENCES public.ar_experiences(id) ON DELETE SET NULL,
  deleted_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ar_experiences ADD CONSTRAINT ar_experiences_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

CREATE TABLE public.product_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  color_name text,
  color_hex text,
  size text,
  cloudinary_image_url text,
  stock integer DEFAULT 0 CHECK (stock >= 0),
  price_adjustment numeric(10, 2) DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.product_digital_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL UNIQUE,
  drive_link text NOT NULL,
  instructions text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  total numeric(10, 2) NOT NULL CHECK (total >= 0),
  status text DEFAULT 'pending_payment' NOT NULL CHECK (status IN ('pending_payment', 'paid', 'ready_for_pickup', 'completed', 'cancelled')),
  payment_method text DEFAULT 'card' NOT NULL,
  payment_voucher_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10, 2) NOT NULL CHECK (price >= 0)
);

-- ------------------------------------------------------------------------------
-- 6. OTRAS TABLAS AUXILIARES (LOGOS, CONTACTS, PAGES, FORM RESPONSES)
-- ------------------------------------------------------------------------------
CREATE TABLE public.logos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id uuid REFERENCES public.ministries(id) ON DELETE SET NULL, -- Se mantiene NULL por compatibilidad
  variant text NOT NULL CHECK (variant IN ('cuadrado', 'circular', 'vertical', 'horizontal')),
  color_mode text NOT NULL CHECK (color_mode IN ('color', 'blanco_y_negro', 'blanco_solido', 'negro_solido')),
  format varchar(10) NOT NULL,
  storage_path varchar(255) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text DEFAULT 'unread' NOT NULL CHECK (status IN ('unread', 'read')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.page_contents (
  id text PRIMARY KEY,
  page text NOT NULL,
  section text NOT NULL,
  name text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  content_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  section_type text NOT NULL DEFAULT 'custom',
  cover_image_url text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.form_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id text NOT NULL,
  page_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  member_name text,
  member_email text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  score integer DEFAULT 0,
  max_score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6.5. TABLAS DE INVENTARIO Y REALIDAD AUMENTADA (WEBAR)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category_id uuid REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  photo_url text,
  purchase_date date,
  product_link text,
  price numeric(10, 2) DEFAULT 0.00 NOT NULL,
  status text NOT NULL DEFAULT 'buen_estado' CHECK (status IN ('buen_estado', 'reparacion', 'critico')),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  description text,
  video_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_ar_models (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL UNIQUE,
  glb_url text NOT NULL,
  usdz_url text,
  ar_scale text DEFAULT 'fixed' CHECK (ar_scale IN ('fixed', 'auto')),
  shadow_intensity numeric(3,2) DEFAULT 1.0,
  xr_environment boolean DEFAULT true,
  auto_rotate boolean DEFAULT true,
  camera_controls boolean DEFAULT true,
  hotspots jsonb DEFAULT '[]'::jsonb,
  video_url text,
  video_target_material text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ar_targets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  mind_file_url text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ar_target_mappings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  target_id uuid REFERENCES public.ar_targets(id) ON DELETE CASCADE NOT NULL,
  target_index integer NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  video_url text,
  video_chromakey boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (target_id, target_index)
);

-- ------------------------------------------------------------------------------
-- 7. CONFIGURAR ROW LEVEL SECURITY (RLS) PARA TODAS LAS TABLAS
-- ------------------------------------------------------------------------------
-- Función helper con SECURITY DEFINER para romper recursión infinita en RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin' AND banned = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_digital_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ar_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_target_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_experiences ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: PROFILES
CREATE POLICY "Permitir lectura pública de perfiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de perfil propio" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Permitir actualización de perfil propio" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Permitir gestión de perfiles a administradores" ON public.profiles FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: ROLE_PERMISSIONS
CREATE POLICY "Permitir lectura pública de permisos de rol" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de permisos a administradores" ON public.role_permissions FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: MINISTRIES (COMPATIBILIDAD)
CREATE POLICY "Permitir lectura pública de sucursales" ON public.ministries FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de sucursales a administradores" ON public.ministries FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: PRODUCTS
CREATE POLICY "Permitir lectura pública de productos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de productos a administradores" ON public.products FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: PRODUCT_VARIANTS
CREATE POLICY "Permitir lectura pública de variantes" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de variantes a administradores" ON public.product_variants FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: PRODUCT_DIGITAL_ASSETS
CREATE POLICY "Líderes y dueños de órdenes pagadas pueden ver recursos" ON public.product_digital_assets
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      WHERE o.user_id = auth.uid() 
        AND oi.product_id = product_digital_assets.product_id
        AND o.status IN ('paid', 'ready_for_pickup', 'completed')
    )
  );
CREATE POLICY "Permitir gestión de recursos a administradores" ON public.product_digital_assets FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: ORDERS
CREATE POLICY "Permitir crear pedidos públicamente" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura de pedidos propios y admins" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin()
);
CREATE POLICY "Permitir actualización de pedidos propios y admins" ON public.orders FOR UPDATE USING (
  auth.uid() = user_id OR public.is_admin()
);
CREATE POLICY "Permitir eliminación de pedidos a administradores" ON public.orders FOR DELETE USING (
  public.is_admin()
);

-- POLÍTICAS: ORDER_ITEMS
CREATE POLICY "Permitir crear detalles de pedido públicamente" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura de detalles a dueños y admins" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id 
      AND (o.user_id = auth.uid() OR public.is_admin())
  )
);
CREATE POLICY "Permitir gestión de detalles a administradores" ON public.order_items FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: LOGOS
CREATE POLICY "Permitir lectura pública de logos" ON public.logos FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de logos a administradores" ON public.logos FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: CONTACT_MESSAGES
CREATE POLICY "Permitir enviar mensajes de contacto públicamente" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir gestión de mensajes de contacto a administradores" ON public.contact_messages FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: PAGE_CONTENTS
CREATE POLICY "Permitir lectura pública de contenidos de página" ON public.page_contents FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de contenidos de página a administradores" ON public.page_contents FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: FORM_RESPONSES
CREATE POLICY "Permitir inserción pública de respuestas" ON public.form_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir lectura de respuestas propias y admins" ON public.form_responses FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin()
);
CREATE POLICY "Permitir gestión de respuestas a administradores" ON public.form_responses FOR ALL USING (
  public.is_admin()
);

-- POLÍTICAS: INVENTORY_CATEGORIES
CREATE POLICY "Permitir lectura de categorías a usuarios autenticados" ON public.inventory_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Permitir gestión de categorías a personal autorizado" ON public.inventory_categories
  FOR ALL USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('editor', 'staff')
    )
  );

-- POLÍTICAS: INVENTORY_ITEMS
CREATE POLICY "Permitir lectura de inventario a personal autorizado" ON public.inventory_items
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor', 'staff')
    )
  );
CREATE POLICY "Permitir gestión de inventario a personal autorizado" ON public.inventory_items
  FOR ALL USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'editor'
    )
  );

-- POLÍTICAS: PRODUCT_AR_MODELS
CREATE POLICY "Permitir lectura pública de modelos AR" ON public.product_ar_models
  FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de modelos AR a administradores y editores" ON public.product_ar_models
  FOR ALL USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'editor'
    )
  );

-- POLÍTICAS: AR_TARGETS
CREATE POLICY "Permitir lectura pública de objetivos AR" ON public.ar_targets
  FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de objetivos AR a administradores y editores" ON public.ar_targets
  FOR ALL USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'editor'
    )
  );

-- POLÍTICAS: AR_TARGET_MAPPINGS
CREATE POLICY "Permitir lectura pública de mapeos AR" ON public.ar_target_mappings
  FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de mapeos AR a administradores y editores" ON public.ar_target_mappings
  FOR ALL USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'editor'
    )
  );

-- POLÍTICAS: AR_EXPERIENCES
CREATE POLICY "Permitir lectura pública de experiencias AR" ON public.ar_experiences
  FOR SELECT USING (true);
CREATE POLICY "Permitir gestión de experiencias AR a administradores y editores" ON public.ar_experiences
  FOR ALL USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'editor'
    )
  );

-- RPC: INCREMENTO DE MÉTRICAS AR
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

-- ------------------------------------------------------------------------------
-- 8. CARGAR SEMILLAS INICIALES (SEED DATA)
-- ------------------------------------------------------------------------------

-- Permisos por defecto
INSERT INTO public.role_permissions (role, permissions) VALUES
  ('admin', '{
    "dashboard": {"view": true, "edit": true},
    "pages": {"view": true, "edit": true},
    "products": {"view": true, "edit": true},
    "ar_manager": {"view": true, "edit": true},
    "logos": {"view": true, "edit": true},
    "users": {"view": true, "edit": true}
  }'::jsonb),
  ('customer', '{
    "dashboard": {"view": false, "edit": false},
    "pages": {"view": false, "edit": false},
    "products": {"view": false, "edit": false},
    "ar_manager": {"view": false, "edit": false},
    "logos": {"view": false, "edit": false},
    "users": {"view": false, "edit": false}
  }'::jsonb),
  ('editor', '{
    "dashboard": {"view": true, "edit": false},
    "pages": {"view": true, "edit": true},
    "products": {"view": true, "edit": true},
    "ar_manager": {"view": true, "edit": true},
    "logos": {"view": true, "edit": false},
    "users": {"view": false, "edit": false}
  }'::jsonb),
  ('staff', '{
    "dashboard": {"view": true, "edit": false},
    "pages": {"view": false, "edit": false},
    "products": {"view": true, "edit": false},
    "ar_manager": {"view": true, "edit": false},
    "logos": {"view": false, "edit": false},
    "users": {"view": false, "edit": false}
  }'::jsonb)
ON CONFLICT (role) DO UPDATE SET permissions = EXCLUDED.permissions;

-- Insertar categorías iniciales de inventario
INSERT INTO public.inventory_categories (name) VALUES
  ('Sonido'),
  ('Cocina'),
  ('Multimedia'),
  ('Herramientas'),
  ('Utensilios'),
  ('Mobiliario'),
  ('Instrumentos'),
  ('Otros')
ON CONFLICT (name) DO NOTHING;

-- Sucursal ficticia general (Para evitar errores en logos)
INSERT INTO public.ministries (id, name, image_url, theme_color)
VALUES ('00000000-0000-0000-0000-000000000000', 'Cafetería Principal', NULL, '#8C5E58')
ON CONFLICT (name) DO NOTHING;

-- Seed de productos para demostración de Rose Coffee
INSERT INTO public.products (id, name, description, price, image_url, stock, category, type, features, cover_image_url) VALUES
  (
    '11111111-1111-1111-1111-111111111111', 
    'Café de Especialidad Blend Rose', 
    'Un blend artesanal de altura de granos arábigos con notas de cata florales, caramelo y chocolate. Tostado localmente en lotes pequeños.', 
    14.50, 
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80', 
    100, 
    'café', 
    'physical', 
    '["Origen: Loja, Ecuador", "Altura: 1500msnm", "Proceso: Lavado", "Tueste: Medio"]'::jsonb, 
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1920&auto=format&fit=crop&q=80'
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'Pan de Masa Madre de Trigo Rústico', 
    'Pan tradicional hecho con masa madre natural y fermentación en frío de 24 horas. Crujiente por fuera, suave y alveolado por dentro.', 
    6.00, 
    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&auto=format&fit=crop&q=80', 
    25, 
    'panadería', 
    'physical', 
    '["Ingredientes: Harina orgánica, agua, sal de mar, masa madre", "Peso: 750g", "Alérgenos: Contiene gluten"]'::jsonb, 
    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=1920&auto=format&fit=crop&q=80'
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    'Guía Completa de Panadería con Masa Madre (Ebook)', 
    'Ebook digital interactivo con todos los secretos de Rose Coffee para alimentar tu masa madre madre, hornear tu primer pan e instrucciones detalladas con video.', 
    12.00, 
    'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=800&auto=format&fit=crop&q=80', 
    9999, 
    'recursos', 
    'digital', 
    '["Formato: PDF interactivo + Acceso a Videos", "Páginas: 84", "Idioma: Español"]'::jsonb, 
    'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=1920&auto=format&fit=crop&q=80'
  )
ON CONFLICT (id) DO NOTHING;

-- Enlace digital para el producto digital (recetas/ebook)
INSERT INTO public.product_digital_assets (product_id, drive_link, instructions)
VALUES (
  '33333333-3333-3333-3333-333333333333', 
  'https://drive.google.com/file/d/example-rose-coffee-ebook/view?usp=sharing', 
  '¡Gracias por tu compra! Haz clic en el enlace para descargar tu Ebook. Guarda tu comprobante y revisa la sección "Mis Compras" en tu cuenta.'
)
ON CONFLICT (product_id) DO NOTHING;

-- Asignar el rol 'admin' a los superusuarios especificados (Esteban y Naomy)
-- Se ejecuta dinámicamente buscando por ID o por email para evitar FK violations
DO $$
DECLARE
  esteban_id uuid;
  naomy_id uuid;
BEGIN
  -- 1. Promover a Esteban por ID
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = '2e523d97-61c5-45b5-a424-938be3dddd67') THEN
    INSERT INTO public.profiles (id, email, role, first_name, last_name)
    VALUES ('2e523d97-61c5-45b5-a424-938be3dddd67', 'estebanico10@gmail.com', 'admin', 'Esteban', '')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;

  -- 2. Promover a Naomy por Email
  SELECT id INTO naomy_id FROM auth.users WHERE email = 'naomyalvarado.2026@gmail.com';
  IF naomy_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, role, first_name, last_name)
    VALUES (naomy_id, 'naomyalvarado.2026@gmail.com', 'admin', 'Naomy', 'Alvarado')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 9. BUCKETS DE ALMACENAMIENTO (PRODUCTS, RECEIPTS, LOGOS)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('products', 'products', true),
  ('receipts', 'receipts', true),
  ('logos', 'logos', true),
  ('product-models', 'product-models', true),
  ('inventory', 'inventory', true)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas viejas si existen
DROP POLICY IF EXISTS "Cualquiera puede leer imágenes de productos" ON storage.objects;
DROP POLICY IF EXISTS "Admins pueden subir imágenes de productos" ON storage.objects;
DROP POLICY IF EXISTS "Admins pueden actualizar/eliminar imágenes de productos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública de comprobantes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subir comprobantes públicamente" ON storage.objects;
DROP POLICY IF EXISTS "Permitir gestión de comprobantes a administradores" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública de logos en storage" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subir logos a administradores" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizar/eliminar logos a administradores" ON storage.objects;
DROP POLICY IF EXISTS "Permitir acceso de lectura pública a modelos AR" ON storage.objects;
DROP POLICY IF EXISTS "Permitir inserción de modelos AR a administradores" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización de modelos AR a administradores" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación de modelos AR a administradores" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública de fotos de inventario en storage" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subir fotos de inventario a autorizados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizar/eliminar fotos de inventario a autorizados" ON storage.objects;

-- Crear políticas para "products"
CREATE POLICY "Cualquiera puede leer imágenes de productos" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Admins pueden subir imágenes de productos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products' AND public.is_admin());
CREATE POLICY "Admins pueden actualizar/eliminar imágenes de productos" ON storage.objects
  FOR ALL USING (bucket_id = 'products' AND public.is_admin());

-- Crear políticas para "receipts"
CREATE POLICY "Permitir lectura pública de comprobantes" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts');
CREATE POLICY "Permitir subir comprobantes públicamente" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts');
CREATE POLICY "Permitir gestión de comprobantes a administradores" ON storage.objects
  FOR ALL USING (bucket_id = 'receipts' AND public.is_admin());

-- Crear políticas para "logos"
CREATE POLICY "Permitir lectura pública de logos en storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Permitir subir logos a administradores" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos' AND public.is_admin());
CREATE POLICY "Permitir actualizar/eliminar logos a administradores" ON storage.objects
  FOR ALL USING (bucket_id = 'logos' AND public.is_admin());

-- Crear políticas para "product-models"
CREATE POLICY "Permitir acceso de lectura pública a modelos AR" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-models');
CREATE POLICY "Permitir inserción de modelos AR a administradores" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-models' AND (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'editor'
  )));
CREATE POLICY "Permitir actualización de modelos AR a administradores" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-models' AND (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'editor'
  )));
CREATE POLICY "Permitir eliminación de modelos AR a administradores" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-models' AND (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'editor'
  )));

-- Crear políticas para "inventory"
CREATE POLICY "Permitir lectura pública de fotos de inventario en storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'inventory');
CREATE POLICY "Permitir subir fotos de inventario a autorizados" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'inventory' AND (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('editor', 'staff')
  )));
CREATE POLICY "Permitir actualizar/eliminar fotos de inventario a autorizados" ON storage.objects
  FOR ALL USING (bucket_id = 'inventory' AND (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('editor', 'staff')
  )));

-- ------------------------------------------------------------------------------
-- 10. TRIGGER PARA CREACIÓN AUTOMÁTICA DE PERFIL (AUTH SIGN-UP)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role, banned)
  VALUES (
    new.id, 
    coalesce(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'given_name'), 
    coalesce(new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'family_name'), 
    new.email,
    'customer',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sincronizar perfiles para usuarios de auth.users existentes que no tengan perfil
INSERT INTO public.profiles (id, first_name, last_name, email, role, banned)
SELECT 
  id,
  coalesce(raw_user_meta_data->>'first_name', raw_user_meta_data->>'given_name'),
  coalesce(raw_user_meta_data->>'last_name', raw_user_meta_data->>'family_name'),
  email,
  'customer',
  false
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 11. FUNCIONES RPC ADMINISTRATIVAS (BORRADO SEGURO DE USUARIOS)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validar que el usuario que invoca la función (auth.uid()) sea un administrador activo
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Operación denegada. Solo los administradores pueden eliminar usuarios.';
  END IF;

  -- Eliminar de la tabla pública de perfiles
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Eliminar de la tabla interna de autenticación (auth.users)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
