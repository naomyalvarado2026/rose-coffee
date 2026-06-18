import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RotateCcw, AlertTriangle, Info, Tag, Maximize } from 'lucide-react';
import type { ProductARModel, ARHotspot } from '../../types';

export interface ARHotspotItem {
  id: string;
  position: string;
  normal: string;
  label: string;
  type?: 'info' | 'price' | 'allergen';
}

interface ARViewerProps {
  arModel: ProductARModel;
  productName: string;
  onClose?: () => void;
  hotspots?: ARHotspotItem[];
  poster?: string;
}

export default function ARViewer({ arModel, productName, onClose, hotspots, poster }: ARViewerProps) {
  const modelViewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<ARHotspot | null>(null);
  const [videoPlayBlocked, setVideoPlayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    // Safety timeout — if the model takes >15s or CORS blocks it, stop spinning
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 15000);

    const handleLoad = async () => {
      clearTimeout(safetyTimeout);
      setLoading(false);

      // Handle dynamic video textures
      if (arModel.video_url && arModel.video_target_material) {
        try {
          const material = viewer.model?.materials.find(
            (m: any) => m.name === arModel.video_target_material
          );

          if (material) {
            const video = document.createElement('video');
            video.src = arModel.video_url;
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
  }, [arModel]);

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
      {/* Top Floating Info */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
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
              className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer shadow-sm"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20 text-slate-400">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Cargando Modelo 3D...</span>
          <span className="text-[10px] text-slate-500 mt-1">Puede tardar unos segundos</span>
        </div>
      )}

      {/* Error overlay */}
      {loadError && !loading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20 text-slate-400 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
          <span className="text-sm font-bold text-slate-300">No se pudo cargar el modelo 3D</span>
          <span className="text-[11px] text-slate-500 leading-relaxed">El archivo GLB no está disponible o el formato no es compatible con tu navegador.</span>
        </div>
      )}

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
        src={arModel.glb_url}
        ios-src={arModel.usdz_url || undefined}
        poster={poster || undefined}
        alt={`Modelo 3D interactivo de ${productName}`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale={arModel.ar_scale}
        camera-controls={arModel.camera_controls}
        touch-action="pan-y"
        auto-rotate={arModel.auto_rotate}
        xr-environment={arModel.xr_environment}
        shadow-intensity={arModel.shadow_intensity?.toString() || '1.0'}
        loading="eager"
        environment-image="neutral"
        exposure="1"
        shadow-softness="1"
        style={{ width: '100%', height: '100%', outline: 'none' }}
      >
        {/* Render hotspots from props or fallback to model's default hotspots */}
        {(hotspots || arModel.hotspots)?.map((hotspot) => (
          <button
            key={hotspot.id}
            slot={hotspot.id}
            data-position={hotspot.position}
            data-normal={hotspot.normal}
            onClick={(e) => {
              e.stopPropagation();
              setActiveHotspot(hotspot as any);
            }}
            className={`w-6 h-6 rounded-full border-2 border-white text-white font-bold text-xs flex items-center justify-center shadow-lg transition-transform hover:scale-115 cursor-pointer outline-none ${
              hotspot.type === 'allergen'
                ? 'bg-red-650'
                : hotspot.type === 'price'
                ? 'bg-amber-600'
                : 'bg-primary'
            }`}
          >
            {hotspot.type === 'allergen' ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : hotspot.type === 'price' ? (
              <Tag className="w-3.5 h-3.5" />
            ) : (
              <Info className="w-3.5 h-3.5" />
            )}
          </button>
        ))}
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
