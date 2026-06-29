/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Coffee, ShoppingBag, Layers, Heart, Star, Sparkle
} from 'lucide-react';
import FloatingElements from '../../components/public/FloatingElements';
import ScrollDrawSVG from '../../components/animations/ScrollDrawSVG';

import { supabase } from '../../config/supabase';
import type { Product } from '../../types';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
import StoreHoursSection from '../../components/public/StoreHoursSection';
import { ImageGallerySection } from '../../components/public/ImageGallerySection';
import SEOHead from '../../components/common/SEOHead';
import heroImgFallback from '/bg_coffee_bread.webp';

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

  // Hero Animation Logic
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 250]);

  const heroPhrases = [
    sectionsData['home_hero']?.title || 'El Café y Pan con Alma Artesanal',
    'Café de Especialidad',
    'Masa Madre Artesanal',
    'Pasión en cada taza'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % heroPhrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroPhrases.length]);

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

  const welcomeSection = sectionsData['home_welcome'];
  const gallerySection = sectionsData['home_gallery'];
  const eventsSection = sectionsData['home_events'];
  const blogSection = sectionsData['home_sermons'];

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
          imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80'
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


  const sectionConfig = sectionsData['home_section_config']?.content_blocks || [
    { id: 'home_hero', visible: true, order: 0 },
    { id: 'marquee', visible: true, order: 1 },
    { id: 'home_welcome', visible: true, order: 2 },
    { id: 'home_gallery', visible: true, order: 3 },
    { id: 'home_journey', visible: true, order: 4 },
    { id: 'products', visible: true, order: 5 },
    { id: 'home_events', visible: true, order: 6 },
    { id: 'home_origin', visible: true, order: 7 },
    { id: 'sourdough', visible: true, order: 8 },
    { id: 'home_roseclub_module', visible: true, order: 9 },
    { id: 'home_subscriptions', visible: true, order: 10 },
    { id: 'home_birthdays', visible: true, order: 11 },
    { id: 'home_sermons', visible: true, order: 12 },
    { id: 'home_schedules', visible: false, order: 13 }
  ];

  const renderSection = (id: string) => {
    switch (id) {
      case 'home_hero':
        return (
          <section id="hero" className="relative min-h-screen flex items-center justify-center text-white overflow-hidden pt-32 pb-16 md:py-24 w-full">
            <div className="absolute inset-0 z-0">
              <motion.img 
                initial={{ scale: 1.15, filter: 'blur(4px)' }}
                animate={{ scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                style={{ y: heroY }}
                src={heroImgFallback}
                alt="Fondo de la portada de Rose Coffee"
                className="w-full h-[120%] object-cover object-center origin-center will-change-transform"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-stone-950/60 pointer-events-none" />
            </div>
            <FloatingElements />
            <motion.div 
              initial="initial"
              animate="animate"
              variants={{
                initial: { opacity: 0 },
                animate: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
              }}
              className="relative z-10 max-w-4xl mx-auto px-6 w-full flex flex-col items-center text-center space-y-8"
            >
              <motion.div variants={{ initial: { opacity: 0, y: 20, filter: 'blur(4px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: "easeOut" } } }} className="inline-flex items-center gap-2 bg-white dark:bg-stone-800/10 text-gold border border-gold/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md select-none">
                <Sparkles size={13} className="text-gold animate-pulse" />
                <span>Cafetería de Especialidad & Masa Madre</span>
              </motion.div>
              <div className="h-32 sm:h-36 md:h-40 lg:h-48 flex items-center justify-center w-full relative">
                <AnimatePresence mode="wait">
                  <motion.h1 
                    key={currentPhraseIndex}
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.6, ease: "easeOut" }} 
                    className="absolute text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] text-[#faf2e7] drop-shadow-sm font-sans w-full"
                  >
                    {heroPhrases[currentPhraseIndex]}
                  </motion.h1>
                </AnimatePresence>
              </div>
              <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }} className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto justify-center z-20">
                <MagneticButton>
                  <Link to="/tienda" className="px-8 py-3.5 bg-coffee hover:bg-coffee-dark text-[#faf2e7] rounded-2xl font-bold shadow-lg shadow-coffee/20 transition-all duration-300 ease-in-out text-xs flex items-center justify-center gap-1.5 border border-coffee/30 w-full sm:w-auto">
                    <ShoppingBag size={14} />
                    Explorar Tienda
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link to="/ar" className="px-8 py-3.5 bg-white dark:bg-stone-800/10 hover:bg-white dark:bg-stone-800/20 text-[#faf2e7] border border-[#faf2e7]/30 rounded-2xl font-bold transition-all duration-300 ease-in-out text-xs flex items-center justify-center gap-1.5 shadow-2xs backdrop-blur-md w-full sm:w-auto">
                    <Layers size={14} className="text-[#faf2e7]" />
                    Visualizar AR 3D
                  </Link>
                </MagneticButton>
              </motion.div>
            </motion.div>
          </section>
        );
      case 'marquee':
        return <MarqueeText />;
      case 'home_welcome':
        return (
          <section id="experience" className="max-w-7xl mx-auto px-6 space-y-12 relative">
            <div className="absolute inset-0 z-0 bg-[url('/productos/bread_and_coffee_1782575652616.webp')] bg-cover bg-center bg-fixed opacity-10 blur-sm pointer-events-none" />
            <div className="absolute -left-32 top-10 w-96 h-96 opacity-10 pointer-events-none hidden lg:block z-0 text-coffee dark:text-gold">
              <ScrollDrawSVG strokeWidth={1} viewBox="0 0 100 100" paths={["M10,50 Q30,20 50,50 T90,50", "M20,60 Q40,30 60,60 T100,60", "M40,20 C40,40 20,40 20,60 C20,80 40,80 40,60 C40,40 60,40 60,60 C60,80 80,80 80,60"]} />
            </div>
            <SlideUp className="text-center max-w-2xl mx-auto space-y-3 relative z-10">
              <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">Diferenciales</span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-stone-100">{welcomeSection?.title || 'La Experiencia Rose Coffee'}</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{welcomeSection?.subtitle || 'Cuidamos cada detalle de nuestro proceso artesanal para ofrecerte la máxima calidad.'}</p>
            </SlideUp>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                const DEFAULT_PILLARS = [
                  { icon: <Coffee size={20} />, title: 'Café de Especialidad', description: 'Granos seleccionados con puntajes de taza sobresalientes de Zaruma y Loja, tostados localmente para resaltar sus notas de sabor más puras.' },
                  { icon: <Sparkle size={20} />, title: 'Masa Madre Natural', description: 'Panes horneados con harinas orgánicas y levadura salvaje nativa. Una fermentación lenta de 24 horas que garantiza una corteza crujiente.' },
                  { icon: <Layers size={20} />, title: 'Realidad Aumentada 3D', description: 'Visualiza el tamaño y el aspecto exacto de nuestros panes y combos de café antes de comprarlos con tecnología AR interactiva.' },
                  { icon: <Heart size={20} />, title: 'Hecho con Amor', description: 'Un emprendimiento fundado bajo la filosofía de honrar las tradiciones de la panadería artesanal y celebrar el buen café hecho en casa.' },
                ];
                const ICON_MAP: Record<string, React.ReactNode> = { coffee: <Coffee size={20} />, sparkle: <Sparkle size={20} />, layers: <Layers size={20} />, heart: <Heart size={20} />, star: <Star size={20} />, sparkles: <Sparkles size={20} /> };
                const dynamicBlocks = welcomeSection?.content_blocks;
                const pillars = (dynamicBlocks && Array.isArray(dynamicBlocks) && dynamicBlocks.length > 0) ? dynamicBlocks.map((block: any) => ({ icon: ICON_MAP[block.icon] || <Coffee size={20} />, title: block.title || block.textContent || 'Sin título', description: block.description || block.text || '' })) : DEFAULT_PILLARS;
                return pillars.map((pillar: any, idx: number) => (
                  <StaggerItem key={idx}>
                    <div className="bg-white dark:bg-stone-800/80 backdrop-blur-md p-6 rounded-3xl border border-stone-200 dark:border-stone-700/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-in-out group flex flex-col justify-between h-full relative z-10">
                      <div className="space-y-4">
                        <div className="w-11 h-11 bg-coffee/10 text-coffee dark:text-gold rounded-2xl flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform duration-300">{pillar.icon}</div>
                        <h3 className="font-bold text-base text-primary dark:text-stone-200">{pillar.title}</h3>
                        <p className="text-stone-500 text-xs leading-relaxed">{pillar.description}</p>
                      </div>
                    </div>
                  </StaggerItem>
                ));
              })()}
            </StaggerContainer>

            <SlideUp className="relative w-full max-w-4xl mx-auto h-[400px] mt-16 rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing">
                <model-viewer
                  src={`${import.meta.env.BASE_URL}coffee_bean.glb`}
                  auto-rotate
                  camera-controls
                  rotation-per-second="10deg"
                  shadow-intensity="1.5"
                  exposure="1"
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%', background: 'transparent' }}
                ></model-viewer>
              </div>
              <div className="absolute top-4 left-4 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 pointer-events-none z-10">
                <p className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
                  <Layers size={16} className="text-primary" />
                  Grano de Café Interactivo
                </p>
                <p className="text-xs text-stone-500 mt-1">Arrastra para rotar • Usa el scroll para acercar</p>
              </div>
            </SlideUp>
          </section>
        );
      case 'home_journey':
        return <CoffeeJourneySection data={sectionsData['home_journey']} />;
      case 'home_gallery':
        return gallerySection && gallerySection.content_blocks && gallerySection.content_blocks.length > 0 ? (
          <ImageGallerySection title={gallerySection.title || 'Nuestros Productos en Imágenes'} subtitle={gallerySection.subtitle || 'Momentos especiales de nuestro proceso artesanal y productos de Rose Coffee.'} slides={gallerySection.content_blocks} />
        ) : null;
      case 'products':
        return (
          <section id="products" className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 text-left">
                <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">Catálogo Destacado</span>
                <h2 className="text-3xl font-bold text-primary dark:text-stone-100">Nuestros Favoritos de la Semana</h2>
                <p className="text-stone-500 text-xs sm:text-sm">Recién horneados y listos para enviar directamente a tu puerta.</p>
              </div>
              <Link to="/tienda" className="text-coffee dark:text-gold hover:text-coffee dark:text-gold-dark font-bold text-xs uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors duration-300">
                Ver catálogo completo <ArrowRight size={14} />
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="h-80 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-3xl animate-pulse"></div>)}
              </div>
            ) : featuredProducts.length > 0 ? (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((product) => {
                  const extraInfo = getProductExtraInfo(product.name);
                  const hasAR = !!(product.ar_model_url);
                  return (
                    <StaggerItem key={product.id}>
                      <div className="bg-white dark:bg-stone-800 rounded-[28px] border border-stone-200 dark:border-stone-700 overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                        <Link to={`/producto/${product.id}`} className="h-56 bg-stone-100 relative overflow-hidden block cursor-pointer">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400"><Coffee size={32} /></div>
                          )}
                          <span className="absolute top-4 left-4 bg-white dark:bg-stone-800/80 backdrop-blur-md text-stone-700 text-[9px] font-bold px-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-700/50 shadow-xxs">{extraInfo.weight}</span>
                          {hasAR && (
                            <span className="absolute top-4 right-4 bg-primary/95 text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/10 shadow-xxs flex items-center gap-1"><Layers size={10} />AR 3D</span>
                          )}
                        </Link>
                        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-coffee dark:text-gold uppercase tracking-widest bg-coffee/5 px-2.5 py-1 rounded-md inline-block">{product.category}</span>
                              <div className="flex items-center gap-0.5 text-gold">
                                {Array.from({ length: extraInfo.rating }).map((_, i) => <Star key={i} size={11} fill="currentColor" className="stroke-none" />)}
                              </div>
                            </div>
                            <h3 className="font-bold text-base text-primary dark:text-stone-200 leading-tight group-hover:text-coffee dark:text-gold transition-colors duration-200">
                              <Link to={`/producto/${product.id}`} className="hover:underline">{product.name}</Link>
                            </h3>
                            <p className="text-[10px] text-coffee dark:text-gold font-medium">{extraInfo.notes}</p>
                            <p className="text-stone-500 dark:text-stone-400 text-xs line-clamp-2 leading-relaxed">{product.description || 'Sin descripción disponible.'}</p>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-stone-100 dark:border-stone-700">
                            <div className="flex flex-col text-left">
                              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Precio</span>
                              <span className="text-lg font-extrabold text-coffee dark:text-gold-dark tracking-tight">${product.price.toFixed(2)}</span>
                            </div>
                            <div className="flex gap-2">
                              {hasAR && (
                                <ScaleHover>
                                  <Link to={`/producto/${product.id}`} className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-[10px] font-bold px-3 py-2 rounded-xl transition-all duration-200 inline-flex items-center gap-1 cursor-pointer">
                                    <Layers size={11} />Ver AR
                                  </Link>
                                </ScaleHover>
                              )}
                              <ScaleHover>
                                <Link to={`/producto/${product.id}`} className="bg-coffee hover:bg-coffee-dark text-[#faf2e7] text-[10px] font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-xs hover:shadow-md inline-flex items-center gap-1.5 cursor-pointer">
                                  <ShoppingBag size={11} />Comprar
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
              <div className="text-center py-12 text-stone-400 bg-white dark:bg-stone-800 border border-dashed border-stone-300 rounded-3xl">No hay productos cargados.</div>
            )}
          </section>
        );
      case 'home_events':
        return (
          <section id="events" className="max-w-7xl mx-auto px-6 space-y-12">
            <SlideUp className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">Eventos</span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-gold">{eventsSection?.title || 'Próximas Degustaciones'}</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">{eventsSection?.subtitle || 'Entérate de las catas de café, talleres de barismo y lanzamientos de nuevos productos.'}</p>
            </SlideUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dynamicEvents.map((event: any, idx: number) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="bg-white dark:bg-stone-800 rounded-[32px] border border-stone-200 dark:border-stone-700 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group h-full">
                  <div className="w-full sm:w-48 h-48 bg-stone-50 flex-shrink-0 overflow-hidden relative">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex flex-col justify-between text-left flex-1">
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold text-gold uppercase tracking-wider block">{event.date}</span>
                      <h3 className="font-bold text-base text-primary dark:text-white font-sans leading-snug group-hover:text-coffee dark:group-hover:text-gold transition-colors duration-200">{event.title}</h3>
                      <p className="text-stone-550 dark:text-stone-400 text-xs leading-relaxed line-clamp-3">{event.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        );
      case 'home_origin':
        return <OriginSection data={sectionsData['home_origin']} />;
      case 'sourdough':
        return <SourdoughBenefits />;
      case 'home_roseclub_module':
        return sectionsData['home_roseclub_module'] ? <RoseClubSection /> : null;
      case 'home_subscriptions':
        return sectionsData['home_subscriptions'] ? <CoffeeSubscription data={sectionsData['home_subscriptions']} /> : null;
      case 'home_birthdays':
        return <TestimonialsSection data={birthdaySection} />;
      case 'home_sermons':
        return (
          <section id="blog" className="max-w-7xl mx-auto px-6 space-y-12">
            <SlideUp className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">Blog Rose Coffee</span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-gold">{blogSection?.title || 'Artículos del Blog'}</h2>
              <p className="text-stone-550 dark:text-stone-400 text-sm leading-relaxed">{blogSection?.subtitle || 'Consejos de barismo, recetas con masa madre y novedades del mundo del café.'}</p>
            </SlideUp>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {dynamicBlog.map((post: any, idx: number) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="bg-white dark:bg-stone-800 rounded-[28px] border border-stone-200 dark:border-stone-700 overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                  <div className="h-48 bg-stone-100 dark:bg-stone-800 relative overflow-hidden block">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <span className="absolute top-4 left-4 bg-white dark:bg-stone-800/85 backdrop-blur-md text-stone-700 text-[9px] font-bold px-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-700/50 shadow-xxs">{post.date}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-coffee dark:text-gold uppercase tracking-widest bg-coffee/5 px-2.5 py-1 rounded-md inline-block">Por {post.author}</span>
                      <h3 className="font-bold text-base text-primary dark:text-white leading-tight group-hover:text-coffee dark:group-hover:text-gold transition-colors duration-200">{post.title}</h3>
                      <p className="text-stone-550 dark:text-stone-400 text-xs line-clamp-3 leading-relaxed">{post.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        );
      case 'home_schedules':
        return <StoreHoursSection businessSettings={businessSettings} />;
      default:
        return null;
    }
  };


  return (
    <div className="space-y-16 pb-20 text-left bg-brand-base dark:bg-stone-900 text-black dark:text-stone-100 font-sans relative">
      <SEOHead 
        title="Café de Especialidad & Masa Madre" 
        description="Rose Coffee en Milagro, Ecuador. Granos seleccionados de Loja y Zaruma tostados al instante y panes de masa madre fermentados por 24 horas."
        keywords="cafe especialidad, masa madre, milagro ecuador, zaruma, loja, panaderia artesanal, AR 3D, cafeteria"
      />
      
            {sectionConfig.sort((a: any, b: any) => a.order - b.order).map((section: any) => {
        if (!section.visible) return null;
        return (
          <React.Fragment key={section.id}>
            {renderSection(section.id)}
          </React.Fragment>
        );
      })}

      {/* HOURS & LOCATION */}
      <StoreHoursSection businessSettings={businessSettings} />

    </div>
  );
};

export default Home;
