import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import type { Product } from '../../types';
import { Search, ShoppingBag, Filter, Eye, Maximize2 } from 'lucide-react';
import OptimizedMedia from '../../components/common/OptimizedMedia';
import { motion, AnimatePresence } from 'framer-motion';
import ARViewer from '../../components/public/ARViewer';
import SEOHead from '../../components/common/SEOHead';
import coffeeRoastingImg from '/coffee_roasting_process.png';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-1',
    name: 'Café Rose de Especialidad (400g)',
    description: 'Café de especialidad con notas de frutos rojos, chocolate y caramelo. Cultivado a 1500m de altura, tueste medio.',
    price: 12.50,
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
    stock: 50,
    category: 'Café',
    type: 'physical',
    cover_image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
    features: ['Origen: Loja, Ecuador', 'Proceso: Lavado', 'Tueste: Medio artesanal'],
    created_at: new Date().toISOString(),
    product_variants: [
      {
        id: 'mock-var-1',
        product_id: 'mock-1',
        color_name: 'En Grano',
        color_hex: '#4A2C2A',
        size: '400g',
        cloudinary_image_url: null,
        stock: 25,
        price_adjustment: 0
      },
      {
        id: 'mock-var-2',
        product_id: 'mock-1',
        color_name: 'Molido Fino',
        color_hex: '#6E423F',
        size: '400g',
        cloudinary_image_url: null,
        stock: 25,
        price_adjustment: 0.50
      }
    ]
  },
  {
    id: 'mock-2',
    name: 'Pan de Masa Madre Clásico',
    description: 'Hogaza de pan artesanal elaborado con harina orgánica de trigo, levadura salvaje nativa y fermentación lenta de 24 horas.',
    price: 6.50,
    image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600',
    stock: 20,
    category: 'Panadería',
    type: 'physical',
    cover_image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600',
    features: ['100% fermentación natural', 'Corteza crujiente, miga alveolada', 'Sin aditivos ni preservantes'],
    created_at: new Date().toISOString(),
    product_variants: []
  },
  {
    id: 'mock-3',
    name: 'E-Book: El Arte de la Masa Madre en Casa',
    description: 'Guía digital completa con recetas detalladas paso a paso para crear tu propia masa madre y hornear panes perfectos.',
    price: 9.99,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    stock: 999,
    category: 'Recursos Digitales',
    type: 'digital',
    cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    features: ['Formato PDF y ePUB', 'Descarga instantánea segura', 'Incluye videos y guías visuales'],
    created_at: new Date().toISOString(),
    product_variants: []
  }
];

