import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, QrCode, Coffee, X, Play } from 'lucide-react';
import { toast } from 'sonner';
import SEOHead from '../../components/common/SEOHead';
import MixedARViewer from '../../components/public/MixedARViewer';
import type { ARExperience, Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';

const MOCK_AR_EXPERIENCES: ARExperience[] = [
  {
    id: 'mock-exp-1',
    name: 'Café Rose de Especialidad (400g)',
    type: 'MODEL_3D',
    category: 'PRODUCT',
    preview_image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
    model_url: 'https://cdn.jsdelivr.net/gh/google/model-viewer/shared-assets/models/Astronaut.glb', // fallback GLB
    scale: { x: 0.15, y: 0.15, z: 0.15 },
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-exp-2',
    name: 'Holograma de Preparación V60',
    type: 'VIDEO_AR',
    category: 'VIDEO',
    preview_image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-maker-machine-brewing-close-up-1736-large.mp4', // public fallback MP4
    enabled: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-exp-3',
    name: 'Pan de Masa Madre Rústica',
    type: 'MIXED_EXPERIENCE',
    category: 'PRODUCT',
    preview_image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600',
    model_url: 'https://cdn.jsdelivr.net/gh/google/model-viewer/shared-assets/models/Astronaut.glb',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-water-into-a-mug-43034-large.mp4',
    enabled: true,
    created_at: new Date().toISOString()
  }
];

export default function ARShowroom() {
  const [experiences, setExperiences] = useState<ARExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PRODUCT' | 'VIDEO' | 'ANIMATION'>('ALL');
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null);
  const [showQrFor, setShowQrFor] = useState<ARExperience | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ar_experiences')
        .select('*')
        .eq('enabled', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setExperiences(data as ARExperience[]);
      } else {
        setExperiences(MOCK_AR_EXPERIENCES);
      }
    } catch (err: any) {
      console.error('Error fetching experiences from Supabase:', err);
      // Fallback
      setExperiences(MOCK_AR_EXPERIENCES);
    } finally {
      setLoading(false);
    }
  };

  // Check query params on load (e.g. from QR: /ar/showroom?exp=id)
  useEffect(() => {
    if (experiences.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const expId = params.get('exp');
      if (expId) {
        const found = experiences.find((e) => e.id === expId);
        if (found) {
          setSelectedExpId(found.id);
        }
      }
    }
  }, [experiences]);

  // Handle adding product to cart
  const handleAddToCart = async (productId: string) => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (product) {
        useCartStore.getState().addItem(product as Product);
        toast.success(`¡"${product.name}" añadido al carrito!`);
      }
    } catch (err: any) {
      console.error('Error fetching product for cart:', err);
      toast.error('No se pudo añadir el producto al carrito.');
    }
  };

  // Get QR URL for a specific experience
  const getQRUrl = (expId: string) => {
    const currentUrl = `${window.location.origin}${import.meta.env.BASE_URL}ar/showroom?exp=${expId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&color=021a54&bgcolor=faf2e7`;
  };

  const filteredExperiences = experiences.filter(exp => {
    if (activeTab === 'ALL') return true;
    return exp.category === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#faf2e7] py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead 
        title="Showroom de Realidad Aumentada Space" 
        description="Interactúa con modelos 3D, videos holográficos y composiciones en realidad aumentada de Rose Coffee. Escanea la mesa y experimenta."
        keywords="realidad aumentada, showroom ar, cafe 3d, webxr, panaderia ar"
      />

      <div className="max-w-5xl mx-auto text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#021a54]/5 text-[#021a54] text-xs font-extrabold uppercase tracking-widest border border-[#021a54]/10">
          <Sparkles className="w-4 h-4 text-[#6b3a0e] animate-pulse" />
          Showroom Espacial WebXR
        </div>
        <h1 className="text-4xl font-extrabold text-[#021a54] tracking-tight">
          Experiencia Inmersiva AR
        </h1>
        <p className="text-[#6b3a0e]/80 text-sm max-w-xl mx-auto font-light leading-relaxed">
          Escanea tu mesa para anclar nuestros cafés de especialidad o visualiza hologramas interactivos de preparación sin salir de la cámara.
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="max-w-md mx-auto mb-10 flex justify-center p-1.5 bg-white dark:bg-stone-800/60 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-stone-700/50 shadow-sm">
        {(['ALL', 'PRODUCT', 'VIDEO', 'ANIMATION'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === tab 
                ? 'bg-[#021a54] text-white shadow-md' 
                : 'text-stone-600 hover:text-[#021a54] hover:bg-stone-100/50'
            }`}
          >
            {tab === 'ALL' && '✨ Todos'}
            {tab === 'PRODUCT' && '☕ Catálogo'}
            {tab === 'VIDEO' && '🎬 Hologramas'}
            {tab === 'ANIMATION' && '🎨 Efectos'}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-[#021a54] animate-spin" />
        </div>
      ) : filteredExperiences.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-800/40 border border-dashed border-stone-300 rounded-3xl p-8 max-w-md mx-auto">
          <Coffee className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <p className="text-stone-500 font-semibold text-sm">No se encontraron experiencias AR</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {filteredExperiences.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-stone-800/70 backdrop-blur-sm rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700/60 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
            >
              {/* Image Preview & Hover Play */}
              <div className="aspect-video relative overflow-hidden bg-stone-100">
                <img
                  src={exp.preview_image || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400'}
                  alt={exp.name}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#021a54]/90 text-[#faf2e7] text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                  {exp.type === 'MODEL_3D' && '3D GLB'}
                  {exp.type === 'VIDEO_AR' && 'Holograma'}
                  {exp.type === 'MIXED_EXPERIENCE' && 'Modelo + Video'}
                </div>
              </div>

              {/* Body info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h2 className="font-bold text-lg text-[#021a54] line-clamp-1 leading-snug">{exp.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider bg-stone-100/65 px-2 py-0.5 rounded-md">
                      {exp.category}
                    </span>
                    {exp.views_count !== undefined && (
                      <span className="text-[10px] text-stone-400 font-medium">
                        👁️ {exp.views_count} vistas
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  {/* Visualizar Button */}
                  <button
                    onClick={() => setSelectedExpId(exp.id)}
                    className="flex-1 bg-[#6b3a0e] hover:bg-[#4d2607] text-[#faf2e7] text-xs font-bold py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Visualizar</span>
                  </button>

                  {/* QR Button */}
                  <button
                    onClick={() => setShowQrFor(exp)}
                    className="border border-[#021a54]/20 hover:bg-[#021a54]/5 text-[#021a54] text-xs font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Código QR</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 6. MODAL VISOR ESPACIAL (MixedARViewer) */}
      <AnimatePresence>
        {selectedExpId && (
          <MixedARViewer
            experiences={experiences}
            initialExperienceId={selectedExpId}
            onClose={() => setSelectedExpId(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* 7. MODAL CODIGO QR */}
      <AnimatePresence>
        {showQrFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrFor(null)}
              className="absolute inset-0 bg-[#021a54]/45 backdrop-blur-xs"
            />
            {/* Card Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#faf2e7] p-8 rounded-3xl max-w-sm w-full relative z-10 text-center shadow-2xl border border-stone-200 dark:border-stone-700/50 space-y-6"
            >
              <button
                onClick={() => setShowQrFor(null)}
                className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 dark:text-stone-200 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="font-extrabold text-[#021a54] text-lg">Escanear Experiencia</h3>
                <p className="text-stone-500 text-xs">{showQrFor.name}</p>
              </div>

              {/* QR Image Frame */}
              <div className="w-48 h-48 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl mx-auto flex items-center justify-center shadow-inner overflow-hidden p-2">
                <img
                  src={getQRUrl(showQrFor.id)}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-[#6b3a0e] text-[11px] leading-relaxed">
                Abre la cámara de tu celular y apunta al código QR para anclar esta experiencia directamente en tu espacio real.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
