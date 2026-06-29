/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../../config/supabase';
import { toast } from 'sonner';
import MediaUploader from '../../common/MediaUploader';
import BlockEditor from '../BlockEditor';
import ProductQRGenerator from '../ProductQRGenerator';
import ProductFeaturesEditor from './ProductFeaturesEditor';
import ProductVariantsEditor, { type FormVariant } from './ProductVariantsEditor';
import type { ProductFeature } from '../../../utils/productSpecs';

// ── Zod schema ──────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(1, 'El nombre del producto es obligatorio'),
  price: z.number({ message: 'El precio debe ser un número válido' }).min(0),
  stock: z.number({ message: 'El stock debe ser un número entero' }).int().min(0),
  stock_min: z.number().int().min(0).optional(),
  category: z.string().min(1, 'La categoría es obligatoria'),
  type: z.enum(['physical', 'digital'], { message: 'Tipo inválido' }),
  image_url: z.string().url('URL de imagen inválida').or(z.literal('')),
  description: z.string().min(1, 'La descripción es obligatoria'),
  features: z.string().optional(),
  drive_link: z.string().url('URL de Drive inválida').or(z.literal('')),
  instructions: z.string().optional(),
  ar_model_url: z.string().url('URL del modelo 3D inválida').or(z.literal('')),
  ar_poster_url: z.string().url('URL de póster inválida').or(z.literal('')),
});

type ProductForm = z.infer<typeof productSchema>;

export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  stock_min?: number | null;
  category: string;
  deleted_at?: string | null;
  type?: 'physical' | 'digital';
  features?: any;
  cover_image_url?: string | null;
  ar_model_url?: string | null;
  ar_poster_url?: string | null;
  created_at: string;
}

interface ProductFormProps {
  editingProduct: DbProduct | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductFormPanel({ editingProduct, onSave, onCancel }: ProductFormProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(editingProduct?.image_url ?? null);
  const [formFeatures, setFormFeatures] = useState<ProductFeature[]>(() => {
    if (!editingProduct?.features) return [];
    if (Array.isArray(editingProduct.features)) {
      return editingProduct.features.map((f: any) =>
        typeof f === 'string'
          ? { text: f, icon: '', iconType: 'none' as const }
          : { text: f.text || '', icon: f.icon || '', iconType: (f.iconType || 'none') as 'none' | 'svg' | 'emoji' }
      );
    }
    return [];
  });
  const [variants, setVariants] = useState<FormVariant[]>([]);

  const defaultValues: ProductForm = {
    name: editingProduct?.name ?? '',
    price: editingProduct ? Number(editingProduct.price) : (undefined as any),
    stock: editingProduct ? Number(editingProduct.stock) : (undefined as any),
    stock_min: editingProduct?.stock_min != null ? Number(editingProduct.stock_min) : 5,
    category: editingProduct?.category ?? 'Café',
    type: (editingProduct?.type as 'physical' | 'digital') ?? 'physical',
    image_url: editingProduct?.image_url ?? '',
    description: editingProduct?.description ?? '',
    features: '',
    drive_link: '',
    instructions: '',
    ar_model_url: editingProduct?.ar_model_url ?? '',
    ar_poster_url: editingProduct?.ar_poster_url ?? '',
  };

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const productType = watch('type');

  const onSubmit = async (data: ProductForm) => {
    setActionLoading(true);
    try {
      const featuresArray = formFeatures
        .map(f => ({ text: f.text.trim(), icon: f.icon || '', iconType: f.iconType || 'none' }))
        .filter(f => f.text);

      const productPayload = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        stock_min: data.stock_min ?? 5,
        category: data.category,
        type: data.type,
        image_url: data.image_url || null,
        cover_image_url: data.image_url || null,
        features: featuresArray,
        ar_model_url: data.ar_model_url || null,
        ar_poster_url: data.ar_poster_url || null,
      };

      let productId = editingProduct?.id;

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productPayload).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { data: newProd, error } = await supabase.from('products').insert(productPayload).select().single();
        if (error) throw error;
        productId = newProd.id;
      }

