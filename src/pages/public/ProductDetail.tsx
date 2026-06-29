import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { useCartStore } from '../../store/useCartStore';
import type { Product, ProductARModel } from '../../types';
import { 
  ShoppingBag, Sparkles, Plus, Minus, Eye, Maximize2, 
  ArrowLeft, ChevronRight, Star, AlertTriangle, Loader2,
  X, ChevronLeft
} from 'lucide-react';
import OptimizedMedia from '../../components/common/OptimizedMedia';
import { motion, AnimatePresence } from 'framer-motion';
import ARViewer from '../../components/public/ARViewer';
import { renderFeatureIcon, type ProductFeature } from '../../utils/productSpecs';
import SEOHead from '../../components/common/SEOHead';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [arModel, setArModel] = useState<ProductARModel | null>(null);
  const [isArOpen, setIsArOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Variant states
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [arProducts, setArProducts] = useState<Product[]>([]);

  // Fetch other AR products for the continuous showroom
  useEffect(() => {
    const fetchARProducts = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('*, product_ar_models(*)')
          .is('deleted_at', null)
          .order('name', { ascending: true });
        
        if (data) {
          const filtered = data.filter((p: any) => {
            const arModel = Array.isArray(p.product_ar_models)
              ? p.product_ar_models[0]
              : p.product_ar_models;
            return !!p.ar_model_url || (arModel && !!arModel.glb_url);
          });
          setArProducts(filtered as Product[]);
        }
      } catch (err) {
        console.error('Error fetching AR products in ProductDetail:', err);
      }
    };
    fetchARProducts();
  }, []);


  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Fetch product with variants
        const { data, error } = await supabase
          .from('products')
          .select('*, product_variants(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setProduct(data as Product);
          
          // Fetch AR Model if exists
          const { data: arData } = await supabase
            .from('product_ar_models')
            .select('*')
            .eq('product_id', id)
            .maybeSingle();

          if (arData) {
            setArModel(arData as ProductARModel);
          }
        }
      } catch (err) {
        console.error('Error al obtener los detalles del producto:', err);
        toast.error('No se pudo cargar la información del producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Initialize selected variants when product data changes
  useEffect(() => {
    if (product) {
      const variants = product.product_variants || [];
      const availableColors = Array.from(new Map(variants.filter(v => v.color_name).map(v => [v.color_name, v])).values());
      const availableSizes = Array.from(new Set(variants.filter(v => v.size).map(v => v.size)));
      
      if (availableColors.length > 0) {
        // eslint-disable-next-line
        setSelectedColor(availableColors[0].color_name);
      }
      if (availableSizes.length > 0) {
        setSelectedSize(availableSizes[0]);
      }
      
      // Initialize active image
      setActiveImage(product.cover_image_url || product.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600');
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4 bg-brand-base dark:bg-stone-900">
        <Loader2 className="animate-spin text-coffee dark:text-gold w-10 h-10" />
        <p className="text-stone-500 font-bold uppercase tracking-wider text-xs">Cargando experiencia premium...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4 text-center px-4 bg-brand-base dark:bg-stone-900">
        <AlertTriangle className="text-gold w-16 h-16" />
        <h2 className="text-2xl font-bold text-primary">Producto no encontrado</h2>
        <p className="text-stone-500 max-w-sm text-sm">El producto que buscas no existe o ha sido retirado de nuestra tienda.</p>
        <button
          onClick={() => navigate('/tienda')}
          className="mt-4 px-6 py-2.5 bg-coffee hover:bg-coffee-dark text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md focus-visible:ring-2 focus-visible:ring-coffee focus-visible:outline-none"
        >
          <ArrowLeft size={16} />
          Volver a la Tienda
        </button>
      </div>
    );
  }

  const variants = product.product_variants || [];
  const availableColors = Array.from(new Map(variants.filter(v => v.color_name).map(v => [v.color_name, v])).values());
  const availableSizes = Array.from(new Set(variants.filter(v => v.size).map(v => v.size)));

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
    toast.success(`${product.name} agregado al carrito`);
    setTimeout(() => setAdded(false), 1500);
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 bg-brand-base dark:bg-stone-900">
      <SEOHead 
        title={`${product.name} - Rose Coffee`} 
        description={product.description || `Adquiere ${product.name} en nuestra tienda online premium de café de especialidad y panadería artesanal.`}
        keywords={`${product.name}, cafe especialidad, pan masa madre, comprar cafe, rose coffee`}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-stone-500 mb-6 font-medium">
        <Link to="/" className="hover:text-coffee dark:text-gold transition-colors">Inicio</Link>
        <ChevronRight size={12} />
        <Link to="/tienda" className="hover:text-coffee dark:text-gold transition-colors">Tienda</Link>
        <ChevronRight size={12} />
        <span className="text-stone-400 capitalize">{product.category}</span>
        <ChevronRight size={12} />
        <span className="text-stone-700 font-semibold line-clamp-1">{product.name}</span>
      </div>

      {/* Volver a la tienda */}
      <Link
        to="/tienda"
        className="inline-flex items-center gap-2 text-xs font-bold text-coffee dark:text-gold hover:text-coffee dark:text-gold-dark mb-8 group transition-colors focus-visible:outline-none"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver a la Tienda
      </Link>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Media Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative bg-white dark:bg-stone-800 rounded-3xl overflow-hidden shadow-md border border-stone-200 dark:border-stone-700/50 flex items-center justify-center min-h-[300px] max-h-[600px] group">
            <button 
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="w-full h-full flex items-center justify-center cursor-zoom-in focus-visible:outline-none"
              aria-label="Ver imagen en pantalla completa"
            >
              <OptimizedMedia
                src={displayImage}
                alt={product.name}
                className="w-full h-auto max-h-[600px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </button>
            
            {product.type === 'digital' && (
              <span className="absolute bottom-4 left-4 bg-purple-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm z-10 pointer-events-none">
                Recurso Digital / Descargable
              </span>
            )}

            {arModel && (
              <button
                onClick={() => setIsArOpen(true)}
                className="absolute bottom-4 right-4 bg-primary/95 text-white hover:bg-primary border border-white/10 px-4 py-2 rounded-xl text-xs font-bold shadow-md z-10 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Maximize2 size={14} />
                Ver en Realidad Aumentada
              </button>
            )}
          </div>

          {/* Thumbnails Gallery */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
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
        <div className="lg:col-span-6 space-y-6 text-left">
          
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
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

            <h1 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Description */}
          <div className="text-stone-600 text-sm md:text-base leading-relaxed font-light">
            <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
          </div>

          {/* Technical Specifications */}
          {product.category === 'Café' && (
            <div className="bg-[#fdf6ee] dark:bg-stone-800 border border-coffee/15 rounded-3xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-coffee dark:text-gold flex items-center gap-1.5">
                <Sparkles size={14} className="text-gold fill-gold" />
                Ficha Técnica Artesanal
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-stone-600 font-medium">
                <div>
                  <span className="text-[9px] text-stone-400 block font-bold uppercase">Origen / Región</span>
                  <span className="text-stone-700 font-bold">Zaruma, El Oro, Ecuador</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 block font-bold uppercase">Proceso de Selección</span>
                  <span className="text-stone-700 font-bold">Honey / Lavado a Mano</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 block font-bold uppercase">Notas de Cata</span>
                  <span className="text-stone-700 font-bold">🍫 Chocolate Amargo • 🌰 Avellana tostada • 🍯 Miel</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 block font-bold uppercase">Altura de Cultivo</span>
                  <span className="text-stone-700 font-bold">1450m - 1650m</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-stone-400 block font-bold uppercase mb-1.5">Nivel de Tueste</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden flex">
                      <div className="bg-coffee rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-coffee dark:text-gold uppercase shrink-0">Medio Artesanal</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {product.category === 'Panadería' && (
            <div className="bg-[#fdf6ee] dark:bg-stone-800 border border-coffee/15 rounded-3xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-coffee dark:text-gold flex items-center gap-1.5">
                <Sparkles size={14} className="text-gold fill-gold" />
                Detalles del Panadero
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-stone-600 font-medium">
                <div>
                  <span className="text-[9px] text-stone-400 block font-bold uppercase">Fermentación</span>
                  <span className="text-stone-700 font-bold">⏳ 24 Horas Lenta y Controlada</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 block font-bold uppercase">Levadura</span>
                  <span className="text-stone-700 font-bold">🌾 Cultivo Salvaje Nativo</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 block font-bold uppercase">Harina</span>
                  <span className="text-stone-700 font-bold">🌾 Trigo Ecológico Sin Blanquear</span>
                </div>
                <div>
                  <span className="text-[9px] text-stone-400 block font-bold uppercase">Textura</span>
                  <span className="text-stone-700 font-bold">Corteza Crujiente, Alveolado Alto</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] text-stone-400 block font-bold uppercase mb-1.5">Digestibilidad</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-600 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase shrink-0">Máxima Digestión</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listado de Características Adicionales */}
          {featuresList.length > 0 && (
            <div className="space-y-2">
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
              <span className="text-stone-550 font-bold">Disponibilidad en Tienda</span>
              <span className={`font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider ${
                finalStock > 0 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {finalStock > 0 
                  ? product.type === 'digital' ? 'Acceso Digital Instantáneo' : 'Disponible / En Stock'
                  : 'Agotado'}
              </span>
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-white dark:bg-stone-800/80 backdrop-blur-md border border-stone-250/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex flex-col text-left self-start sm:self-center">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Monto Total</span>
                <span className="text-3xl font-extrabold text-coffee dark:text-gold tracking-tight">
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
                      aria-label="Restar uno"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-extrabold text-stone-800 dark:text-stone-200">{quantity}</span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(finalStock, prev + 1))}
                      className="p-3 text-stone-600 hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-200 transition-colors focus-visible:outline-none"
                      aria-label="Sumar uno"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={finalStock <= 0}
                  className={`flex-grow sm:flex-grow-0 px-8 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md focus-visible:outline-none ${
                    finalStock <= 0
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed shadow-none border border-stone-200'
                      : added
                      ? 'bg-green-600 text-white shadow-green-150'
                      : 'bg-coffee hover:bg-coffee-dark text-white hover:shadow-lg'
                  }`}
                >
                  <ShoppingBag size={14} />
                  {finalStock <= 0
                    ? 'Agotado'
                    : added
                    ? 'Agregado ✓'
                    : 'Añadir al Carrito'}
                </button>
              </div>
            </div>

            {/* AR Experiencia Info Callout */}
            {arModel && (
              <div className="bg-blue-50/40 dark:bg-blue-900/40 border border-primary/10 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Maximize2 size={14} className="text-primary animate-pulse" />
                    Realidad Aumentada Activa
                  </h5>
                  <p className="text-[10px] text-stone-500 leading-normal">
                    ¿Quieres ver las dimensiones de esta presentación? Escanea o interactúa con el modelo 3D directamente desde tu celular.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsArOpen(true)}
                  className="bg-primary hover:bg-[#0a2a6e] text-white text-[10px] font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs focus-visible:outline-none"
                >
                  <Eye size={12} />
                  Visualizar en 3D
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Lightbox Modal overlay */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center"
          >
            {/* Close button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-white dark:bg-stone-800/10 hover:bg-white dark:bg-stone-800/20 p-2 rounded-full transition-colors z-50 focus-visible:outline-none"
            >
              <X size={24} />
            </button>

            {/* Previous button */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const prevIdx = (galleryImages.indexOf(displayImage) - 1 + galleryImages.length) % galleryImages.length;
                  setActiveImage(galleryImages[prevIdx]);
                }}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white dark:bg-stone-800/10 hover:bg-white dark:bg-stone-800/20 p-3 rounded-full transition-colors z-50 focus-visible:outline-none"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Next button */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIdx = (galleryImages.indexOf(displayImage) + 1) % galleryImages.length;
                  setActiveImage(galleryImages[nextIdx]);
                }}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white dark:bg-stone-800/10 hover:bg-white dark:bg-stone-800/20 p-3 rounded-full transition-colors z-50 focus-visible:outline-none"
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full h-full flex items-center justify-center p-4 sm:p-12 cursor-zoom-out"
              onClick={() => setIsLightboxOpen(false)}
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

      {/* AR Modal overlay */}
      <AnimatePresence>
        {isArOpen && arModel && (
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
                  activeProduct={{ ...product, product_ar_models: arModel }}
                  products={arProducts}
                  onProductSelect={(newProd) => {
                    window.location.href = `/producto/${newProd.id}`;
                  }}
                  onClose={() => setIsArOpen(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
