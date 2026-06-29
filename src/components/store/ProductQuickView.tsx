import { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import type { Product, ProductARModel } from '../../types';
import { 
  ShoppingBag, Plus, Minus, Maximize2, 
  ChevronRight, Star, X, ChevronLeft
} from 'lucide-react';
import OptimizedMedia from '../common/OptimizedMedia';
import { motion, AnimatePresence } from 'framer-motion';
import { renderFeatureIcon, type ProductFeature } from '../../utils/productSpecs';

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  arModel?: ProductARModel | null;
  onOpenAR?: () => void;
}

const ProductQuickView = ({ product, onClose, onNext, onPrev, arModel, onOpenAR }: ProductQuickViewProps) => {
  const addItem = useCartStore((state) => state.addItem);
  
  const [added, setAdded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Variant states
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const variants = product.product_variants || [];
  const availableColors = Array.from(new Map(variants.filter(v => v.color_name).map(v => [v.color_name, v])).values());
  const availableSizes = Array.from(new Set(variants.filter(v => v.size).map(v => v.size)));

  const [prevProduct, setPrevProduct] = useState(product);
  if (product.id !== prevProduct.id) {
    setPrevProduct(product);
    setSelectedColor(availableColors.length > 0 ? availableColors[0].color_name! : null);
    setSelectedSize(availableSizes.length > 0 ? availableSizes[0] : null);
    setQuantity(1);
    setActiveImage(product.cover_image_url || product.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600');
  }



  // Find corresponding variant
  const currentVariant = variants.find(v => {
    const colorMatch = !selectedColor || v.color_name === selectedColor;
    const sizeMatch = !selectedSize || v.size === selectedSize;
    return colorMatch && sizeMatch;
  }) || null;

  const matchedVariant = currentVariant || variants.find(v => !selectedColor || v.color_name === selectedColor) || null;

  const finalPrice = Number(product.price) + (matchedVariant?.price_adjustment ? Number(matchedVariant.price_adjustment) : 0);
  const finalStock = matchedVariant ? matchedVariant.stock : (product.stock || 0);

  // Parse features list safely
  let featuresList: (string | ProductFeature)[] = [];
  if (Array.isArray(product.features)) {
    featuresList = product.features;
  } else if (typeof product.features === 'string') {
    try {
      featuresList = JSON.parse(product.features);
    } catch {
      featuresList = [product.features];
    }
  }

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (finalStock <= 0) return;
    addItem(product, matchedVariant, quantity);
    setAdded(true);
    useCartStore.getState().openDrawer();
    setTimeout(() => {
      setAdded(false);
      onClose(); // Optional: close modal after adding to cart
    }, 1500);
  };

  // Gallery images list (avoid duplicates)
  const baseImage = product.cover_image_url || product.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600';
  const galleryImages = [
    baseImage,
    ...variants.map(v => v.cloudinary_image_url).filter((url): url is string => !!url)
  ].filter((value, index, self) => self.indexOf(value) === index);

  // If a variant changes and has a custom image, auto-update the active image
  const variantImage = matchedVariant?.cloudinary_image_url;
  const displayImage = variantImage || activeImage || baseImage;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-brand-base dark:bg-stone-900 w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Options */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white dark:bg-stone-800/80 hover:bg-white dark:bg-stone-800 backdrop-blur-md text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 dark:text-stone-200 rounded-full flex items-center justify-center transition-all shadow-sm focus-visible:outline-none"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Arrows */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white dark:bg-stone-800/90 hover:bg-white dark:bg-stone-800 text-coffee dark:text-gold rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 hidden md:flex focus-visible:outline-none"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white dark:bg-stone-800/90 hover:bg-white dark:bg-stone-800 text-coffee dark:text-gold rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 hidden md:flex focus-visible:outline-none"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Content Area - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6 md:p-10 scrollbar-thin scrollbar-thumb-stone-300 scrollbar-track-transparent">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Media Gallery */}
            <div className="lg:col-span-5 xl:col-span-6 space-y-4">
              <div className="relative bg-white dark:bg-stone-800 rounded-3xl overflow-hidden shadow-md border border-stone-200 dark:border-stone-700/50 flex items-center justify-center min-h-[300px] max-h-[500px] group">
                <button 
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="w-full h-full flex items-center justify-center cursor-zoom-in focus-visible:outline-none"
                >
                  <OptimizedMedia
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-auto max-h-[500px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </button>
                
                {product.type === 'digital' && (
                  <span className="absolute bottom-4 left-4 bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm z-10 pointer-events-none">
                    Recurso Digital / Descargable
                  </span>
                )}

                {arModel && (
                  <button
                    onClick={onOpenAR}
                    className="absolute bottom-4 right-4 bg-primary/95 text-white hover:bg-primary border border-white/10 px-4 py-2 rounded-xl text-xs font-bold shadow-md z-10 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Maximize2 size={14} />
                    Ver en AR 3D
                  </button>
                )}
              </div>

              {/* Thumbnails Gallery */}
              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none justify-center">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        displayImage === imgUrl ? 'border-coffee scale-95 shadow-sm' : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <img src={imgUrl} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Detail & Configurator */}
            <div className="lg:col-span-7 xl:col-span-6 space-y-6 text-left">
              
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 pr-12">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-amber-50 dark:bg-amber-900/50 px-2.5 py-1 rounded-md border border-amber-200/50">
                    {product.category}
                  </span>

                  {/* Fixed 5 Stars Rating */}
                  <div className="flex items-center gap-0.5 text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" className="stroke-none" />
                    ))}
                    <span className="text-xs text-stone-500 ml-1.5 font-bold">(5.0)</span>
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-primary leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Description */}
              <div className="text-stone-600 text-sm leading-relaxed font-light">
                <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
              </div>

              {/* Listado de Características Adicionales */}
              {featuresList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-sans">Características</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {featuresList.map((feat, idx) => {
                      const isObject = typeof feat === 'object' && feat !== null;
                      const text = isObject ? (feat as ProductFeature).text : (feat as string);
                      const icon = isObject ? (feat as ProductFeature).icon : undefined;
                      const iconType = isObject ? (feat as ProductFeature).iconType : undefined;
                      
                      return (
                        <li key={idx} className="text-xs text-stone-650 flex items-start gap-2.5 font-medium bg-white dark:bg-stone-800/40 p-2 rounded-xl border border-stone-200 dark:border-stone-700/40">
                          {renderFeatureIcon(icon, iconType, text)}
                          <span className="leading-normal">{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Configuración de Compra */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-700/60 space-y-5">
                {variants.length > 0 && (
                  <div className="space-y-4">
                    {/* Grind Option / Color Selection */}
                    {availableColors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 font-sans">Tipo / Molienda: {selectedColor}</h4>
                        <div className="flex flex-wrap gap-2">
                          {availableColors.map((col) => (
                            <button
                              key={col.id}
                              onClick={() => setSelectedColor(col.color_name)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 focus-visible:outline-none ${
                                selectedColor === col.color_name
                                  ? 'bg-coffee/10 border-coffee text-coffee dark:text-gold shadow-2xs font-bold'
                                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
                              }`}
                            >
                              <span 
                                className="w-3.5 h-3.5 rounded-full border border-stone-300 inline-block shrink-0" 
                                style={{ backgroundColor: col.color_hex || '#CCC' }} 
                              />
                              {col.color_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Options */}
                    {availableSizes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 font-sans">Tamaño / Presentación</h4>
                        <div className="flex gap-2.5">
                          {availableSizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all focus-visible:outline-none ${
                                selectedSize === size
                                  ? 'bg-coffee text-white border-coffee shadow-xs'
                                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Availability */}
                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-stone-550 font-bold">Disponibilidad</span>
                  <span className={`font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider ${
                    finalStock > 0 
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}>
                    {finalStock > 0 
                      ? product.type === 'digital' ? 'Digital Instantáneo' : 'En Stock'
                      : 'Agotado'}
                  </span>
                </div>

                {/* Bottom Actions Bar */}
                <div className="bg-white dark:bg-stone-800/80 backdrop-blur-md border border-stone-250/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex flex-col text-left self-start sm:self-center">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Monto Total</span>
                    <span className="text-2xl font-extrabold text-coffee dark:text-gold tracking-tight">
                      ${(finalPrice * quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Quantity Controls */}
                    {finalStock > 0 && product.type !== 'digital' && (
                      <div className="flex items-center border border-stone-200 dark:border-stone-700/80 rounded-2xl bg-stone-50 dark:bg-stone-800 shrink-0">
                        <button
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="p-3 text-stone-600 hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-200 transition-colors focus-visible:outline-none"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-extrabold text-stone-800 dark:text-stone-200">{quantity}</span>
                        <button
                          onClick={() => setQuantity(prev => Math.min(finalStock, prev + 1))}
                          className="p-3 text-stone-600 hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-200 transition-colors focus-visible:outline-none"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={finalStock <= 0}
                      className={`flex-grow sm:flex-grow-0 px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md focus-visible:outline-none overflow-hidden relative ${
                        finalStock <= 0
                          ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed shadow-none border border-stone-200 dark:border-stone-700'
                          : added
                          ? 'bg-green-600 text-white shadow-green-150'
                          : 'bg-coffee hover:bg-coffee-dark text-white hover:shadow-lg'
                      }`}
                    >
                      {finalStock <= 0 ? (
                        <>
                          <ShoppingBag size={14} />
                          Agotado
                        </>
                      ) : added ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor">
                            <motion.path
                              d="M20 6L9 17l-5-5"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                          </svg>
                          ¡Agregado!
                        </motion.div>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          Agregar al Carrito
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mobile Navigation Arrows (Visible only on small screens below content) */}
                <div className="flex justify-between items-center md:hidden pt-4 border-t border-stone-200 dark:border-stone-700/50">
                   {onPrev ? (
                    <button onClick={onPrev} className="text-coffee dark:text-gold flex items-center gap-1 text-xs font-bold px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl">
                      <ChevronLeft size={16} /> Anterior
                    </button>
                   ) : <div/>}
                   {onNext ? (
                    <button onClick={onNext} className="text-coffee dark:text-gold flex items-center gap-1 text-xs font-bold px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl">
                      Siguiente <ChevronRight size={16} />
                    </button>
                   ) : <div/>}
                </div>

              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Lightbox Overlay (inner modal) */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-white dark:bg-stone-800/10 hover:bg-white dark:bg-stone-800/20 p-2 rounded-full transition-colors z-50 focus-visible:outline-none"
            >
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full h-full flex items-center justify-center p-4 sm:p-12 cursor-zoom-out"
            >
              <img
                src={displayImage}
                alt={product.name}
                className="max-w-full max-h-full object-contain shadow-2xl drop-shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductQuickView;
