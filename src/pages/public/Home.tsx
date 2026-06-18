import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Coffee, ShoppingBag, Layers, Clock, MapPin, Heart, Star, Sparkle
} from 'lucide-react';
import FloatingElements from '../../components/public/FloatingElements';

import { supabase } from '../../config/supabase';
import type { Product } from '../../types';
import { motion } from 'framer-motion';
import { 
  SlideUp, 
  ScaleHover, 
  StaggerContainer, 
  StaggerItem 
} from '../../components/animations/MotionWrappers';
import MagneticButton from '../../components/animations/MagneticButton';
import MarqueeText from '../../components/public/MarqueeText';
import CoffeeSubscription from '../../components/public/CoffeeSubscription';
import SourdoughBenefits from '../../components/public/SourdoughBenefits';
import TestimonialsSection from '../../components/public/TestimonialsSection';
import CoffeeJourneySection from '../../components/public/CoffeeJourneySection';
import OriginSection from '../../components/public/OriginSection';
import RoseClubSection from '../../components/public/RoseClubSection';
import { ImageGallerySection } from '../../components/public/ImageGallerySection';
import SEOHead from '../../components/common/SEOHead';
import heroImgFallback from '/hero_coffee_sourdough.png';

const MOCK_PRODUCTS: Partial<Product>[] = [
  {
    id: 'mock-1',
    name: 'Espresso Blend Zaruma',
    category: 'Café',
    price: 12.50,
    description: 'Notas intensas de chocolate oscuro y caramelo. Tostado medio-oscuro ideal para espresso y moka.',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    stock: 15
  },
  {
    id: 'mock-2',
    name: 'Pan de Masa Madre Integral',
    category: 'Panadería',
    price: 4.80,
    description: 'Elaborado con harina de trigo integral y centeno de molienda artesanal. Fermentación salvaje de 24h.',
    image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80',
    stock: 8
  },
  {
    id: 'mock-3',
    name: 'Bourbon Cidra Zaruma (Honey)',
    category: 'Café',
    price: 18.00,
    description: 'Proceso Honey con notas a durazno, miel de abeja y jazmín. Acidez cítrica y dulzor prolongado.',
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    stock: 5
  }
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [sectionsData, setSectionsData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [businessSettings, setBusinessSettings] = useState<any>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // 1. Fetch products
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .is('deleted_at', null)
          .limit(3);

        if (!prodErr && prodData && prodData.length > 0) {
          setFeaturedProducts(prodData);
        } else {
          setFeaturedProducts(MOCK_PRODUCTS as Product[]);
        }

        // 2. Fetch page contents
        const { data: pageData } = await supabase
          .from('page_contents')
          .select('*')
          .eq('page', 'home');

        if (pageData) {
          const mapped = pageData.reduce((acc: any, item: any) => {
            acc[item.id] = item;
            return acc;
          }, {});
          setSectionsData(mapped);
        }

        // 3. Fetch business settings (hours, phone, address)
        const { data: settingsData } = await supabase
          .from('page_contents')
          .select('*')
          .eq('id', 'business_settings')
          .maybeSingle();

        if (settingsData?.content_blocks?.[0]) {
          setBusinessSettings(settingsData.content_blocks[0]);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
        setFeaturedProducts(MOCK_PRODUCTS as Product[]);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const heroSection = sectionsData['home_hero'];
  const welcomeSection = sectionsData['home_welcome'];
  const gallerySection = sectionsData['home_gallery'];
  const eventsSection = sectionsData['home_events'];
  const blogSection = sectionsData['home_sermons'];
  const donationSection = sectionsData['home_donations'];
  const birthdaySection = sectionsData['home_birthdays'];

  const dynamicEvents = eventsSection?.content_blocks && eventsSection.content_blocks.length > 0
    ? eventsSection.content_blocks.map((block: any, idx: number) => ({
        id: block.id || `event-${idx}`,
        title: block.title || block.name || 'Evento de Café',
        date: block.subtitle || block.date || 'Próximamente',
        description: block.description || block.text || '',
        imageUrl: block.imageUrl || 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&auto=format&fit=crop&q=80'
      }))
    : [
        {
          id: 'event-1',
          title: 'Catación Guiada: Bourbon Honey',
          date: 'Sábado 27 de Junio - 4:00 PM',
          description: 'Aprende a identificar notas florales y frutales con nuestro barista certificado. Incluye degustación de 3 orígenes.',
          imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&auto=format&fit=crop&q=80'
        },
        {
          id: 'event-2',
          title: 'Taller de Arte Latte para Aficionados',
          date: 'Sábado 11 de Julio - 10:00 AM',
          description: 'Domina la emulsión de la leche y crea tus primeros diseños de corazones y tulipanes en casa.',
          imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?w=600&auto=format&fit=crop&q=80'
        }
      ];

  const dynamicBlog = blogSection?.content_blocks && blogSection.content_blocks.length > 0
    ? blogSection.content_blocks.map((block: any, idx: number) => ({
        id: block.id || `blog-${idx}`,
        title: block.title || block.name || 'Artículo de Blog',
        author: block.author || 'Redacción Rose Coffee',
        date: block.subtitle || block.date || 'Reciente',
        description: block.description || block.text || '',
        imageUrl: block.imageUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80'
      }))
    : [
        {
          id: 'blog-1',
          title: 'Guía Práctica: Cómo Cuidar Tu Masa Madre en Clima Cálido',
          author: 'Naomy Alvarado',
          date: '15 Jun, 2026',
          description: 'Trucos y recomendaciones para mantener tu masa madre activa, fresca y evitar sobre-fermentación en climas tropicales como Milagro.',
          imageUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80'
        },
        {
          id: 'blog-2',
          title: 'Métodos de Extracción: V60 vs Prensa Francesa',
          author: 'Naomy Alvarado',
          date: '08 Jun, 2026',
          description: 'Analizamos las diferencias en cuerpo, acidez y dulzor de estos populares métodos de filtrado de café de especialidad.',
          imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80'
        },
        {
          id: 'blog-3',
          title: 'La Importancia del Comercio Justo con Caficultores',
          author: 'Naomy Alvarado',
          date: '28 May, 2026',
          description: 'Te contamos cómo compramos nuestro café Bourbon de Zaruma directamente a pequeños productores, eliminando intermediarios.',
          imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=600&auto=format&fit=crop&q=80'
        }
      ];

  // Static flavor notes dictionary matching categories/products
  const getProductExtraInfo = (productName: string) => {
    if (productName.toLowerCase().includes('pan')) {
      return {
        rating: 5,
        notes: '🌾 Trigo orgánico • ⏳ 24h Fermentación',
        weight: '750g'
      };
    }
    return {
      rating: 5,
      notes: '🍫 Chocolate • 🌰 Frutos Secos • 🍊 Cítrico',
      weight: '250g / 500g'
    };
  };

  return (
    <div className="space-y-16 pb-20 text-left bg-brand-base text-black font-sans relative">
      <SEOHead 
        title="Café de Especialidad & Masa Madre" 
        description="Rose Coffee en Milagro, Ecuador. Granos seleccionados de Loja y Zaruma tostados al instante y panes de masa madre fermentados por 24 horas."
        keywords="cafe especialidad, masa madre, milagro ecuador, zaruma, loja, panaderia artesanal, AR 3D, cafeteria"
      />
      
      {/* HERO SECTION - Split Layout */}
      <section id="hero" className="relative min-h-[85vh] flex items-center justify-center bg-brand-base text-black overflow-hidden pt-32 pb-16 md:py-24">
        {/* Floating animated ambient coffee elements */}
        <FloatingElements />

        {/* Decorative Background Patterns / Warm Orbs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-coffee/8 blur-[130px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & CTAs */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 bg-coffee/5 text-coffee border border-coffee/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-xs select-none">
              <Sparkles size={13} className="text-coffee animate-pulse" />
              <span>Cafetería de Especialidad & Masa Madre</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-primary">
              {heroSection?.title || 'Donde el Grano se Une con la'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-coffee to-amber-700">
                {heroSection?.title ? '' : 'Masa Madre'}
              </span>
            </h1>

            <p className="text-stone-900 text-sm md:text-base max-w-xl leading-relaxed font-semibold tracking-wide">
              {heroSection?.subtitle || 'En Rose Coffee cultivamos experiencias únicas. Tostamos granos de especialidad seleccionados de Zaruma y horneamos panes de masa madre de fermentación lenta para brindarte un sabor incomparable.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full sm:w-auto">
              <MagneticButton>
                <Link
                  to="/tienda"
                  className="w-full sm:w-auto px-8 py-3.5 bg-coffee hover:bg-coffee-dark text-[#faf2e7] rounded-2xl font-bold shadow-lg shadow-coffee/15 transition-all duration-300 ease-in-out text-xs flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag size={14} />
                  Explorar Tienda
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  to="/ar"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-coffee/5 text-coffee border border-coffee/30 rounded-2xl font-bold transition-all duration-300 ease-in-out text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Layers size={14} className="text-coffee" />
                  Visualizar AR 3D
                </Link>
              </MagneticButton>
              <MagneticButton>
                <a
                  href="#rose-club"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gold/5 text-gold border border-gold/40 rounded-2xl font-bold transition-all duration-300 ease-in-out text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Star size={14} className="fill-gold stroke-none" />
                  Rose Club
                </a>
              </MagneticButton>
            </div>
          </motion.div>

          {/* Right Column: Hero Image Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 relative flex justify-center lg:mt-16"
          >
            <div className="relative w-full max-w-md aspect-square rounded-[36px] overflow-hidden border border-stone-200 shadow-2xl bg-white/50 backdrop-blur-xs p-3 animate-float">
              <img 
                src={heroSection?.cover_image_url || heroImgFallback} 
                alt="Rose Coffee Café y Masa Madre" 
                className="w-full h-full object-cover rounded-[28px]"
                loading="eager"
              />
              {/* Subtle steam floating effect decoration */}
              <div className="absolute top-10 right-10 flex gap-1 pointer-events-none">
                <div className="w-1 h-6 bg-white/20 rounded-full blur-[2px] animate-steam" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-8 bg-white/30 rounded-full blur-[2px] animate-steam" />
                <div className="w-1 h-5 bg-white/10 rounded-full blur-[2px] animate-steam" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* INFINITE MARQUEE BANNER */}
      <MarqueeText />

      {/* FOUR PILLARS / ATTRIBUTES */}
      <section id="experience" className="max-w-7xl mx-auto px-6 space-y-12">
        <SlideUp className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block text-[10px] font-bold text-coffee uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">
            Diferenciales
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            {welcomeSection?.title || 'La Experiencia Rose Coffee'}
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            {welcomeSection?.subtitle || 'Cuidamos cada detalle de nuestro proceso artesanal para ofrecerte la máxima calidad.'}
          </p>
        </SlideUp>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(() => {
            const DEFAULT_PILLARS = [
              { icon: <Coffee size={20} />, title: 'Café de Especialidad', description: 'Granos seleccionados con puntajes de taza sobresalientes de Zaruma y Loja, tostados localmente para resaltar sus notas de sabor más puras.' },
              { icon: <Sparkle size={20} />, title: 'Masa Madre Natural', description: 'Panes horneados con harinas orgánicas y levadura salvaje nativa. Una fermentación lenta de 24 horas que garantiza una corteza crujiente.' },
              { icon: <Layers size={20} />, title: 'Realidad Aumentada 3D', description: 'Visualiza el tamaño y el aspecto exacto de nuestros panes y combos de café antes de comprarlos con tecnología AR interactiva.' },
              { icon: <Heart size={20} />, title: 'Hecho con Amor', description: 'Un emprendimiento fundado bajo la filosofía de honrar las tradiciones de la panadería artesanal y celebrar el buen café hecho en casa.' },
            ];
            const ICON_MAP: Record<string, React.ReactNode> = {
              coffee: <Coffee size={20} />,
              sparkle: <Sparkle size={20} />,
              layers: <Layers size={20} />,
              heart: <Heart size={20} />,
              star: <Star size={20} />,
              sparkles: <Sparkles size={20} />,
            };

            // Use dynamic pillars from content_blocks if available
            const dynamicBlocks = welcomeSection?.content_blocks;
            const pillars = (dynamicBlocks && Array.isArray(dynamicBlocks) && dynamicBlocks.length > 0)
              ? dynamicBlocks.map((block: any) => ({
                  icon: ICON_MAP[block.icon] || <Coffee size={20} />,
                  title: block.title || block.textContent || 'Sin título',
                  description: block.description || block.text || '',
                }))
              : DEFAULT_PILLARS;

            return pillars.map((pillar: any, idx: number) => (
              <StaggerItem key={idx}>
                <div className="bg-white/60 backdrop-blur-xs p-6 rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out group flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="w-11 h-11 bg-coffee/10 text-coffee rounded-2xl flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                      {pillar.icon}
                    </div>
                    <h3 className="font-bold text-base text-primary">{pillar.title}</h3>
                    <p className="text-stone-500 text-xs leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              </StaggerItem>
            ));
          })()}
        </StaggerContainer>
      </section>

      {/* TIMELINE SECTION - DEL GRANO A TU TAZA */}
      <CoffeeJourneySection data={sectionsData['home_journey']} />

      {/* IMAGE GALLERY SECTION */}
      {gallerySection && gallerySection.content_blocks && gallerySection.content_blocks.length > 0 && (
        <ImageGallerySection
          title={gallerySection.title || 'Nuestros Productos en Imágenes'}
          subtitle={gallerySection.subtitle || 'Momentos especiales de nuestro proceso artesanal y productos de Rose Coffee.'}
          slides={gallerySection.content_blocks}
        />
      )}

      {/* FEATURED PRODUCTS */}
      <section id="products" className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="inline-block text-[10px] font-bold text-coffee uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">
              Catálogo Destacado
            </span>
            <h2 className="text-3xl font-bold text-primary">Nuestros Favoritos de la Semana</h2>
            <p className="text-stone-500 text-xs sm:text-sm">Recién horneados y listos para enviar directamente a tu puerta.</p>
          </div>
          <Link 
            to="/tienda" 
            className="text-coffee hover:text-coffee-dark font-bold text-xs uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors duration-300"
          >
            Ver catálogo completo
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-80 bg-white border border-stone-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
              const extraInfo = getProductExtraInfo(product.name);
              const hasAR = !!(product.ar_model_url);

              return (
                <StaggerItem key={product.id}>
                  <div className="bg-white rounded-[28px] border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                    <Link to={`/producto/${product.id}`} className="h-56 bg-stone-100 relative overflow-hidden block cursor-pointer">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <Coffee size={32} />
                        </div>
                      )}
                      
                      {/* Weight Selector Badge */}
                      <span className="absolute top-4 left-4 bg-white/80 backdrop-blur-md text-stone-700 text-[9px] font-bold px-2.5 py-1 rounded-full border border-stone-200/50 shadow-xxs">
                        {extraInfo.weight}
                      </span>

                      {/* AR 3D Badge */}
                      {hasAR && (
                        <span className="absolute top-4 right-4 bg-primary/95 text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/10 shadow-xxs flex items-center gap-1">
                          <Layers size={10} />
                          AR 3D
                        </span>
                      )}
                    </Link>
                    
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-coffee uppercase tracking-widest bg-coffee/5 px-2.5 py-1 rounded-md inline-block">
                            {product.category}
                          </span>
                          
                          {/* Static Stars Rating */}
                          <div className="flex items-center gap-0.5 text-gold">
                            {Array.from({ length: extraInfo.rating }).map((_, i) => (
                              <Star key={i} size={11} fill="currentColor" className="stroke-none" />
                            ))}
                          </div>
                        </div>

                        <h3 className="font-bold text-base text-primary leading-tight group-hover:text-coffee transition-colors duration-200">
                          <Link to={`/producto/${product.id}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </h3>

                        {/* Flavor Notes / Ingredients with Emojis */}
                        <p className="text-[10px] text-coffee font-medium">
                          {extraInfo.notes}
                        </p>

                        <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                          {product.description || 'Sin descripción disponible.'}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Precio</span>
                          <span className="text-lg font-extrabold text-coffee-dark tracking-tight">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {hasAR && (
                            <ScaleHover>
                              <Link
                                to={`/producto/${product.id}`}
                                className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold px-3 py-2 rounded-xl transition-all duration-200 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Layers size={11} />
                                Ver AR
                              </Link>
                            </ScaleHover>
                          )}
                          <ScaleHover>
                            <Link
                              to={`/producto/${product.id}`}
                              className="bg-coffee hover:bg-coffee-dark text-[#faf2e7] text-[10px] font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-xs hover:shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingBag size={11} />
                              Comprar
                            </Link>
                          </ScaleHover>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        ) : (
          <div className="text-center py-12 text-stone-400 bg-white border border-dashed border-stone-300 rounded-3xl">
            No hay productos cargados en la base de datos por el momento.
          </div>
        )}
      </section>

      {/* EVENTS SECTION - PRÓXIMAS DEGUSTACIONES */}
      <section id="events" className="max-w-7xl mx-auto px-6 space-y-12">
        <SlideUp className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block text-[10px] font-bold text-coffee uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">
            Eventos
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            {eventsSection?.title || 'Próximas Degustaciones'}
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed">
            {eventsSection?.subtitle || 'Entérate de las catas de café, talleres de barismo y lanzamientos de nuevos productos.'}
          </p>
        </SlideUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dynamicEvents.map((event: any, idx: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-[32px] border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group h-full"
            >
              <div className="w-full sm:w-48 h-48 bg-stone-50 flex-shrink-0 overflow-hidden relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col justify-between text-left flex-1">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-gold uppercase tracking-wider block">
                    {event.date}
                  </span>
                  <h3 className="font-bold text-base text-primary font-sans leading-snug group-hover:text-coffee transition-colors duration-200">
                    {event.title}
                  </h3>
                  <p className="text-stone-550 text-xs leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ORIGIN SECTION - NUESTRO CAFÉ TIENE HISTORIA */}
      <OriginSection data={sectionsData['home_origin']} />

      {/* SOURDOUGH BENEFITS */}
      <SourdoughBenefits />

      {/* ROSE CLUB LOYALTY PROGRAM */}
      <RoseClubSection />

      {/* COFFEE CLUB SUBSCRIPTIONS */}
      <CoffeeSubscription data={donationSection} />

      {/* TESTIMONIALS SECTION */}
      <TestimonialsSection data={birthdaySection} />

      {/* BLOG SECTION - ARTÍCULOS DEL BLOG */}
      <section id="blog" className="max-w-7xl mx-auto px-6 space-y-12">
        <SlideUp className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block text-[10px] font-bold text-coffee uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">
            Blog Rose Coffee
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            {blogSection?.title || 'Artículos del Blog'}
          </h2>
          <p className="text-stone-550 text-sm leading-relaxed">
            {blogSection?.subtitle || 'Consejos de barismo, recetas con masa madre y novedades del mundo del café.'}
          </p>
        </SlideUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dynamicBlog.map((post: any, idx: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-[28px] border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group"
            >
              <div className="h-48 bg-stone-100 relative overflow-hidden block">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-4 left-4 bg-white/85 backdrop-blur-md text-stone-700 text-[9px] font-bold px-2.5 py-1 rounded-full border border-stone-200/50 shadow-xxs">
                  {post.date}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-coffee uppercase tracking-widest bg-coffee/5 px-2.5 py-1 rounded-md inline-block">
                    Por {post.author}
                  </span>
                  <h3 className="font-bold text-base text-primary leading-tight group-hover:text-coffee transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="text-stone-550 text-xs line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOURS & LOCATION */}
      <section id="location" className="max-w-4xl mx-auto px-6">
        <div className="bg-primary text-[#faf2e7] rounded-[32px] p-8 md:p-12 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-white/5 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-coffee/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="space-y-6 text-left relative z-10">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-md inline-block border border-white/15">¿Quieres visitarnos?</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">Ven a probar el aroma y frescura</h2>
            </div>
            
            <div className="space-y-4 text-xs text-white/70">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gold shrink-0 mt-0.5" />
                <address className="not-italic text-white/80">
                  {businessSettings?.address || (
                    <>
                      E25 y Av. 17 de Septiembre<br />
                      Milagro, Ecuador
                    </>
                  )}
                </address>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white text-[10px] uppercase tracking-wider">Horario de Atención</p>
                  {(() => {
                    const hours = businessSettings?.daily_hours;
                    if (hours && typeof hours === 'object') {
                      const openDays = Object.entries(hours)
                        .filter(([, v]: [string, any]) => v.open)
                        .map(([day, v]: [string, any]) => `${day}: ${v.start} - ${v.end}`);
                      return openDays.length > 0 ? (
                        <div className="mt-0.5 text-white/70 space-y-0.5">
                          {openDays.map((line, i) => <p key={i}>{line}</p>)}
                        </div>
                      ) : <p className="mt-0.5 text-white/70">Consultar horarios</p>;
                    }
                    return <p className="mt-0.5 text-white/70">Lunes a Sábado: 8:00 AM - 8:00 PM</p>;
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden h-64 bg-white/5 flex items-center justify-center border border-white/10 shadow-inner relative z-10 p-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <Coffee className="text-emerald-400 animate-bounce" size={24} />
              </div>
              <h4 className="font-bold text-sm text-white">Pedido Rápido por WhatsApp</h4>
              <p className="text-xs text-white/60 leading-relaxed">¿Estás en Milagro? Coordina tus entregas directas a domicilio chateando directamente con nuestro barista en tiempo real.</p>
              <a 
                href={`https://wa.me/${(businessSettings?.phone || '+593980372113').replace(/[^0-9]/g, '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-emerald-500 hover:bg-emerald-450 text-white rounded-xl text-xs font-bold transition-all duration-300 ease-in-out shadow-md hover:shadow-lg cursor-pointer"
              >
                Escribir a WhatsApp ({businessSettings?.phone || '+593 98 037 2113'})
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
