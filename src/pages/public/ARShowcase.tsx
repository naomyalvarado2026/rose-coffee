import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, QrCode, Coffee, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import ARViewer from '../../components/public/ARViewer';
import type { Product } from '../../types';

const MOCK_AR_PRODUCTS: Product[] = [
  {
    id: 'mock-ar-1',
    name: 'Pan de Masa Madre Rústico (Mock)',
    description: 'Hogaza de pan artesanal elaborado con harina orgánica de trigo, levadura salvaje nativa y fermentación lenta de 24 horas.',
    price: 6.00,
    image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600',
    stock: 20,
    category: 'Panadería',
    type: 'physical',
    cover_image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600',
    features: ['100% fermentación natural', 'Corteza crujiente, miga alveolada'],
    ar_model_url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    ar_poster_url: 'https://modelviewer.dev/shared-assets/models/Astronaut.webp',
    created_at: new Date().toISOString(),
  }
];

export default function ARShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showQrFor, setShowQrFor] = useState<Product | null>(null);

  useEffect(() => {
    fetchARProducts();
  }, []);


  const fetchARProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_ar_models(*)')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (error) throw error;

      // Filter products that have either direct ar_model_url or a linked glb_url
      const arProducts = (data || []).filter((product: any) => {
        const arModel = Array.isArray(product.product_ar_models)
          ? product.product_ar_models[0]
          : product.product_ar_models;
        return !!product.ar_model_url || (arModel && !!arModel.glb_url);
      });

      if (arProducts.length > 0) {
        setProducts(arProducts as Product[]);
      } else {
        setProducts(MOCK_AR_PRODUCTS);
      }
    } catch (err: any) {
      console.error('Error fetching AR products from Supabase:', err);
      toast.error('Error al cargar la galería 3D: ' + err.message);
      setProducts(MOCK_AR_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const getQRUrl = (productId: string) => {
    const currentUrl = `${window.location.origin}/ar?product=${productId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}&color=021a54&bgcolor=faf2e7`;
  };

  // Check URL query parameters to open a specific product directly (e.g. from QR scan)
  useEffect(() => {
    if (products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      if (productId) {
        const found = products.find((p) => p.id === productId);
        if (found) {
          setSelectedProduct(found);
        }
      }
    }
  }, [products]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#faf2e7]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf2e7] py-12 px-4 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="max-w-5xl mx-auto text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#021a54]/5 text-[#021a54] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4.5 h-4.5 text-[#6b3a0e] animate-pulse" />
          Experiencia Espacial WebAR
        </div>
        <h1 className="text-4xl font-extrabold text-[#021a54] font-sans tracking-tight">
          Menú Interactivo 3D
        </h1>
        <p className="max-w-xl mx-auto text-[#6b3a0e]/80 text-sm font-medium">
          Explora nuestros panes artesanales y cafés de especialidad en Realidad Aumentada en tiempo real. Apunta con tu dispositivo e interactúa con el menú.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-150 rounded-3xl shadow-xs max-w-lg mx-auto">
            <Coffee className="w-12 h-12 text-[#6b3a0e] opacity-40 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">El Menú 3D se está preparando</h3>
            <p className="text-xs text-slate-500 mt-1">
              Pronto podrás disfrutar del visor interactivo 3D.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Product Render/Image area */}
                <div className="aspect-square relative bg-slate-50 overflow-hidden group border-b border-slate-50">
                  {product.cover_image_url || product.image_url ? (
                    <img
                      src={product.cover_image_url || product.image_url || ''}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-450">
                      <Coffee className="w-12 h-12 opacity-30" />
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-[#021a54] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    {product.category}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans font-bold text-base text-stone-900">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-stone-100">
                    <span className="text-base font-bold text-[#021a54]">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      {/* QR Button for desktop users */}
                      <button
                        onClick={() => setShowQrFor(product)}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-[#021a54] hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                        title="Código QR para Escanear"
                      >
                        <QrCode className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="bg-[#021a54] hover:bg-[#021a54]/95 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        Ver en 3D
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Model Viewer Modal Popup */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-4xl h-[80vh] min-h-[500px] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
            >
              <div className="flex-1">
                {(() => {
                  const arModel = Array.isArray(selectedProduct.product_ar_models)
                    ? selectedProduct.product_ar_models[0]
                    : selectedProduct.product_ar_models;

                  const modelConfig = arModel
                    ? {
                        id: arModel.id,
                        product_id: selectedProduct.id,
                        glb_url: arModel.glb_url || selectedProduct.ar_model_url || '',
                        usdz_url: arModel.usdz_url,
                        ar_scale: arModel.ar_scale || 'fixed',
                        camera_controls: arModel.camera_controls ?? true,
                        auto_rotate: arModel.auto_rotate ?? true,
                        xr_environment: arModel.xr_environment ?? true,
                        shadow_intensity: arModel.shadow_intensity !== undefined ? arModel.shadow_intensity : 1.0,
                        video_url: arModel.video_url,
                        video_target_material: arModel.video_target_material,
                        created_at: arModel.created_at || selectedProduct.created_at,
                      }
                    : {
                        id: selectedProduct.id,
                        product_id: selectedProduct.id,
                        glb_url: selectedProduct.ar_model_url || '',
                        ar_scale: 'fixed' as const,
                        camera_controls: true,
                        auto_rotate: true,
                        xr_environment: true,
                        shadow_intensity: 1.5,
                        created_at: selectedProduct.created_at,
                      };

                  const viewerHotspots = (arModel && arModel.hotspots && arModel.hotspots.length > 0)
                    ? arModel.hotspots
                    : [
                        {
                          id: 'hotspot-price',
                          position: '0 0.2 0',
                          normal: '0 1 0',
                          label: `$${Number(selectedProduct.price).toFixed(2)}`,
                          type: 'price' as const
                        }
                      ];

                  return (
                    <ARViewer
                      arModel={modelConfig}
                      productName={selectedProduct.name}
                      onClose={() => setSelectedProduct(null)}
                      poster={selectedProduct.ar_poster_url || undefined}
                      hotspots={viewerHotspots}
                    />
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Popover Modal */}
      <AnimatePresence>
        {showQrFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#021a54]/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#faf2e7] border border-[#6b3a0e]/10 p-6 rounded-3xl shadow-xl max-w-xs w-full text-center space-y-4 relative"
            >
              <button
                onClick={() => setShowQrFor(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 cursor-pointer rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="bg-white p-3 rounded-2xl inline-block shadow-2xs border border-slate-100">
                <img
                  src={getQRUrl(showQrFor.id)}
                  alt="QR Code"
                  className="w-40 h-40 object-contain"
                />
              </div>
              <div>
                <h3 className="font-sans font-bold text-base text-[#021a54]">
                  Escanear con tu Móvil
                </h3>
                <p className="text-[11px] mt-1 leading-relaxed text-[#6b3a0e]" >
                  Escanea el código con la cámara de tu teléfono para experimentar la Realidad Aumentada nativa (WebXR/QuickLook) en tu mesa.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
