import { useState, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { Loader2, UploadCloud, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ARUploaderProps {
  onUploadSuccess: (url: string) => void;
  allowedExtensions: string[];
  label: string;
  folder?: string;
  currentUrl?: string | null;
}

export default function ARUploader({
  onUploadSuccess,
  allowedExtensions,
  label,
  folder = 'models',
  currentUrl
}: ARUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      setError(`Formato no soportado. Extensiones permitidas: ${allowedExtensions.join(', ')}`);
      toast.error(`Formato no soportado. Extensiones permitidas: ${allowedExtensions.join(', ')}`);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('product-models')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadErr) {
        throw uploadErr;
      }

      setProgress(90);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-models')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('No se pudo obtener la URL pública del archivo.');
      }

      setProgress(100);
      toast.success('Archivo subido correctamente');
      onUploadSuccess(urlData.publicUrl);
    } catch (err: any) {
      console.error('Error uploading file to storage:', err);
      setError(err.message || 'Error al subir el archivo');
      toast.error('Error al subir el archivo: ' + err.message);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={allowedExtensions.map((ext) => `.${ext}`).join(',')}
      />

      <div
        onClick={triggerInput}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[120px] ${
          uploading
            ? 'border-primary/40 bg-primary/[0.02] cursor-not-allowed'
            : error
            ? 'border-red-300 hover:border-red-400 bg-red-50/10'
            : 'border-slate-200 hover:border-primary/40 bg-slate-50/30 hover:bg-primary/[0.01]'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs font-bold text-slate-500">Subiendo archivo... {progress}%</span>
            <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <UploadCloud className="w-8 h-8 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</span>
            <span className="text-[10px] text-slate-400 font-medium">
              Soporta: {allowedExtensions.map((ext) => `.${ext.toUpperCase()}`).join(', ')}
            </span>
          </div>
        )}
      </div>

      {currentUrl && (
        <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium truncate">
            <File className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{currentUrl.split('/').pop()}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Subido
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
