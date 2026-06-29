
export interface Ministry {
  id: string;
  name: string;
}

import { useState, useRef } from 'react';
import { supabase } from '../../../config/supabase';
import { toast } from 'sonner';
import { Plus, Upload, Loader2 } from 'lucide-react';

interface LogoUploadFormProps {
  ministries: Ministry[];
  onUploadSuccess: () => void;
}

export default function LogoUploadForm({ ministries, onUploadSuccess }: LogoUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ministryId, setMinistryId] = useState('');
  const [variant, setVariant] = useState<'cuadrado' | 'circular' | 'vertical' | 'horizontal'>('cuadrado');
  const [colorMode, setColorMode] = useState<'color' | 'blanco_y_negro' | 'blanco_solido' | 'negro_solido'>('color');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Por favor, selecciona un archivo de imagen o logo.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'png';
      const filePrefix = ministryId ? `ministry_${ministryId}` : 'brand_general';
      const timestamp = Date.now();
      const uniqueFileName = `${filePrefix}_${variant}_${colorMode}_${timestamp}.${fileExt}`;
      
      const folderPath = ministryId ? ministryId : 'general';
      const storagePath = `${folderPath}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(storagePath, selectedFile, {
          cacheControl: '31536000',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('logos')
        .insert({
          ministry_id: ministryId || null,
          variant,
          color_mode: colorMode,
          format: fileExt,
          storage_path: storagePath
        });

      if (dbError) {
        await supabase.storage.from('logos').remove([storagePath]);
        throw dbError;
      }

      toast.success('Logo subido y registrado con éxito.');
      setSelectedFile(null);
      setMinistryId('');
      setVariant('cuadrado');
      setColorMode('color');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      onUploadSuccess();
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      toast.error('Error al subir el logo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="lg:col-span-1 bg-white dark:bg-stone-800 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-sm p-6 self-start space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-stone-700">
        <Plus className="text-gold" size={20} />
        <h2 className="font-sans font-bold text-gray-800 dark:text-stone-200 text-lg">Subir Nuevo Logo</h2>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* File Input */}
        <div>
          <label htmlFor="logo_file" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Archivo de Logo</label>
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-stone-700 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input
              id="logo_file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".png,.svg,.webp,.jpg,.jpeg,.ai"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Upload className="text-gray-400 mb-2" size={24} />
            <span className="text-xs font-medium text-gray-650 text-center">
              {selectedFile ? selectedFile.name : 'Seleccionar o arrastrar archivo'}
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Formatos aceptados: PNG, SVG, WEBP, JPG, AI
            </span>
          </div>
        </div>

        {/* Ministry Owner */}
        <div>
          <label htmlFor="logo_ministry" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pertenece a</label>
          <select
            id="logo_ministry"
            value={ministryId}
            onChange={(e) => setMinistryId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 focus:ring-2 focus:ring-primary/20 focus:outline-none"
            disabled={uploading}
          >
            <option value="">Marca Principal / Cafetería General</option>
            {ministries.map((min) => (
              <option key={min.id} value={min.id}>
                {min.name}
              </option>
            ))}
          </select>
        </div>

        {/* Variant Type */}
        <div>
          <label htmlFor="logo_variant" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Variante / Orientación</label>
          <select
            id="logo_variant"
            value={variant}
            onChange={(e) => setVariant(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 focus:ring-2 focus:ring-primary/20 focus:outline-none"
            disabled={uploading}
          >
            <option value="cuadrado">Cuadrado (1:1)</option>
            <option value="circular">Circular</option>
            <option value="vertical">Vertical / Apilado</option>
            <option value="horizontal">Horizontal / Isologo</option>
          </select>
        </div>

        {/* Color Mode */}
        <div>
          <label htmlFor="logo_color_mode" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Modo de Color</label>
          <select
            id="logo_color_mode"
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-stone-700 rounded-xl text-sm bg-white dark:bg-stone-800 focus:ring-2 focus:ring-primary/20 focus:outline-none"
            disabled={uploading}
          >
            <option value="color">Full Color</option>
            <option value="blanco_y_negro">Blanco y Negro (Escala de Grises)</option>
            <option value="blanco_solido">Blanco Sólido (Para fondos oscuros)</option>
            <option value="negro_solido">Negro Sólido (Monocromático oscuro)</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="w-full bg-primary hover:bg-blue-900 disabled:bg-gray-150 disabled:text-gray-400 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer border border-transparent"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Subiendo...
            </>
          ) : (
            <>
              <Upload size={16} />
              Subir y Registrar Logo
            </>
          )}
        </button>
      </form>
    </div>
  );
}
