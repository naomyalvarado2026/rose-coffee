-- Migración para crear la tabla de Blogs en Rose Coffee
-- 1. Crear Tabla blogs
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT NOT NULL UNIQUE,
  cover_image_url TEXT,
  category TEXT DEFAULT 'Café de Especialidad' NOT NULL,
  blocks JSONB DEFAULT '[]'::jsonb NOT NULL,
  published BOOLEAN DEFAULT false NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear Trigger para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION public.update_blogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_blogs_update_updated_at ON public.blogs;
CREATE TRIGGER tr_blogs_update_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blogs_updated_at();

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas RLS
-- Lectura pública para blogs publicados
DROP POLICY IF EXISTS "Permitir lectura pública de blogs publicados" ON public.blogs;
CREATE POLICY "Permitir lectura pública de blogs publicados" 
  ON public.blogs FOR SELECT 
  USING (published = true);

-- Lectura completa de todos los blogs para administradores
DROP POLICY IF EXISTS "Permitir lectura completa a administradores" ON public.blogs;
CREATE POLICY "Permitir lectura completa a administradores"
  ON public.blogs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Escritura completa (CRUD) para administradores
DROP POLICY IF EXISTS "Permitir escritura de blogs a administradores" ON public.blogs;
CREATE POLICY "Permitir escritura de blogs a administradores" 
  ON public.blogs FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Insertar datos semilla iniciales de demostración
INSERT INTO public.blogs (title, subtitle, slug, cover_image_url, category, blocks, published)
VALUES
(
  'El Arte de la Masa Madre: Todo lo que debes saber',
  'Descubre por qué la fermentación natural de masa madre hace que nuestro pan sea único, saludable y delicioso.',
  'el-arte-de-la-masa-madre',
  'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=1200',
  'Panadería Artesanal',
  '[
    {"id": "block-1", "type": "text", "content": {"text": "<h2>¿Qué es realmente la Masa Madre?</h2><p>La masa madre es un cultivo simbiótico de levaduras silvestres y bacterias lácticas (principalmente lactobacilos) que se originan de forma natural en la harina y el agua. A diferencia del pan comercial elaborado con levadura química o industrial, la masa madre no requiere de aditivos para fermentar.</p><p>En <strong>Rose Coffee</strong>, alimentamos diariamente nuestra masa madre (a la que llamamos con su propio carácter) para asegurar que el pan tenga el alveolado perfecto, una corteza crujiente y esa acidez característica tan balanceada y sutil.</p>"}},
    {"id": "block-2", "type": "image", "content": {"url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800", "alt": "Harina y pan artesanal", "alignment": "center", "size": "medium", "caption": "Harina de fuerza premium seleccionada para nuestro pan de masa madre."}},
    {"id": "block-3", "type": "true_false", "content": {"statement": "¿La fermentación de masa madre dura generalmente más de 12 horas en Rose Coffee?", "isTrue": true, "explanation": "¡Correcto! En Rose Coffee realizamos fermentaciones en frío de entre 16 y 24 horas. Este largo proceso descompone el gluten y los fitatos, haciendo que el pan sea mucho más fácil de digerir."}},
    {"id": "block-4", "type": "text", "content": {"text": "<h2>Los 3 Beneficios Principales para tu Salud</h2><ol><li><strong>Mayor digestibilidad:</strong> La fermentación prolongada predigiere los almidones y reduce la presencia de gluten.</li><li><strong>Bajo índice glucémico:</strong> Los ácidos orgánicos producidos ralentizan la liberación de glucosa en el torrente sanguíneo.</li><li><strong>Mejor absorción de nutrientes:</strong> Los lactobacilos neutralizan el ácido fítico, liberando minerales esenciales como hierro, zinc y magnesio.</li></ol>"}},
    {"id": "block-5", "type": "question", "content": {"question": "¿Cuál de las siguientes bacterias es la responsable de la acidez láctica beneficiosa en el pan de masa madre?", "options": ["Saccharomyces cerevisiae", "Lactobacillus sanfranciscensis", "Escherichia coli"], "correctAnswerIndex": 1, "explanation": "Lactobacillus sanfranciscensis es la bacteria láctica que fermenta junto a las levaduras silvestres, creando los ácidos láctico y acético que le otorgan su incomparable sabor y textura."}}
  ]'::jsonb,
  true
),
(
  'Guía de Barismo: Los Métodos de Filtrado en Rose Coffee',
  'De la prensa francesa al V60. Te enseñamos a extraer cada nota de sabor de nuestros granos de especialidad.',
  'guia-metodos-filtrado',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200',
  'Café de Especialidad',
  '[
    {"id": "block-1", "type": "text", "content": {"text": "<h2>El V60: El método del vertido preciso</h2><p>El V60 es uno de los métodos de goteo (pour-over) más populares del mundo. Su nombre proviene de su ángulo de 60 grados y los vectores en espiral dentro del cono, que ayudan al flujo de agua y la liberación de gases del café.</p><p>Este método resalta los sabores frutales, florales y cítricos de los cafés de especialidad de origen único con cuerpo ligero y limpio.</p>"}},
    {"id": "block-2", "type": "image", "content": {"url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800", "alt": "Método de filtrado V60", "alignment": "center", "size": "medium", "caption": "Un barismo de precisión requiere medir la temperatura, tiempo y peso."}},
    {"id": "block-3", "type": "question", "content": {"question": "¿Qué temperatura de agua es ideal para una correcta extracción en un método filtrado V60?", "options": ["100°C (Hirviendo)", "90°C a 94°C", "70°C a 75°C"], "correctAnswerIndex": 1, "explanation": "Entre 90°C y 94°C es la temperatura ideal. Si usas agua hirviendo, puedes quemar el café y extraer notas amargas; si está muy fría, el café quedará sub-extraído y aguado."}},
    {"id": "block-4", "type": "text", "content": {"text": "<h2>Chemex y Prensa Francesa</h2><p>Mientras que la Chemex utiliza un filtro de papel más grueso que retiene los aceites y sedimentos dando una taza extremadamente limpia, la Prensa Francesa utiliza un filtro de malla metálica que permite que todos los aceites pasen a la taza, resultando en un cuerpo robusto, denso y con mucho peso en boca.</p>"}},
    {"id": "block-5", "type": "true_false", "content": {"statement": "¿La Chemex produce un café con cuerpo más pesado que la Prensa Francesa?", "isTrue": false, "explanation": "¡Falso! Al contrario, el filtro grueso de la Chemex retiene los aceites y compuestos amargos, produciendo una taza súper limpia y ligera. La Prensa Francesa da el cuerpo más pesado."}}
  ]'::jsonb,
  true
)
ON CONFLICT (slug) DO NOTHING;
