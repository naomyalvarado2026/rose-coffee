-- =======================================================
-- SQL MIGRATION: SEMILLADO DE CONTENIDO DE PÁGINAS ROSE COFFEE
-- COPIAR Y PEGAR EN EL SQL EDITOR DE SUPABASE O EJECUTAR LOCALMENTE
-- =======================================================

-- 1. Limpiar page_contents de placeholders antiguos
DELETE FROM public.page_contents WHERE page IN ('home', 'about', 'store', 'contact');

-- 2. Semillar secciones de Inicio (Home)
INSERT INTO public.page_contents (id, page, section, name, order_index, section_type, title, subtitle, cover_image_url, content_blocks)
VALUES
  ('home_hero', 'home', 'hero', 'Sección Principal (Héroe)', 10, 'custom', 'El Café y Pan con Alma Artesanal', 'Café de especialidad recién tostado y panes de masa madre de fermentación natural en Milagro, Ecuador.', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&auto=format&fit=crop&q=80', '[]'::jsonb),
  ('home_welcome', 'home', 'welcome', 'Nuestros Pilares (4 Valores)', 20, 'custom', 'Nuestros Pilares', 'Calidad artesanal, procesos naturales, comercio justo y tecnología interactiva.', NULL, '[]'::jsonb),
  ('home_schedules', 'home', 'schedules', 'Horarios de Atención', 30, 'system_schedules', 'Horarios de Atención', 'Visítanos en nuestra cafetería y panadería física para probar el sabor fresco del día.', NULL, '[]'::jsonb),
  ('home_events', 'home', 'events', 'Próximas Catas', 40, 'system_events', 'Próximas Catas', 'Cursos de barismo, catas guiadas y eventos gastronómicos especiales en Milagro.', NULL, '[]'::jsonb),
  ('home_sermons', 'home', 'sermons', 'Artículos del Blog', 50, 'system_sermons', 'Artículos del Blog', 'Secretos del pan de masa madre, métodos de filtrado de café y recetas exclusivas.', NULL, '[]'::jsonb),
  ('home_birthdays', 'home', 'birthdays', 'Clientes Destacados', 60, 'system_birthdays', 'Rose Club Members', 'Nuestros clientes más leales del mes y sus opiniones.', NULL, '[]'::jsonb),
  ('home_donations', 'home', 'donations', 'Membresías / Club', 70, 'custom', 'Únete al Club de Café', 'Recibe granos seleccionados directamente en tu casa y obtén beneficios en todas tus compras.', NULL, '[]'::jsonb),
  ('home_gallery', 'home', 'gallery', 'Galería de Imágenes', 55, 'system_gallery', 'Nuestra Comunidad en Imágenes', 'Descubre momentos de preparación, baristas en acción y sonrisas en Rose Coffee.', NULL, '[
    {"id": "slide_1", "url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=1200", "caption": "Extracción de espresso perfecta en máquina profesional"},
    {"id": "slide_2", "url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200", "caption": "Amasado y preformado a mano de panes de masa madre"},
    {"id": "slide_3", "url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200", "caption": "Disfruta de un ambiente cálido y acogedor en Milagro"}
  ]'::jsonb);

-- 3. Semillar secciones de Nosotros (About)
INSERT INTO public.page_contents (id, page, section, name, order_index, section_type, title, subtitle, cover_image_url, content_blocks)
VALUES
  ('about_hero', 'about', 'hero', 'Héroe Principal', 10, 'custom', 'Quiénes Somos', 'La historia de pasión por el café de especialidad y la fermentación natural de masa madre en Milagro, Ecuador.', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&auto=format&fit=crop&q=80', '[]'::jsonb),
  ('about_vision_mission', 'about', 'vision_mission', 'Misión y Visión', 20, 'custom', 'Misión & Visión', 'Nuestros objetivos y compromiso de calidad artesanal.', NULL, '[]'::jsonb),
  ('about_history', 'about', 'history', 'Nuestra Historia', 30, 'custom', 'Nuestra Historia', 'El camino de experimentación y dedicación que dio vida a Rose Coffee.', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&auto=format&fit=crop&q=80', '[]'::jsonb),
  ('about_pillars', 'about', 'pillars', 'Nuestros Pilares Artesanales', 40, 'system_about_pillars', 'Nuestros Pilares Artesanales', 'Criterios de calidad que respaldan cada uno de nuestros productos.', NULL, '[]'::jsonb),
  ('about_pastoral', 'about', 'pastoral', 'El Equipo', 50, 'custom', 'El Equipo', 'Las manos e ingenio detrás de Rose Coffee.', NULL, '[
    {
      "id": "block-esteban",
      "type": "image",
      "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
      "imageAlign": "left",
      "imageCaption": "Esteban Alarcón",
      "imageText": "Fundador & Panadero. Esteban es el encargado de alimentar nuestra masa madre centenaria y hornear los panes rústicos todos los días."
    },
    {
      "id": "block-naomy",
      "type": "image",
      "imageUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
      "imageAlign": "left",
      "imageCaption": "Naomy Alvarado",
      "imageText": "Co-fundadora & Barista. Sommelier y experta en barismo. Define los perfiles de tueste y las curvas de extracción de nuestros granos."
    }
  ]'::jsonb);

-- 4. Semillar secciones de Tienda (Store)
INSERT INTO public.page_contents (id, page, section, name, order_index, section_type, title, subtitle, cover_image_url, content_blocks)
VALUES
  ('store_hero', 'store', 'hero', 'Banner Principal (Héroe)', 10, 'custom', 'Nuestra Tienda', 'Selección premium de café de especialidad de origen Zaruma y panes de masa madre de fermentación natural. Visualiza los modelos en Realidad Aumentada (AR) 3D interactiva en tu propio espacio.', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1920&auto=format&fit=crop&q=80', '[]'::jsonb);

-- 5. Semillar secciones de Contacto (Contact)
INSERT INTO public.page_contents (id, page, section, name, order_index, section_type, title, subtitle, cover_image_url, content_blocks)
VALUES
  ('contact_hero', 'contact', 'hero', 'Cabecera Principal (Héroe)', 10, 'custom', 'Contacto', '¿Tienes dudas sobre nuestros productos, envíos o deseas hacernos alguna consulta? Ponte en contacto con nosotros, estamos para atenderte.', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&auto=format&fit=crop&q=80', '[]'::jsonb);
