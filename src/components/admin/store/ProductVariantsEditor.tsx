/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus, Trash2 } from 'lucide-react';
import MediaUploader from '../../common/MediaUploader';

export interface FormVariant {
  id?: string;
  color_name: string;
  color_hex: string;
  size: string;
  cloudinary_image_url: string;
  stock: number;
  price_adjustment: number;
}

interface ProductVariantsEditorProps {
  variants: FormVariant[];
  onChange: (variants: FormVariant[]) => void;
}

export default function ProductVariantsEditor({ variants, onChange }: ProductVariantsEditorProps) {
  const handleAdd = () => {
    onChange([
      ...variants,
      { color_name: '', color_hex: '', size: '', cloudinary_image_url: '', stock: 0, price_adjustment: 0 }
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: keyof FormVariant, value: any) => {
    onChange(variants.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  return (
    <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-stone-700">
      <div className="flex justify-between items-center">
        <h4 className="font-sans font-bold text-gray-800 dark:text-stone-200 text-base">Variantes de Producto (Tallas, Colores)</h4>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 px-3 py-1.5 border border-primary hover:bg-primary/5 text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Añadir Variante
        </button>
      </div>

      {variants.length === 0 ? (
        <p className="text-xs text-gray-450 italic">No has agregado ninguna variante. El producto se venderá con su precio y stock base generales.</p>
      ) : (
        <div className="border border-gray-150 dark:border-stone-700 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-gray-500 font-bold border-b border-gray-150 dark:border-stone-700">
                <th className="py-2.5 px-3">Color</th>
                <th className="py-2.5 px-3">Hex</th>
                <th className="py-2.5 px-3">Talla</th>
                <th className="py-2.5 px-3">Foto (Cloudinary)</th>
                <th className="py-2.5 px-3">Stock</th>
                <th className="py-2.5 px-3">Ajuste Precio</th>
                <th className="py-2.5 px-3 text-right">Quitar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {variants.map((v, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={v.color_name}
                      onChange={(e) => updateField(idx, 'color_name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-stone-700 rounded-md focus:outline-none"
                      placeholder="Ej. Rojo"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={v.color_hex || '#000000'}
                        onChange={(e) => updateField(idx, 'color_hex', e.target.value)}
                        className="w-7 h-7 p-0 rounded-full border border-gray-250 cursor-pointer overflow-hidden"
                      />
                      <input
                        type="text"
                        value={v.color_hex}
                        onChange={(e) => updateField(idx, 'color_hex', e.target.value)}
                        className="w-14 px-1 py-1 border border-gray-200 dark:border-stone-700 rounded-md uppercase text-[10px] text-center"
                        placeholder="#FF0000"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) => updateField(idx, 'size', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 dark:border-stone-700 rounded-md focus:outline-none"
                      placeholder="Ej. XL"
                    />
                  </td>
                  <td className="py-2 px-3 flex items-center gap-2">
                    <MediaUploader
                      folder="productos"
                      allowedFormats={['jpg', 'png', 'webp']}
                      label="Subir"
                      className="py-1 px-2 text-[10px]"
                      onUploadSuccess={(url) => updateField(idx, 'cloudinary_image_url', url)}
                    />
                    {v.cloudinary_image_url && (
                      <img 
                        src={v.cloudinary_image_url} 
                        alt="Variant" 
                        className="w-7 h-7 rounded object-cover border border-gray-150 dark:border-stone-700 shadow-2xs shrink-0" 
                      />
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateField(idx, 'stock', Number(e.target.value))}
                      className="w-14 px-2 py-1 border border-gray-200 dark:border-stone-700 rounded-md focus:outline-none"
                      min="0"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={v.price_adjustment}
                        onChange={(e) => updateField(idx, 'price_adjustment', Number(e.target.value))}
                        className="w-16 pl-4 pr-1 py-1 border border-gray-200 dark:border-stone-700 rounded-md focus:outline-none font-bold"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="text-gray-400 hover:text-accent-red p-1 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
