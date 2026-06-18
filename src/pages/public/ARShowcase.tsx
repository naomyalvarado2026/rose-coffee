import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, QrCode, Coffee, Eye, X, Layers } from 'lucide-react';
import { toast } from 'sonner';
import ARViewer from '../../components/public/ARViewer';
import type { Product } from '../../types';
import FloatingElements from '../../components/public/FloatingElements';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import SEOHead from '../../components/common/SEOHead';

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
      <div className="flex min-h-[70vh] items-center justify-center bg-brand-base">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-base py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEOHead 
        title="Visualizador Menú 3D Realidad Aumentada - Rose Coffee" 
        description="Interactúa con nuestros panes artesanales de masa madre y combos de café en Realidad Aumentada (AR) 3D antes de comprarlos."
        keywords="AR 3D cafe, realidad aumentada menu, panaderia 3d, rose coffee realidad aumentada"
      />
      
      {/* Background animations */}
      <FloatingElements />

      {/* Decorative Glow Orbs for 3D depth field background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[550px] h-[250px] rounded-full bg-gradient-to-r from-coffee/8 to-gold/8 blur-[110px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/3 left-10 w-[300px] h-[300px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] rounded-full bg-coffee/5 blur-[130px] pointer-events-none" />
      </div>

      {/* Header section */}
      <div className="max-w-5xl mx-auto text-center mb-16 space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10 text-xs font-bold uppercase tracking-wider backdrop-blur-xs select-none">
          <Sparkles className="w-4 h-4 text-coffee animate-pulse" />
          Experiencia Espacial WebAR
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary font-sans tracking-tight">
          Menú Interactivo 3D
        </h1>
        <p className="max-w-xl mx-auto text-coffee-dark/85 text-sm font-semibold leading-relaxed">
          Explora nuestros panes artesanales y cafés de especialidad en Realidad Aumentada en tiempo real. Apunta con tu dispositivo e interactúa con el menú.
        </p>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white/70 backdrop-blur-xs border border-coffee/10 rounded-3xl shadow-xs max-w-lg mx-auto">
            <Coffee className="w-12 h-12 text-coffee opacity-40 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">El Menú 3D se está preparando</h3>
            <p className="text-xs text-slate-500 mt-1">
              Pronto podrás disfrutar del visor interactivo 3D.
            </p>
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            style={{ perspective: 1000 }}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                whileHover={{ 
                  y: -12, 
                  rotateX: 4, 
                  rotateY: -4, 
                  scale: 1.025, 
                  boxShadow: '0 25px 50px -12px rgba(107, 58, 14, 0.18)' 
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                onClick={() => setSelectedProduct(product)}
                className="bg-white/80 backdrop-blur-xs rounded-[32px] border border-coffee/10 overflow-hidden shadow-sm flex flex-col justify-between group transition-colors duration-350 hover:border-coffee/20 cursor-pointer relative"
              >
                {/* Product Render/Image area */}
                <div className="aspect-square relative bg-stone-50 overflow-hidden border-b border-stone-100">
                  {product.cover_image_url || product.image_url ? (
                    <img
                      src={product.cover_image_url || product.image_url || ''}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Coffee className="w-12 h-12 opacity-30" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-primary/90 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1.5 border border-white/10">
                    <Layers size={10} />
                    {product.category}
                  </div>

                  {/* 3D Active Badge */}
                  <div className="absolute top-4 right-4 bg-emerald-500/90 text-white text-[9px] font-extrabold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>3D ACTIVO</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-sans font-extrabold text-lg text-primary group-hover:text-coffee transition-colors duration-200">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed font-medium line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
                    <span className="text-xl font-black text-coffee-dark tracking-tight">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <div className="flex gap-2.5">
                      {/* QR Button for desktop users */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowQrFor(product); }}
                        className="w-9 h-9 rounded-xl border border-coffee/20 flex items-center justify-center text-[#021a54] hover:bg-coffee/5 transition-all cursor-pointer shadow-2xs hover:border-coffee/40 active:scale-95"
                        title="Código QR para Escanear"
                      >
                        <QrCode className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                        className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        Ver en 3D
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Model Viewer Modal Popup */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.93, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 25 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="bg-slate-900/90 border border-slate-800/80 w-full max-w-4xl h-[80vh] min-h-[500px] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(107,58,14,0.3)] relative flex flex-col backdrop-blur-xs"
            >
              {/* Premium Glow Orbs behind the 3D model */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-coffee/15 blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-gold/10 blur-[100px]" />
              </div>

              <div className="flex-1 relative z-10">
                <ARViewer
                  activeProduct={selectedProduct}
                  products={products}
                  onProductSelect={setSelectedProduct}
                  onClose={() => setSelectedProduct(null)}
                />
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
