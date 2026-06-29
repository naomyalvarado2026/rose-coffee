import { Eye, Edit3, Trash2, Calendar, BookOpen, ImageIcon } from 'lucide-react';
import type { Blog } from '../../../types';

interface BlogListProps {
  blogs: Blog[];
  loading: boolean;
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (blog: Blog) => void;
}

export function BlogList({ blogs, loading, onEdit, onDelete, onTogglePublish }: BlogListProps) {
  if (loading) {
    return (
      <div className="p-12 text-center text-stone-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-coffee mx-auto mb-3"></div>
        Cargando artículos...
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="py-16 text-center text-stone-400">
        <BookOpen className="h-12 w-12 mx-auto text-stone-300 mb-3" />
        <p className="text-sm font-bold uppercase tracking-wider text-stone-700">Aún no hay artículos de blog creados.</p>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          Haz clic en el botón superior para crear tu primer artículo interactivo y comenzar a deleitar a tus clientes.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-stone-50 text-stone-500 border-b border-stone-100 dark:border-stone-700 text-[10px] font-black uppercase tracking-widest">
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
                      className="w-16 h-10 object-cover rounded-lg border border-stone-100 dark:border-stone-700 shadow-xxs shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-10 bg-stone-100 flex items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 text-stone-400 shrink-0">
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
                <span className="text-xs bg-stone-100 text-stone-700 border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded-full">
                  {blog.category}
                </span>
              </td>
              <td className="py-4 px-6 text-stone-500 text-xs">
                {blog.blocks?.length || 0} bloques
              </td>
              <td className="py-4 px-6">
                <button
                  onClick={() => onTogglePublish(blog)}
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
                  onClick={() => onEdit(blog)}
                  className="inline-flex p-1.5 text-stone-400 hover:text-primary hover:bg-stone-50 rounded-lg transition-colors cursor-pointer"
                  title="Editar artículo"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => onDelete(blog.id)}
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
  );
}
