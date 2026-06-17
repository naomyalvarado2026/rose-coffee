import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { Compass, Sparkles, Coffee, Layers, ShieldCheck } from 'lucide-react';
import { supabase } from '../../config/supabase';
import BlockRenderer from '../../components/public/BlockRenderer';
import { ImageGallerySection } from '../../components/public/ImageGallerySection';
import OptimizedMedia from '../../components/common/OptimizedMedia';
import SEOHead from '../../components/common/SEOHead';

const founderEstebanImg = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80'; // Portrait of a man
const founderNaomyImg = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80'; // Portrait of a woman
const teamGroupImg = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&auto=format&fit=crop&q=80'; // Cafe interior team working

const DEFAULT_ABOUT_SECTIONS = [
  { id: 'about_hero', section_type: 'custom', name: 'Héroe Principal', title: 'Quiénes Somos', subtitle: 'La historia de pasión por el café de especialidad y la fermentación natural de masa madre en Milagro, Ecuador.', content_blocks: [] },
  { id: 'about_vision_mission', section_type: 'custom', name: 'Misión y Visión', title: 'Misión & Visión', subtitle: 'Nuestros objetivos y compromiso de calidad artesanal.', content_blocks: [] },
  { id: 'about_history', section_type: 'custom', name: 'Nuestra Historia', title: 'Nuestra Historia', subtitle: 'El camino de experimentación y dedicación que dio vida a Rose Coffee.', content_blocks: [] },
  { id: 'about_pillars', section_type: 'system_about_pillars', name: 'Nuestros Pilares Artesanales', title: 'Nuestros Pilares Artesanales', subtitle: 'Criterios de calidad que respaldan cada uno de nuestros productos.' },
  { id: 'about_pastoral', section_type: 'custom', name: 'El Equipo', title: 'El Equipo', subtitle: 'Las manos e ingenio detrás de Rose Coffee.', content_blocks: [] }
];

