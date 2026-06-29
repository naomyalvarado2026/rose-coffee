
export interface Ministry {
  id: string;
  name: string;
}

import { useState } from 'react';
import { supabase } from '../../../config/supabase';
import { toast } from 'sonner';
import { Filter, Loader2, FileCode, Copy, Check, Palette, ExternalLink, FolderHeart, Trash2, ImageIcon } from 'lucide-react';
import { useConfirmStore } from '../../../store/useConfirmStore';
import type { LogoData } from '../../../pages/admin/LogosManager';

interface LogoGridProps {
  logos: LogoData[];
  ministries: Ministry[];
  loading: boolean;
  onEditSvg: (logo: LogoData) => void;
  onRefresh: () => void;
}

export default function LogoGrid({ logos, ministries, loading, onEditSvg, onRefresh }: LogoGridProps) {
  const confirm = useConfirmStore((state) => state.confirm);
  const [filterMinistry, setFilterMinistry] = useState('all');
  const [filterVariant, setFilterVariant] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getPublicUrl = (logoPath: string) => {
    return supabase.storage.from('logos').getPublicUrl(logoPath).data.publicUrl;
  };

  const copyToClipboard = (logoPath: string, logoId: string) => {
    const { data } = supabase.storage.from('logos').getPublicUrl(logoPath);
    if (data?.publicUrl) {
      navigator.clipboard.writeText(data.publicUrl);
      setCopiedId(logoId);
      toast.success('URL del logo copiada al portapapeles.');
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('No se pudo generar la URL pública del logo.');
    }
  };

  const handleDelete = async (logo: LogoData) => {
    const confirmed = await confirm({
      title: 'Eliminar logo',
      message: '¿Estás seguro de que deseas eliminar este logo?\n\nSe borrará del almacenamiento permanentemente.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;

    setDeletingId(logo.id);
    try {
      const { error: storageError } = await supabase.storage
        .from('logos')
        .remove([logo.storage_path]);

      if (storageError) {
        console.warn('Advertencia al borrar del storage:', storageError);
      }

      const { error: dbError } = await supabase
        .from('logos')
        .delete()
        .eq('id', logo.id);

      if (dbError) throw dbError;

      toast.success('Logo eliminado correctamente.');
      onRefresh();
    } catch (err: any) {
      console.error('Error deleting logo:', err);
      toast.error('Error al eliminar el logo: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredLogos = logos.filter(logo => {
    const matchesMinistry = filterMinistry === 'all' || 
      (filterMinistry === 'general' && logo.ministry_id === null) ||
      (logo.ministry_id === filterMinistry);
    
    const matchesVariant = filterVariant === 'all' || logo.variant === filterVariant;

    return matchesMinistry && matchesVariant;
  });

  return (
    <div className="lg:col-span-2 space-y-4">
      {/* Filtros */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-sm p-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400" size={18} />
          <span className="text-sm font-semibold text-gray-700">Filtros:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Ministry Filter */}
          <div>
            <label htmlFor="filter_ministry" className="sr-only">Filtrar por Ministerio</label>
            <select
              id="filter_ministry"
              value={filterMinistry}
              onChange={(e) => setFilterMinistry(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 dark:border-stone-700 rounded-lg text-xs bg-white dark:bg-stone-800 focus:outline-none"
            >
              <option value="all">Todos los Propietarios</option>
              <option value="general">Marca Principal</option>
              {ministries.map((min) => (
                <option key={min.id} value={min.id}>
                  {min.name}
                </option>
              ))}
            </select>
          </div>

          {/* Variant Filter */}
          <div>
            <label htmlFor="filter_variant" className="sr-only">Filtrar por Variante</label>
            <select
              id="filter_variant"
              value={filterVariant}
              onChange={(e) => setFilterVariant(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 dark:border-stone-700 rounded-lg text-xs bg-white dark:bg-stone-800 focus:outline-none"
            >
              <option value="all">Todas las Variantes</option>
              <option value="cuadrado">Cuadrados</option>
              <option value="circular">Circulares</option>
              <option value="vertical">Verticales</option>
              <option value="horizontal">Horizontales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grilla */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white dark:bg-stone-800 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-sm">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : filteredLogos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLogos.map((logo) => {
            const publicUrl = logo.isLocal ? logo.storage_path : getPublicUrl(logo.storage_path);
            const isRenderable = ['png', 'svg', 'webp', 'jpg', 'jpeg'].includes(logo.format.toLowerCase());
            
            const colorModeLabels = {
              color: 'Color',
              blanco_y_negro: 'B&N',
              blanco_solido: 'Blanco Sólido',
              negro_solido: 'Negro Sólido'
            };

            const variantLabels = {
              cuadrado: 'Cuadrado',
              circular: 'Circular',
              vertical: 'Vertical',
              horizontal: 'Horizontal'
            };

            return (
              <div 
                key={logo.id} 
                className="group bg-white dark:bg-stone-800 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="h-44 bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100 dark:border-stone-700 relative overflow-hidden">
                  {isRenderable ? (
                    <img 
                      src={publicUrl} 
                      alt={`Logo ${logo.variant}`}
                      className="max-w-full max-h-full object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileCode size={48} className="text-gold mb-2" />
                      <span className="font-mono text-sm uppercase font-bold">{logo.format}</span>
                      <span className="text-[10px] text-gray-400 mt-1">Archivo de Diseño Vectorial</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyToClipboard(logo.storage_path, logo.id)}
                      className="bg-white dark:bg-stone-800 hover:bg-gray-100 text-gray-800 dark:text-stone-200 p-2 rounded-xl shadow-sm transition-transform hover:scale-105 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                      title="Copiar Enlace público"
                    >
                      {copiedId === logo.id ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                      <span>Copiar URL</span>
                    </button>
                    
                    {logo.format.toLowerCase() === 'svg' && (
                      <button
                        onClick={() => onEditSvg(logo)}
                        className="bg-white dark:bg-stone-800 hover:bg-gray-100 text-gray-800 dark:text-stone-200 p-2 rounded-xl shadow-sm transition-transform hover:scale-105 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                        title="Editar colores del SVG"
                      >
                        <Palette size={16} className="text-primary" />
                        <span>Editar</span>
                      </button>
                    )}

                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white dark:bg-stone-800 hover:bg-gray-100 text-gray-800 dark:text-stone-200 p-2 rounded-xl shadow-sm transition-transform hover:scale-105 flex items-center gap-1 text-xs font-semibold"
                    >
                      <ExternalLink size={16} />
                      <span>Ver</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <FolderHeart size={14} className="text-gold flex-shrink-0" />
                        <span className="font-sans font-bold text-gray-800 dark:text-stone-200 text-sm truncate">
                          {logo.isLocal ? logo.name : (logo.ministries?.name || 'Marca Principal')}
                        </span>
                      </div>
                      {logo.isLocal && (
                        <span className="px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                          Predefinido
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 text-blue-600 border border-blue-100">
                        {variantLabels[logo.variant]}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-100">
                        {colorModeLabels[logo.color_mode]}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-gray-100 text-gray-600">
                        {logo.format}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-50 flex justify-end">
                    {!logo.isLocal ? (
                      <button
                        onClick={() => handleDelete(logo)}
                        disabled={deletingId === logo.id}
                        className="text-gray-400 hover:text-accent-red p-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
                        title="Eliminar Logo"
                      >
                        {deletingId === logo.id ? (
                          <Loader2 className="animate-spin text-red-500" size={14} />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        <span>Eliminar</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium select-none py-1.5">
                        Sólo Lectura
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-stone-800 rounded-2xl border border-dashed border-gray-200 dark:border-stone-700">
          <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-sans font-bold text-gray-700">No se encontraron logos</h3>
          <p className="text-gray-400 text-sm mt-1">Sube el primer logo o ajusta los filtros de búsqueda.</p>
        </div>
      )}
    </div>
  );
}
