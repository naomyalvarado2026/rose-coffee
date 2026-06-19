import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  RotateCcw, 
  AlertTriangle, 
  Info, 
  Tag, 
  Maximize, 
  X, 
  Camera,
  Sun,
  Moon,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';
import type { Product, ARHotspot } from '../../types';
import { toast } from 'sonner';

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

/**
 * ARViewer — WebXR-enabled 3D product viewer with DOM Overlay.
 *
 * Key WebXR features:
 *  - `ar-scale="fixed"` enforces the GLB's metric dimensions (centimeters as authored).
 *  - `ar-placement="floor"` forces hit-test anchoring to horizontal surfaces (table/floor).
 *  - `slot="ar-button"` provides a custom, high-visibility button that the browser
 *     requires for user-gesture-gated camera activation.
 *  - `slot="ar-ui"` injects a DOM Overlay (product carousel) rendered ON TOP of the
 *     live camera feed during a WebXR session. This is the native WebXR DOM Overlay API.
 *
 * NOTE on platform compatibility:
 *  - Android (Chrome 79+): Full WebXR DOM Overlay support. The `slot="ar-ui"` carousel
 *    will be visible and interactive while the camera is open.
 *  - iOS (Safari / Quick Look): Apple's AR Quick Look does NOT support DOM Overlay.
 *    The `slot="ar-ui"` content is silently ignored. Users see only the model in AR.
 *    The `ios-src` (USDZ) attribute provides the best available iOS AR experience.
 */
