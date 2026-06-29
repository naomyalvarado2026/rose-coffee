import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../config/supabase';

import { Loader2, ScanLine, AlertTriangle, Coffee, X, Camera, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { ARTarget, ARTargetMapping, Product } from '../../types';

interface JoinedMapping extends ARTargetMapping {
  products?: Product | null;
}

interface JoinedTarget extends ARTarget {
  ar_target_mappings?: JoinedMapping[];
}

/**
 * ARMenuScanner: Uses MindAR.js + A-Frame for image-tracked AR experiences.
 * Loads a compiled .mind target file and overlays 3D models or chromakey
 * video content over detected physical markers (menu cards, cups, coasters).
 *
 * Scripts are loaded lazily on mount to avoid affecting bundle size.
 */
export default function ARMenuScanner() {
  const [targets, setTargets] = useState<JoinedTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<JoinedTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [arActive, setArActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ar_targets')
        .select(`
          *,
          ar_target_mappings (
            *,
            products (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTargets((data || []) as JoinedTarget[]);
      if (data && data.length > 0) {
        setSelectedTarget(data[0] as JoinedTarget);
      }
    } catch (err: any) {
      console.error('Error fetching AR targets:', err);
      toast.error('Error al cargar los marcadores AR: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExternalScripts = useCallback(async () => {
    // Check if scripts already loaded
    if (document.querySelector('script[data-mindar]')) return;

    const scripts = [
      { src: 'https://cdn.jsdelivr.net/gh/nicolo-ribaudo/tc39-proposal-realms@0.4.4/shim.min.js', id: 'realms-shim' },
      { src: 'https://aframe.io/releases/1.6.0/aframe.min.js', id: 'aframe' },
      { src: 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js', id: 'mindar', attr: 'data-mindar' },
    ];

    for (const scriptDef of scripts) {
      if (document.getElementById(scriptDef.id)) continue;
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptDef.src;
        script.id = scriptDef.id;
        if (scriptDef.attr) script.setAttribute(scriptDef.attr, 'true');
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${scriptDef.src}`));
        document.head.appendChild(script);
      });
    }
  }, []);

  const startAR = async () => {
    if (!selectedTarget) {
      toast.error('Selecciona un marcador primero.');
      return;
    }

    setArActive(true);

    try {
      // Request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(t => t.stop()); // Release immediately — MindAR will manage the stream
      setCameraPermission('granted');

      // Load external scripts lazily
      await loadExternalScripts();

      // Build the A-Frame scene dynamically
      if (containerRef.current) {
        // Clear previous scene
        containerRef.current.innerHTML = '';

        const scene = document.createElement('a-scene');
        scene.setAttribute('mindar-image', `imageTargetSrc: ${selectedTarget.mind_file_url}; autoStart: true; uiScanning: no; uiLoading: no;`);
        scene.setAttribute('color-space', 'sRGB');
        scene.setAttribute('renderer', 'colorManagement: true; physicallyCorrectLights: true;');
        scene.setAttribute('vr-mode-ui', 'enabled: false');
        scene.setAttribute('device-orientation-permission-ui', 'enabled: false');

        // Camera entity
        const camera = document.createElement('a-camera');
        camera.setAttribute('position', '0 0 0');
        camera.setAttribute('look-controls', 'enabled: false');
        scene.appendChild(camera);

        // Create entities for each mapping (target index)
        const mappings = selectedTarget.ar_target_mappings || [];
        mappings.forEach((mapping) => {
          const anchor = document.createElement('a-entity');
          anchor.setAttribute('mindar-image-target', `targetIndex: ${mapping.target_index}`);

          if (mapping.video_url) {
            // Video plane (with optional chromakey)
            const videoId = `video-${mapping.target_index}`;
            const videoEl = document.createElement('video');
            videoEl.id = videoId;
            videoEl.src = mapping.video_url;
            videoEl.setAttribute('autoplay', 'true');
            videoEl.setAttribute('loop', 'true');
            videoEl.muted = true;
            videoEl.setAttribute('playsinline', 'true');
            videoEl.style.display = 'none';

            // Add to assets
            let assets = scene.querySelector('a-assets');
            if (!assets) {
              assets = document.createElement('a-assets');
              scene.prepend(assets);
            }
            assets.appendChild(videoEl);

            const plane = document.createElement('a-plane');
            plane.setAttribute('position', '0 0 0');
            plane.setAttribute('width', '1');
            plane.setAttribute('height', '0.5625');
            plane.setAttribute('rotation', '0 0 0');

            if (mapping.video_chromakey) {
              plane.setAttribute('material', `shader: chromakey; src: #${videoId}; color: 0.1 0.9 0.2`);
            } else {
              plane.setAttribute('material', `src: #${videoId}`);
            }

            anchor.appendChild(plane);
          } else if (mapping.product_id) {
            // Simple text annotation with product name
            const text = document.createElement('a-text');
            const productName = mapping.products?.name || 'Producto';
            const productPrice = mapping.products?.price ? `$${Number(mapping.products.price).toFixed(2)}` : '';
            text.setAttribute('value', `${productName}\n${productPrice}`);
            text.setAttribute('color', '#021a54');
            text.setAttribute('align', 'center');
            text.setAttribute('width', '2');
            text.setAttribute('position', '0 0 0');

            const bg = document.createElement('a-plane');
            bg.setAttribute('width', '1.2');
            bg.setAttribute('height', '0.4');
            bg.setAttribute('color', '#faf2e7');
            bg.setAttribute('opacity', '0.9');
            bg.setAttribute('position', '0 0 -0.01');
            anchor.appendChild(bg);
            anchor.appendChild(text);
          }

          // Event listeners for tracking
          anchor.addEventListener('targetFound', () => {
            console.log(`Target ${mapping.target_index} found`);
          });
          anchor.addEventListener('targetLost', () => {
            console.log(`Target ${mapping.target_index} lost`);
          });

          scene.appendChild(anchor);
        });

        containerRef.current.appendChild(scene);
        sceneRef.current = scene;
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setCameraPermission('denied');
        toast.error('Permiso de cámara denegado. Habilítalo en la configuración de tu navegador.');
      } else {
        console.error('Error starting AR:', err);
        toast.error('Error al iniciar la experiencia AR: ' + err.message);
      }
      setArActive(false);
    }
  };

  const stopAR = () => {
    if (sceneRef.current) {
      sceneRef.current.remove();
      sceneRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    setArActive(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf2e7]">
      {/* Header when not in AR mode */}
      {!arActive && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#021a54]/5 text-[#021a54] text-xs font-bold uppercase tracking-wider">
              <ScanLine className="w-4 h-4 text-[#6b3a0e]" />
              Escaneo de Menú Físico
            </div>
            <h1 className="text-3xl font-extrabold text-[#021a54] font-sans tracking-tight">
              Escáner de Menú AR
            </h1>
            <p className="max-w-md mx-auto text-[#6b3a0e]/80 text-sm font-medium">
              Apunta tu cámara hacia el menú impreso, el portavaso o el vaso con el logo de Rose Coffee para desbloquear contenido interactivo.
            </p>
          </div>

          {targets.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-stone-800 border border-slate-150 dark:border-stone-700 rounded-3xl shadow-xs max-w-lg mx-auto">
              <Coffee className="w-12 h-12 text-[#6b3a0e] opacity-40 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700">Los marcadores se están configurando</h3>
              <p className="text-xs text-slate-500 mt-1">
                Pronto podrás escanear nuestros menús físicos.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Target selector */}
              <div className="bg-white dark:bg-stone-800 rounded-2xl border border-slate-100 dark:border-stone-700 p-5 shadow-xs">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Selecciona el Marcador</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {targets.map((target) => (
                    <button
                      key={target.id}
                      onClick={() => setSelectedTarget(target)}
                      className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedTarget?.id === target.id
                          ? 'border-[#021a54] bg-[#021a54]/[0.03] shadow-xs'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <span className="font-bold text-sm text-[#021a54] block">{target.name}</span>
                      {target.description && (
                        <span className="text-[11px] text-slate-500 block mt-1">{target.description}</span>
                      )}
                      <span className="text-[10px] text-slate-400 block mt-2 font-medium">
                        {target.ar_target_mappings?.length || 0} elemento(s) mapeados
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info banner */}
              <div className="bg-[#021a54]/5 border border-[#021a54]/10 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#021a54] shrink-0 mt-0.5" />
                <div className="text-xs text-[#021a54]/80 space-y-1">
                  <p className="font-semibold">¿Cómo funciona?</p>
                  <p>Al presionar "Iniciar Cámara", se activará tu cámara trasera. Enfoca el marcador impreso y verás aparecer contenido de realidad aumentada superpuesto en tu pantalla.</p>
                </div>
              </div>

              {/* Start button */}
              <button
                onClick={startAR}
                disabled={!selectedTarget}
                className="w-full bg-[#021a54] hover:bg-[#021a54]/95 text-white font-bold text-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5" />
                Iniciar Cámara y Escanear
              </button>

              {cameraPermission === 'denied' && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-xs text-red-700 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Permiso de cámara denegado. Ve a la configuración del navegador para habilitarlo.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AR Active View */}
      {arActive && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Close button */}
          <button
            onClick={stopAR}
            className="absolute top-4 right-4 z-50 bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scanning indicator */}
          <div className="absolute top-4 left-4 z-50 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <ScanLine className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-[10px] font-bold text-green-300 uppercase tracking-wider">Escaneando...</span>
          </div>

          {/* MindAR A-Frame scene container */}
          <div ref={containerRef} className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
