import { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { toast } from 'sonner';
import { Palette, X, Loader2, Download, RefreshCw, Save, Plus } from 'lucide-react';
import type { LogoData } from '../../../pages/admin/LogosManager';

interface SVGEditorModalProps {
  logo: LogoData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SVGEditorModal({ logo, onClose, onSuccess }: SVGEditorModalProps) {
  const [fetchingSvg, setFetchingSvg] = useState(false);
  const [originalSvg, setOriginalSvg] = useState<string | null>(null);
  const [modifiedSvg, setModifiedSvg] = useState<string | null>(null);
  
  // Editor State
  const [editorTab, setEditorTab] = useState<'solid' | 'gradient'>('solid');
  const [solidPreset, setSolidPreset] = useState<'custom' | 'white' | 'black'>('custom');
  const [detectedColors, setDetectedColors] = useState<string[]>([]);
  const [colorReplacements, setColorReplacements] = useState<Record<string, string>>({});
  const [gradStartColor, setGradStartColor] = useState('#D4AF37'); // Gold default
  const [gradEndColor, setGradEndColor] = useState('#8B6914');
  const [gradAngle, setGradAngle] = useState('45');
  const [savingChanges, setSavingChanges] = useState(false);

  // Parse colors from SVG string
  const extractSvgColors = (svgString: string) => {
    const colorRegex = /fill="(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)"|stroke="(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)"|stop-color="(#[0-9a-fA-F]{3,6}|[a-zA-Z]+)"/g;
    const colors = new Set<string>();
    let match;
    
    while ((match = colorRegex.exec(svgString)) !== null) {
      const color = match[1] || match[2] || match[3];
      if (color && color.toLowerCase() !== 'none' && color.toLowerCase() !== 'transparent') {
        colors.add(color);
      }
    }
    
    return Array.from(colors);
  };

  // Process SVG based on current editor settings
  const processSvg = (baseSvg: string) => {
    let newSvg = baseSvg;

    if (editorTab === 'solid') {
      // Remover definiciones preexistentes que puedan estorbar
      newSvg = newSvg.replace(/<defs>[\\s\\S]*?<\/defs>/gi, '');

      if (solidPreset === 'white') {
        // Reemplazar todos los fills y strokes por blanco, ignorando 'none'
        newSvg = newSvg.replace(/fill="([^"]+)"/gi, (match, p1) => p1.toLowerCase() === 'none' ? match : 'fill="#ffffff"');
        newSvg = newSvg.replace(/stroke="([^"]+)"/gi, (match, p1) => p1.toLowerCase() === 'none' ? match : 'stroke="#ffffff"');
      } else if (solidPreset === 'black') {
        newSvg = newSvg.replace(/fill="([^"]+)"/gi, (match, p1) => p1.toLowerCase() === 'none' ? match : 'fill="#000000"');
        newSvg = newSvg.replace(/stroke="([^"]+)"/gi, (match, p1) => p1.toLowerCase() === 'none' ? match : 'stroke="#000000"');
      } else {
        // Custom: apply dictionary replacements
        Object.entries(colorReplacements).forEach(([oldColor, newColor]) => {
          // Reemplazar coincidencias exactas ignorando mayúsculas/minúsculas
          const fillRegex = new RegExp(`fill="${oldColor}"`, 'gi');
          const strokeRegex = new RegExp(`stroke="${oldColor}"`, 'gi');
          const stopColorRegex = new RegExp(`stop-color="${oldColor}"`, 'gi');
          
          newSvg = newSvg.replace(fillRegex, `fill="${newColor}"`);
          newSvg = newSvg.replace(strokeRegex, `stroke="${newColor}"`);
          newSvg = newSvg.replace(stopColorRegex, `stop-color="${newColor}"`);
        });
      }
    } else if (editorTab === 'gradient') {
      // Gradient Mode: Replace everything with a unified linear gradient
      
      // Calculate gradient coordinates based on angle
      const angleRad = (parseInt(gradAngle) - 90) * (Math.PI / 180);
      const x1 = Math.round(50 + Math.cos(angleRad) * 50);
      const y1 = Math.round(50 + Math.sin(angleRad) * 50);
      const x2 = Math.round(50 - Math.cos(angleRad) * 50);
      const y2 = Math.round(50 - Math.sin(angleRad) * 50);

      const gradientId = 'rose-coffee-custom-gradient';
      const gradientDef = `<defs>
        <linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
          <stop offset="0%" stop-color="${gradStartColor}" />
          <stop offset="100%" stop-color="${gradEndColor}" />
        </linearGradient>
      </defs>`;

      // Remover defs anteriores
      newSvg = newSvg.replace(/<defs>[\\s\\S]*?<\/defs>/gi, '');
      
      // Insertar el nuevo def justo después de la etiqueta de apertura <svg>
      newSvg = newSvg.replace(/(<svg[^>]*>)/i, `$1\n${gradientDef}`);

      // Aplicar el gradiente a todos los elementos, excepto los que tienen fill="none"
      newSvg = newSvg.replace(/fill="([^"]+)"/gi, (match, p1) => {
        if (p1.toLowerCase() === 'none') return match;
        // Evitar reemplazar si ya apunta a un url() por precaución, o reemplazarlo de todos modos
        return `fill="url(#${gradientId})"`;
      });
      
      newSvg = newSvg.replace(/stroke="([^"]+)"/gi, (match, p1) => {
        if (p1.toLowerCase() === 'none') return match;
        return `stroke="url(#${gradientId})"`;
      });
      
      // Manejar casos donde los paths no tienen explícitamente fill (SVG toma negro por defecto)
      // Añadir fill si no existe, como aproximación ruda pero efectiva
      // (Omitido aquí para no romper SVGs complejos, requiere parser HTML real para ser 100% seguro)
    }

    setModifiedSvg(newSvg);
  };

  useEffect(() => {
    if (originalSvg) {
      processSvg(originalSvg);
    }
  }, [editorTab, solidPreset, colorReplacements, gradStartColor, gradEndColor, gradAngle, originalSvg]);

  useEffect(() => {
    const fetchSvg = async () => {
      setFetchingSvg(true);
      try {
        let svgText = '';
        if (logo.isLocal) {
          // Fetch directly from public path
          const response = await fetch(logo.storage_path);
          if (!response.ok) throw new Error('No se pudo cargar el SVG local');
          svgText = await response.text();
        } else {
          // Download from Supabase Storage
          const { data, error } = await supabase.storage.from('logos').download(logo.storage_path);
          if (error) throw error;
          svgText = await data.text();
        }

        setOriginalSvg(svgText);
        setModifiedSvg(svgText);
        
        // Extraer colores para el panel de custom
        const colors = extractSvgColors(svgText);
        setDetectedColors(colors);
        
        // Inicializar mapeo 1:1
        const initialReplacements: Record<string, string> = {};
        colors.forEach(c => initialReplacements[c] = c);
        setColorReplacements(initialReplacements);

      } catch (err: any) {
        console.error('Error fetching SVG for edit:', err);
        toast.error('No se pudo cargar el código SVG.');
        onClose();
      } finally {
        setFetchingSvg(false);
      }
    };

    fetchSvg();
  }, [logo]);

  const handleColorChange = (oldColor: string, newColor: string) => {
    setColorReplacements(prev => ({ ...prev, [oldColor]: newColor }));
    setSolidPreset('custom');
  };

  const handleDownloadEditedSvg = () => {
    if (!modifiedSvg) return;
    const blob = new Blob([modifiedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edited_${logo.name || 'logo'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('SVG descargado a tu equipo.');
  };

  const handleSaveEditedSvg = async (mode: 'overwrite' | 'new') => {
    if (!modifiedSvg) return;
    if (logo.isLocal && mode === 'overwrite') {
      toast.error('No se puede sobreescribir un logo local/predefinido. Elige "Guardar Nueva Variante".');
      return;
    }

    setSavingChanges(true);
    try {
      const blob = new Blob([modifiedSvg], { type: 'image/svg+xml' });
      const fileExt = 'svg';
      const timestamp = Date.now();
      
      let storagePath = logo.storage_path;
      
      if (mode === 'new') {
        const filePrefix = logo.ministry_id ? `ministry_${logo.ministry_id}` : 'brand_general';
        const uniqueFileName = `${filePrefix}_${logo.variant}_${editorTab}_${timestamp}.${fileExt}`;
        const folderPath = logo.ministry_id ? logo.ministry_id : 'general';
        storagePath = `${folderPath}/${uniqueFileName}`;
      }

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(storagePath, blob, {
          cacheControl: '31536000',
          upsert: mode === 'overwrite'
        });

      if (uploadError) throw uploadError;

      // 2. Database update/insert
      if (mode === 'new') {
        const { error: dbError } = await supabase
          .from('logos')
          .insert({
            ministry_id: logo.ministry_id,
            variant: logo.variant,
            color_mode: editorTab === 'solid' ? (solidPreset === 'white' ? 'blanco_solido' : (solidPreset === 'black' ? 'negro_solido' : 'color')) : 'color',
            format: 'svg',
            storage_path: storagePath
          });

        if (dbError) throw dbError;
        toast.success('Nueva variante de SVG guardada en la base de datos.');
      } else {
        // Just updated the file, maybe touch the updated_at if we had one
        toast.success('SVG sobreescrito exitosamente.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving SVG:', err);
      toast.error('Error al guardar el SVG: ' + err.message);
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-stone-800 w-full max-w-5xl rounded-3xl border border-gray-200 dark:border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn">
        
        {/* Cabecera del Modal */}
        <div className="p-5 border-b border-gray-150 dark:border-stone-700 flex items-center justify-between bg-primary text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-stone-800/10 rounded-lg">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base">
                Editor de Colores SVG Inteligente
              </h3>
              <p className="text-[10px] text-gray-300 font-mono mt-0.5">
                Modificando variante {logo.variant} ({logo.color_mode})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white dark:bg-stone-800/10 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        {fetchingSvg ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3 text-gray-550">
            <Loader2 className="animate-spin text-primary" size={36} />
            <span className="text-xs font-semibold">Descargando código del logo SVG...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-5 min-h-0">
            
            {/* Panel Izquierdo: Previsualización con Fondo de Transparencia */}
            <div className="lg:col-span-3 bg-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px] border-r border-gray-150 dark:border-stone-700 relative overflow-auto">
              <div className="absolute top-4 left-4 bg-black/55 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded select-none z-10">
                Vista Previa en Tiempo Real
              </div>
              
              {/* Contenedor SVG con cuadrícula checkerboard */}
              <div 
                className="max-w-full max-h-[40vh] lg:max-h-[55vh] aspect-square rounded-2xl border border-gray-200 dark:border-stone-700 shadow-inner flex items-center justify-center p-8 overflow-hidden relative"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  backgroundColor: '#ffffff'
                }}
              >
                {modifiedSvg ? (
                  <div 
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain [&>svg]:block"
                    dangerouslySetInnerHTML={{ __html: modifiedSvg }}
                  />
                ) : (
                  <span className="text-xs text-gray-400">Sin vista previa disponible</span>
                )}
              </div>
            </div>

            {/* Panel Derecho: Controles del Editor */}
            <div className="lg:col-span-2 p-6 overflow-y-auto space-y-6 flex flex-col justify-between h-full min-h-0 bg-slate-50">
              <div className="space-y-5">
                
                {/* Selectores de Pestañas (Sólido vs Degradado) */}
                <div className="flex border-b border-gray-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setEditorTab('solid')}
                    className={`flex-1 pb-2 font-bold text-xs uppercase tracking-wider border-b-2 text-center transition-colors cursor-pointer ${
                      editorTab === 'solid' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-650'
                    }`}
                  >
                    Color Sólido
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('gradient')}
                    className={`flex-1 pb-2 font-bold text-xs uppercase tracking-wider border-b-2 text-center transition-colors cursor-pointer ${
                      editorTab === 'gradient' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-650'
                    }`}
                  >
                    Degradado
                  </button>
                </div>

                {editorTab === 'solid' ? (
                  <div className="space-y-4">
                    {/* Presets Sólidos */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Preajustes Rápidos</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSolidPreset('custom')}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            solidPreset === 'custom' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Personalizado
                        </button>
                        <button
                          type="button"
                          onClick={() => setSolidPreset('white')}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            solidPreset === 'white' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Blanco Sólido
                        </button>
                        <button
                          type="button"
                          onClick={() => setSolidPreset('black')}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            solidPreset === 'black' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Negro Sólido
                        </button>
                      </div>
                    </div>

                    {/* Colores Detectados */}
                    {solidPreset === 'custom' && (
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Colores del Logotipo Detectados</label>
                        {detectedColors.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No se detectaron colores vectoriales editables.</p>
                        ) : (
                          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                            {detectedColors.map((color, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-stone-800 border border-gray-150 dark:border-stone-700 rounded-xl shadow-2xs">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-5 h-5 rounded-md border border-gray-200 dark:border-stone-700 flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="text-xs font-mono font-semibold text-gray-600">{color}</span>
                                </div>
                                <span className="text-gray-300">→</span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="color" 
                                    value={colorReplacements[color] || color}
                                    onChange={(e) => handleColorChange(color, e.target.value)}
                                    className="w-8 h-8 rounded border border-gray-200 dark:border-stone-700 cursor-pointer p-0 bg-transparent"
                                  />
                                  <input 
                                    type="text" 
                                    value={colorReplacements[color] || color}
                                    onChange={(e) => handleColorChange(color, e.target.value)}
                                    className="w-20 px-2 py-1 border border-gray-200 dark:border-stone-700 rounded-lg text-xs font-mono uppercase focus:outline-none text-gray-700"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Configuración de Degradado</label>
                    
                    {/* Selector de Color de Inicio */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-stone-800 border border-gray-150 dark:border-stone-700 rounded-xl shadow-2xs">
                      <span className="text-xs font-bold text-gray-600">Color Inicial:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={gradStartColor}
                          onChange={(e) => setGradStartColor(e.target.value)}
                          className="w-8 h-8 rounded border border-gray-200 dark:border-stone-700 cursor-pointer p-0 bg-transparent"
                        />
                        <input 
                          type="text" 
                          value={gradStartColor}
                          onChange={(e) => setGradStartColor(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 dark:border-stone-700 rounded-lg text-xs font-mono uppercase focus:outline-none text-gray-750 font-bold"
                        />
                      </div>
                    </div>

                    {/* Selector de Color de Fin */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-stone-800 border border-gray-150 dark:border-stone-700 rounded-xl shadow-2xs">
                      <span className="text-xs font-bold text-gray-600">Color Final:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={gradEndColor}
                          onChange={(e) => setGradEndColor(e.target.value)}
                          className="w-8 h-8 rounded border border-gray-200 dark:border-stone-700 cursor-pointer p-0 bg-transparent"
                        />
                        <input 
                          type="text" 
                          value={gradEndColor}
                          onChange={(e) => setGradEndColor(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 dark:border-stone-700 rounded-lg text-xs font-mono uppercase focus:outline-none text-gray-750 font-bold"
                        />
                      </div>
                    </div>

                    {/* Slider de Ángulo */}
                    <div className="p-3 bg-white dark:bg-stone-800 border border-gray-150 dark:border-stone-700 rounded-xl shadow-2xs space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-600">
                        <span>Ángulo del Degradado:</span>
                        <span className="font-mono text-primary">{gradAngle}°</span>
                      </div>
                      <input 
                        type="range" 
                        min="-180" 
                        max="180" 
                        value={gradAngle}
                        onChange={(e) => setGradAngle(e.target.value)}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pie del Modal */}
        {!fetchingSvg && (
          <div className="p-5 bg-gray-50 border-t border-gray-150 dark:border-stone-700 flex flex-wrap justify-between items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-gray-100 border border-gray-250 rounded-xl text-xs font-semibold text-gray-500 cursor-pointer"
              disabled={savingChanges}
            >
              Cerrar
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadEditedSvg}
                className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-stone-800 hover:bg-gray-50 text-gray-700 border border-gray-200 dark:border-stone-700 font-bold rounded-xl text-xs shadow-2xs cursor-pointer transition-colors"
                disabled={savingChanges}
              >
                <Download size={14} />
                Descargar SVG
              </button>

              <button
                type="button"
                onClick={() => handleSaveEditedSvg('overwrite')}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer transition-colors"
                disabled={savingChanges}
              >
                {savingChanges ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                Sobreescribir Original
              </button>

              <button
                type="button"
                onClick={() => handleSaveEditedSvg('new')}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-blue-900 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer transition-colors"
                disabled={savingChanges}
              >
                {savingChanges ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                Guardar Nueva Variante
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
