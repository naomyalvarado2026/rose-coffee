/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { CoverSlide } from '../../components/presentation/CoverSlide';
import { BrandColorsSection } from '../../components/presentation/BrandColorsSection';
import { TypographySection } from '../../components/presentation/TypographySection';
import { LogoShowcase } from '../../components/presentation/LogoShowcase';
import { ContentCalendarSection } from '../../components/presentation/ContentCalendarSection';
import SEOHead from '../../components/common/SEOHead';
import { motion } from 'framer-motion';
import { PrintPDFButton } from '../../components/common/PrintPDFButton';

const resolveUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const base = import.meta.env.BASE_URL || '/';
  return url.startsWith('/') ? `${base}${url.slice(1)}` : `${base}${url}`;
};

const BrandPresentation = () => {
  const [sectionsData, setSectionsData] = useState<Record<string, Record<string, any>>>({});
  const [orderedSections, setOrderedSections] = useState<string[]>(['cover', 'description', 'objective', 'audience', 'logo', 'colors', 'typography', 'style', 'applications', 'calendar']);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresentationData = async () => {
      try {
        const { data, error } = await supabase
          .from('page_contents')
          .select('*')
          .eq('page', 'brand_presentation');

        if (error) throw error;

        if (data) {
          const mapped = data.reduce((acc: Record<string, Record<string, any>>, item: Record<string, any>) => {
            acc[item.section || item.section_id || item.id] = item;
            return acc;
          }, {});
          
          const configRow = data.find((item: any) => item.section === 'config');
          if (configRow && configRow.content_blocks && configRow.content_blocks[0]) {
             const cfg = configRow.content_blocks[0];
             if (cfg.orderedSections) setOrderedSections(cfg.orderedSections);
             if (cfg.hiddenSections) setHiddenSections(cfg.hiddenSections);
          }
          
          setSectionsData(mapped);
        }
      } catch (err) {
        console.error('Error fetching brand presentation data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPresentationData();
  }, []);

  const renderBlocks = (blocks: Record<string, any>[], theme: 'light' | 'dark' = 'light') => {
    if (!blocks || !Array.isArray(blocks)) return null;

    return blocks.map((block: Record<string, any>, idx: number) => {
      const textColorClass = theme === 'dark' ? 'text-stone-300' : 'text-stone-600';
      const titleColorClass = theme === 'dark' ? 'text-stone-100' : 'text-primary';

      switch (block.type) {
        case 'text':
          return (
            <motion.div
              key={block.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`prose prose-lg max-w-none ${textColorClass} mb-6`}
              dangerouslySetInnerHTML={{ __html: block.textContent || block.text || '' }}
            />
          );
        case 'section':
          return (
            <motion.h3
              key={block.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-2xl font-bold ${titleColorClass} mt-12 mb-6`}
            >
              {block.title}
            </motion.h3>
          );
        case 'image':
          return (
            <motion.div
              key={block.id || idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="my-8 flex flex-col items-center"
            >
              <img
                src={resolveUrl(block.imageUrl || block.image_url)}
                alt={block.imageCaption || ''}
                className="rounded-3xl shadow-xl max-w-full h-auto max-h-[600px] object-cover"
              />
              {block.imageCaption && (
                <p className={`mt-3 text-sm italic ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                  {block.imageCaption}
                </p>
              )}
            </motion.div>
          );
        case 'columns':
          return (
            <motion.div
              key={block.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-8"
            >
              {(block.columns || []).map((col: string, i: number) => (
                <div key={i} className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-stone-800' : 'bg-stone-50'} shadow-sm border ${theme === 'dark' ? 'border-stone-700' : 'border-stone-200'}`}>
                  <p className={textColorClass}>{col}</p>
                </div>
              ))}
            </motion.div>
          );
        default:
          return null;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-base">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Extract sections data
  const coverData = sectionsData['cover']?.content_blocks?.[0] || {
    title: 'Manual de Marca & Estrategia',
    subtitle: 'Identidad Phygital y Contenidos',
    author: 'Naomy Alvarado',
    backgroundImage: ''
  };

  const logoData = sectionsData['logo']?.content_blocks?.[0] || {};
  const colorsData = sectionsData['colors']?.content_blocks || undefined;
  const typographyData = sectionsData['typography']?.content_blocks || undefined;
  const calendarData = sectionsData['calendar']?.content_blocks || undefined;

  const descriptionData = sectionsData['description']?.content_blocks || [
    { type: 'text', textContent: '<p>El proyecto se desarrolla para la cafetería <strong>Rose Coffee</strong> bajo el concepto creativo <em>"Del origen a la mesa"</em>.</p><p>La propuesta consiste en transformar la experiencia tradicional de consumo integrando espacios físicos y digitales, con el fin de comunicar la historia, el proceso artesanal y el valor gastronómico de su producto estrella: el pan de masa madre.</p><p>Se basa en un enfoque phygital transmedia que construye un ecosistema digital compuesto por una página web interactiva, contenido audiovisual, campañas publicitarias y experiencias de realidad aumentada.</p><p>El objetivo de esta integración es generar conexiones emocionales auténticas con los consumidores y extender la interacción con la marca más allá del espacio físico de la cafetería.</p>' }
  ];

  const objectiveData = sectionsData['objective']?.content_blocks || [
    { type: 'text', textContent: '<p>El objetivo general es diseñar una <strong>experiencia phygital transmedia</strong> utilizando narrativa audiovisual, contenidos interactivos y realidad aumentada.</p><p>Esta experiencia está orientada a fortalecer tanto la experiencia digital como la fidelización de los clientes en una cafetería-panadería artesanal.</p>' }
  ];

  const audienceData = sectionsData['audience']?.content_blocks || [
    { type: 'text', textContent: '<p>El proyecto está dirigido a <strong>jóvenes y adultos de entre 18 y 35 años de edad</strong>.</p><p>Se trata de consumidores de café y productos artesanales que mantienen hábitos digitales activos y son usuarios frecuentes de dispositivos móviles, redes sociales y plataformas web.</p><p>Este grupo demográfico se caracteriza por buscar y valorar experiencias auténticas, innovación tecnológica y propuestas gastronómicas que les ofrezcan una interacción dinámica y significativa con las marcas.</p>' },
    { type: 'columns', columns: ['Jóvenes y adultos (18 - 35 años)', 'Consumidores digitales activos', 'Amantes de la gastronomía y tecnología'] }
  ];

  const styleData = sectionsData['style']?.content_blocks || [
    { type: 'image', imageUrl: '/hero_bg_new.webp', imageCaption: 'Fotografía cálida y texturas orgánicas' }
  ];

  const applicationsData = sectionsData['applications']?.content_blocks || [
    { image_url: '/bg_coffee_bread.webp', caption: 'Bolsa de Café y Pan', category: 'Empaque' },
    { image_url: '/hero_coffee_sourdough.webp', caption: 'Masa Madre', category: 'Producto' },
    { image_url: '/coffee_roasting_process.webp', caption: 'Tostado', category: 'Proceso' }
  ];

  return (
    <div className="relative font-sans bg-brand-base dark:bg-stone-950">
      <SEOHead title="Presentación de Marca | Rose Coffee" description="Descubre el manual de marca y la estrategia de Rose Coffee." />

      <div id="brand-presentation-content">
        {orderedSections.filter(id => !hiddenSections.includes(id)).map(id => {
           switch (id) {
             case 'cover':
               return <CoverSlide key={id} {...coverData} backgroundImage={coverData.backgroundImage ? resolveUrl(coverData.backgroundImage) : undefined} />;
             case 'description':
               return descriptionData ? (
                 <section key={id} className="py-24 px-6 max-w-4xl mx-auto">
                   <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
                     <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 dark:border-gold/25 bg-coffee/5 dark:bg-gold/5 px-4 py-1.5 rounded-full mb-4">Introducción</span>
                     <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">Descripción General</h2>
                   </motion.div>
                   {renderBlocks(descriptionData, 'light')}
                 </section>
               ) : null;
             case 'objective':
               return objectiveData ? (
                 <section key={id} className="py-24 px-6 bg-primary w-full">
                   <div className="max-w-4xl mx-auto">
                     <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
                       <span className="inline-block text-[10px] font-bold text-gold uppercase tracking-widest border border-gold/30 bg-gold/10 px-4 py-1.5 rounded-full mb-4">Propósito</span>
                       <h2 className="text-3xl md:text-5xl font-bold text-stone-100 mb-6">Objetivo del Proyecto</h2>
                     </motion.div>
                     {renderBlocks(objectiveData, 'dark')}
                   </div>
                 </section>
               ) : null;
             case 'audience':
               return audienceData ? (
                 <section key={id} className="py-24 px-6 max-w-4xl mx-auto">
                   <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
                     <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 dark:border-gold/25 bg-coffee/5 dark:bg-gold/5 px-4 py-1.5 rounded-full mb-4">Target</span>
                     <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">Público Objetivo</h2>
                   </motion.div>
                   {renderBlocks(audienceData, 'light')}
                 </section>
               ) : null;
             case 'logo':
               return <LogoShowcase key={id} description={logoData.description} visibleVariants={logoData.visibleVariants} />;
             case 'colors':
               return <BrandColorsSection key={id} colors={colorsData} />;
             case 'typography':
               return <TypographySection key={id} fonts={typographyData} />;
             case 'style':
               return styleData ? (
                 <section key={id} className="py-24 px-6 max-w-4xl mx-auto">
                   <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
                     <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 dark:border-gold/25 bg-coffee/5 dark:bg-gold/5 px-4 py-1.5 rounded-full mb-4">Dirección de Arte</span>
                     <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">Estilo Gráfico</h2>
                   </motion.div>
                   {renderBlocks(styleData, 'light')}
                 </section>
               ) : null;
             case 'applications':
               return (applicationsData && applicationsData.length > 0) ? (
                 <section key={id} className="py-24 px-6 bg-white dark:bg-stone-900 w-full">
                   <div className="max-w-7xl mx-auto">
                     <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
                       <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 dark:border-gold/25 bg-coffee/5 dark:bg-gold/5 px-4 py-1.5 rounded-full mb-4">Mockups</span>
                       <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">Aplicaciones de Identidad</h2>
                     </motion.div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {applicationsData.map((app: Record<string, any>, idx: number) => (
                         <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-sm group bg-white dark:bg-stone-800">
                           <div className="aspect-[4/3] bg-stone-100 dark:bg-stone-700 overflow-hidden">
                             <img src={resolveUrl(app.image_url || app.imageUrl)} alt={app.caption || 'Aplicación'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           </div>
                           {(app.caption || app.category) && (
                             <div className="p-6 bg-white dark:bg-stone-800">
                               {app.category && <p className="text-[10px] font-bold text-gold uppercase mb-1">{app.category}</p>}
                               {app.caption && <p className="text-stone-700 dark:text-stone-300 font-medium">{app.caption}</p>}
                             </div>
                           )}
                         </motion.div>
                       ))}
                     </div>
                   </div>
                 </section>
               ) : null;
             case 'calendar':
               return <ContentCalendarSection key={id} rows={calendarData} />;
             default:
               return null;
           }
        })}
      </div>

      {/* Botón Inteligente de Exportación PDF */}
      <PrintPDFButton title="Presentación Oficial de Marca - Rose Coffee" />
    </div>
  );
};

export default BrandPresentation;
