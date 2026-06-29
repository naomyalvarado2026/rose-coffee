import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  HelpCircle, 
  AlertCircle,
  Share2,
  Check
} from 'lucide-react';
import type { Blog } from '../../types';
import { toast } from 'sonner';

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Estados interactivos para cuestionarios
  // Guardamos las respuestas de los usuarios por ID de bloque
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [tfAnswers, setTfAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchBlogDetails = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setBlog(data);
        } else {
          // Intentar buscar en datos locales de prueba
          const localMatch = MOCK_BLOGS.find(b => b.slug === slug);
          if (localMatch) {
            setBlog(localMatch);
          } else {
            toast.error('Artículo no encontrado');
            navigate('/blog');
          }
        }
      } catch (err: any) {
        console.error('Error fetching blog details:', err);
        const localMatch = MOCK_BLOGS.find(b => b.slug === slug);
        if (localMatch) {
          setBlog(localMatch);
        } else {
          toast.error('Error cargando el artículo de blog');
          navigate('/blog');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [slug, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Enlace copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf2e7]/40 dark:bg-stone-900 flex flex-col items-center justify-center p-6 text-stone-550">
        <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-coffee mb-3"></div>
        <p className="text-xs font-bold uppercase tracking-wider">Cargando artículo...</p>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#faf2e7]/40 dark:bg-stone-900 pb-24 text-stone-850 dark:text-stone-100">
      
      {/* Estilos locales para renderizado seguro de texto HTML en blogs */}
      <style>{`
        .blog-content-prose h2 {
          font-size: 1.6rem;
          font-weight: 800;
          color: #021a54;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.25;
        }
        .blog-content-prose h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #6b3a0e;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .blog-content-prose p {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #44403c;
          margin-bottom: 1.2rem;
        }
        .blog-content-prose strong {
          color: #010c27;
          font-weight: 700;
        }
        .blog-content-prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.2rem;
          font-size: 0.95rem;
          color: #44403c;
        }
        .blog-content-prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.2rem;
          font-size: 0.95rem;
          color: #44403c;
        }
        .blog-content-prose li {
          margin-bottom: 0.4rem;
          line-height: 1.6;
        }
        .blog-content-prose blockquote {
          border-left: 4px solid #c8922a;
          padding-left: 1.25rem;
          font-style: italic;
          color: #6b3a0e;
          background-color: #c8922a/5;
          margin: 1.5rem 0;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
      `}</style>

      {/* Decorative Orbs */}
      <div className="absolute top-[200px] left-0 w-[450px] h-[450px] bg-coffee/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[350px] h-[350px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Banner Area */}
      <section className="relative bg-gradient-to-r from-[#021a54] to-[#010c27] text-white py-24 px-4 md:px-8 overflow-hidden">
        {/* Top bar steam visual */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold/10 via-gold/50 to-gold/10" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-white font-bold transition-colors uppercase tracking-wider mr-2"
            >
              <ArrowLeft size={14} />
              <span>Volver a blogs</span>
            </Link>
            
            <span className="bg-gold/20 text-gold border border-gold/45 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xxs">
              {blog.category}
            </span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-sans font-black tracking-tight leading-tight max-w-3xl"
          >
            {blog.title}
          </motion.h1>

          {blog.subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-stone-300 text-sm md:text-base font-medium max-w-2xl leading-relaxed"
            >
              {blog.subtitle}
            </motion.p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-stone-300">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Calendar size={14} className="text-gold" />
              <span>
                Publicado el {new Date(blog.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800/5 hover:bg-white dark:bg-stone-800/10 border border-white/10 rounded-lg font-bold transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-gold animate-bounce" /> : <Share2 size={14} />}
              <span>{copied ? 'Copiado' : 'Compartir'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main content body */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 mt-12 relative z-10">
        <div className="bg-white dark:bg-stone-800 rounded-3xl border border-coffee/10 p-6 md:p-10 shadow-xxs space-y-10">
          
          {/* Cover Image in Detail Page */}
          {blog.cover_image_url && (
            <div className="rounded-2xl overflow-hidden aspect-video shadow-sm border border-stone-100 dark:border-stone-700 max-h-[420px]">
              <img
                src={blog.cover_image_url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rendering the blocks */}
          <div className="space-y-8">
            {blog.blocks && blog.blocks.length > 0 ? (
              blog.blocks.map((block) => {
                const blockContent = block.content;

                switch (block.type) {
                  case 'text': {
                    const textData = blockContent as any;
                    return (
                      <div 
                        key={block.id} 
                        className="blog-content-prose"
                        dangerouslySetInnerHTML={{ __html: textData.text || '' }}
                      />
                    );
                  }

                  case 'image': {
                    const imgData = blockContent as any;
                    // Class builders for alignment and size
                    let widthClass = 'w-full';
                    if (imgData.size === 'small') widthClass = 'max-w-sm';
                    else if (imgData.size === 'medium') widthClass = 'max-w-xl';
                    else if (imgData.size === 'large') widthClass = 'max-w-3xl';
                    else if (imgData.size === 'full') widthClass = 'w-full';

                    let alignClass = 'mx-auto';
                    if (imgData.alignment === 'left') alignClass = 'mr-auto ml-0 md:float-left md:mr-6 md:mb-4';
                    else if (imgData.alignment === 'right') alignClass = 'ml-auto mr-0 md:float-right md:ml-6 md:mb-4';

                    return (
                      <div key={block.id} className={`my-6 overflow-hidden ${alignClass} ${widthClass} clear-both`}>
                        {imgData.url && (
                          <img
                            src={imgData.url}
                            alt={imgData.alt || blog.title}
                            className="rounded-2xl w-full border border-stone-100 dark:border-stone-700 shadow-sm"
                          />
                        )}
                        {imgData.caption && (
                          <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-2 font-medium italic">
                            {imgData.caption}
                          </p>
                        )}
                      </div>
                    );
                  }

                  case 'question': {
                    const qData = blockContent as any;
                    const blockId = block.id;
                    const isAnswered = selectedAnswers[blockId] !== undefined;
                    const selectedIdx = selectedAnswers[blockId];
                    const correctIdx = qData.correctAnswerIndex;

                    return (
                      <div 
                        key={blockId} 
                        className="my-8 bg-stone-50 dark:bg-stone-800 border border-coffee/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-inner"
                      >
                        <div className="flex items-start gap-3">
                          <HelpCircle className="text-coffee dark:text-gold h-6 w-6 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-gold">Pregunta Interactiva</span>
                            <h4 className="font-sans font-extrabold text-primary dark:text-gold text-base md:text-lg mt-0.5 leading-snug">
                              {qData.question}
                            </h4>
                          </div>
                        </div>

                        {/* Opciones */}
                        <div className="space-y-2.5 pt-2">
                          {(qData.options || []).map((option: string, oIdx: number) => {
                            let optionStyle = 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-coffee text-stone-700';
                            let icon = null;

                            if (isAnswered) {
                              if (oIdx === correctIdx) {
                                // Opción correcta (siempre verde)
                                optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                                icon = <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />;
                              } else if (oIdx === selectedIdx) {
                                // Opción seleccionada incorrecta (rojo)
                                optionStyle = 'bg-red-50 border-red-400 text-red-800 font-bold';
                                icon = <XCircle size={16} className="text-red-600 shrink-0" />;
                              } else {
                                // Otras opciones deshabilitadas
                                optionStyle = 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-400 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                disabled={isAnswered}
                                onClick={() => {
                                  setSelectedAnswers(prev => ({
                                    ...prev,
                                    [blockId]: oIdx
                                  }));
                                }}
                                className={`w-full flex items-center justify-between text-left px-4.5 py-3.5 rounded-xl border text-xs font-bold transition-all ${optionStyle} ${!isAnswered ? 'cursor-pointer hover:bg-stone-50 dark:bg-stone-800' : 'cursor-default'}`}
                              >
                                <span>{option}</span>
                                {icon}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explicación (Aparece al responder) */}
                        <AnimatePresence>
                          {isAnswered && qData.explanation && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700/60 flex gap-2.5 text-xs font-medium text-stone-600 leading-relaxed bg-[#faf2e7]/40 dark:bg-stone-800 p-4 rounded-xl"
                            >
                              <AlertCircle size={16} className="text-gold shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-coffee dark:text-gold block uppercase text-[10px] tracking-wider mb-0.5">Explicación</span>
                                <p>{qData.explanation}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  case 'html': {
                    const htmlData = blockContent as any;
                    return (
                      <div 
                        key={block.id} 
                        className="my-6 rounded-2xl overflow-hidden shadow-sm border border-stone-150 dark:border-stone-700 p-2 bg-stone-50 dark:bg-stone-800"
                        dangerouslySetInnerHTML={{ __html: htmlData.html || '' }}
                      />
                    );
                  }

                  case 'true_false': {
                    const tfData = blockContent as any;
                    const blockId = block.id;
                    const isAnswered = tfAnswers[blockId] !== undefined;
                    const selectedVal = tfAnswers[blockId];
                    const correctVal = tfData.isTrue;

                    return (
                      <div 
                        key={blockId} 
                        className="my-8 bg-stone-50 dark:bg-stone-800 border border-coffee/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-inner"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="text-coffee dark:text-gold h-6 w-6 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-gold">Desafío Verdadero o Falso</span>
                            <h4 className="font-sans font-extrabold text-primary dark:text-gold text-base md:text-lg mt-0.5 leading-snug">
                              {tfData.statement}
                            </h4>
                          </div>
                        </div>

                        {/* Botones Verdadero o Falso */}
                        <div className="flex gap-4 pt-2">
                          {[true, false].map((val) => {
                            const label = val ? 'Verdadero' : 'Falso';
                            let btnStyle = 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-coffee text-stone-700';
                            let icon = null;

                            if (isAnswered) {
                              if (val === correctVal) {
                                btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                                icon = <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />;
                              } else if (val === selectedVal) {
                                btnStyle = 'bg-red-50 border-red-400 text-red-800 font-bold';
                                icon = <XCircle size={14} className="text-red-600 shrink-0" />;
                              } else {
                                btnStyle = 'bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-400 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={val ? 't' : 'f'}
                                type="button"
                                disabled={isAnswered}
                                onClick={() => {
                                  setTfAnswers(prev => ({
                                    ...prev,
                                    [blockId]: val
                                  }));
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold transition-all ${btnStyle} ${!isAnswered ? 'cursor-pointer hover:bg-stone-50 dark:bg-stone-800' : 'cursor-default'}`}
                              >
                                <span>{label}</span>
                                {icon}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explicación Verdadero o Falso */}
                        <AnimatePresence>
                          {isAnswered && tfData.explanation && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700/60 flex gap-2.5 text-xs font-medium text-stone-600 leading-relaxed bg-[#faf2e7]/40 dark:bg-stone-800 p-4 rounded-xl"
                            >
                              <AlertCircle size={16} className="text-gold shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-coffee dark:text-gold block uppercase text-[10px] tracking-wider mb-0.5">Explicación</span>
                                <p>{tfData.explanation}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  default:
                    return null;
                }
              })
            ) : (
              <div className="py-8 text-stone-450 italic text-center">
                El artículo no tiene bloques de contenido configurados.
              </div>
            )}
          </div>

          {/* Footer del Artículo */}
          <div className="pt-8 border-t border-stone-100 dark:border-stone-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-stone-450">
              Escrito con pasión por el equipo de <span className="font-bold text-coffee dark:text-gold">Rose Coffee</span>.
            </div>
            
            <Link
              to="/blog"
              className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-coffee/5 hover:bg-coffee/10 text-coffee dark:text-gold text-xs font-black transition-all"
            >
              <BookOpen size={14} />
              <span>Ver todos los blogs</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}

// Datos semilla de demostración en local si falla la base de datos
const MOCK_BLOGS: Blog[] = [
  {
    id: 'mock-1',
    title: 'El Arte de la Masa Madre: Todo lo que debes saber',
    subtitle: 'Descubre por qué la fermentación natural de masa madre hace que nuestro pan sea único, saludable y delicioso.',
    slug: 'el-arte-de-la-masa-madre',
    cover_image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=1200',
    category: 'Panadería Artesanal',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    blocks: [
      {
        id: 'block-1',
        type: 'text',
        content: { text: '<h2>¿Qué es realmente la Masa Madre?</h2><p>La masa madre es un cultivo simbiótico de levaduras silvestres y bacterias lácticas (principalmente lactobacilos) que se originan de forma natural en la harina y el agua. A diferencia del pan comercial elaborado con levadura química o industrial, la masa madre no requiere de aditivos para fermentar.</p><p>En <strong>Rose Coffee</strong>, alimentamos diariamente nuestra masa madre (a la que llamamos con su propio carácter) para asegurar que el pan tenga el alveolado perfecto, una corteza crujiente y esa acidez característica tan balanceada y sutil.</p>' }
      },
      {
        id: 'block-2',
        type: 'image',
        content: { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800', alt: 'Harina y pan artesanal', alignment: 'center', size: 'medium', caption: 'Harina de fuerza premium seleccionada para nuestro pan de masa madre.' }
      },
      {
        id: 'block-3',
        type: 'true_false',
        content: { statement: '¿La fermentación de masa madre dura generalmente más de 12 horas en Rose Coffee?', isTrue: true, explanation: '¡Correcto! En Rose Coffee realizamos fermentaciones en frío de entre 16 y 24 horas. Este largo proceso descompone el gluten y los fitatos, haciendo que el pan sea mucho más fácil de digerir.' }
      },
      {
        id: 'block-4',
        type: 'text',
        content: { text: '<h2>Los 3 Beneficios Principales para tu Salud</h2><ol><li><strong>Mayor digestibilidad:</strong> La fermentación prolongada predigiere los almidones y reduce la presencia de gluten.</li><li><strong>Bajo índice glucémico:</strong> Los ácidos orgánicos producidos ralentizan la liberación de glucosa en el torrente sanguíneo.</li><li><strong>Mejor absorción de nutrientes:</strong> Los lactobacilos neutralizan el ácido fítico, liberando minerales esenciales como hierro, zinc y magnesio.</li></ol>' }
      },
      {
        id: 'block-5',
        type: 'question',
        content: { question: '¿Cuál de las siguientes bacterias es la responsable de la acidez láctica beneficiosa en el pan de masa madre?', options: ['Saccharomyces cerevisiae', 'Lactobacillus sanfranciscensis', 'Escherichia coli'], correctAnswerIndex: 1, explanation: 'Lactobacillus sanfranciscensis es la bacteria láctica que fermenta junto a las levaduras silvestres, creando los ácidos láctico y acético que le otorgan su incomparable sabor y textura.' }
      }
    ]
  },
  {
    id: 'mock-2',
    title: 'Guía de Barismo: Los Métodos de Filtrado en Rose Coffee',
    subtitle: 'De la prensa francesa al V60. Te enseñamos a extraer cada nota de sabor de nuestros granos de especialidad.',
    slug: 'guia-metodos-filtrado',
    cover_image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200',
    category: 'Café de Especialidad',
    published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    blocks: [
      {
        id: 'block-1',
        type: 'text',
        content: { text: '<h2>El V60: El método del vertido preciso</h2><p>El V60 es uno de los métodos de goteo (pour-over) más populares del mundo. Su nombre proviene de su ángulo de 60 grados y los vectores en espiral dentro del cono, que ayudan al flujo de agua y la liberación de gases del café.</p><p>Este método resalta los sabores frutales, florales y cítricos de los cafés de especialidad de origen único con cuerpo ligero y limpio.</p>' }
      },
      {
        id: 'block-2',
        type: 'image',
        content: { url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800', alt: 'Método de filtrado V60', alignment: 'center', size: 'medium', caption: 'Un barismo de precisión requiere medir la temperatura, tiempo y peso.' }
      },
      {
        id: 'block-3',
        type: 'question',
        content: { question: '¿Qué temperatura de agua es ideal para una correcta extracción en un método filtrado V60?', options: ['100°C (Hirviendo)', '90°C a 94°C', '70°C a 75°C'], correctAnswerIndex: 1, explanation: 'Entre 90°C y 94°C es la temperatura ideal. Si usas agua hirviendo, puedes quemar el café y extraer notas amargas; si está muy fría, el café quedará sub-extraído y aguado.' }
      },
      {
        id: 'block-4',
        type: 'text',
        content: { text: '<h2>Chemex y Prensa Francesa</h2><p>Mientras que la Chemex utiliza un filtro de papel más grueso que retiene los aceites y sedimentos dando una taza extremadamente limpia, la Prensa Francesa utiliza un filtro de malla metálica que permite que todos los aceites pasen a la taza, resultando en un cuerpo robusto, denso y con mucho peso en boca.</p>' }
      },
      {
        id: 'block-5',
        type: 'true_false',
        content: { statement: '¿La Chemex produce un café con cuerpo más pesado que la Prensa Francesa?', isTrue: false, explanation: '¡Falso! Al contrario, el filtro grueso de la Chemex retiene los aceites y compuestos amargos, produciendo una taza súper limpia y ligera. La Prensa Francesa da el cuerpo más pesado.' }
      }
    ]
  }
];
