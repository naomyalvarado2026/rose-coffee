import { useEffect, useRef, useState } from 'react';
import { 
  Loader2, 
  RotateCcw, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  X, 
  ShoppingBag,
  Sun,
  Moon,
  HelpCircle,
  Plus,
  Minus,
  Camera,
  Info
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ARExperience } from '../../types';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';

interface MixedARViewerProps {
  experiences: ARExperience[];
  initialExperienceId?: string;
  onClose?: () => void;
  onAddToCart?: (productId: string) => void;
}

export default function MixedARViewer({ 
  experiences, 
  initialExperienceId, 
  onClose, 
  onAddToCart 
}: MixedARViewerProps) {
  const modelViewerRef = useRef<any>(null);
  const [activeExp, setActiveExp] = useState<ARExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoPlayBlocked, setVideoPlayBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [arSupported, setArSupported] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [exposure, setExposure] = useState(1.1);
  const [lightingMode, setLightingMode] = useState<'neutral' | 'sunset' | 'night'>('neutral');
  const [showHelp, setShowHelp] = useState(false);

  // Initialize active experience
  useEffect(() => {
    if (experiences.length === 0) return;
    const initial = experiences.find(e => e.id === initialExperienceId) || experiences[0];
    setActiveExp(initial);
  }, [experiences, initialExperienceId]);

  useEffect(() => {
    if (activeExp) {
      setAutoRotate(!!activeExp.enabled);
      setScaleMultiplier(1);
      setExposure(1.1);
      setLightingMode('neutral');
    }
  }, [activeExp]);

  const handleToggleLighting = () => {
    if (lightingMode === 'neutral') {
      setLightingMode('sunset');
      setExposure(1.6);
    } else if (lightingMode === 'sunset') {
      setLightingMode('night');
      setExposure(0.6);
    } else {
      setLightingMode('neutral');
      setExposure(1.1);
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
    if (!viewer || !activeExp) return;
    try {
      const blob = await viewer.toBlob({ idealAspect: true });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeExp.name}-3d.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('¡Foto capturada y guardada!');
    } catch (err) {
      console.error('Error taking screenshot:', err);
      toast.error('No se pudo capturar la foto.');
    }
  };

  // Track page views and load textures when active experience changes
  useEffect(() => {
    const exp = activeExp;
    if (!exp) return;

    // Reset loading state for new model
    setLoading(true);
    setVideoPlayBlocked(false);

    // Call RPC to increment view metric in Supabase
    const trackView = async () => {
      try {
        await supabase.rpc('increment_ar_metric', { 
          experience_id: exp.id, 
          metric_name: 'views' 
        });
      } catch (err) {
        console.error('Error incrementing view metric:', err);
      }
    };
    trackView();

    const viewer = modelViewerRef.current;
    if (!viewer) return;

    // Clean up previous video if exists
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.remove();
      videoRef.current = null;
    }

    const handleLoad = async () => {
      setLoading(false);

      if (viewer) {
        setArSupported(typeof viewer.canActivateAR === 'boolean' ? viewer.canActivateAR : true);
      }

      // Trigger metric for interaction
      const trackInteraction = async () => {
        try {
          await supabase.rpc('increment_ar_metric', { 
            experience_id: exp.id, 
            metric_name: 'interactions' 
          });
        } catch (err) {
          console.error('Error incrementing interaction metric:', err);
        }
      };
      trackInteraction();

      // Apply video texture for VIDEO_AR or MIXED_EXPERIENCE
      if ((exp.type === 'VIDEO_AR' || exp.type === 'MIXED_EXPERIENCE') && exp.video_url) {
        try {
          // Find material target:
          // For MIXED_EXPERIENCE, we look for 'video_target_material' in settings or defaults.
          // For VIDEO_AR, we typically map to any available material in the screen/quad model.
          const targetMatName = exp.animation_settings?.video_target_material || 'Screen';
          let material = viewer.model?.materials.find(
            (m: any) => m.name.toLowerCase() === targetMatName.toLowerCase()
          );

          // Fallback: If target material not found, take the first material
          if (!material && viewer.model?.materials.length > 0) {
            material = viewer.model.materials[0];
          }

          if (material) {
            // Create the video element
            const video = document.createElement('video');
            video.src = exp.video_url;
            video.autoplay = true;
            video.loop = true;
            video.muted = isMuted;
            video.playsInline = true;
            video.setAttribute('playsinline', 'true');
            video.setAttribute('webkit-playsinline', 'true');
            video.crossOrigin = 'anonymous';
            video.style.display = 'none';
            document.body.appendChild(video);
            videoRef.current = video;

            // Enable blending for transparency support (WebM VP9 Alpha)
            material.setAlphaMode('BLEND');

            // Play the video
            video.play().catch((err) => {
              console.warn('Autoplay blocked or manual interaction required:', err);
              setVideoPlayBlocked(true);
            });

            // Create and assign texture
            const texture = await viewer.createVideoTexture(video);
            if (material.pbrMetallicRoughness?.baseColorTexture) {
              material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
            }
          }
        } catch (err) {
          console.error('Error applying video texture in MixedARViewer:', err);
        }
      }
    };

    viewer.addEventListener('load', handleLoad);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.remove();
        videoRef.current = null;
      }
    };
  }, [activeExp]);

  // Handle Mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  // Play video manually if blocked by browser autoplay policy
  const handlePlayVideoManually = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setVideoPlayBlocked(false);
      }).catch((err) => {
        console.error('Manual play failed:', err);
        toast.error('No se pudo activar el video/holograma.');
      });
    }
  };

  const handleResetCamera = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.cameraOrbit = '0deg 75deg auto';
      modelViewerRef.current.cameraTarget = 'auto auto auto';
    }
  };

  const handleBuyClick = async () => {
    if (!activeExp) return;

    // Track buy intention metric
    try {
      await supabase.rpc('increment_ar_metric', { 
        experience_id: activeExp.id, 
        metric_name: 'purchases' 
      });
    } catch (err) {
      console.error('Error tracking purchase click:', err);
    }

    if (activeExp.product_id && onAddToCart) {
      onAddToCart(activeExp.product_id);
    } else {
      toast.info('Este elemento es una experiencia demostrativa en AR.');
    }
  };

  // Safe fallback GLB for Video-only AR (a thin billboard / green screen model)
  // If the admin doesn't provide a custom model_url for VIDEO_AR, we load a simple quad
  const glbSource = activeExp?.model_url || 
    'https://cdn.jsdelivr.net/gh/google/model-viewer/shared-assets/models/Astronaut.glb'; // safe default

  // Parse scale/position vector objects to string format for model-viewer attributes
  const formatScale = (s: any) => {
    if (!s) return `${scaleMultiplier} ${scaleMultiplier} ${scaleMultiplier}`;
    return `${(s.x ?? 1) * scaleMultiplier} ${(s.y ?? 1) * scaleMultiplier} ${(s.z ?? 1) * scaleMultiplier}`;
  };

  if (!activeExp) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-white overflow-hidden font-sans">
      
      {/* 1. TOP FLOATING INTERFACE (HTML DOM Overlay compatible) */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        
        {/* Active Item Title & Type Badge */}
        <div className="bg-slate-900/85 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col pointer-events-auto shadow-2xl max-w-[240px] md:max-w-md">
          <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">
            {activeExp.type === 'MODEL_3D' && '☕ Producto 3D'}
            {activeExp.type === 'VIDEO_AR' && '🎬 Holograma Video'}
            {activeExp.type === 'MIXED_EXPERIENCE' && '✨ Experiencia Mixta'}
          </span>
          <h2 className="text-sm md:text-base font-extrabold text-stone-100 truncate mt-0.5">
            {activeExp.name}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2.5 pointer-events-auto">
          {activeExp.video_url && (
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-stone-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
              title={isMuted ? 'Activar Sonido' : 'Mutear'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleResetCamera}
            className="w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-stone-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
            title="Resetear Cámara"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-red-950/85 backdrop-blur-md border border-red-500/25 flex items-center justify-center text-red-300 hover:text-white hover:bg-red-900 transition-all cursor-pointer shadow-lg"
              title="Salir del Showroom"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Fallback Banner: If device does not support AR */}
      {!arSupported && (
        <div className="absolute top-20 left-4 right-4 bg-amber-500/10 border border-amber-500/35 backdrop-blur-md p-3.5 rounded-2xl text-[11px] text-amber-200 font-medium flex items-start gap-2 shadow-lg z-20 pointer-events-auto">
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
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900/85 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          title="Aumentar tamaño +"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={handleDecreaseScale}
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900/85 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          title="Disminuir tamaño -"
        >
          <Minus className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
            autoRotate 
              ? 'bg-[#6b3a0e] border-[#faf2e7]/25 text-[#faf2e7] scale-102 font-bold' 
              : 'bg-slate-900/85 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 hover:scale-105 active:scale-95'
          }`}
          title={autoRotate ? "Pausar Rotación" : "Auto-Rotación"}
        >
          <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin [animation-duration:8s]' : ''}`} />
        </button>

        <button
          onClick={handleToggleLighting}
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900/85 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          title={`Luz: ${lightingMode === 'neutral' ? 'Estudio' : lightingMode === 'sunset' ? 'Atardecer' : 'Noche'}`}
        >
          {lightingMode === 'neutral' && <Sun className="w-4 h-4 text-amber-450" />}
          {lightingMode === 'sunset' && <Sun className="w-4 h-4 text-orange-455 animate-pulse" />}
          {lightingMode === 'night' && <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        <button
          onClick={takeScreenshot}
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900/85 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-850 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          title="Tomar Foto PNG"
        >
          <Camera className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => setShowHelp(true)}
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-900/85 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
          title="Ayuda / Gestos"
        >
          <HelpCircle className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* 2. LOADING STATE */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3.5 z-30 text-stone-400">
          <Loader2 className="w-9 h-9 text-gold animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest text-gold/80 animate-pulse">
            Iniciando Entorno Espacial...
          </span>
        </div>
      )}

      {/* 3. AUTOPLAY BLOCKED INTERACTION PROMPT */}
      {videoPlayBlocked && (
        <div className="absolute top-24 left-4 right-4 bg-slate-900/90 border border-amber-500/20 backdrop-blur-md p-4 rounded-2xl shadow-2xl z-40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-amber-400 font-semibold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Presiona para activar los efectos holográficos.</span>
          </div>
          <button
            onClick={handlePlayVideoManually}
            className="bg-gold hover:bg-amber-600 text-primary text-xs font-extrabold px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0 shadow-md"
          >
            Activar
          </button>
        </div>
      )}

      {/* 4. WEBXR MODEL-VIEWER CANVAS */}
      <model-viewer
        ref={modelViewerRef}
        src={glbSource}
        alt={`Rose Coffee Showroom AR - ${activeExp.name}`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        camera-controls
        touch-action="pan-y"
        auto-rotate={autoRotate}
        interaction-prompt="auto"
        xr-environment
        shadow-intensity="1.5"
        shadow-softness="0.8"
        environment-image="neutral"
        exposure={exposure.toString()}
        scale={formatScale(activeExp.scale)}
        orientation={activeExp.rotation || '0deg 0deg 0deg'}
        style={{ width: '100%', height: '100%', outline: 'none' }}
        className="model-viewer-canvas"
      >
        {/* Interactive Hotspots from Animation Settings */}
        {activeExp.animation_settings?.hotspots?.map((hotspot: any) => (
          <button
            key={hotspot.id}
            slot={hotspot.id}
            data-position={hotspot.position}
            data-normal={hotspot.normal}
            className="w-5 h-5 rounded-full border-2 border-white bg-gold/90 text-primary flex items-center justify-center shadow-lg transition-transform hover:scale-125 cursor-pointer outline-none animate-ping"
            onClick={(e) => {
              e.stopPropagation();
              toast.info(hotspot.label, { duration: 4000 });
            }}
          />
        ))}
      </model-viewer>

      {/* 5. BOTTOM INTERACTIVE BAR (Carrusel de Navegación In-AR y Compras) */}
      <div className="absolute bottom-6 left-4 right-4 z-20 flex flex-col gap-4 pointer-events-none">
        
        {/* Add to Cart Floating Panel */}
        {activeExp.product_id && (
          <div className="self-center pointer-events-auto">
            <button
              onClick={handleBuyClick}
              className="bg-gold hover:bg-amber-600 text-primary font-bold px-6 py-3 rounded-full shadow-2xl hover:shadow-gold/25 transition-all flex items-center gap-2 cursor-pointer border border-gold/40 transform hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              <span>Añadir al Carrito</span>
            </button>
          </div>
        )}

        {/* Carousel: Change experience without closing camera */}
        {experiences.length > 1 && (
          <div className="bg-slate-900/80 backdrop-blur-lg p-3 rounded-[24px] border border-white/5 pointer-events-auto shadow-2xl">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">
              Carrusel del Showroom (Navegación Rápida)
            </span>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {experiences.map((exp) => {
                const isActive = exp.id === activeExp.id;
                return (
                  <button
                    key={exp.id}
                    onClick={() => setActiveExp(exp)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left border transition-all duration-250 cursor-pointer shrink-0 min-w-[130px] ${
                      isActive 
                        ? 'bg-gold/15 border-gold text-gold font-bold shadow-md' 
                        : 'bg-slate-950/45 border-white/5 text-stone-300 hover:border-white/20 hover:bg-slate-800/40'
                    }`}
                  >
                    {exp.preview_image ? (
                      <img 
                        src={exp.preview_image} 
                        alt={exp.name} 
                        className="w-7 h-7 rounded-lg object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 text-xs">
                        🕶️
                      </div>
                    )}
                    <div className="truncate pr-1">
                      <p className="text-[11px] truncate leading-tight">{exp.name}</p>
                      <span className="text-[8px] opacity-75 font-light tracking-wide uppercase">
                        {exp.type === 'MODEL_3D' ? '3D' : exp.type === 'VIDEO_AR' ? 'Video' : 'Mixto'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