const Store = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [arProductIds, setArProductIds] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [storeHeroData, setStoreHeroData] = useState<any>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts(data as Product[]);
      } else {
        setProducts(MOCK_PRODUCTS);
      }
    } catch (err) {
      console.error('Error al cargar productos de Supabase, usando mocks:', err);
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreHero = async () => {
    try {
      const { data, error } = await supabase
        .from('page_contents')
        .select('*')
        .eq('id', 'store_hero')
        .maybeSingle();
      if (!error && data) {
        setStoreHeroData(data);
      }
    } catch (err) {
      console.error('Error al cargar banner de tienda:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
      fetchARProductIds();
      fetchStoreHero();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const fetchARProductIds = async () => {
    try {
      const { data, error } = await supabase
        .from('product_ar_models')
        .select('product_id');
      if (error) throw error;
      if (data) {
        setArProductIds(new Set(data.map((d: any) => d.product_id)));
      }
    } catch (err) {
      // silently fail — AR is optional
    }
  };

  const handleOpenAR = async (product: Product) => {
    try {
      const { data, error } = await supabase
        .from('product_ar_models')
        .select('*')
        .eq('product_id', product.id)
        .maybeSingle();
      if (error) throw error;
      setSelectedProduct({ ...product, product_ar_models: data || null });
    } catch (err) {
      console.error('Error loading AR model:', err);
    }
  };

  const handleProductSelect = async (product: Product) => {
    try {
      const { data, error } = await supabase
        .from('product_ar_models')
        .select('*')
        .eq('product_id', product.id)
        .maybeSingle();
      if (error) throw error;
      setSelectedProduct({ ...product, product_ar_models: data || null });
    } catch (err) {
      console.error('Error switching product:', err);
    }
  };


  const [specialFilter, setSpecialFilter] = useState<'all' | 'best_sellers' | 'new' | 'ar_3d'>('all');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
    
    let matchesSpecial = true;
    if (specialFilter === 'best_sellers') {
      matchesSpecial = product.name.toLowerCase().includes('espresso') || product.name.toLowerCase().includes('clásico') || (product.stock ?? 0) > 30;
    } else if (specialFilter === 'new') {
      matchesSpecial = product.name.toLowerCase().includes('bourbon') || product.name.toLowerCase().includes('e-book');
    } else if (specialFilter === 'ar_3d') {
      matchesSpecial = arProductIds.has(product.id) || !!(product.ar_model_url);
    }
    
    return matchesSearch && matchesCategory && matchesSpecial;
  });

  const categories = ['Todas', ...Array.from(new Set(products.map((p) => p.category)))];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <SEOHead 
        title="Tienda Online - Café & Panadería Masa Madre" 
        description="Explora y compra nuestro café de especialidad ecuatoriano de Loja y Zaruma. Descubre panes de masa madre de fermentación natural y modelos AR 3D interactivos."
        keywords="tienda de cafe, comprar cafe online, pan masa madre ecuador, cafe gourmet, ar 3d cafe"
      />
      {/* Header Banner - Redesigned with warm background image & premium gradient overlay */}
      <div id="store_hero" className="rounded-3xl p-8 md:p-12 text-white mb-10 shadow-xl relative overflow-hidden bg-primary min-h-[250px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={storeHeroData?.cover_image_url || coffeeRoastingImg} 
            alt="Proceso de Tostado Rose Coffee" 
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-2xl text-left space-y-3">
          <span className="bg-gold/20 text-gold border border-gold/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-xs">
            Rose Coffee Store
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-2 tracking-tight">
            {storeHeroData?.title || 'Nuestra Tienda'}
          </h1>
          <p className="text-stone-300 text-xs md:text-sm leading-relaxed font-light">
            {storeHeroData?.subtitle || 'Selección premium de café de especialidad de origen Zaruma y panes de masa madre de fermentación natural. Visualiza los modelos en Realidad Aumentada (AR) 3D interactiva en tu propio espacio.'}
          </p>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div id="store_filters" className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div className="relative w-full md:w-96">
          <label htmlFor="search_store" className="sr-only">Buscar café, panadería, e-books...</label>
          <input
            id="search_store"
            type="text"
            placeholder="Buscar café, panadería, e-books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee focus-visible:border-coffee transition-all text-sm bg-white"
          />
          <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-coffee focus-visible:outline-none ${
                  selectedCategory === category
                    ? 'bg-coffee text-white shadow-sm'
                    : 'bg-white border border-gray-150 text-slate-700 hover:bg-gray-50'
                }`}
              >
                {category === 'Todas' && <Filter size={14} />}
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros Especiales */}
      <div className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-none border-b border-gray-150/40 mb-8 justify-start">
        {[
          { id: 'all', label: 'Todos los productos' },
          { id: 'best_sellers', label: '🔥 Más Vendidos' },
          { id: 'new', label: '✨ Novedades' },
          { id: 'ar_3d', label: '🕶️ Realidad Aumentada 3D' }
        ].map((filt) => (
          <button
            key={filt.id}
            onClick={() => setSpecialFilter(filt.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border cursor-pointer focus-visible:ring-2 focus-visible:ring-coffee focus-visible:outline-none ${
              specialFilter === filt.id
                ? 'bg-coffee/10 border-coffee text-coffee shadow-2xs'
                : 'bg-white border-gray-150 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {filt.label}
          </button>
        ))}
      </div>

      {/* Grid de Productos */}
      <div id="store_grid">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-coffee"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            return (
              <motion.div
                key={product.id}
                layoutId={`product-card-${product.id}`}
                onClick={() => navigate(`/producto/${product.id}`)}
                tabIndex={0}
                role="button"
                aria-label={`Ver opciones de ${product.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/producto/${product.id}`);
                  }
                }}
                className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group h-full cursor-pointer relative focus-visible:ring-2 focus-visible:ring-coffee focus-visible:outline-none"
              >
                {/* Contenedor Imagen */}
                <div className="relative pt-[70%] bg-gray-50 overflow-hidden">
                  <motion.div 
                    layoutId={`product-image-${product.id}`}
                    className="absolute inset-0 w-full h-full"
                  >
                    <OptimizedMedia
                      src={product.cover_image_url || product.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </motion.div>
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <motion.span 
                      layoutId={`product-category-${product.id}`}
                      className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-coffee border border-gray-100 shadow-2xs z-10"
                    >
                      {product.category}
                    </motion.span>
                    {product.type === 'digital' && (
                      <span className="bg-purple-600/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-2xs z-10">
                        Digital / Descargable
                      </span>
                    )}
                    {arProductIds.has(product.id) && (
                      <span className="bg-[#021a54]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-2xs z-10 flex items-center gap-1">
                        <Maximize2 size={10} />
                        3D / AR
                      </span>
                    )}
                  </div>
                  {arProductIds.has(product.id) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenAR(product); }}
                      className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm border border-gray-100 text-[#021a54] px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-xs z-10 flex items-center gap-1 hover:bg-white transition-colors cursor-pointer"
                    >
                      <Eye size={12} />
                      Ver en 3D
                    </button>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-5 flex flex-col flex-grow">
                  <motion.h3 
                    layoutId={`product-title-${product.id}`}
                    className="font-sans font-bold text-lg text-slate-800 mb-2 line-clamp-1"
                  >
                    {product.name}
                  </motion.h3>
                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-4 flex-grow font-medium">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <span className="text-xs text-slate-600 block font-bold">Desde</span>
                      <span className="text-xl font-bold text-slate-800">${Number(product.price).toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/producto/${product.id}`)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-coffee hover:bg-coffee-dark text-white transition-all shadow-sm flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-coffee focus-visible:outline-none"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <ShoppingBag size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-sans font-bold text-slate-800">No se encontraron productos</h3>
          <p className="text-slate-500 text-sm mt-1">Prueba con otra palabra clave o categoría.</p>
        </div>
      )}
      </div>

      {/* AR Viewer Modal */}
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
                <ARViewer
                  activeProduct={selectedProduct}
                  products={products.filter(p => arProductIds.has(p.id) || !!p.ar_model_url)}
                  onProductSelect={handleProductSelect}
                  onClose={() => setSelectedProduct(null)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;
