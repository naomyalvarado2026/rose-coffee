import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { motion } from 'framer-motion';
import { Search, Calendar, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import type { Blog } from '../../types';

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBlogs(data || []);
      } catch (err: any) {
        console.error('Error fetching blogs:', err);
        // Fallback local
        setBlogs(MOCK_BLOGS);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Obtener categorías únicas dinámicamente
  const categories = ['Todos', ...Array.from(new Set(blogs.map(b => b.category)))];

  // Filtrado reactivo de blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (blog.subtitle && blog.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todos' || blog.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#faf2e7]/40 text-stone-850 select-none">
      
      {/* Decorative Orbs (Premium Look) */}
      <div className="absolute top-[120px] left-0 w-[400px] h-[400px] bg-coffee/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-[400px] right-0 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-r from-[#021a54] to-[#010c27] text-white py-20 px-4 md:px-8 text-center overflow-hidden">
        {/* Animated flow line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold/10 via-gold/60 to-gold/10" />
        
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs font-bold uppercase tracking-wider mb-2"
          >
            <Sparkles size={12} className="animate-spin-slow" />
            <span>Bitácora de Especialidad</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl md:text-5xl font-sans font-black tracking-tight"
          >
            El Blog de <span className="text-gold">Rose Coffee</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-stone-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed"
          >
            Acompáñanos a explorar los secretos del pan artesanal de masa madre, las técnicas profesionales de barismo, recetas exclusivas de nuestra barra y la cultura cafetera que amamos.
          </motion.p>
        </div>
      </section>

      {/* Filter and Search Bar Container */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 -mt-8 relative z-25">
        <div className="bg-white/90 backdrop-blur-md border border-coffee/10 rounded-2xl p-4 md:p-6 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Categorías (Pestañas) */}
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none snap-x">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap snap-center cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-coffee text-white shadow-xxs border border-coffee'
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-stone-700 border border-stone-200/60'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search size={16} />
            </span>
            <input
              id="blog-search"
              name="blog-search"
              type="text"
              placeholder="Buscar artículo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-gold outline-none rounded-xl text-xs font-medium transition-all"
            />
          </div>

        </div>
      </section>

      {/* Grid List Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
        {loading ? (
          <div className="py-20 text-center text-stone-550">
            <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-coffee mx-auto mb-3"></div>
            <p className="text-xs font-bold uppercase tracking-wider">Cargando la bitácora de Rose Coffee...</p>
          </div>
        ) : filteredBlogs.length > 0 ? (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredBlogs.map((blog) => (
              <motion.article
                key={blog.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="bg-white border border-coffee/10 rounded-3xl overflow-hidden hover:border-gold/30 hover:-translate-y-1.5 transition-all duration-300 shadow-xxs flex flex-col group h-full"
              >
                {/* Imagen de Portada */}
                <Link to={`/blog/${blog.slug}`} className="relative block overflow-hidden aspect-video bg-stone-100 shrink-0">
                  {blog.cover_image_url ? (
                    <img
                      src={blog.cover_image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <BookOpen size={48} className="stroke-[1.2] opacity-50" />
                    </div>
                  )}
                  {/* Categoría Tag */}
                  <span className="absolute top-4 left-4 bg-primary/90 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 shadow-xxs">
                    {blog.category}
                  </span>
                </Link>

                {/* Contenido de la Tarjeta */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold uppercase tracking-wider mb-2.5">
                    <Calendar size={12} />
                    <span>{new Date(blog.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>

                  <h2 className="text-lg font-sans font-extrabold text-primary mb-2 line-clamp-2 leading-snug group-hover:text-coffee transition-colors">
                    <Link to={`/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h2>

                  <p className="text-stone-550 text-xs leading-relaxed line-clamp-3 mb-6 font-medium">
                    {blog.subtitle || 'Entra y descubre toda la información que hemos preparado para ti sobre este tema.'}
                  </p>

                  <div className="mt-auto pt-4 border-t border-stone-50">
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-black text-coffee hover:text-coffee-dark transition-colors"
                    >
                      <span>Leer Artículo</span>
                      <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        ) : (
          <div className="bg-white border border-coffee/10 rounded-3xl p-16 text-center shadow-xxs max-w-xl mx-auto">
            <BookOpen className="h-12 w-12 mx-auto text-stone-300 mb-3" />
            <h3 className="text-base font-bold text-primary uppercase tracking-wider">No se encontraron artículos</h3>
            <p className="text-xs text-stone-500 mt-1">
              Prueba modificando los filtros de categoría o buscando un término diferente.
            </p>
          </div>
        )}
      </section>

    </div>
  );
}

// Datos semilla de demostración si la base de datos no está disponible
const MOCK_BLOGS: Blog[] = [
  {
    id: 'mock-1',
    title: 'El Arte de la Masa Madre: Todo lo que debes saber',
    subtitle: 'Descubre por qué la fermentación natural de masa madre hace que nuestro pan sea único, saludable y delicioso.',
    slug: 'el-arte-de-la-masa-madre',
    cover_image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=1200',
    category: 'Panadería Artesanal',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    blocks: []
  },
  {
    id: 'mock-2',
    title: 'Guía de Barismo: Los Métodos de Filtrado en Rose Coffee',
    subtitle: 'De la prensa francesa al V60. Te enseñamos a extraer cada nota de sabor de nuestros granos de especialidad.',
    slug: 'guia-metodos-filtrado',
    cover_image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200',
    category: 'Café de Especialidad',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    blocks: []
  }
];
