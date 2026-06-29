import { ArrowLeft, Save } from 'lucide-react';
import type { Blog } from '../../../types';
import { BlogBlocksEditor } from './BlogBlocksEditor';

interface BlogEditorProps {
  currentBlog: Partial<Blog>;
  loading: boolean;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
  onChange: (blog: Partial<Blog>) => void;
}

export function BlogEditor({ currentBlog, loading, onCancel, onSave, onChange }: BlogEditorProps) {
  const handleTitleChange = (title: string) => {
    // Si no hay slug, generarlo automáticamente a partir del título
    const slug = currentBlog.slug 
      ? currentBlog.slug 
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
    onChange({ title, slug });
  };

  return (
    <form onSubmit={onSave} className="space-y-8">
      <div className="bg-white dark:bg-stone-800 p-6 md:p-8 rounded-2xl border border-coffee/10 shadow-xxs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-700">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer"
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
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm font-medium"
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
              onChange={(e) => onChange({ slug: e.target.value })}
              placeholder="ej. el-secreto-del-pan-de-masa-madre"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm font-medium font-mono"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Subtítulo / Resumen Breve
            </label>
            <textarea
              value={currentBlog.subtitle || ''}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="Escribe un breve resumen de lo que trata este artículo..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm font-medium resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
              Categoría
            </label>
            <select
              value={currentBlog.category || 'Café de Especialidad'}
              onChange={(e) => onChange({ category: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm font-medium bg-white dark:bg-stone-800"
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
              onChange={(e) => onChange({ cover_image_url: e.target.value })}
              placeholder="https://images.unsplash.com/... o enlace de subida"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="published"
              checked={!!currentBlog.published}
              onChange={(e) => onChange({ published: e.target.checked })}
              className="w-4.5 h-4.5 rounded border-stone-300 text-coffee dark:text-gold focus:ring-coffee cursor-pointer"
            />
            <label htmlFor="published" className="text-xs font-bold uppercase tracking-wider text-stone-700 cursor-pointer select-none">
              Publicar artículo (Visible para los clientes)
            </label>
          </div>
        </div>
      </div>

      <BlogBlocksEditor 
        blocks={currentBlog.blocks || []} 
        onChange={(blocks) => onChange({ blocks })} 
      />

      {/* ACCIONES DE FORMULARIO */}
      <div className="flex justify-end gap-3 bg-white dark:bg-stone-800 p-4 rounded-xl border border-coffee/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-4.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-bold text-stone-500 hover:bg-stone-50 transition-all cursor-pointer"
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
  );
}
