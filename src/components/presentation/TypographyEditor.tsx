import React from 'react';
import type { TypographySpec } from './TypographySection';
import { Plus, Trash2 } from 'lucide-react';

interface TypographyEditorProps {
  fonts: TypographySpec[];
  onChange: (fonts: TypographySpec[]) => void;
  disabled?: boolean;
}

export const TypographyEditor: React.FC<TypographyEditorProps> = ({ fonts, onChange, disabled }) => {
  const handleAdd = () => {
    onChange([...fonts, { name: 'Nueva Fuente', category: 'Secundaria', weights: 'Regular', specimen: 'El veloz murciélago hindú comía feliz cardillo y kiwi.' }]);
  };

  const handleDelete = (index: number) => {
    onChange(fonts.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof TypographySpec, value: string) => {
    const newFonts = [...fonts];
    newFonts[index] = { ...newFonts[index], [field]: value };
    onChange(newFonts);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fuentes ({fonts.length})</h3>
        {!disabled && (
          <button type="button" onClick={handleAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors">
            <Plus size={14} /> Añadir Fuente
          </button>
        )}
      </div>

      <div className="space-y-4">
        {fonts.map((font, index) => (
          <div key={index} className="bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl p-4 space-y-3 relative shadow-2xs">
            {!disabled && (
              <button type="button" onClick={() => handleDelete(index)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded">
                <Trash2 size={14} />
              </button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Fuente</label>
                <input disabled={disabled} value={font.name} onChange={(e) => handleUpdate(index, 'name', e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 dark:border-stone-700 rounded-lg text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
                <input disabled={disabled} value={font.category} onChange={(e) => handleUpdate(index, 'category', e.target.value)} placeholder="Ej: Primaria (Serif)" className="w-full px-3 py-1.5 border border-slate-200 dark:border-stone-700 rounded-lg text-xs" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pesos Utilizados</label>
                <input disabled={disabled} value={font.weights} onChange={(e) => handleUpdate(index, 'weights', e.target.value)} placeholder="Ej: Regular, Bold" className="w-full px-3 py-1.5 border border-slate-200 dark:border-stone-700 rounded-lg text-xs" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Muestra de Texto (Specimen)</label>
                <textarea disabled={disabled} value={font.specimen} onChange={(e) => handleUpdate(index, 'specimen', e.target.value)} rows={2} className="w-full px-3 py-1.5 border border-slate-200 dark:border-stone-700 rounded-lg text-xs" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
