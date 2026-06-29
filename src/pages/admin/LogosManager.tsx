
export interface Ministry {
  id: string;
  name: string;
}

import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import LogoUploadForm from '../../components/admin/logos/LogoUploadForm';
import LogoGrid from '../../components/admin/logos/LogoGrid';
import SVGEditorModal from '../../components/admin/logos/SVGEditorModal';

export interface LogoData {
  id: string;
  ministry_id: string | null;
  variant: 'cuadrado' | 'circular' | 'vertical' | 'horizontal';
  color_mode: 'color' | 'blanco_y_negro' | 'blanco_solido' | 'negro_solido';
  format: string;
  storage_path: string;
  created_at: string;
  ministries?: {
    name: string;
  } | null;
  isLocal?: boolean;
  name?: string;
}

export default function LogosManager() {
  const [logos, setLogos] = useState<LogoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  
  // Editor State
  const [editingLogo, setEditingLogo] = useState<LogoData | null>(null);

  useEffect(() => {
    fetchMinistries();
    fetchLogos();
  }, []);

  const fetchMinistries = async () => {
    try {
      const { data, error } = await supabase.from('ministries').select('*').order('name');
      if (error) throw error;
      setMinistries(data || []);
    } catch (err: any) {
      console.error('Error fetching ministries:', err);
    }
  };

  const fetchLogos = async () => {
    setLoading(true);
    try {
      // 1. Logotipos dinámicos desde Supabase
      const { data: dbLogos, error } = await supabase
        .from('logos')
        .select(`
          *,
          ministries ( name )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Logotipos predefinidos ("hardcoded" de la carpeta public)
      // simulamos el mismo formato de LogoData
      const localFiles = [
        '/logos/brand_general_circular_color.svg',
        '/logos/brand_general_horizontal_color.svg',
        '/logos/brand_general_vertical_color.svg',
        '/logos/ministry_academia_cuadrado_color.svg',
        '/logos/ministry_academia_horizontal_color.svg',
        '/logos/ministry_catering_cuadrado_color.svg',
        '/logos/ministry_catering_horizontal_color.svg',
        '/logos/ministry_coworking_cuadrado_color.svg',
        '/logos/ministry_coworking_horizontal_color.svg',
        '/logos/ministry_eventos_cuadrado_color.svg',
        '/logos/ministry_eventos_horizontal_color.svg',
        '/logos/ministry_mascotas_cuadrado_color.svg',
        '/logos/ministry_mascotas_horizontal_color.svg',
        '/logos/ministry_panaderia_cuadrado_color.svg',
        '/logos/ministry_panaderia_horizontal_color.svg',
        '/logos/ministry_solidaridad_cuadrado_color.svg',
        '/logos/ministry_solidaridad_horizontal_color.svg'
      ];

      const variantsList = ['circular', 'horizontal', 'vertical', 'cuadrado'] as const;
      const modesList = ['color', 'blanco_y_negro', 'blanco_solido', 'negro_solido'] as const;

      const localLogosList: LogoData[] = localFiles.map((filepath, index) => {
        const filename = filepath.split('/').pop() || '';
        // Resolving correctly based on the fact we're inside the SPA
        // In Vite, public files are served at root
        const resolvedUrl = filepath;
        
        // Asignar variaciones semialeatorias pero consistentes basadas en el index
        // En una app real, esto podría extraerse del nombre del archivo con Regex
        const num = index + 1;
        return {
          id: `local-${filename}`,
          ministry_id: null,
          variant: variantsList[num % 4],
          color_mode: modesList[num % 4],
          format: 'svg',
          storage_path: resolvedUrl, // resolved static URL
          created_at: new Date(2026, 5, 18).toISOString(),
          ministries: null,
          isLocal: true,
          name: filename.replace('.svg', '').replace(/_/g, ' ')
        };
      });

      setLogos([...localLogosList, ...(dbLogos || [])]);
    } catch (err: any) {
      console.error('Error fetching logos:', err);
      toast.error('No se pudieron cargar los logos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-sans font-bold text-primary">Catálogo de Logos</h1>
        <p className="text-gray-500 text-sm">Administra la identidad visual de Rose Coffee en un solo lugar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LogoUploadForm ministries={ministries} onUploadSuccess={fetchLogos} />
        
        <LogoGrid 
          logos={logos}
          ministries={ministries}
          loading={loading}
          onEditSvg={setEditingLogo}
          onRefresh={fetchLogos}
        />
      </div>

      {editingLogo && (
        <SVGEditorModal
          logo={editingLogo}
          onClose={() => setEditingLogo(null)}
          onSuccess={fetchLogos}
        />
      )}
    </div>
  );
}
