/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import AdminHeader from '../../components/admin/AdminHeader';
import BlockBuilder from '../../components/admin/BlockBuilder';
import { ContentCalendarEditor } from '../../components/presentation/ContentCalendarEditor';
import { BrandColorsEditor } from '../../components/presentation/BrandColorsEditor';
import { TypographyEditor } from '../../components/presentation/TypographyEditor';
import MediaSearchModal from '../../components/admin/MediaSearchModal';
import MediaUploader from '../../components/common/MediaUploader';
import { 
  Save, Loader2, Layout, Eye, Search, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DBPageSection {
  id: string;
  page: string;
  section_id: string;
  content_blocks: any[];
}

const SECTIONS_METADATA = [
  { id: 'cover', name: '1. Portada', description: 'Título, subtítulo, autor y fondo.' },
  { id: 'description', name: '2. Descripción General', description: 'Introducción del manual de marca.' },
  { id: 'objective', name: '3. Objetivo del Proyecto', description: 'Objetivos estratégicos de la marca.' },
  { id: 'audience', name: '4. Público Objetivo', description: 'Target y arquetipos de cliente.' },
  { id: 'logo', name: '5. Logotipo y Variaciones', description: 'Variaciones permitidas del logotipo.' },
  { id: 'colors', name: '6. Paleta Cromática', description: 'Colores corporativos y sus usos.' },
  { id: 'typography', name: '7. Tipografías', description: 'Fuentes primarias y secundarias.' },
  { id: 'style', name: '8. Estilo Gráfico', description: 'Dirección de arte y fotografía.' },
  { id: 'applications', name: '9. Aplicaciones de Identidad', description: 'Mockups y usos en el mundo real.' },
  { id: 'calendar', name: '10. Cronograma de Contenidos', description: 'Estrategia semanal de redes.' },
];

export default function BrandPresentationEditor() {
  const [sections, setSections] = useState<Record<string, DBPageSection>>({});
  const [activeSectionId, setActiveSectionId] = useState<string>('cover');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .eq('page', 'brand_presentation');

      if (error) throw error;

      if (data) {
        const mapped = data.reduce((acc: any, item: any) => {
          acc[item.section_id || item.id] = item as DBPageSection;
          return acc;
        }, {});
        
        // Ensure default structure
        SECTIONS_METADATA.forEach(meta => {
          if (!mapped[meta.id]) {
            mapped[meta.id] = {
              id: `${Date.now()}-${meta.id}`,
              page: 'brand_presentation',
              section_id: meta.id,
              content_blocks: []
            };
          }
        });
        
        setSections(mapped);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Error al cargar la presentación de marca');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = () => {
      fetchData();
    };
    load();
  }, []);



  const handleSaveSection = async () => {
    setSaving(true);
    try {
      const currentSection = sections[activeSectionId];
      if (!currentSection) return;

      const payload = {
        page: 'brand_presentation',
        section_id: activeSectionId,
        content_blocks: currentSection.content_blocks
      };

      // Check if exists
      const { data: existing } = await supabase
        .from('page_contents')
        .select('id')
        .eq('page', 'brand_presentation')
        .eq('section_id', activeSectionId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('page_contents')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('page_contents')
          .insert({ ...payload, id: currentSection.id || undefined });
        if (error) throw error;
      }

      toast.success('Sección guardada exitosamente');
    } catch (err: any) {
      console.error(err);
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSectionBlocks = (newBlocks: any[]) => {
    setSections(prev => ({
      ...prev,
      [activeSectionId]: {
        ...prev[activeSectionId],
        content_blocks: newBlocks
      }
    }));
  };

  const updateCoverData = (field: string, value: any) => {
    const current = sections['cover']?.content_blocks?.[0] || { title: 'Manual de Marca', subtitle: '', author: '', backgroundImage: '' };
    updateSectionBlocks([{ ...current, [field]: value }]);
  };

  const updateLogoData = (field: string, value: any) => {
    const current = sections['logo']?.content_blocks?.[0] || { description: '', visibleVariants: [] };
    updateSectionBlocks([{ ...current, [field]: value }]);
  };

  const addApplication = (imageUrl: string) => {
    const current = sections['applications']?.content_blocks || [];
    updateSectionBlocks([...current, { image_url: imageUrl, caption: 'Nueva Aplicación', category: 'Mockup' }]);
  };

  const updateApplication = (idx: number, field: string, value: string) => {
    const current = [...(sections['applications']?.content_blocks || [])];
    current[idx] = { ...current[idx], [field]: value };
    updateSectionBlocks(current);
  };

  const removeApplication = (idx: number) => {
    const current = [...(sections['applications']?.content_blocks || [])];
    current.splice(idx, 1);
    updateSectionBlocks(current);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  const activeMetadata = SECTIONS_METADATA.find(s => s.id === activeSectionId);
  const currentBlocks = sections[activeSectionId]?.content_blocks || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-stone-900 pb-20">
      <AdminHeader 
        title="Editor de Presentación de Marca" 
        description="Gestiona el manual de marca y estrategia phygital"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          <Link 
            to="/presentacion-marca" 
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/10 text-primary dark:text-gold dark:bg-gold/10 font-bold rounded-xl mb-4 hover:bg-primary/20 transition-colors"
          >
            <Eye size={16} /> Ver Presentación Pública
          </Link>
          
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Secciones</h3>
          {SECTIONS_METADATA.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                activeSectionId === section.id
                  ? 'bg-white dark:bg-stone-800 shadow-sm text-primary dark:text-gold border border-slate-200 dark:border-stone-700'
                  : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-stone-800/50 hover:text-slate-700'
              }`}
            >
              <Layout size={16} className={activeSectionId === section.id ? 'text-primary dark:text-gold' : 'opacity-50'} />
              <span className="truncate">{section.name}</span>
            </button>
          ))}
        </div>

        {/* Editor Main Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-slate-200 dark:border-stone-700 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 dark:border-stone-700 bg-slate-50 dark:bg-stone-900/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-stone-100 flex items-center gap-2">
                  <Layout className="text-primary dark:text-gold" size={20} />
                  {activeMetadata?.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{activeMetadata?.description}</p>
              </div>
              
              <button
                onClick={handleSaveSection}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Guardando...' : 'Guardar Sección'}
              </button>
            </div>

            <div className="p-6">
              {/* Cover Editor */}
              {activeSectionId === 'cover' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título de la Portada</label>
                      <input 
                        type="text" 
                        value={currentBlocks[0]?.title || ''} 
                        onChange={(e) => updateCoverData('title', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-stone-700 rounded-xl bg-slate-50 dark:bg-stone-900 focus:bg-white focus:ring-2 focus:ring-primary/20"
                        placeholder="Ej: Manual de Marca Rose Coffee"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtítulo</label>
                      <input 
                        type="text" 
                        value={currentBlocks[0]?.subtitle || ''} 
                        onChange={(e) => updateCoverData('subtitle', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-stone-700 rounded-xl bg-slate-50 dark:bg-stone-900 focus:bg-white focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Autor</label>
                      <input 
                        type="text" 
                        value={currentBlocks[0]?.author || ''} 
                        onChange={(e) => updateCoverData('author', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-stone-700 rounded-xl bg-slate-50 dark:bg-stone-900 focus:bg-white focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fondo de Portada (URL)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={currentBlocks[0]?.backgroundImage || ''} 
                          onChange={(e) => updateCoverData('backgroundImage', e.target.value)}
                          className="flex-1 px-4 py-2 border border-slate-200 dark:border-stone-700 rounded-xl bg-slate-50 dark:bg-stone-900 focus:bg-white focus:ring-2 focus:ring-primary/20"
                        />
                        <button type="button" onClick={() => setIsMediaModalOpen(true)} className="px-3 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-600"><Search size={16} /></button>
                      </div>
                    </div>
                  </div>
                  {currentBlocks[0]?.backgroundImage && (
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                      <img src={currentBlocks[0]?.backgroundImage} alt="Fondo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <MediaSearchModal 
                    isOpen={isMediaModalOpen}
                    onClose={() => setIsMediaModalOpen(false)}
                    onSelect={(url: string) => {
                      updateCoverData('backgroundImage', url);
                      setIsMediaModalOpen(false);
                    }}
                  />
                </div>
              )}

              {/* General Blocks Editors (Description, Objective, Audience, Style) */}
              {['description', 'objective', 'audience', 'style'].includes(activeSectionId) && (
                <BlockBuilder 
                  blocks={currentBlocks}
                  onChange={updateSectionBlocks}
                />
              )}

              {/* Logo Editor */}
              {activeSectionId === 'logo' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción del Logotipo</label>
                    <textarea 
                      value={currentBlocks[0]?.description || ''} 
                      onChange={(e) => updateLogoData('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-stone-700 rounded-xl bg-slate-50 dark:bg-stone-900 focus:bg-white focus:ring-2 focus:ring-primary/20 text-sm"
                      placeholder="Nuestra identidad visual se basa en..."
                    />
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl text-sm text-blue-800 dark:text-blue-300">
                    <p>Las 28 variaciones del logotipo en SVG se cargarán automáticamente desde los archivos del proyecto. La descripción arriba aparecerá introduciéndolos.</p>
                  </div>
                </div>
              )}

              {/* Colors Editor */}
              {activeSectionId === 'colors' && (
                <BrandColorsEditor 
                  colors={currentBlocks}
                  onChange={updateSectionBlocks}
                />
              )}

              {/* Typography Editor */}
              {activeSectionId === 'typography' && (
                <TypographyEditor 
                  fonts={currentBlocks}
                  onChange={updateSectionBlocks}
                />
              )}

              {/* Applications Editor */}
              {activeSectionId === 'applications' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Galería de Aplicaciones ({currentBlocks.length})</h3>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setIsMediaModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors">
                        <Search size={14} /> Galería
                      </button>
                      <MediaUploader
                        folder="paginas"
                        allowedFormats={['jpg', 'jpeg', 'png', 'webp']}
                        onUploadSuccess={addApplication}
                        label="Subir Imagen"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentBlocks.map((app: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 dark:bg-stone-800/50 border border-slate-200 dark:border-stone-700 rounded-xl overflow-hidden relative shadow-2xs group">
                        <button type="button" onClick={() => removeApplication(idx)} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded hover:bg-red-50 z-10 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                        <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                          <img src={app.image_url || app.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 space-y-2">
                          <input 
                            type="text" 
                            value={app.category || ''} 
                            onChange={(e) => updateApplication(idx, 'category', e.target.value)}
                            className="w-full px-2 py-1 border-b border-slate-200 bg-transparent text-xs font-bold uppercase focus:border-primary focus:outline-none"
                            placeholder="Categoría (Ej: Empaque)"
                          />
                          <input 
                            type="text" 
                            value={app.caption || ''} 
                            onChange={(e) => updateApplication(idx, 'caption', e.target.value)}
                            className="w-full px-2 py-1 border-b border-slate-200 bg-transparent text-sm focus:border-primary focus:outline-none"
                            placeholder="Descripción"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <MediaSearchModal 
                    isOpen={isMediaModalOpen}
                    onClose={() => setIsMediaModalOpen(false)}
                    onSelect={(url: string) => {
                      addApplication(url);
                      setIsMediaModalOpen(false);
                    }}
                  />
                </div>
              )}

              {/* Content Calendar Editor */}
              {activeSectionId === 'calendar' && (
                <ContentCalendarEditor 
                  rows={currentBlocks}
                  onChange={updateSectionBlocks}
                />
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
