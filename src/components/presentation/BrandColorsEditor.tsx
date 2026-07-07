import React from 'react';
import { BrandColor } from './BrandColorsSection';
import { Plus, Trash2 } from 'lucide-react';

interface BrandColorsEditorProps {
  colors: BrandColor[];
  onChange: (colors: BrandColor[]) => void;
  disabled?: boolean;
}

export const BrandColorsEditor: React.FC<BrandColorsEditorProps> = ({ colors, onChange, disabled }) => {
  const handleAdd = () => {
    onChange([...colors, { hex: '#000000', name: 'Nuevo Color', description: '' }]);
  };

  const handleDelete = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof BrandColor, value: string) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    onChange(newColors);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Colores ({colors.length})</h3>
        {!disabled && (
          <button type="button" onClick={handleAdd} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors">
            <Plus size={14} /> Añadir Color
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {colors.map((color, index) => (
          <div key={index} className="bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl p-4 flex flex-col gap-3 relative shadow-2xs">
            {!disabled && (
              <button type="button" onClick={() => handleDelete(index)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded">
                <Trash2 size={14} />
              </button>
            )}
            <div className="flex gap-4">
              <input 
                type="color" 
                value={color.hex} 
                onChange={(e) => handleUpdate(index, 'hex', e.target.value)}
                disabled={disabled}
                className="w-12 h-12 rounded cursor-pointer shrink-0 border-0 p-0"
              />
              <div className="space-y-1 flex-1 pr-6">
                <input 
                  type="text" 
                  value={color.name} 
                  onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                  disabled={disabled}
                  placeholder="Nombre del color"
                  className="w-full px-2 py-1 text-sm font-bold border-b border-slate-200 dark:border-stone-700 bg-transparent focus:border-primary focus:outline-none"
                />
                <input 
                  type="text" 
                  value={color.hex} 
                  onChange={(e) => handleUpdate(index, 'hex', e.target.value)}
                  disabled={disabled}
                  placeholder="#HEX"
                  className="w-full px-2 py-1 text-xs font-mono text-slate-500 bg-transparent focus:outline-none"
                />
              </div>
            </div>
            <textarea 
              value={color.description} 
              onChange={(e) => handleUpdate(index, 'description', e.target.value)}
              disabled={disabled}
              placeholder="Descripción del significado o uso del color..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs bg-slate-50 dark:bg-stone-900"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