export default function ARViewer({ activeProduct, products, onProductSelect, onClose }: ARViewerProps) {
  const modelViewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<ARHotspot | null>(null);
  const [videoPlayBlocked, setVideoPlayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [arSupported, setArSupported] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [exposure, setExposure] = useState(1.0);
  const [lightingMode, setLightingMode] = useState<'neutral' | 'sunset' | 'night'>('neutral');
  const [showHelp, setShowHelp] = useState(false);

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
    setAutoRotate(modelConfig.auto_rotate);
    setScaleMultiplier(1);
    setExposure(1.0);
    setLightingMode('neutral');
  }, [modelConfig]);

  const handleToggleLighting = () => {
    if (lightingMode === 'neutral') {
      setLightingMode('sunset');
      setExposure(1.5);
    } else if (lightingMode === 'sunset') {
      setLightingMode('night');
      setExposure(0.6);
    } else {
      setLightingMode('neutral');
      setExposure(1.0);
    }
  };

  const handleIncreaseScale = () => {
    setScaleMultiplier((prev) => Math.min(2.5, prev + 0.1));
  };

  const handleDecreaseScale = () => {
    setScaleMultiplier((prev) => Math.max(0.4, prev - 0.1));
  };

  const takeScreenshot = async () => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;
    try {
      const blob = await viewer.toBlob({ idealAspect: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProduct.name}-3d.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('¡Foto capturada y guardada!');
    } catch (err) {
      console.error('Error taking screenshot:', err);
      toast.error('No se pudo capturar la foto.');
    }
  };

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

      if (viewer) {
        // Expose AR support
        setArSupported(typeof viewer.canActivateAR === 'boolean' ? viewer.canActivateAR : true);
      }

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

  /** Switch model source when user taps a carousel thumbnail */
  const handleCarouselSelect = (prod: Product) => {
    onProductSelect?.(prod);
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

      {/* Fallback Banner: If device does not support AR */}
      {!arSupported && (
        <div className="absolute top-16 left-4 right-4 bg-amber-500/10 border border-amber-500/35 backdrop-blur-md p-3 rounded-2xl text-[11px] text-amber-200 font-medium flex items-start gap-2 shadow-lg z-20 pointer-events-auto">
          <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="text-left">
            <p className="font-bold text-white leading-tight">Visor 3D Interactivo Activo (Plan B)</p>
            <p className="text-[10px] text-stone-300 mt-0.5 leading-relaxed">
              Tu dispositivo no es compatible con la cámara de Realidad Aumentada. ¡Aún puedes girar, mover y hacer zoom al producto en 3D aquí mismo en tu pantalla!
            </p>
          </div>
        </div>
      )}

      {/* Sleek Floating Sidebar of 3D Tools */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5 pointer-events-auto">
        <button
          onClick={handleIncreaseScale}
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900/85 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          title="Aumentar tamaño +"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={handleDecreaseScale}
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900/85 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          title="Disminuir tamaño -"
        >
          <Minus className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
            autoRotate 
              ? 'bg-[#6b3a0e] border-[#faf2e7]/25 text-[#faf2e7] scale-102 font-bold' 
              : 'bg-slate-900/85 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:scale-105 active:scale-95'
          }`}
          title={autoRotate ? "Pausar Rotación" : "Auto-Rotación"}
        >
          <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin [animation-duration:8s]' : ''}`} />
        </button>

        <button
          onClick={handleToggleLighting}
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900/85 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          title={`Luz: ${lightingMode === 'neutral' ? 'Estudio' : lightingMode === 'sunset' ? 'Atardecer' : 'Noche'}`}
        >
          {lightingMode === 'neutral' && <Sun className="w-4 h-4 text-amber-450" />}
          {lightingMode === 'sunset' && <Sun className="w-4 h-4 text-orange-455 animate-pulse" />}
          {lightingMode === 'night' && <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        <button
          onClick={takeScreenshot}
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900/85 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          title="Tomar Foto PNG"
        >
          <Camera className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => setShowHelp(true)}
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900/85 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          title="Ayuda / Gestos"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>
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

      {/* ================================================================
          Main <model-viewer> Canvas — WebXR Configuration
          ================================================================
          Strict attribute contract:
            ar                  → enables AR mode
            ar-modes            → priority: WebXR > Scene Viewer > Quick Look
            ar-scale="auto"    → scale automatically
            ar-placement="floor"→ hit-test anchors to horizontal surface (mesa/suelo)
            camera-controls     → orbit/zoom/pan via touch/mouse
            touch-action="pan-y"→ allows page scroll; AR gestures handled internally
          ================================================================ */}
      <model-viewer
        ref={modelViewerRef}
        src={modelConfig.glb_url}
        ios-src={modelConfig.usdz_url || undefined}
        poster={poster || undefined}
        alt={`Modelo 3D interactivo de ${productName}`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        ar-placement="floor"
        camera-controls
        touch-action="pan-y"
        auto-rotate={autoRotate}
        interaction-prompt="auto"
        xr-environment={modelConfig.xr_environment}
        shadow-intensity={modelConfig.shadow_intensity?.toString() || '1.0'}
        loading="eager"
        environment-image="neutral"
        exposure={exposure.toString()}
        shadow-softness="1"
        scale={`${scaleMultiplier} ${scaleMultiplier} ${scaleMultiplier}`}
        style={{ width: '100%', height: '100%', outline: 'none' }}
      >
        {/* ──────────────────────────────────────────────────────────────
            slot="ar-button" — Custom AR Activation Button
            ──────────────────────────────────────────────────────────────
            Browsers require a user gesture to start the camera/XR session.
            This slotted button replaces the default <model-viewer> AR icon
            with a large, branded, highly visible call-to-action.
        */}
        <button
          slot="ar-button"
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#6b3a0e',
            color: '#faf2e7',
            border: '2px solid rgba(250, 242, 231, 0.25)',
            borderRadius: '16px',
            padding: '14px 28px',
            fontSize: '14px',
            fontWeight: 800,
            letterSpacing: '0.02em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 32px rgba(107, 58, 14, 0.45), 0 0 0 1px rgba(250, 242, 231, 0.08)',
            backdropFilter: 'blur(12px)',
            zIndex: 40,
            whiteSpace: 'nowrap',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(-50%) scale(1.04)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(-50%)';
          }}
        >
          <Camera style={{ width: '20px', height: '20px', flexShrink: 0 }} />
          Ver en mi mesa (Activar Cámara)
        </button>

        {/* ──────────────────────────────────────────────────────────────
            Hotspots — 3D-anchored labels on the model surface
        */}
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

        {/* ──────────────────────────────────────────────────────────────
            slot="ar-ui" — WebXR DOM Overlay: In-AR Product Carousel
            ──────────────────────────────────────────────────────────────
            This <div> is projected directly onto the live camera feed
            during an active WebXR immersive-ar session, via the native
            WebXR DOM Overlay API.

            Platform behavior:
              ✅ Android (Chrome 79+): Fully visible & interactive over camera.
              ❌ iOS Quick Look: Silently ignored — Apple does not support
                 DOM Overlay in their AR Quick Look viewer. iOS users only
                 see the 3D model without the carousel.

            The carousel lets the user switch between AR-enabled products
            WITHOUT closing the camera — enabling a "continuous showroom"
            experience on supported devices.
        */}
        {products && products.length > 1 && (
          <div
            slot="ar-ui"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: '12px 16px 20px',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.22)',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '9px',
                fontWeight: 800,
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
                textAlign: 'center',
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}
            >
              Showroom Continuo — Toca para cambiar producto
            </span>
            <div
              style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '10px',
                paddingBottom: '4px',
              }}
            >
              {products.map((prod) => {
                const isActive = prod.id === activeProduct.id;
                const thumbSrc = prod.ar_poster_url
                  || prod.image_url
                  || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=150';

                return (
                  <button
                    key={prod.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCarouselSelect(prod);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '12px',
                      border: isActive
                        ? '2px solid #faf2e7'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      background: isActive
                        ? 'rgba(107, 58, 14, 0.85)'
                        : 'rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      flexShrink: 0,
                      minWidth: '140px',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      transform: isActive ? 'scale(1.03)' : 'scale(1)',
                      boxShadow: isActive
                        ? '0 4px 20px rgba(107, 58, 14, 0.5)'
                        : '0 2px 8px rgba(0,0,0,0.15)',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  >
                    <img
                      src={thumbSrc}
                      alt={prod.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: '#1c1917',
                      }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <p
                        style={{
                          fontSize: '11px',
                          fontWeight: isActive ? 700 : 500,
                          lineHeight: '1.2',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {prod.name}
                      </p>
                      <span
                        style={{
                          fontSize: '8px',
                          opacity: 0.7,
                          fontWeight: 300,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'block',
                          marginTop: '2px',
                        }}
                      >
                        {prod.category} · ${Number(prod.price).toFixed(2)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </model-viewer>

      {/* ================================================================
          Non-AR Carousel (visible when viewing the model in the web page,
          outside of an immersive WebXR session).
          The slot="ar-ui" carousel above is ONLY rendered during an active
          AR camera session. This duplicate carousel provides the same
          switching functionality in the standard 3D preview mode.
          ================================================================ */}
      {products && products.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full z-10 bg-white/15 backdrop-blur-md border-t border-white/20 p-4 pointer-events-auto select-none">
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
                      handleCarouselSelect(prod);
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

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full relative z-10 text-left shadow-2xl space-y-4 text-stone-200"
            >
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-gold">
                <HelpCircle className="w-5 h-5 text-gold" />
                <h3 className="font-extrabold text-white text-base">Guía de Interacción</h3>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-350">
                <div>
                  <h4 className="font-bold text-white mb-0.5">En Pantalla (Visor 3D):</h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-300">
                    <li><strong>Girar:</strong> Arrastra con 1 dedo o haz click izquierdo y arrastra.</li>
                    <li><strong>Zoom / Tamaño:</strong> Pellizca con 2 dedos, usa la rueda o los botones de la derecha.</li>
                    <li><strong>Mover:</strong> Arrastra con 2 dedos o haz click derecho y arrastra.</li>
                  </ul>
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <h4 className="font-bold text-white mb-0.5">En tu Espacio (Cámara AR):</h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-300">
                    <li><strong>Anclar:</strong> Apunta a una superficie plana (mesa/suelo) y mueve suavemente tu teléfono.</li>
                    <li><strong>Girar:</strong> Rota con 2 dedos sobre la pantalla.</li>
                    <li><strong>Cambiar Tamaño:</strong> Pellizca la pantalla para agrandar o encoger.</li>
                    <li><strong>Mover:</strong> Arrastra con 1 dedo.</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full py-2.5 bg-primary hover:bg-blue-900 text-[#faf2e7] rounded-xl font-bold text-xs transition-colors cursor-pointer text-center mt-2"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
