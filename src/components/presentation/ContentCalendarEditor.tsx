import React, { useState } from 'react';
import type { CalendarRow } from './ContentCalendarSection';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, Maximize2 } from 'lucide-react';
import { AdaptivePostImage } from './AdaptivePostImage';
import type { AspectRatio } from './AdaptivePostImage';
import MediaSearchModal from '../admin/MediaSearchModal';
import MediaUploader from '../common/MediaUploader';

interface ContentCalendarEditorProps {
  rows: CalendarRow[];
  onChange: (rows: CalendarRow[]) => void;
  disabled?: boolean;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: '1:1 (Post)' },
  { value: '4:5', label: '4:5 (Portrait)' },
  { value: '3:4', label: '3:4' },
  { value: '9:16', label: '9:16 (Reel/Story)' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9 (YouTube)' },
];

export const ContentCalendarEditor: React.FC<ContentCalendarEditorProps> = ({ rows, onChange, disabled }) => {
  const [expandedRows, setExpandedRows] = useState<string[]>(rows.map(r => r.id));
  const [mediaModalOpenFor, setMediaModalOpenFor] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const handleAddRow = () => {
    const newRow: CalendarRow = {
      id: Date.now().toString(),
      day: `Día ${rows.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      platform: 'Instagram',
      format: 'Post',
      objective: 'Alcance',
      description: '',
      copyIn: '',
      copyOut: '',
      cta: '',
      justification: '',
      status: 'draft',
      imageAspectRatio: '4:5'
    };
    onChange([...rows, newRow]);
    setExpandedRows(prev => [...prev, newRow.id]);
  };

  const handleDuplicateRow = (row: CalendarRow) => {
    const newRow = { ...row, id: crypto.randomUUID() };
    onChange([...rows, newRow]);
    setExpandedRows(prev => [...prev, newRow.id]);
  };

  const handleDeleteRow = (id: string) => {
    onChange(rows.filter(row => row.id !== id));
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    const newRows = [...rows];
    if (direction === 'up' && index > 0) {
      [newRows[index - 1], newRows[index]] = [newRows[index], newRows[index - 1]];
    } else if (direction === 'down' && index < newRows.length - 1) {
      [newRows[index + 1], newRows[index]] = [newRows[index], newRows[index + 1]];
    }
    onChange(newRows);
  };

  const handleUpdateRow = (id: string, field: keyof CalendarRow, value: string) => {
    onChange(rows.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300">Editor del Cronograma</h3>
          <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-1">{rows.length} Publicaciones configuradas</p>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Plus size={16} />
            Añadir Nuevo Post
          </button>
        )}
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => {
          const isExpanded = expandedRows.includes(row.id);
          
          return (
            <div key={row.id} className="bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl overflow-hidden shadow-2xs">
              <div 
                className="bg-slate-50 dark:bg-stone-900 border-b border-slate-150 dark:border-stone-700 px-4 py-3 flex justify-between items-center cursor-pointer select-none"
                onClick={() => toggleRow(row.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-primary dark:text-stone-100 flex items-center gap-2">
                      Fila {index + 1}: {row.day}
                      {row.status && (
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                          row.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                          row.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                          'bg-stone-200 text-stone-600'
                        }`}>
                          {row.status}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium mt-0.5">{row.platform} • {row.format}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  {!disabled && (
                    <>
                      <button type="button" disabled={index === 0} onClick={() => handleMoveRow(index, 'up')} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded disabled:opacity-30">
                        <ArrowUp size={14} />
                      </button>
                      <button type="button" disabled={index === rows.length - 1} onClick={() => handleMoveRow(index, 'down')} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded disabled:opacity-30">
                        <ArrowDown size={14} />
                      </button>
                      <div className="w-px h-4 bg-slate-200 mx-1" />
                      <button type="button" onClick={() => handleDuplicateRow(row)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded" title="Duplicar">
                        <Copy size={14} />
                      </button>
                      <button type="button" onClick={() => handleDeleteRow(row.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <div className="p-1 text-slate-400">
                    <Maximize2 size={14} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 flex flex-col lg:flex-row gap-6">
                  {/* Left Side - Image Upload & Aspect Ratio */}
                  <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Imagen del Post</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setMediaModalOpenFor(row.id)} className="px-2 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold">
                            Buscar
                          </button>
                          <MediaUploader
                            folder="calendar"
                            allowedFormats={['jpg', 'jpeg', 'png', 'webp']}
                            onUploadSuccess={(url) => handleUpdateRow(row.id, 'imageUrl', url)}
                            label="Subir"
                          />
                        </div>
                      </div>
                      <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4 flex flex-col items-center justify-center min-h-[250px]">
                        <div className="w-full max-w-[200px]">
                          <AdaptivePostImage 
                            src={row.imageUrl} 
                            ratio={row.imageAspectRatio} 
                            showBadge={true} 
                          />
                        </div>
                        {row.imageUrl && !disabled && (
                          <button type="button" onClick={() => handleUpdateRow(row.id, 'imageUrl', '')} className="mt-4 text-[10px] font-bold text-red-500 hover:text-red-600 uppercase">
                            Eliminar Imagen
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Proporción (Aspect Ratio)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {ASPECT_RATIOS.map(ratio => (
                          <button
                            key={ratio.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleUpdateRow(row.id, 'imageAspectRatio', ratio.value)}
                            className={`py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${
                              row.imageAspectRatio === ratio.value 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                            }`}
                          >
                            {ratio.value}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Forms */}
                  <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
                    {/* Identifiers & Date */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Día / Nombre Corto</label>
                      <input disabled={disabled} value={row.day} onChange={(e) => handleUpdateRow(row.id, 'day', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-primary" placeholder="Ej: Día 1 o Lunes" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha Exacta (Calendario)</label>
                      <input type="date" disabled={disabled} value={row.date || ''} onChange={(e) => handleUpdateRow(row.id, 'date', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-primary" />
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plataforma</label>
                      <input disabled={disabled} value={row.platform} onChange={(e) => handleUpdateRow(row.id, 'platform', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Formato</label>
                      <input disabled={disabled} value={row.format} onChange={(e) => handleUpdateRow(row.id, 'format', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-primary" />
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado de Publicación</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleUpdateRow(row.id, 'status', 'draft')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${row.status === 'draft' ? 'bg-stone-200 border-stone-300 text-stone-700' : 'bg-white border-stone-200 text-stone-500'}`}>Borrador</button>
                        <button type="button" onClick={() => handleUpdateRow(row.id, 'status', 'scheduled')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${row.status === 'scheduled' ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-white border-stone-200 text-stone-500'}`}>Programado</button>
                        <button type="button" onClick={() => handleUpdateRow(row.id, 'status', 'published')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${row.status === 'published' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-stone-200 text-stone-500'}`}>Publicado</button>
                      </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Objetivo de Marketing</label>
                      <input disabled={disabled} value={row.objective} onChange={(e) => handleUpdateRow(row.id, 'objective', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-primary" />
                    </div>

                    {/* Content */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Copy In (Texto dentro de la imagen/video)</label>
                      <textarea disabled={disabled} value={row.copyIn} onChange={(e) => handleUpdateRow(row.id, 'copyIn', e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-primary" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Copy Out (Caption del Post)</label>
                      <textarea disabled={disabled} value={row.copyOut} onChange={(e) => handleUpdateRow(row.id, 'copyOut', e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-primary" />
                    </div>

                    {/* Meta */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Llamado a la acción (CTA)</label>
                      <input disabled={disabled} value={row.cta} onChange={(e) => handleUpdateRow(row.id, 'cta', e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-primary" />
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Justificación Estratégica</label>
                      <textarea disabled={disabled} value={row.justification} onChange={(e) => handleUpdateRow(row.id, 'justification', e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-primary bg-stone-50 dark:bg-stone-800/50" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <MediaSearchModal 
        isOpen={mediaModalOpenFor !== null}
        onClose={() => setMediaModalOpenFor(null)}
        onSelect={(url) => {
          if (mediaModalOpenFor) {
            handleUpdateRow(mediaModalOpenFor, 'imageUrl', url);
          }
          setMediaModalOpenFor(null);
        }}
      />
    </div>
  );
};