const About = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDynamicContent = async () => {
      try {
        const { data, error } = await supabase
          .from('page_contents')
          .select('*')
          .eq('page', 'about')
          .order('order_index', { ascending: true });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setSections(data);
        } else {
          setSections(DEFAULT_ABOUT_SECTIONS);
        }
      } catch (err) {
        console.error('Error fetching about page contents:', err);
        setSections(DEFAULT_ABOUT_SECTIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchDynamicContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4 bg-base">
        <div className="w-8 h-8 border-4 border-coffee border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">Cargando sobre nosotros...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-16 bg-base text-black font-sans relative overflow-hidden">
      <SEOHead 
        title="Nosotros - Historia & Filosofía" 
        description="Conoce la historia detrás de Rose Coffee, nuestro compromiso con el tueste de café de especialidad y la elaboración artesanal de masa madre."
        keywords="nosotros cafe, historia rose coffee, panaderia artesanal, barismo ecuador"
      />

      {/* Glow Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-coffee/5 blur-[130px] pointer-events-none" />

      {sections.map((sectionData) => {
        const { id, section_type, title, subtitle, content_blocks, cover_image_url } = sectionData;

        switch (section_type) {
          case 'custom':
            // 1. HERO SECTION
            if (id === 'about_hero') {
              return (
                <div 
                  key={id} 
                  id={id}
                  className="relative rounded-3xl p-8 md:p-16 text-white shadow-xl overflow-hidden bg-primary min-h-[300px] flex items-center border border-white/5"
                >
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={cover_image_url || "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&auto=format&fit=crop&q=80"} 
                      alt="Portada Rose Coffee" 
                      className="w-full h-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent"></div>
                  </div>
                  <motion.div 
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="relative z-10 max-w-3xl space-y-4 text-left"
                  >
                    <span className="bg-gold/20 text-gold border border-gold/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-xs select-none">
                      Nuestra Identidad
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold mt-3 tracking-tight font-sans text-white">{title || 'Quiénes Somos'}</h1>
                    <p className="text-stone-300 text-sm md:text-base leading-relaxed font-light max-w-2xl">
                      {subtitle || 'La historia de pasión por el café de especialidad y la fermentación natural de masa madre en Milagro, Ecuador.'}
                    </p>
                    {content_blocks && content_blocks.length > 0 && (
                      <div className="pt-4 border-t border-white/10 mt-4">
                        <BlockRenderer blocks={content_blocks} />
                      </div>
                    )}
                  </motion.div>
                </div>
              );
            }

            // 2. VISION & MISSION
            if (id === 'about_vision_mission') {
              return (
                <div key={id} id={id}>
                  {content_blocks && content_blocks.length > 0 ? (
                    <div className="bg-white p-8 md:p-12 rounded-3xl border border-stone-200/80 shadow-xs text-left">
                      {title && <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-2 font-sans">{title}</h2>}
                      {subtitle && <p className="text-stone-500 text-sm mb-6">{subtitle}</p>}
                      <BlockRenderer blocks={content_blocks} />
                    </div>
                  ) : (
                    <motion.section 
                      variants={staggerContainer}
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true, amount: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
                    >
                      {/* Mision */}
                      <motion.div 
                        variants={fadeInUp}
                        className="glass-card p-8 md:p-10 rounded-[32px] border border-coffee/10 hover:border-coffee/20 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between text-left group"
                      >
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-coffee/10 text-coffee rounded-2xl flex items-center justify-center font-bold border border-coffee/15 shadow-2xs group-hover:scale-105 transition-transform duration-350">
                            <Compass size={22} />
                          </div>
                          <h2 className="font-bold text-2xl text-primary font-sans">Nuestra Misión</h2>
                          <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-medium">
                            Tostar artesanalmente granos de especialidad de origen seleccionado y hornear pan de masa madre con fermentación natural lenta para brindar una experiencia gastronómica premium y saludable a nuestra comunidad en Milagro.
                          </p>
                        </div>
                      </motion.div>

                      {/* Vision */}
                      <motion.div 
                        variants={fadeInUp}
                        className="glass-card p-8 md:p-10 rounded-[32px] border border-coffee/10 hover:border-coffee/20 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between text-left group"
                      >
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-coffee/10 text-coffee rounded-2xl flex items-center justify-center font-bold border border-coffee/15 shadow-2xs group-hover:scale-105 transition-transform duration-350">
                            <Sparkles size={22} />
                          </div>
                          <h2 className="font-bold text-2xl text-primary font-sans">Nuestra Visión</h2>
                          <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-medium">
                            Ser la marca referente de café de especialidad y panadería artesanal en la región, integrando tecnología interactiva 3D AR, sostenibilidad y comercio justo con los caficultores de nuestro país.
                          </p>
                        </div>
                      </motion.div>
                    </motion.section>
                  )}
                </div>
              );
            }

            // 3. HISTORY
            if (id === 'about_history') {
              return (
                <div key={id} id={id}>
                  {content_blocks && content_blocks.length > 0 ? (
                    <div className="bg-white rounded-3xl border border-stone-200 p-8 md:p-12 shadow-xs space-y-4 text-left">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-primary border-b border-stone-100 pb-4 font-sans">
                        {title || 'Nuestra Historia'}
                      </h2>
                      {subtitle && <p className="text-stone-500 text-sm">{subtitle}</p>}
                      <BlockRenderer blocks={content_blocks} />
                    </div>
                  ) : (
                    <motion.section 
                      variants={fadeInUp}
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true, amount: 0.2 }}
                      className="bg-white rounded-[36px] border border-stone-200 p-8 md:p-12 shadow-xs space-y-6 text-left relative overflow-hidden"
                    >
                      <h2 className="text-2xl md:text-3xl font-extrabold text-primary border-b border-stone-100 pb-4 font-sans">Nuestra Historia</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-7 space-y-4 text-stone-600 text-xs md:text-sm leading-relaxed font-medium">
                          <p>
                            Rose Coffee nació de la búsqueda personal de redescubrir los sabores auténticos y los procesos lentos de la gastronomía tradicional. Lo que comenzó como un pasatiempo de fermentación natural de masa madre en el horno de nuestro hogar, pronto se expandió al maravilloso mundo del café de especialidad.
                          </p>
                          <p>
                            Al comprender la complejidad y el arte de la catación y el tueste, decidimos tender un puente directo entre los caficultores de las zonas altas de Ecuador y nuestra comunidad en Milagro. De esa forma, cada bolsa de café y cada pan rústico que sale de nuestro taller representa un homenaje al esfuerzo del campo y la precisión de la panadería artesanal.
                          </p>
                          <p>
                            Hoy, combinamos la calidez del servicio clásico con la innovación digital, permitiendo a nuestros clientes visualizar nuestros combos y panes mediante Realidad Aumentada 3D antes de comprarlos. Una fusión única entre la tradición artesanal y el futuro.
                          </p>
                        </div>
                        <div className="lg:col-span-5">
                          <div className="rounded-[28px] shadow-xl border border-stone-200 p-2.5 bg-white/80 backdrop-blur-xs">
                            <OptimizedMedia 
                              src={cover_image_url || teamGroupImg} 
                              alt="Equipo Rose Coffee trabajando"
                              className="w-full h-72 object-cover rounded-[20px] shadow-inner"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.section>
                  )}
                </div>
              );
            }

            // 5. PASTORAL / LIDERAZGO
            if (id === 'about_pastoral') {
              const imageBlocks = content_blocks?.filter((b: any) => b.type === 'image') || [];
              const hasImageBlocks = imageBlocks.length > 0;

              return (
                <div key={id} id={id}>
                  <section className="space-y-8 text-left">
                    <motion.div 
                      variants={fadeInUp}
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true }}
                      className="text-center max-w-xl mx-auto space-y-2"
                    >
                      <span className="inline-block text-[10px] font-bold text-coffee uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full mb-2">
                        Talento Humano
                      </span>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-primary font-sans">{title || 'El Equipo'}</h2>
                      {subtitle && (
                        <p className="text-stone-500 text-xs md:text-sm">
                          {subtitle}
                        </p>
                      )}
                    </motion.div>

                    {hasImageBlocks ? (
                      <motion.div 
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.15 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                      >
                        {imageBlocks.map((block: any) => {
                          const textParts = block.imageText ? block.imageText.split('.') : [];
                          const role = textParts[0]?.trim() || 'Miembro del Equipo';
                          const bio = textParts.slice(1).join('.').trim() || block.imageText;
                          return (
                            <motion.div 
                              key={block.id}
                              variants={fadeInUp}
                              className="bg-white rounded-[32px] border border-stone-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group h-full"
                            >
                              <div className="w-full sm:w-48 h-60 bg-stone-50 flex-shrink-0 overflow-hidden">
                                <OptimizedMedia 
                                  src={block.imageUrl || founderEstebanImg} 
                                  alt={block.imageCaption || 'Miembro del equipo'}
                                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                                />
                              </div>
                              <div className="p-6 flex flex-col justify-between text-left">
                                <div className="space-y-2">
                                  <span className="inline-flex items-center gap-1.5 bg-gold/15 text-gold border border-gold/30 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                    {role}
                                  </span>
                                  <h3 className="font-bold text-lg text-primary font-sans">{block.imageCaption}</h3>
                                  {bio && (
                                    <p className="text-stone-550 text-xs leading-relaxed font-medium">
                                      {bio}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    ) : content_blocks && content_blocks.length > 0 ? (
                      <div className="bg-white rounded-3xl border border-stone-200 p-8 md:p-12 shadow-xs">
                        <BlockRenderer blocks={content_blocks} />
                      </div>
                    ) : (
                      <motion.div 
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, amount: 0.15 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                      >
                        {/* Esteban */}
                        <motion.div 
                          variants={fadeInUp}
                          className="bg-white rounded-[32px] border border-stone-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group h-full"
                        >
                          <div className="w-full sm:w-48 h-60 bg-stone-50 flex-shrink-0 overflow-hidden">
                            <OptimizedMedia 
                              src={founderEstebanImg} 
                              alt="Esteban - Fundador"
                              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-6 flex flex-col justify-between text-left">
                            <div className="space-y-2">
                              <span className="inline-flex items-center gap-1.5 bg-gold/15 text-gold border border-gold/30 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                Fundador & Panadero
                              </span>
                              <h3 className="font-bold text-lg text-primary font-sans">Esteban Alarcón</h3>
                              <p className="text-stone-550 text-xs leading-relaxed font-medium">
                                Ingeniero de software y apasionado de la microbiología del pan. Es el encargado de alimentar nuestra masa madre centenaria y hornear los panes rústicos todos los días.
                              </p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Naomy */}
                        <motion.div 
                          variants={fadeInUp}
                          className="bg-white rounded-[32px] border border-stone-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group h-full"
                        >
                          <div className="w-full sm:w-48 h-60 bg-stone-50 flex-shrink-0 overflow-hidden">
                            <OptimizedMedia 
                              src={founderNaomyImg} 
                              alt="Naomy - Jefa Barista"
                              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-6 flex flex-col justify-between text-left">
                            <div className="space-y-2">
                              <span className="inline-flex items-center gap-1.5 bg-gold/15 text-gold border border-gold/30 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                Co-fundadora & Barista
                              </span>
                              <h3 className="font-bold text-lg text-primary font-sans">Naomy Alvarado</h3>
                              <p className="text-stone-550 text-xs leading-relaxed font-medium">
                                Sommelier y experta en barismo. Define los perfiles de tueste y las curvas de extracción de nuestros granos de especialidad para garantizar el sabor óptimo en tu taza.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </section>
                </div>
              );
            }

            // OTHER GENERIC CUSTOM SECTIONS
            return (
              <section key={id} id={id} className="max-w-7xl mx-auto px-4 md:px-8 space-y-8 text-left">
                {(title || subtitle) && (
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    {title && <h2 className="text-2xl md:text-3xl font-extrabold text-primary font-sans">{title}</h2>}
                    {subtitle && <p className="text-stone-500 text-sm md:text-base leading-relaxed">{subtitle}</p>}
                  </div>
                )}
                <div className="bg-white p-8 md:p-12 rounded-3xl border border-stone-200 shadow-xs">
                  <BlockRenderer blocks={content_blocks} />
                </div>
              </section>
            );

          case 'system_about_pillars':
            // 4. NUESTROS PILARES
            return (
              <section key={id} id={id} className="space-y-8 text-left">
                <motion.div 
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  className="text-center max-w-xl mx-auto space-y-2"
                >
                  <span className="inline-block text-[10px] font-bold text-coffee uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full mb-2">
                    Nuestros Valores
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-primary font-sans">{title || 'Nuestros Pilares Artesanales'}</h2>
                  {subtitle && (
                    <p className="text-stone-500 text-xs md:text-sm">{subtitle}</p>
                  )}
                </motion.div>

                <motion.div 
                  variants={staggerContainer}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, amount: 0.15 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {/* Pillar 1 */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-gold/5 text-gold border border-gold/15 rounded-xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform duration-300 shadow-2xs">
                        <Coffee size={22} />
                      </div>
                      <h3 className="font-bold text-base text-primary font-sans">Café de Especialidad</h3>
                      <p className="text-stone-500 text-xs leading-relaxed font-medium">
                        Granos arábigos cosechados a mano sobre los 1500m, con perfiles de tueste optimizados para notas aromáticas inigualables.
                      </p>
                    </div>
                  </motion.div>

                  {/* Pillar 2 */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-gold/5 text-gold border border-gold/15 rounded-xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform duration-300 shadow-2xs">
                        <Sparkles size={22} />
                      </div>
                      <h3 className="font-bold text-base text-primary font-sans">Masa Madre Natural</h3>
                      <p className="text-stone-500 text-xs leading-relaxed font-medium">
                        Fermentación natural biológica de 24 horas. Pan sin químicos, de corteza crujiente y fácil digestibilidad.
                      </p>
                    </div>
                  </motion.div>

                  {/* Pillar 3 */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-gold/5 text-gold border border-gold/15 rounded-xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform duration-300 shadow-2xs">
                        <Layers size={22} />
                      </div>
                      <h3 className="font-bold text-base text-primary font-sans">Realidad Aumentada 3D</h3>
                      <p className="text-stone-500 text-xs leading-relaxed font-medium">
                        Visualización interactiva 3D de nuestros combos y panes directo en tu mesa antes de pedirlos con tu celular.
                      </p>
                    </div>
                  </motion.div>

                  {/* Pillar 4 */}
                  <motion.div 
                    variants={fadeInUp}
                    className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-gold/5 text-gold border border-gold/15 rounded-xl flex items-center justify-center font-bold group-hover:scale-105 transition-transform duration-300 shadow-2xs">
                        <ShieldCheck size={22} />
                      </div>
                      <h3 className="font-bold text-base text-primary font-sans">Comercio Sostenible</h3>
                      <p className="text-stone-500 text-xs leading-relaxed font-medium">
                        Trato directo con pequeños productores caficultores de Loja y Zamora, garantizando precios justos e impacto local.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </section>
            );

          case 'system_gallery':
            return (
              <div key={id} id={id}>
                <ImageGallerySection 
                  title={title || ''}
                  subtitle={subtitle || ''}
                  slides={content_blocks || []}
                />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default About;
