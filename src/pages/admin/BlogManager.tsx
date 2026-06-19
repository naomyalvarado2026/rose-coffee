import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Eye, 
  Edit3, 
  ArrowLeft, 
  Image as ImageIcon, 
  HelpCircle, 
  Code, 
  CheckSquare, 
  BookOpen, 
  FileText,
  Calendar,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '../../components/admin/RichTextEditor';
import type { Blog, BlogBlock, BlogBlockType } from '../../types';

export default function BlogManager() {
  const { user } = useAuthStore();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Partial<Blog> | null>(null);

  // Cargar blogs desde Supabase
  const loadBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error: any) {
      console.error('Error cargando blogs:', error);
      toast.error('No se pudieron cargar los blogs. Mostrando datos de respaldo.');
      // Fallback a datos locales de prueba si falla la base de datos o la tabla no se ha migrado aún
      setBlogs(MOCK_BLOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  // Función para slugify automático
  const handleTitleChange = (title: string) => {
    if (!currentBlog) return;
    const slug = title
      .toLowerCase()
      .trim()
      .normalize('NFD') // Quitar acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '') // Quitar caracteres especiales
      .replace(/[\s-]+/g, '-') // Cambiar espacios y guiones repetidos por un solo guion
      .replace(/^-+|-+$/g, ''); // Quitar guiones sobrantes al inicio/fin

    setCurrentBlog(prev => ({
      ...prev,
      title,
      slug
    }));
  };

  // Manejar el inicio de creación
  const handleCreateNew = () => {
    setCurrentBlog({
      title: '',
      subtitle: '',
      slug: '',
      cover_image_url: '',
      category: 'Café de Especialidad',
      blocks: [],
      published: false,
      author_id: user?.id || null
    });
    setIsEditing(true);
  };

  // Manejar el inicio de edición
  const handleEdit = (blog: Blog) => {
    setCurrentBlog({ ...blog });
    setIsEditing(true);
  };

  // Manejar eliminación de blog
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este artículo de blog? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Artículo de blog eliminado correctamente');
      loadBlogs();
    } catch (err: any) {
      console.error('Error eliminando blog:', err);
      toast.error('Error al eliminar: ' + err.message);
      // Eliminar del estado local como fallback
      setBlogs(prev => prev.filter(b => b.id !== id));
    }
  };

  // Alternar el estado de publicado directamente en la lista
  const togglePublished = async (blog: Blog) => {
    const nextPublished = !blog.published;
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ published: nextPublished })
        .eq('id', blog.id);

      if (error) throw error;
      toast.success(nextPublished ? 'Artículo publicado' : 'Artículo guardado como borrador');
      loadBlogs();
    } catch (err: any) {
      console.error('Error al actualizar estado:', err);
      toast.error('No se pudo actualizar el estado de publicación en la base de datos.');
      // Actualizar localmente como fallback
      setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, published: nextPublished } : b));
    }
  };

  // Operaciones de Bloques en el Editor
  const addBlock = (type: BlogBlockType) => {
    if (!currentBlog) return;
    const newId = `block-${Date.now()}`;
    
    let defaultContent: any = {};
    if (type === 'text') {
      defaultContent = { text: '<p>Escribe tu contenido aquí...</p>' };
    } else if (type === 'image') {
      defaultContent = { url: '', alt: '', alignment: 'center', size: 'medium', caption: '' };
    } else if (type === 'question') {
      defaultContent = { question: '', options: ['', ''], correctAnswerIndex: 0, explanation: '' };
    } else if (type === 'html') {
      defaultContent = { html: '<!-- Inserta tu código HTML aquí -->' };
    } else if (type === 'true_false') {
      defaultContent = { statement: '', isTrue: true, explanation: '' };
    }

    const newBlock: BlogBlock = {
      id: newId,
      type,
      content: defaultContent
    };

    setCurrentBlog(prev => ({
      ...prev,
      blocks: [...(prev?.blocks || []), newBlock]
    }));
    toast.success(`Bloque de ${type} añadido`);
  };

  const removeBlock = (index: number) => {
    if (!currentBlog || !currentBlog.blocks) return;
    const updated = [...currentBlog.blocks];
    updated.splice(index, 1);
    setCurrentBlog(prev => ({ ...prev, blocks: updated }));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (!currentBlog || !currentBlog.blocks) return;
    const updated = [...currentBlog.blocks];
    if (direction === 'up' && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === 'down' && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    setCurrentBlog(prev => ({ ...prev, blocks: updated }));
  };

  const updateBlockContent = (index: number, newContent: any) => {
    if (!currentBlog || !currentBlog.blocks) return;
    const updated = [...currentBlog.blocks];
    updated[index] = {
      ...updated[index],
      content: {
        ...updated[index].content,
        ...newContent
      }
    };
    setCurrentBlog(prev => ({ ...prev, blocks: updated }));
  };

  // Guardar en Supabase
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
      
      // Simular guardado localmente si falla la base de datos para pruebas
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
    <div className="space-y-8 min-h-screen text-stone-800">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-coffee/10 shadow-xxs">
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl border border-coffee/20 text-xs font-bold text-coffee hover:bg-stone-50 transition-all cursor-pointer"
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
        /* VISTA EDITOR */
        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-coffee/10 shadow-xxs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setCurrentBlog(null); }}
                className="flex items-center gap-2 text-stone-500 hover:text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                Volver a la lista
              </button>
              <h2 className="text-base font-bold text-primary uppercase tracking-wider">
                {currentBlog.id ? 'Editar Artículo' : 'Nuevo Artículo'}
              </h2>
            </div>

            {/* Metadatos del Blog */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Título del Artículo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={currentBlog.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="ej. El Secreto del Pan de Masa Madre"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Ruta URL (Slug) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={currentBlog.slug || ''}
                  onChange={(e) => setCurrentBlog(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="ej. el-secreto-del-pan-de-masa-madre"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm font-medium font-mono"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Subtítulo / Resumen Breve
                </label>
                <textarea
                  value={currentBlog.subtitle || ''}
                  onChange={(e) => setCurrentBlog(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Escribe un breve resumen de lo que trata este artículo..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Categoría
                </label>
                <select
                  value={currentBlog.category || 'Café de Especialidad'}
                  onChange={(e) => setCurrentBlog(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm font-medium bg-white"
                >
                  <option value="Café de Especialidad">Café de Especialidad</option>
                  <option value="Panadería Artesanal">Panadería Artesanal</option>
                  <option value="Recetas Exclusivas">Recetas Exclusivas</option>
                  <option value="Cultura Cafetera">Cultura Cafetera</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                  Imagen de Portada (URL)
                </label>
                <input
                  type="url"
                  value={currentBlog.cover_image_url || ''}
                  onChange={(e) => setCurrentBlog(prev => ({ ...prev, cover_image_url: e.target.value }))}
                  placeholder="https://images.unsplash.com/... o enlace de subida"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm font-medium"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={!!currentBlog.published}
                  onChange={(e) => setCurrentBlog(prev => ({ ...prev, published: e.target.checked }))}
                  className="w-4.5 h-4.5 rounded border-stone-300 text-coffee focus:ring-coffee cursor-pointer"
                />
                <label htmlFor="published" className="text-xs font-bold uppercase tracking-wider text-stone-700 cursor-pointer select-none">
                  Publicar artículo (Visible para los clientes)
                </label>
              </div>
            </div>
          </div>

          {/* EDITOR POR BLOQUES */}
          <div className="bg-stone-50 border border-coffee/10 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-primary uppercase tracking-wider">
                  Bloques del Contenido
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Añade, ordena y edita los bloques que formarán la estructura del artículo.
                </p>
              </div>
              
              {/* Botones Rápidos para Añadir Bloque */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => addBlock('text')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-gold hover:text-gold text-stone-600 rounded-lg text-xs font-bold transition-all shadow-xxs cursor-pointer"
                >
                  <FileText size={14} />
                  <span>+ Texto</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('image')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-gold hover:text-gold text-stone-600 rounded-lg text-xs font-bold transition-all shadow-xxs cursor-pointer"
                >
                  <ImageIcon size={14} />
                  <span>+ Imagen</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('question')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-gold hover:text-gold text-stone-600 rounded-lg text-xs font-bold transition-all shadow-xxs cursor-pointer"
                >
                  <HelpCircle size={14} />
                  <span>+ Pregunta</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('html')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-gold hover:text-gold text-stone-600 rounded-lg text-xs font-bold transition-all shadow-xxs cursor-pointer"
                >
                  <Code size={14} />
                  <span>+ HTML</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('true_false')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-gold hover:text-gold text-stone-600 rounded-lg text-xs font-bold transition-all shadow-xxs cursor-pointer"
                >
                  <CheckSquare size={14} />
                  <span>+ V / F</span>
                </button>
              </div>
            </div>

            {/* Listado de bloques creados */}
            <div className="space-y-6">
              {currentBlog.blocks && currentBlog.blocks.length > 0 ? (
                currentBlog.blocks.map((block, idx) => {
                  return (
                    <div 
                      key={block.id} 
                      className="bg-white border border-stone-200 rounded-2xl shadow-xxs p-5 relative group/block hover:border-gold/30 transition-all"
                    >
                      {/* Control de Bloque (Reordenar y eliminar) */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                        <span className="text-[10px] font-black uppercase bg-stone-100 text-stone-500 border border-stone-200 px-2 py-0.5 rounded-md tracking-widest">
                          {block.type === 'true_false' ? 'Verdadero / Falso' : block.type} Block #{idx + 1}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded disabled:opacity-30 cursor-pointer"
                            title="Subir bloque"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, 'down')}
                            disabled={idx === currentBlog.blocks!.length - 1}
                            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded disabled:opacity-30 cursor-pointer"
                            title="Bajar bloque"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <div className="w-px h-4 bg-stone-200 mx-1"></div>
                          <button
                            type="button"
                            onClick={() => removeBlock(idx)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Eliminar bloque"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Contenido de bloque según tipo */}
                      {block.type === 'text' && (
                        <div className="space-y-2">
                          <RichTextEditor 
                            content={(block.content as any).text || ''} 
                            onChange={(html) => updateBlockContent(idx, { text: html })}
                          />
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">URL de la Imagen</label>
                            <input 
                              type="url" 
                              required
                              value={(block.content as any).url || ''} 
                              onChange={(e) => updateBlockContent(idx, { url: e.target.value })}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Texto Alternativo (Alt)</label>
                            <input 
                              type="text" 
                              value={(block.content as any).alt || ''} 
                              onChange={(e) => updateBlockContent(idx, { alt: e.target.value })}
                              placeholder="Texto alternativo de la imagen"
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Alineación</label>
                            <select 
                              value={(block.content as any).alignment || 'center'} 
                              onChange={(e) => updateBlockContent(idx, { alignment: e.target.value })}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none bg-white"
                            >
                              <option value="left">Izquierda</option>
                              <option value="center">Centro</option>
                              <option value="right">Derecha</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Tamaño (Ancho)</label>
                            <select 
                              value={(block.content as any).size || 'medium'} 
                              onChange={(e) => updateBlockContent(idx, { size: e.target.value })}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none bg-white"
                            >
                              <option value="small">Pequeño</option>
                              <option value="medium">Mediano</option>
                              <option value="large">Grande</option>
                              <option value="full">Ancho Completo</option>
                            </select>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Pie de foto (Caption)</label>
                            <input 
                              type="text" 
                              value={(block.content as any).caption || ''} 
                              onChange={(e) => updateBlockContent(idx, { caption: e.target.value })}
                              placeholder="Descripción al pie de la imagen..."
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {block.type === 'question' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 font-bold">Pregunta</label>
                            <input 
                              type="text" 
                              required
                              value={(block.content as any).question || ''} 
                              onChange={(e) => updateBlockContent(idx, { question: e.target.value })}
                              placeholder="ej. ¿Qué es un grano peaberry?"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none"
                            />
                          </div>
                          
                          <div className="space-y-2.5">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Opciones (Soporta dinámicas)</label>
                            {((block.content as any).options || []).map((option: string, optIdx: number) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <input 
                                  type="radio" 
                                  name={`correct-${block.id}`}
                                  checked={(block.content as any).correctAnswerIndex === optIdx}
                                  onChange={() => updateBlockContent(idx, { correctAnswerIndex: optIdx })}
                                  className="text-coffee focus:ring-coffee"
                                  title="Marcar como respuesta correcta"
                                />
                                <input 
                                  type="text" 
                                  required
                                  value={option} 
                                  onChange={(e) => {
                                    const opts = [...(block.content as any).options];
                                    opts[optIdx] = e.target.value;
                                    updateBlockContent(idx, { options: opts });
                                  }}
                                  placeholder={`Opción ${optIdx + 1}`}
                                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none"
                                />
                                {((block.content as any).options || []).length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const opts = [...(block.content as any).options];
                                      opts.splice(optIdx, 1);
                                      // Ajustar respuesta correcta si se eliminó una antes
                                      let correct = (block.content as any).correctAnswerIndex;
                                      if (correct >= opts.length) correct = opts.length - 1;
                                      updateBlockContent(idx, { options: opts, correctAnswerIndex: correct });
                                    }}
                                    className="p-1.5 text-stone-400 hover:text-red-500 rounded hover:bg-stone-50"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const opts = [...((block.content as any).options || []), ''];
                                updateBlockContent(idx, { options: opts });
                              }}
                              className="inline-flex items-center gap-1 text-[10px] text-coffee hover:text-coffee-dark font-bold hover:underline cursor-pointer"
                            >
                              <Plus size={10} /> Añadir opción
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Explicación Retroalimentación</label>
                            <textarea 
                              value={(block.content as any).explanation || ''} 
                              onChange={(e) => updateBlockContent(idx, { explanation: e.target.value })}
                              placeholder="Explica detalladamente por qué es la respuesta correcta para enseñar al lector..."
                              rows={2.5}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {block.type === 'html' && (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Código HTML Embebido (Iframe, Videos, Maps)</label>
                          <textarea 
                            required
                            value={(block.content as any).html || ''} 
                            onChange={(e) => updateBlockContent(idx, { html: e.target.value })}
                            placeholder="<iframe width='100%' height='315' src='https://www.youtube.com/embed/...'></iframe>"
                            rows={5}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none font-mono"
                          />
                        </div>
                      )}

                      {block.type === 'true_false' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Enunciado / Afirmación</label>
                            <input 
                              type="text" 
                              required
                              value={(block.content as any).statement || ''} 
                              onChange={(e) => updateBlockContent(idx, { statement: e.target.value })}
                              placeholder="ej. El café tiene más antioxidantes que el té verde."
                              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Opción Correcta</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name={`correct-tf-${block.id}`}
                                  checked={(block.content as any).isTrue === true}
                                  onChange={() => updateBlockContent(idx, { isTrue: true })}
                                  className="text-coffee focus:ring-coffee"
                                />
                                Verdadero
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name={`correct-tf-${block.id}`}
                                  checked={(block.content as any).isTrue === false}
                                  onChange={() => updateBlockContent(idx, { isTrue: false })}
                                  className="text-coffee focus:ring-coffee"
                                />
                                Falso
                              </label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Explicación Retroalimentación</label>
                            <textarea 
                              value={(block.content as any).explanation || ''} 
                              onChange={(e) => updateBlockContent(idx, { explanation: e.target.value })}
                              placeholder="Explica la realidad de la afirmación..."
                              rows={2.5}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 focus:border-gold outline-none resize-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border border-dashed border-stone-300 rounded-2xl py-12 text-center text-stone-400">
                  <BookOpen className="h-10 w-10 mx-auto text-stone-300 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider">No hay bloques en el artículo.</p>
                  <p className="text-[10px] text-stone-400 mt-1">Usa los botones superiores para añadir textos, imágenes, preguntas interactivos, etc.</p>
                </div>
              )}
            </div>
          </div>

          {/* ACCIONES DE FORMULARIO */}
          <div className="flex justify-end gap-3 bg-white p-4 rounded-xl border border-coffee/10">
            <button
              type="button"
              onClick={() => { setIsEditing(false); setCurrentBlog(null); }}
              className="px-4.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-500 hover:bg-stone-50 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-white rounded-xl text-xs font-black transition-all shadow-xxs cursor-pointer"
            >
              <Save size={14} />
              <span>{currentBlog.id ? 'Guardar Cambios' : 'Crear Artículo'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* VISTA LISTADO */
        <div className="bg-white rounded-2xl border border-coffee/10 shadow-xxs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-stone-500">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-coffee mx-auto mb-3"></div>
              Cargando artículos...
            </div>
          ) : blogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 border-b border-stone-100 text-[10px] font-black uppercase tracking-widest">
                    <th className="py-4 px-6">Portada / Título</th>
                    <th className="py-4 px-6">Categoría</th>
                    <th className="py-4 px-6">Bloques</th>
                    <th className="py-4 px-6">Estado</th>
                    <th className="py-4 px-6">Fecha</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm font-medium">
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {blog.cover_image_url ? (
                            <img 
                              src={blog.cover_image_url} 
                              alt={blog.title} 
                              className="w-16 h-10 object-cover rounded-lg border border-stone-100 shadow-xxs shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-10 bg-stone-100 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 shrink-0">
                              <ImageIcon size={16} />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-primary max-w-xs truncate" title={blog.title}>
                              {blog.title}
                            </h3>
                            <span className="text-[10px] text-stone-400 font-mono" title={blog.slug}>
                              /{blog.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-full">
                          {blog.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-stone-500 text-xs">
                        {blog.blocks?.length || 0} bloques
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => togglePublished(blog)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                            blog.published
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${blog.published ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          {blog.published ? 'Publicado' : 'Borrador'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-stone-500 text-xs flex flex-col gap-0.5 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5">
                        <a
                          href={`/blog/${blog.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex p-1.5 text-stone-400 hover:text-gold hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                          title="Ver artículo público"
                        >
                          <Eye size={15} />
                        </a>
                        <button
                          onClick={() => handleEdit(blog)}
                          className="inline-flex p-1.5 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar artículo"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="inline-flex p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar artículo"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-stone-400">
              <BookOpen className="h-12 w-12 mx-auto text-stone-300 mb-3" />
              <p className="text-sm font-bold uppercase tracking-wider text-stone-700">Aún no hay artículos de blog creados.</p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Haz clic en el botón superior para crear tu primer artículo interactivo y comenzar a deleitar a tus clientes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Datos semilla de demostración en local si falla la base de datos
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
    blocks: [
      {
        id: 'block-1',
        type: 'text',
        content: { text: '<h2>¿Qué es realmente la Masa Madre?</h2><p>La masa madre es un cultivo simbiótico de levaduras silvestres y bacterias lácticas (principalmente lactobacilos) que se originan de forma natural en la harina y el agua. A diferencia del pan comercial elaborado con levadura química o industrial, la masa madre no requiere de aditivos para fermentar.</p><p>En <strong>Rose Coffee</strong>, alimentamos diariamente nuestra masa madre (a la que llamamos con su propio carácter) para asegurar que el pan tenga el alveolado perfecto, una corteza crujiente y esa acidez característica tan balanceada y sutil.</p>' }
      },
      {
        id: 'block-2',
        type: 'image',
        content: { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800', alt: 'Harina y pan artesanal', alignment: 'center', size: 'medium', caption: 'Harina de fuerza premium seleccionada para nuestro pan de masa madre.' }
      },
      {
        id: 'block-3',
        type: 'true_false',
        content: { statement: '¿La fermentación de masa madre dura generalmente más de 12 horas en Rose Coffee?', isTrue: true, explanation: '¡Correcto! En Rose Coffee realizamos fermentaciones en frío de entre 16 y 24 horas. Este largo proceso descompone el gluten y los fitatos, haciendo que el pan sea mucho más fácil de digerir.' }
      },
      {
        id: 'block-4',
        type: 'text',
        content: { text: '<h2>Los 3 Beneficios Principales para tu Salud</h2><ol><li><strong>Mayor digestibilidad:</strong> La fermentación prolongada predigiere los almidones y reduce la presencia de gluten.</li><li><strong>Bajo índice glucémico:</strong> Los ácidos orgánicos producidos ralentizan la liberación de glucosa en el torrente sanguíneo.</li><li><strong>Mejor absorción de nutrientes:</strong> Los lactobacilos neutralizan el ácido fítico, liberando minerales esenciales como hierro, zinc y magnesio.</li></ol>' }
      },
      {
        id: 'block-5',
        type: 'question',
        content: { question: '¿Cuál de las siguientes bacterias es la responsable de la acidez láctica beneficiosa en el pan de masa madre?', options: ['Saccharomyces cerevisiae', 'Lactobacillus sanfranciscensis', 'Escherichia coli'], correctAnswerIndex: 1, explanation: 'Lactobacillus sanfranciscensis es la bacteria láctica que fermenta junto a las levaduras silvestres, creando los ácidos láctico y acético que le otorgan su incomparable sabor y textura.' }
      }
    ]
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
    blocks: [
      {
        id: 'block-1',
        type: 'text',
        content: { text: '<h2>El V60: El método del vertido preciso</h2><p>El V60 es uno de los métodos de goteo (pour-over) más populares del mundo. Su nombre proviene de su ángulo de 60 grados y los vectores en espiral dentro del cono, que ayudan al flujo de agua y la liberación de gases del café.</p><p>Este método resalta los sabores frutales, florales y cítricos de los cafés de especialidad de origen único con cuerpo ligero y limpio.</p>' }
      },
      {
        id: 'block-2',
        type: 'image',
        content: { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800', alt: 'Método de filtrado V60', alignment: 'center', size: 'medium', caption: 'Un barismo de precisión requiere medir la temperatura, tiempo y peso.' }
      },
      {
        id: 'block-3',
        type: 'question',
        content: { question: '¿Qué temperatura de agua es ideal para una correcta extracción en un método filtrado V60?', options: ['100°C (Hirviendo)', '90°C a 94°C', '70°C a 75°C'], correctAnswerIndex: 1, explanation: 'Entre 90°C y 94°C es la temperatura ideal. Si usas agua hirviendo, puedes quemar el café y extraer notas amargas; si está muy fría, el café quedará sub-extraído y aguado.' }
      },
      {
        id: 'block-4',
        type: 'text',
        content: { text: '<h2>Chemex y Prensa Francesa</h2><p>Mientras que la Chemex utiliza un filtro de papel más grueso que retiene los aceites y sedimentos dando una taza extremadamente limpia, la Prensa Francesa utiliza un filtro de malla metálica que permite que todos los aceites pasen a la taza, resultando en un cuerpo robusto, denso y con mucho peso en boca.</p>' }
      },
      {
        id: 'block-5',
        type: 'true_false',
        content: { statement: '¿La Chemex produce un café con cuerpo más pesado que la Prensa Francesa?', isTrue: false, explanation: '¡Falso! Al contrario, el filtro grueso de la Chemex retiene los aceites y compuestos amargos, produciendo una taza súper limpia y ligera. La Prensa Francesa da el cuerpo más pesado.' }
      }
    ]
  }
];
