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

const BrandPresentation = () => {
  const [sectionsData, setSectionsData] = useState<Record<string, Record<string, any>>>({});
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
                src={block.imageUrl || block.image_url}
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
    { type: 'text', textContent: '<p>Rose Coffee es más que una cafetería; es un espacio donde la tradición del café de especialidad se encuentra con el arte de la masa madre.</p>' }
  ];

  const objectiveData = sectionsData['objective']?.content_blocks || [
    { type: 'text', textContent: '<p>Posicionar a Rose Coffee como el destino principal para amantes del buen café y repostería artesanal, ofreciendo una experiencia phygital impecable.</p>' }
  ];

  const audienceData = sectionsData['audience']?.content_blocks || [
    { type: 'columns', columns: ['Jóvenes profesionales', 'Estudiantes universitarios', 'Amantes de la gastronomía artesanal'] }
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

      {/* 1. Portada */}
      <CoverSlide {...coverData} />

      {/* 2. Descripción General */}
      {descriptionData && (
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 dark:border-gold/25 bg-coffee/5 dark:bg-gold/5 px-4 py-1.5 rounded-full mb-4">
              Introducción
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">Descripción General</h2>
          </motion.div>
          {renderBlocks(descriptionData, 'light')}
        </section>
      )}

      {/* 3. Objetivo del Proyecto */}
      {objectiveData && (
        <section className="py-24 px-6 bg-primary w-full">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
              <span className="inline-block text-[10px] font-bold text-gold uppercase tracking-widest border border-gold/30 bg-gold/10 px-4 py-1.5 rounded-full mb-4">
                Propósito
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-stone-100 mb-6">Objetivo del Proyecto</h2>
            </motion.div>
            {renderBlocks(objectiveData, 'dark')}
          </div>
        </section>
      )}

      {/* 4. Público Objetivo */}
      {audienceData && (
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 dark:border-gold/25 bg-coffee/5 dark:bg-gold/5 px-4 py-1.5 rounded-full mb-4">
              Target
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">Público Objetivo</h2>
          </motion.div>
          {renderBlocks(audienceData, 'light')}
        </section>
      )}

      {/* 5. Logotipo */}
      <LogoShowcase description={logoData.description} visibleVariants={logoData.visibleVariants} />

      {/* 6. Paleta Cromática */}
      <BrandColorsSection colors={colorsData} />

      {/* 7. Tipografías */}
      <TypographySection fonts={typographyData} />

      {/* 8. Estilo Gráfico */}
      {styleData && (
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 dark:border-gold/25 bg-coffee/5 dark:bg-gold/5 px-4 py-1.5 rounded-full mb-4">
              Dirección de Arte
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">Estilo Gráfico</h2>
          </motion.div>
          {renderBlocks(styleData, 'light')}
        </section>
      )}

      {/* 9. Aplicaciones de Identidad */}
      {applicationsData && applicationsData.length > 0 && (
        <section className="py-24 px-6 bg-white dark:bg-stone-900 w-full">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
              <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 dark:border-gold/25 bg-coffee/5 dark:bg-gold/5 px-4 py-1.5 rounded-full mb-4">
                Mockups
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-primary dark:text-stone-100 mb-6">Aplicaciones de Identidad</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {applicationsData.map((app: Record<string, any>, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-sm group bg-white dark:bg-stone-800"
                >
                  <div className="aspect-[4/3] bg-stone-100 dark:bg-stone-700 overflow-hidden">
                    <img src={app.image_url || app.imageUrl} alt={app.caption || 'Aplicación'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
      )}

      {/* 10. Cronograma 7 Días */}
      <ContentCalendarSection rows={calendarData} />

      {/* Botón Inteligente de Exportación PDF */}
      <PrintPDFButton title="Presentación Oficial de Marca - Rose Coffee" />
    </div>
  );
};

export default BrandPresentation;