      // Sync variants / digital assets
      if (data.type === 'physical') {
        await supabase.from('product_variants').delete().eq('product_id', productId);
        if (variants.length > 0) {
          const variantsToInsert = variants.map(v => ({
            product_id: productId,
            color_name: v.color_name || null,
            color_hex: v.color_hex || null,
            size: v.size || null,
            cloudinary_image_url: v.cloudinary_image_url || null,
            stock: Number(v.stock) || 0,
            price_adjustment: Number(v.price_adjustment) || 0,
          }));
          const { error: varErr } = await supabase.from('product_variants').insert(variantsToInsert);
          if (varErr) throw varErr;
        }
        await supabase.from('product_digital_assets').delete().eq('product_id', productId);
      } else {
        await supabase.from('product_digital_assets').delete().eq('product_id', productId);
        if (data.drive_link) {
          const { error: assetErr } = await supabase.from('product_digital_assets').insert({
            product_id: productId,
            drive_link: data.drive_link,
            instructions: data.instructions || null,
          });
          if (assetErr) throw assetErr;
        }
        await supabase.from('product_variants').delete().eq('product_id', productId);
      }

      toast.success(editingProduct ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      onSave();
    } catch (err: any) {
      console.error('Error saving product:', err);
      toast.error('Error al guardar el producto: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-stone-800 rounded-2xl shadow-xs border border-gray-150 dark:border-stone-700 p-6 md:p-8"
    >
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-stone-700">
        <h3 className="font-sans font-bold text-gray-800 dark:text-stone-200 text-lg">
          {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 rounded-lg p-1.5 cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nombre del Producto</label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none dark:bg-stone-900 dark:text-stone-200"
            placeholder="Ej. Café de Especialidad Ecuatoriano 400g"
          />
          {errors.name && <p className="text-accent-red text-xs mt-1">{errors.name.message}</p>}
        </div>

        {/* Price / Stock / Type / Category */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Precio Base ($ USD)</label>
            <input type="number" step="0.01" min="0" {...register('price', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none dark:bg-stone-900 dark:text-stone-200"
              placeholder="0.00" />
            {errors.price && <p className="text-accent-red text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stock Base</label>
            <input type="number" min="0" {...register('stock', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none dark:bg-stone-900 dark:text-stone-200"
              placeholder="10" />
            {errors.stock && <p className="text-accent-red text-xs mt-1">{errors.stock.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Stock Mínimo</label>
            <input type="number" min="0" {...register('stock_min', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none dark:bg-stone-900 dark:text-stone-200"
              placeholder="5" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tipo de Producto</label>
            <select {...register('type')}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-900 dark:text-stone-200 focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer">
              <option value="physical">Físico</option>
              <option value="digital">Digital / Descargable</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Categoría</label>
            <select {...register('category')}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-900 dark:text-stone-200 focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer">
              <option value="Café">Café</option>
              <option value="Panadería">Panadería</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Materia Prima">Materia Prima</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Imagen Principal (Cloudinary)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="border border-dashed border-gray-250 rounded-xl p-4 text-center hover:bg-gray-50/50 transition-colors flex flex-col items-center justify-center gap-2">
              <MediaUploader
                folder="productos"
                allowedFormats={['jpg', 'jpeg', 'png', 'webp']}
                label="Subir Imagen de Portada"
                onUploadSuccess={(url) => { setValue('image_url', url); setImagePreview(url); }}
              />
            </div>
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <div className="relative w-20 h-20 rounded-xl border border-gray-150 dark:border-stone-700 overflow-hidden bg-gray-50 flex-shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => { setImagePreview(null); setValue('image_url', ''); }}
                    className="absolute top-1 right-1 bg-red-650 text-white rounded-full p-0.5 hover:bg-red-700 shadow-sm cursor-pointer border border-white">
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border border-dashed border-gray-200 dark:border-stone-700 bg-gray-50 flex items-center justify-center text-gray-300 text-[10px] font-semibold flex-shrink-0">Sin Imagen</div>
              )}
              <div className="flex-grow">
                <span className="text-[10px] text-gray-400 font-bold block mb-1">O ingresa URL de imagen</span>
                <input type="url" {...register('image_url')}
                  className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs focus:outline-none dark:bg-stone-900 dark:text-stone-200 dark:border-stone-700"
                  placeholder="https://cloudinary.com/imagen.jpg" />
              </div>
            </div>
          </div>
        </div>

        {/* AR Model / Poster */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100 dark:border-stone-700">
          <div className={editingProduct ? 'md:col-span-2' : 'md:col-span-3'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Modelo 3D para AR (.glb)</label>
                <div className="flex flex-col gap-2">
                  <MediaUploader folder="modelos-3d" label="Subir Archivo .GLB" allowedFormats={['glb', 'gltf']}
                    onUploadSuccess={(url) => setValue('ar_model_url', url, { shouldValidate: true })}
                    className="w-full justify-center" />
                  <input type="text" {...register('ar_model_url')} readOnly
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none bg-gray-50 dark:bg-stone-900 text-gray-500"
                    placeholder="URL del modelo (se rellena automáticamente al subir)" />
                  {watch('ar_model_url') && (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-semibold">
                      <span>✅</span>
                      <span className="truncate">{watch('ar_model_url')?.split('/').pop()}</span>
                      <button type="button" onClick={() => setValue('ar_model_url', '', { shouldValidate: true })}
                        className="ml-auto text-gray-400 hover:text-red-500 cursor-pointer text-xs font-bold shrink-0">Quitar</button>
                    </div>
                  )}
                </div>
                {errors.ar_model_url && <p className="text-accent-red text-xs mt-1">{errors.ar_model_url.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Póster 2D para AR (.webp / .png)</label>
                <div className="flex flex-col gap-2">
                  <MediaUploader folder="posters-ar" label="Subir Imagen Póster" allowedFormats={['png', 'webp', 'jpg', 'jpeg']}
                    onUploadSuccess={(url) => setValue('ar_poster_url', url, { shouldValidate: true })}
                    className="w-full justify-center" />
                  <input type="text" {...register('ar_poster_url')} readOnly
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none bg-gray-50 dark:bg-stone-900 text-gray-500"
                    placeholder="URL del póster (se rellena automáticamente)" />
                  {watch('ar_poster_url') && (
                    <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-semibold">
                      <img src={watch('ar_poster_url') || ''} alt="Póster AR"
                        className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-stone-700 shrink-0" />
                      <span className="truncate">{watch('ar_poster_url')?.split('/').pop()}</span>
                      <button type="button" onClick={() => setValue('ar_poster_url', '', { shouldValidate: true })}
                        className="ml-auto text-gray-400 hover:text-red-500 cursor-pointer text-xs font-bold shrink-0">Quitar</button>
                    </div>
                  )}
                </div>
                {errors.ar_poster_url && <p className="text-accent-red text-xs mt-1">{errors.ar_poster_url.message}</p>}
              </div>
            </div>
          </div>
          {editingProduct && (
            <div className="flex flex-col justify-center">
              <ProductQRGenerator productId={editingProduct.id} productName={editingProduct.name} />
            </div>
          )}
        </div>

        {/* Features */}
        <ProductFeaturesEditor features={formFeatures} onChange={setFormFeatures} />

        {/* Digital asset */}
        {productType === 'digital' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 bg-purple-50/30 p-4 rounded-xl border border-purple-150">
            <h4 className="font-bold text-sm text-purple-800 flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              Configuración de Recurso Digital Seguro
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1.5">Enlace Seguro de Google Drive</label>
                <input type="text" {...register('drive_link')}
                  className="w-full px-4 py-2 border border-purple-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  placeholder="https://drive.google.com/..." />
                {errors.drive_link && <p className="text-accent-red text-xs mt-1">{errors.drive_link.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1.5">Instrucciones de Descarga</label>
                <input type="text" {...register('instructions')}
                  className="w-full px-4 py-2 border border-purple-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  placeholder="Ej. Contraseña para descomprimir: RoseCoffee2026" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Variants */}
        {productType === 'physical' && (
          <ProductVariantsEditor variants={variants} onChange={setVariants} />
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Descripción del Producto</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => <BlockEditor content={field.value} onChange={field.onChange} />}
          />
          {errors.description && <p className="text-accent-red text-xs mt-1">{errors.description.message}</p>}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 dark:border-stone-700 flex justify-end gap-3">
          <button type="button" onClick={onCancel}
            className="px-5 py-2 border border-gray-250 text-gray-700 dark:text-stone-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-stone-700 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button type="submit" disabled={actionLoading}
            className="bg-primary hover:bg-blue-900 disabled:bg-gray-200 text-white px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer">
            {actionLoading ? <Loader2 className="animate-spin" size={16} /> : null}
            {editingProduct ? 'Actualizar Producto' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
