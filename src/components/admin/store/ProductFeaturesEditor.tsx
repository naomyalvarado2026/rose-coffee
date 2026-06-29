/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, Trash2 } from 'lucide-react';
import { SPEC_ICONS, FOOD_EMOJIS, type ProductFeature, type SpecIconKey } from '../../../utils/productSpecs';

interface ProductFeaturesEditorProps {
  features: ProductFeature[];
  onChange: (features: ProductFeature[]) => void;
}

export default function ProductFeaturesEditor({ features, onChange }: ProductFeaturesEditorProps) {
  const addFeature = () => {
    onChange([...features, { text: '', icon: '', iconType: 'none' }]);
  };

  const removeFeature = (index: number) => {
    onChange(features.filter((_, i) => i !== index));
  };

  const updateText = (index: number, text: string) => {
    onChange(features.map((f, i) => i === index ? { ...f, text } : f));
  };

  const updateIconType = (index: number, iconType: 'none' | 'svg' | 'emoji') => {
    onChange(features.map((f, i) => {
      if (i === index) {
        let icon = '';
        if (iconType === 'svg') icon = 'weight';
        if (iconType === 'emoji') icon = '🍞';
        return { ...f, iconType, icon };
      }
      return f;
    }));
  };

  const updateIcon = (index: number, icon: string) => {
    onChange(features.map((f, i) => i === index ? { ...f, icon } : f));
  };

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === features.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newFeatures = [...features];
    const temp = newFeatures[index];
    newFeatures[index] = newFeatures[targetIndex];
    newFeatures[targetIndex] = temp;
    
    onChange(newFeatures);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-stone-700">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-sans font-bold text-gray-800 dark:text-stone-200 text-sm">Especificaciones / Ficha Técnica</h4>
          <p className="text-[11px] text-gray-400 font-medium">Agrega peso, fermentación, alérgenos, etc. con iconos SVG o emojis personalizados.</p>
        </div>
        <button
          type="button"
          onClick={addFeature}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primary hover:bg-primary/5 text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Añadir Especificación
        </button>
      </div>

      {features.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-gray-200 dark:border-stone-700 rounded-xl bg-slate-50/50">
          <p className="text-xs text-gray-400 italic">No hay especificaciones añadidas. Se autodetectarán iconos por palabras clave o puedes añadirlos manualmente.</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-visible pr-1">
          {features.map((feat, idx) => (
            <div key={idx} className="relative flex flex-col sm:flex-row gap-2 items-center bg-slate-50 p-2 rounded-xl border border-gray-150 dark:border-stone-700 z-10 hover:z-40 focus-within:z-40">
              {/* Controles de orden e Input de texto */}
              <div className="flex items-center gap-1.5 w-full sm:flex-grow">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveFeature(idx, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-650 disabled:opacity-30"
                    title="Subir"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFeature(idx, 'down')}
                    disabled={idx === features.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-650 disabled:opacity-30"
                    title="Bajar"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>
                
                <input
                  type="text"
                  value={feat.text}
                  onChange={(e) => updateText(idx, e.target.value)}
                  className="flex-grow px-3 py-1.5 border border-gray-200 dark:border-stone-700 rounded-lg text-sm bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ej. Peso: 750g o Fermentación: 24h"
                />
              </div>

              {/* Selección de Tipo e Icono */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <select
                  value={feat.iconType || 'none'}
                  onChange={(e) => updateIconType(idx, e.target.value as 'none' | 'svg' | 'emoji')}
                  className="px-2 py-1.5 border border-gray-200 dark:border-stone-700 rounded-lg text-xs bg-white dark:bg-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="none">Ninguno (Punto)</option>
                  <option value="svg">Icono SVG</option>
                  <option value="emoji">Emoji Picker</option>
                </select>

                {/* Selector SVG */}
                {feat.iconType === 'svg' && (
                  <div className="relative group">
                    <button
                      type="button"
                      className="px-2.5 py-1.5 bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-lg text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5"
                    >
                      {feat.icon && feat.icon in SPEC_ICONS ? (
                        <>
                          {SPEC_ICONS[feat.icon as SpecIconKey].svg("w-3.5 h-3.5 text-gold")}
                          <span className="max-w-[70px] truncate">{SPEC_ICONS[feat.icon as SpecIconKey].name}</span>
                        </>
                      ) : (
                        <span>Seleccionar SVG</span>
                      )}
                    </button>
                    
                    <div className="hidden group-hover:block absolute right-0 bottom-full mb-1 z-30 bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-xl shadow-lg p-2 w-48">
                      <span className="text-[9px] font-bold text-gray-400 block px-1.5 pb-1 uppercase tracking-wider">Iconos SVG</span>
                      <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                        {Object.entries(SPEC_ICONS).map(([key, value]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => updateIcon(idx, key)}
                            className={`flex items-center gap-2 p-1.5 text-left rounded-lg text-xs hover:bg-slate-50 transition-colors w-full ${
                              feat.icon === key ? 'bg-primary/5 text-primary font-bold' : 'text-gray-700'
                            }`}
                          >
                            {value.svg("w-3.5 h-3.5 text-gold shrink-0")}
                            <span className="truncate">{value.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Emoji Picker Popover */}
                {feat.iconType === 'emoji' && (
                  <div className="relative group">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center min-w-[38px]"
                    >
                      {feat.icon || '🍞'}
                    </button>

                    <div className="hidden group-hover:block absolute right-0 bottom-full mb-1 z-30 bg-white dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-xl shadow-lg p-2.5 w-56">
                      <span className="text-[9px] font-bold text-gray-400 block pb-1.5 uppercase tracking-wider">Seleccionar Emoji</span>
                      <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-0.5">
                        {FOOD_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => updateIcon(idx, emoji)}
                            className={`text-lg p-1 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center ${
                              feat.icon === emoji ? 'bg-primary/10 scale-110' : ''
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quitar */}
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="p-1.5 text-gray-400 hover:text-accent-red hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
