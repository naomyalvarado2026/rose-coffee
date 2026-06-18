import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RotateCcw, AlertTriangle, Info, Tag, Maximize, X } from 'lucide-react';
import type { Product, ARHotspot } from '../../types';

export interface ARHotspotItem {
  id: string;
  position: string;
  normal: string;
  label: string;
  type?: 'info' | 'price' | 'allergen';
}

interface ARViewerProps {
  activeProduct: Product;
  products?: Product[];
  onProductSelect?: (product: Product) => void;
  onClose?: () => void;
}

export default function ARViewer({ activeProduct, products, onProductSelect, onClose }: ARViewerProps) {
  const modelViewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<ARHotspot | null>(null);
  const [videoPlayBlocked, setVideoPlayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const modelConfig = useMemo(() => {
    const arModel = Array.isArray(activeProduct.product_ar_models)
      ? activeProduct.product_ar_models[0]
      : activeProduct.product_ar_models;

    return arModel
      ? {
          id: arModel.id,
          product_id: activeProduct.id,
          glb_url: arModel.glb_url || activeProduct.ar_model_url || '',
          usdz_url: arModel.usdz_url,
          ar_scale: arModel.ar_scale || 'fixed',
          camera_controls: arModel.camera_controls ?? true,
          auto_rotate: arModel.auto_rotate ?? true,
          xr_environment: arModel.xr_environment ?? true,
          shadow_intensity: arModel.shadow_intensity !== undefined ? arModel.shadow_intensity : 1.0,
          video_url: arModel.video_url,
          video_target_material: arModel.video_target_material,
          created_at: arModel.created_at || activeProduct.created_at,
        }
      : {
          id: activeProduct.id,
          product_id: activeProduct.id,
          glb_url: activeProduct.ar_model_url || '',
          ar_scale: 'fixed' as const,
          camera_controls: true,
          auto_rotate: true,
          xr_environment: true,
          shadow_intensity: 1.5,
          created_at: activeProduct.created_at,
        };
  }, [activeProduct]);

  const viewerHotspots = useMemo(() => {
    const arModel = Array.isArray(activeProduct.product_ar_models)
      ? activeProduct.product_ar_models[0]
      : activeProduct.product_ar_models;

    return (arModel && arModel.hotspots && arModel.hotspots.length > 0)
      ? arModel.hotspots
      : [
          {
            id: 'hotspot-price',
            position: '0 0.2 0',
            normal: '0 1 0',
            label: `$${Number(activeProduct.price).toFixed(2)}`,
            type: 'price' as const
          }
        ];
  }, [activeProduct]);

  const productName = activeProduct.name;
  const poster = activeProduct.ar_poster_url || undefined;

  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    setLoading(true);
    setLoadError(false);
    setActiveHotspot(null);
    setVideoPlayBlocked(false);

    // Safety timeout — if the model takes >15s or CORS blocks it, stop spinning
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 15000);

    const handleLoad = async () => {
      clearTimeout(safetyTimeout);
      setLoading(false);

      // Handle dynamic video textures
      if (modelConfig.video_url && modelConfig.video_target_material) {
        try {
          const material = viewer.model?.materials.find(
            (m: any) => m.name === modelConfig.video_target_material
          );

          if (material) {
            const video = document.createElement('video');
            video.src = modelConfig.video_url;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('playsinline', 'true');
            video.setAttribute('webkit-playsinline', 'true');
            video.style.display = 'none';
            document.body.appendChild(video);
            videoRef.current = video;

            video.play().catch((err) => {
              console.warn('Autoplay blocked or low power mode active:', err);
              setVideoPlayBlocked(true);
            });

            const texture = await viewer.createVideoTexture(video);
            if (material.pbrMetallicRoughness?.baseColorTexture) {
              material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
          }
        } catch (err) {
          console.error('Error applying video texture:', err);
        }
      }
    };

    const handleError = () => {
      clearTimeout(safetyTimeout);
      setLoading(false);
      setLoadError(true);
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);

    return () => {
      clearTimeout(safetyTimeout);
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.remove();
      }
    };
  }, [modelConfig]);

  const handlePlayVideoManually = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setVideoPlayBlocked(false);
      }).catch((err) => {
        console.error('Manual play failed:', err);
      });
    }
  };

  const handleResetCamera = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.cameraOrbit = '0deg 75deg auto';
      modelViewerRef.current.cameraTarget = 'auto auto auto';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[450px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center justify-center">

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20 text-slate-400">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Cargando Modelo 3D...</span>
          <span className="text-[10px] text-slate-500 mt-1">Puede tardar unos segundos</span>
        </div>
      )}

      {/* Error overlay — includes its own close button */}
      {loadError && !loading && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20 text-slate-400 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
          <span className="text-sm font-bold text-slate-300">No se pudo cargar el modelo 3D</span>
          <span className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
            El archivo GLB no está disponible, fue bloqueado por CORS, o el formato no es compatible con tu navegador.
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
            >
              ✕ Cerrar
            </button>
          )}
        </div>
      )}

      {/* Top Floating Info + Botones — z-30 para estar sobre las overlays */}
      <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800 text-[10px] text-blue-200 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <Maximize className="w-3.5 h-3.5" />
          AR 3D: {productName}
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={handleResetCamera}
            className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-sm"
            title="Resetear Cámara"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-red-900/80 hover:bg-red-700 backdrop-blur-md border border-red-800 flex items-center justify-center text-red-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Cerrar visor"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Play video overlay if blocked by low power mode */}
      {videoPlayBlocked && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-3 rounded-xl shadow-xl z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-amber-500 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>La animación de vapor/líquido requiere interacción manual.</span>
          </div>
          <button
            onClick={handlePlayVideoManually}
            className="bg-primary hover:bg-blue-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Activar Animación
          </button>
        </div>
      )}

      {/* Main 3D Model-Viewer Canvas */}
      <model-viewer
        ref={modelViewerRef}
        src={modelConfig.glb_url}
        ios-src={modelConfig.usdz_url || undefined}
        poster={poster || undefined}
        alt={`Modelo 3D interactivo de ${productName}`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        ar-placement="floor"
        camera-controls={modelConfig.camera_controls}
        touch-action="pan-y"
        auto-rotate={modelConfig.auto_rotate}
        xr-environment={modelConfig.xr_environment}
        shadow-intensity={modelConfig.shadow_intensity?.toString() || '1.0'}
        loading="eager"
        environment-image="neutral"
        exposure="1"
        shadow-softness="1"
        style={{ width: '100%', height: '100%', outline: 'none' }}
      >
        {/* Render hotspots from props or fallback to model's default hotspots */}
        {viewerHotspots?.map((hotspot) => (
          <button
            key={hotspot.id}
            slot={hotspot.id}
            data-position={hotspot.position}
            data-normal={hotspot.normal}
            onClick={(e) => {
              e.stopPropagation();
              setActiveHotspot(hotspot as any);
            }}
            className={`px-2 py-1 rounded-full border border-white/30 text-white font-bold flex items-center gap-1 shadow-lg transition-transform hover:scale-110 cursor-pointer outline-none backdrop-blur-xs ${
              hotspot.type === 'allergen'
                ? 'bg-red-600/90'
                : hotspot.type === 'price'
                ? 'bg-amber-600/90'
                : 'bg-stone-850/90'
            }`}
          >
            {hotspot.type === 'allergen' ? (
              <AlertTriangle className="w-3 h-3 shrink-0" />
            ) : hotspot.type === 'price' ? (
              <Tag className="w-3 h-3 shrink-0" />
            ) : (
              <Info className="w-3 h-3 shrink-0" />
            )}
            <span className="text-[10px] leading-none font-bold tracking-tight">{hotspot.label}</span>
          </button>
        ))}

        {/* DOM Overlay: In-AR Product Carousel */}
        {products && products.length > 1 && (
          <div className="absolute bottom-0 left-0 w-full z-50 bg-white/20 backdrop-blur-md border-t border-white/30 p-4 pointer-events-auto select-none">
            <div className="max-w-3xl mx-auto flex flex-col">
              <span className="text-[10px] font-bold text-white drop-shadow-xs uppercase tracking-wider block mb-2 px-1 text-center sm:text-left">
                Showroom Continuo (Productos AR)
              </span>
              <div className="flex overflow-x-auto gap-3 pb-1 scrollbar-thin scrollbar-thumb-white/25 scrollbar-track-transparent">
                {products.map((prod) => {
                  const isActive = prod.id === activeProduct.id;
                  return (
                    <button
                      key={prod.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductSelect?.(prod);
                      }}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left border transition-all duration-300 cursor-pointer shrink-0 min-w-[140px] focus:outline-none ${
                        isActive
                          ? 'bg-[#6b3a0e] border-[#faf2e7] text-white shadow-lg scale-102 font-bold'
                          : 'bg-white/15 border-white/10 text-white/90 hover:bg-white/25 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={prod.ar_poster_url || prod.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=150'}
                        alt={prod.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/20 bg-stone-900"
                      />
                      <div className="truncate pr-1">
                        <p className="text-[11px] truncate leading-tight font-medium">{prod.name}</p>
                        <span className="text-[8px] opacity-75 font-light tracking-wide uppercase block mt-0.5">
                          {prod.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </model-viewer>

      {/* Active Hotspot Context Overlay */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 rounded-2xl shadow-2xl z-10 flex gap-3 text-xs"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-slate-700/50 ${
                activeHotspot.type === 'allergen'
                  ? 'bg-red-950/30 text-red-500'
                  : activeHotspot.type === 'price'
                  ? 'bg-amber-950/30 text-amber-500'
                  : 'bg-blue-950/30 text-blue-400'
              }`}
            >
              {activeHotspot.type === 'allergen' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : activeHotspot.type === 'price' ? (
                <Tag className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                {activeHotspot.type === 'allergen'
                  ? 'Información de Alérgenos'
                  : activeHotspot.type === 'price'
                  ? 'Precio Destacado'
                  : 'Detalle de Especialidad'}
              </span>
              <p className="font-semibold text-slate-200">{activeHotspot.label}</p>
            </div>
            <button
              onClick={() => setActiveHotspot(null)}
              className="text-slate-400 hover:text-white self-start text-[10px] font-bold cursor-pointer hover:bg-slate-800 px-2 py-1 rounded-md"
            >
              Ocultar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
