import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { BookOpen, Plus, Globe } from 'lucide-react';
import { toast } from 'sonner';
import type { Blog } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { BlogList } from '../../components/admin/blog/BlogList';
import { BlogEditor } from '../../components/admin/blog/BlogEditor';

export default function BlogManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Partial<Blog> | null>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setBlogs(data || []);
    } catch (err: any) {
      console.error('Error al cargar blogs:', err);
      toast.error('No se pudieron cargar los artículos');
      setBlogs(MOCK_BLOGS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentBlog({
      title: '',
      slug: '',
      blocks: [],
      published: false,
      category: 'Café de Especialidad'
    });
    setIsEditing(true);
  };

  const handleEdit = (blog: Blog) => {
    setCurrentBlog(blog);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Artículo eliminado correctamente');
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      console.error('Error al eliminar:', err);
      toast.error('Error al eliminar: ' + err.message);
      setBlogs(prev => prev.filter(b => b.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (blog: Blog) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ published: !blog.published })
        .eq('id', blog.id);

      if (error) throw error;
      
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, published: !b.published } : b));
      toast.success(blog.published ? 'Artículo oculto' : 'Artículo publicado');
    } catch (err: any) {
      console.error('Error:', err);
      toast.error('Error al actualizar estado');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBlog || !currentBlog.title || !currentBlog.slug) {
      toast.error('El título y la URL (Slug) son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      const isNew = !currentBlog.id;
      
      const blogData = {
        title: currentBlog.title,
        subtitle: currentBlog.subtitle || null,
        slug: currentBlog.slug,
        cover_image_url: currentBlog.cover_image_url || null,
        category: currentBlog.category || 'Café de Especialidad',
        blocks: currentBlog.blocks || [],
        published: !!currentBlog.published,
        author_id: currentBlog.author_id || user?.id || null,
        updated_at: new Date().toISOString()
      };

      if (isNew) {
        const { error } = await supabase
          .from('blogs')
          .insert([blogData]);
        if (error) throw error;
        toast.success('Artículo creado con éxito');
      } else {
        const { error } = await supabase
          .from('blogs')
          .update(blogData)
          .eq('id', currentBlog.id);
        if (error) throw error;
        toast.success('Artículo guardado correctamente');
      }

      setIsEditing(false);
      setCurrentBlog(null);
      loadBlogs();
    } catch (err: any) {
      console.error('Error al guardar blog:', err);
      toast.error('Error al guardar en base de datos: ' + err.message);
      
      const isNew = !currentBlog.id;
      if (isNew) {
        const newLocalBlog: Blog = {
          id: `local-${Date.now()}`,
          title: currentBlog.title!,
          subtitle: currentBlog.subtitle || '',
          slug: currentBlog.slug!,
          cover_image_url: currentBlog.cover_image_url || '',
          category: currentBlog.category || 'Café de Especialidad',
          blocks: currentBlog.blocks || [],
          published: !!currentBlog.published,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author_id: user?.id || null
        };
        setBlogs(prev => [newLocalBlog, ...prev]);
      } else {
        setBlogs(prev => prev.map(b => b.id === currentBlog.id ? { ...b, ...currentBlog as Blog } : b));
      }
      setIsEditing(false);
      setCurrentBlog(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 min-h-screen text-stone-800 dark:text-stone-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-stone-800 p-6 rounded-2xl border border-coffee/10 shadow-xxs">
        <div>
          <h1 className="text-2xl font-sans font-bold text-primary flex items-center gap-2.5">
            <BookOpen className="text-gold h-7 w-7" />
            Gestión de Blogs
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Crea, edita y organiza los artículos informativos de especialidad y masa madre.
          </p>
        </div>
        {!isEditing && (
          <div className="flex gap-3 w-full sm:w-auto">
            <a 
              href="/blog" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl border border-coffee/20 text-xs font-bold text-coffee dark:text-gold hover:bg-stone-50 transition-all cursor-pointer"
            >
              <Globe size={14} />
              <span>Ver blogs disponibles</span>
            </a>
            <button
              onClick={handleCreateNew}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-black transition-all shadow-xxs cursor-pointer"
            >
              <Plus size={16} />
              <span>Nuevo Artículo</span>
            </button>
          </div>
        )}
      </div>

      {isEditing && currentBlog ? (
        <BlogEditor 
          currentBlog={currentBlog}
          loading={loading}
          onCancel={() => { setIsEditing(false); setCurrentBlog(null); }}
          onSave={handleSave}
          onChange={(updates) => setCurrentBlog(prev => ({ ...prev, ...updates }))}
        />
      ) : (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-coffee/10 shadow-xxs overflow-hidden">
          <BlogList 
            blogs={blogs}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePublish={togglePublished}
          />
        </div>
      )}
    </div>
  );
}

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
  }
];
