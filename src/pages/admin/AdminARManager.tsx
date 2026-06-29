import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Package, Sparkles, Sliders, Play, Trash2, HelpCircle, Save, Tag } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import ARUploader from '../../components/admin/ARUploader';
import type { Product, ProductARModel, ARHotspot } from '../../types';

export default function AdminARManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [arModel, setArModel] = useState<Partial<ProductARModel> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const modelViewerRef = useRef<any>(null);

  // Hotspot form state
  const [newHotspotLabel, setNewHotspotLabel] = useState('');
  const [newHotspotType, setNewHotspotType] = useState<'info' | 'price' | 'allergen'>('info');
  const [pendingHotspot, setPendingHotspot] = useState<{ position: string; normal: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchARModel(selectedProduct.id);
    } else {
      setArModel(null);
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
      if (data && data.length > 0) {
        setSelectedProduct(data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      toast.error('Error al cargar productos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchARModel = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_ar_models')
        .select('*')
        .eq('product_id', productId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setArModel(data);
      } else {
        // Initialize empty model settings
        setArModel({
          product_id: productId,
          glb_url: '',
          usdz_url: '',
          ar_scale: 'fixed',
          shadow_intensity: 1.0,
          xr_environment: true,
          auto_rotate: true,
          camera_controls: true,
          hotspots: [],
          video_url: '',
          video_target_material: ''
        });
      }
    } catch (err: any) {
      console.error('Error fetching AR model:', err);
      toast.error('Error al cargar configuración AR: ' + err.message);
    }
  };

  const handleModelViewerClick = (event: any) => {
    if (!modelViewerRef.current || !arModel) return;

    const viewer = modelViewerRef.current;
    const rect = viewer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hit = viewer.positionAndNormalFromPoint(x, y);
    if (hit) {
      setPendingHotspot({
        position: `${hit.position.x} ${hit.position.y} ${hit.position.z}`,
        normal: `${hit.normal.x} ${hit.normal.y} ${hit.normal.z}`
      });
      toast.info('Punto seleccionado. Ingresa un texto para agregar la etiqueta flotante.');
    }
  };

  const handleAddHotspot = () => {
    if (!pendingHotspot || !newHotspotLabel.trim() || !arModel) return;

    const newHotspot: ARHotspot = {
      id: `hotspot_${Date.now()}`,
      position: pendingHotspot.position,
      normal: pendingHotspot.normal,
      label: newHotspotLabel.trim(),
      type: newHotspotType
    };

    const updatedHotspots = [...(arModel.hotspots || []), newHotspot];
    setArModel({ ...arModel, hotspots: updatedHotspots });
    setPendingHotspot(null);
    setNewHotspotLabel('');
    toast.success('Punto informativo añadido.');
  };

  const handleRemoveHotspot = (id: string) => {
    if (!arModel) return;
    const updatedHotspots = (arModel.hotspots || []).filter((h) => h.id !== id);
    setArModel({ ...arModel, hotspots: updatedHotspots });
    toast.success('Punto informativo eliminado.');
  };

  const handleSave = async () => {
    if (!arModel || !arModel.glb_url) {
      toast.error('Debes subir al menos un archivo de modelo 3D (.glb) antes de guardar.');
      return;
    }

    setSaving(true);
    try {
      // Check if it already exists
      const { data: existing } = await supabase
        .from('product_ar_models')
        .select('id')
        .eq('product_id', arModel.product_id)
        .maybeSingle();

      const payload = {
        product_id: arModel.product_id,
        glb_url: arModel.glb_url,
        usdz_url: arModel.usdz_url || null,
        ar_scale: arModel.ar_scale || 'fixed',
        shadow_intensity: arModel.shadow_intensity !== undefined ? Number(arModel.shadow_intensity) : 1.0,
        xr_environment: arModel.xr_environment !== undefined ? arModel.xr_environment : true,
        auto_rotate: arModel.auto_rotate !== undefined ? arModel.auto_rotate : true,
        camera_controls: arModel.camera_controls !== undefined ? arModel.camera_controls : true,
        hotspots: arModel.hotspots || [],
        video_url: arModel.video_url || null,
        video_target_material: arModel.video_target_material || null
      };

      if (existing) {
        const { error } = await supabase
          .from('product_ar_models')
          .update(payload)
          .eq('product_id', arModel.product_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('product_ar_models')
          .insert(payload);

        if (error) throw error;
      }

      // Sincronizar con la tabla de productos para mantener compatibilidad con las vistas del frontend
      const { error: syncError } = await supabase
        .from('products')
        .update({
          ar_model_url: arModel.glb_url,
          ar_poster_url: arModel.usdz_url || null
        })
        .eq('id', arModel.product_id);

      if (syncError) throw syncError;

      toast.success('Configuración de Realidad Aumentada guardada con éxito.');
      fetchARModel(arModel.product_id!);
    } catch (err: any) {
      console.error('Error saving AR model config:', err);
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <AdminHeader
        title="Gestor de Realidad Aumentada (WebAR)"
        description="Asocia modelos 3D volumétricos a tus productos y configura anotaciones interactivas o texturas de video dinámicas."
        action={
          arModel?.glb_url && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar Cambios
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: Products list */}
        <div className="lg:col-span-4 bg-white dark:bg-stone-800 rounded-2xl border border-slate-150 dark:border-stone-700 p-4 shadow-sm max-h-[750px] overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-primary" />
            Productos del Menú
          </h3>
          <div className="space-y-1">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                  selectedProduct?.id === product.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-8 h-8 rounded-lg object-cover bg-slate-50 border border-slate-100 dark:border-stone-700 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-dashed border-slate-200 dark:border-stone-700 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="truncate">
                  <span className="block truncate font-semibold">{product.name}</span>
                  <span className={`text-[10px] block ${selectedProduct?.id === product.id ? 'text-blue-200' : 'text-slate-400'}`}>
                    ${Number(product.price).toFixed(2)} — {product.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {arModel ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Form & Properties */}
              <div className="space-y-6">
                {/* Upload Files */}
                <div className="bg-white dark:bg-stone-800 rounded-2xl border border-slate-150 dark:border-stone-700 p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5 border-b border-slate-100 dark:border-stone-700 pb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Archivos 3D (Blender GLB / USDZ)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">Modelo GLB (Requerido para Android/WebXR)</span>
                      <ARUploader
                        allowedExtensions={['glb']}
                        label="Subir archivo .glb"
                        folder="models/glb"
                        currentUrl={arModel.glb_url}
                        onUploadSuccess={(url) => setArModel({ ...arModel, glb_url: url })}
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">Modelo USDZ (Opcional para Apple Quick Look)</span>
                      <ARUploader
                        allowedExtensions={['usdz']}
                        label="Subir archivo .usdz"
                        folder="models/usdz"
                        currentUrl={arModel.usdz_url}
                        onUploadSuccess={(url) => setArModel({ ...arModel, usdz_url: url })}
                      />
                    </div>
                  </div>
                </div>

                {/* Configuration Parameters */}
                <div className="bg-white dark:bg-stone-800 rounded-2xl border border-slate-150 dark:border-stone-700 p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5 border-b border-slate-100 dark:border-stone-700 pb-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    Propiedades de Visualización
                  </h4>
                  <div className="space-y-4 text-xs font-medium text-slate-600">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Escala AR</label>
                        <select
                          value={arModel.ar_scale}
                          onChange={(e) => setArModel({ ...arModel, ar_scale: e.target.value as any })}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg text-xs bg-white dark:bg-stone-800 focus:outline-none"
                        >
                          <option value="fixed">Fixed (Mantener escala real)</option>
                          <option value="auto">Auto (Permitir redimensionar)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Intensidad de Sombra ({arModel.shadow_intensity})</label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={arModel.shadow_intensity || 1.0}
                          onChange={(e) => setArModel({ ...arModel, shadow_intensity: parseFloat(e.target.value) })}
                          className="w-full accent-primary mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <label className="flex items-center gap-2 border border-slate-100 dark:border-stone-700 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={arModel.auto_rotate ?? true}
                          onChange={(e) => setArModel({ ...arModel, auto_rotate: e.target.checked })}
                          className="accent-primary"
                        />
                        <span>Auto Rotar</span>
                      </label>
                      <label className="flex items-center gap-2 border border-slate-100 dark:border-stone-700 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={arModel.camera_controls ?? true}
                          onChange={(e) => setArModel({ ...arModel, camera_controls: e.target.checked })}
                          className="accent-primary"
                        />
                        <span>Controles</span>
                      </label>
                      <label className="flex items-center gap-2 border border-slate-100 dark:border-stone-700 p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={arModel.xr_environment ?? true}
                          onChange={(e) => setArModel({ ...arModel, xr_environment: e.target.checked })}
                          className="accent-primary"
                        />
                        <span>Luz Entorno</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Video Mapping config */}
                <div className="bg-white dark:bg-stone-800 rounded-2xl border border-slate-150 dark:border-stone-700 p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5 border-b border-slate-100 dark:border-stone-700 pb-2">
                    <Play className="w-4 h-4 text-primary" />
                    Texturas de Video Dinámicas
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">URL de Video (.mp4 / .webm)</label>
                      <input
                        type="url"
                        value={arModel.video_url || ''}
                        onChange={(e) => setArModel({ ...arModel, video_url: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg focus:outline-none"
                        placeholder="https://ejemplo.com/vapor.mp4"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nombre del Material Destino en el Modelo</label>
                      <input
                        type="text"
                        value={arModel.video_target_material || ''}
                        onChange={(e) => setArModel({ ...arModel, video_target_material: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-stone-700 rounded-lg focus:outline-none"
                        placeholder="Ej. LiquidMaterial"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Viewport & Hotspots management */}
              <div className="space-y-6">
                {/* 3D Canvas Viewport */}
                <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-square relative border border-slate-800 shadow-md group flex flex-col justify-between">
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-[10px] text-blue-200 font-bold px-2.5 py-1 rounded-full border border-slate-800 flex items-center gap-1 z-10">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    Vista Previa Interactiva 3D
                  </div>

                  {arModel.glb_url ? (
                    <div className="w-full h-full relative">
                      <model-viewer
                        ref={modelViewerRef}
                        src={arModel.glb_url}
                        alt={`AR Preview of ${selectedProduct?.name}`}
                        camera-controls={arModel.camera_controls}
                        auto-rotate={arModel.auto_rotate}
                        shadow-intensity={arModel.shadow_intensity?.toString()}
                        xr-environment={arModel.xr_environment}
                        style={{ width: '100%', height: '100%', outline: 'none' }}
                        onClick={handleModelViewerClick}
                      >
                        {/* Render existing hotspots */}
                        {arModel.hotspots?.map((hotspot) => (
                          <button
                            key={hotspot.id}
                            slot={hotspot.id}
                            data-position={hotspot.position}
                            data-normal={hotspot.normal}
                            className={`w-5 h-5 rounded-full border border-white text-white font-bold text-[10px] flex items-center justify-center shadow-md animate-scale-in cursor-default outline-none ${
                              hotspot.type === 'allergen'
                                ? 'bg-red-650'
                                : hotspot.type === 'price'
                                ? 'bg-amber-600'
                                : 'bg-primary'
                            }`}
                          >
                            <span>
                              {hotspot.type === 'allergen' ? '!' : hotspot.type === 'price' ? '$' : 'i'}
                            </span>
                          </button>
                        ))}
                      </model-viewer>

                      {/* Tap to set label overlay */}
                      <AnimatePresence>
                        {pendingHotspot && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-slate-800 backdrop-blur-md p-3 rounded-xl shadow-xl z-20 space-y-2.5"
                          >
                            <span className="text-[10px] font-bold text-blue-200 block">CREAR PUNTO DE ANOTACIÓN</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newHotspotLabel}
                                onChange={(e) => setNewHotspotLabel(e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-slate-800 bg-slate-950 text-white rounded-lg text-xs focus:outline-none"
                                placeholder="Ej. Contiene Gluten"
                                autoFocus
                              />
                              <select
                                value={newHotspotType}
                                onChange={(e: any) => setNewHotspotType(e.target.value)}
                                className="px-2 py-1.5 border border-slate-800 bg-slate-950 text-white rounded-lg text-[10px] font-bold outline-none cursor-pointer"
                              >
                                <option value="info">Info</option>
                                <option value="price">Precio</option>
                                <option value="allergen">Alerta</option>
                              </select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setPendingHotspot(null)}
                                className="text-[10px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-md cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={handleAddHotspot}
                                className="bg-primary hover:bg-blue-900 text-white text-[10px] font-bold px-3 py-1 rounded-md cursor-pointer"
                              >
                                Agregar
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                      <HelpCircle className="w-10 h-10 mb-2 opacity-30 text-white" />
                      <p className="text-xs font-semibold text-slate-400">Modelo GLB no disponible.</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                        Sube un modelo en la columna izquierda para activar la vista interactiva.
                      </p>
                    </div>
                  )}
                </div>

                {/* Hotspots List */}
                <div className="bg-white dark:bg-stone-800 rounded-2xl border border-slate-150 dark:border-stone-700 p-5 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5 border-b border-slate-100 dark:border-stone-700 pb-2">
                    <Tag className="w-4 h-4 text-primary" />
                    Puntos de Información ({arModel.hotspots?.length || 0})
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium italic">
                    Tip: Haz clic en cualquier lugar del visor 3D superior para colocar una nueva anotación sobre la superficie del croissant o taza.
                  </p>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {(!arModel.hotspots || arModel.hotspots.length === 0) ? (
                      <p className="text-xs text-slate-450 italic text-center py-4">No hay anotaciones añadidas.</p>
                    ) : (
                      arModel.hotspots.map((hotspot) => (
                        <div
                          key={hotspot.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-stone-700 hover:bg-slate-50/50 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2 text-slate-700 font-semibold truncate">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                hotspot.type === 'allergen'
                                  ? 'bg-red-600'
                                  : hotspot.type === 'price'
                                  ? 'bg-amber-600'
                                  : 'bg-primary'
                              }`}
                            />
                            <span className="truncate">{hotspot.label}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveHotspot(hotspot.id)}
                            className="text-red-500 hover:text-red-700 rounded-md p-1 hover:bg-red-50 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-800 rounded-2xl border border-slate-150 dark:border-stone-700 p-12 text-center shadow-sm">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-semibold">Selecciona un producto para configurar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
