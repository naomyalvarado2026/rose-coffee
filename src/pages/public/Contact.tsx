import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../../utils/animations';
import SEOHead from '../../components/common/SEOHead';
import OptimizedMedia from '../../components/common/OptimizedMedia';
import FloatingElements from '../../components/public/FloatingElements';

const DEFAULT_CONTACT_SECTIONS = [
  { 
    id: 'contact_hero', 
    section_type: 'custom', 
    name: 'Cabecera Principal (Héroe)', 
    title: 'Contacto', 
    subtitle: '¿Tienes dudas sobre nuestros productos, envíos o deseas hacernos alguna consulta? Ponte en contacto con nosotros, estamos para atenderte.', 
    cover_image_url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&auto=format&fit=crop&q=80' 
  }
];

const Contact = () => {
  const [sections, setSections] = useState<any[]>(DEFAULT_CONTACT_SECTIONS);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Consulta General',
    message: '',
  });

  const [phone, setPhone] = useState('+593 98 765 4321');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com');
  const [tiktokUrl, setTiktokUrl] = useState('https://tiktok.com');

  useEffect(() => {
    // Fast cache recovery
    const cachedPhone = localStorage.getItem('rose_coffee_business_phone');
    if (cachedPhone) setPhone(cachedPhone);
    const cachedFacebook = localStorage.getItem('rose_coffee_facebook_url');
    if (cachedFacebook) setFacebookUrl(cachedFacebook);
    const cachedInstagram = localStorage.getItem('rose_coffee_instagram_url');
    if (cachedInstagram) setInstagramUrl(cachedInstagram);
    const cachedTiktok = localStorage.getItem('rose_coffee_tiktok_url');
    if (cachedTiktok) setTiktokUrl(cachedTiktok);

    const fetchDynamicContent = async () => {
      try {
        const { data, error } = await supabase
          .from('page_contents')
          .select('*')
          .eq('page', 'contact')
          .order('order_index', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setSections(data);
        }
      } catch (err) {
        console.error('Error fetching contact page contents:', err);
      }
    };

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('page_contents')
          .select('*')
          .eq('id', 'business_settings')
          .maybeSingle();

        if (error) throw error;

        if (data && data.content_blocks && data.content_blocks[0]) {
          const cfg = data.content_blocks[0];
          if (cfg.phone) {
            setPhone(cfg.phone);
            localStorage.setItem('rose_coffee_business_phone', cfg.phone);
          }
          if (cfg.facebook_url) {
            setFacebookUrl(cfg.facebook_url);
            localStorage.setItem('rose_coffee_facebook_url', cfg.facebook_url);
          }
          if (cfg.instagram_url) {
            setInstagramUrl(cfg.instagram_url);
            localStorage.setItem('rose_coffee_instagram_url', cfg.instagram_url);
          }
          if (cfg.tiktok_url) {
            setTiktokUrl(cfg.tiktok_url);
            localStorage.setItem('rose_coffee_tiktok_url', cfg.tiktok_url);
          }
        }
      } catch (e) {
        console.warn('Could not sync contact settings:', e);
      }
    };

    fetchDynamicContent();
    fetchSettings();
  }, []);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call rate-limiter Edge Function to protect endpoint against spamming
      const { data: limitData, error: limitError } = await supabase.functions.invoke('rate-limiter', {
        body: { endpoint: 'contacto' }
      });

      if (limitError) {
        setError('Límite de solicitudes excedido (5 peticiones cada 15 min). Por favor intenta de nuevo más tarde.');
        setLoading(false);
        return;
      }

      if (!limitData || !limitData.success) {
        setError('Límite de solicitudes excedido (5 peticiones cada 15 min). Por favor intenta de nuevo más tarde.');
        setLoading(false);
        return;
      }

      // Proceed with inserting the contact message
      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: 'unread',
        });

      if (insertError) throw insertError;
      setSuccess(true);
    } catch (err: any) {
      console.error('Error enviando mensaje a Supabase:', err);
      if (err.context?.status === 429 || err.message?.includes('429')) {
        setError('Límite de solicitudes excedido (5 peticiones cada 15 min). Por favor intenta de nuevo más tarde.');
      } else {
        setError('Ocurrió un error al enviar tu mensaje. Por favor intenta más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const heroSection = sections.find(s => s.id === 'contact_hero') || DEFAULT_CONTACT_SECTIONS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-16 bg-brand-base text-black font-sans relative overflow-hidden">
      <SEOHead 
        title="Contacto - Visítanos en Milagro" 
        description="Ponte en contacto con Rose Coffee. Encuentra nuestra dirección, horarios de atención, teléfonos de pedidos y envíanos tus dudas directamente."
        keywords="contacto cafe, direccion rose coffee, milagro ecuador, telefono barismo, consultas"
      />
      
      {/* Floating background elements for premium feel */}
      <FloatingElements />
      
      {/* Glow Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-coffee/5 blur-[130px] pointer-events-none" />

      {/* HEADER HERO */}
      <div id="contact_hero" className="relative rounded-3xl p-8 md:p-16 text-white shadow-xl overflow-hidden bg-primary min-h-[300px] flex items-center border border-white/5">
        <div className="absolute inset-0 z-0">
          <OptimizedMedia 
            src={heroSection.cover_image_url || "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&auto=format&fit=crop&q=80"} 
            alt="Cafetería Rose Coffee" 
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-transparent"></div>
        </div>
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="relative z-10 max-w-3xl space-y-4 text-left"
        >
          <span className="bg-gold/20 text-gold border border-gold/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-xs select-none">
            Canales de Atención
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 tracking-tight font-sans text-white">{heroSection.title || 'Contacto'}</h1>
          <p className="text-stone-300 text-sm md:text-base leading-relaxed font-light max-w-2xl">
            {heroSection.subtitle || '¿Tienes dudas sobre nuestros productos, envíos o deseas hacernos alguna consulta? Ponte en contacto con nosotros, estamos para atenderte.'}
          </p>
        </motion.div>
      </div>

      {/* GRID PRINCIPAL (2 Columnas en Desktop) */}
      <motion.div 
        id="contact_info"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch relative z-10"
      >
        
        {/* Columna Izquierda: Información de Contacto */}
        <motion.div variants={fadeInUp} className="space-y-6 flex flex-col justify-between text-left">
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-primary pb-3 border-b border-stone-200/60 font-sans">
              Información de Contacto
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Tarjeta Dirección */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(107, 58, 14, 0.12)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-cream rounded-2xl border border-coffee/10 p-6 flex gap-4 shadow-2xs transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gold/10 text-gold border border-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-stone-850 text-sm">Dirección</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed font-medium">
                    E25 y Av. 17 de Septiembre, Milagro, Ecuador.
                  </p>
                </div>
              </motion.div>

              {/* Tarjeta Atención al Cliente */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(107, 58, 14, 0.12)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-cream rounded-2xl border border-coffee/10 p-6 flex gap-4 shadow-2xs transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gold/10 text-gold border border-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-stone-850 text-sm">Atención al Cliente</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed font-medium">
                    {phone} (Barista de turno)
                  </p>
                </div>
              </motion.div>

              {/* Tarjeta Correo */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.02, boxShadow: '0 10px 25px -5px rgba(107, 58, 14, 0.12)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-cream rounded-2xl border border-coffee/10 p-6 flex gap-4 shadow-2xs transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gold/10 text-gold border border-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-stone-850 text-sm">Correo Electrónico</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed font-medium">
                    contacto@rosecoffee.com
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="pt-6 border-t border-stone-200/80 space-y-4">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Nuestras Redes Sociales</span>
            <div className="flex gap-4">
              <motion.a 
                whileHover={{ y: -4, scale: 1.05 }}
                href={facebookUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="w-12 h-12 bg-cream text-stone-700 hover:text-primary border border-coffee/10 rounded-2xl flex items-center justify-center shadow-2xs hover:shadow-sm hover:border-coffee/20 transition-all duration-300" 
                title="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </motion.a>

              <motion.a 
                whileHover={{ y: -4, scale: 1.05 }}
                href={instagramUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="w-12 h-12 bg-cream text-stone-700 hover:text-accent-red border border-coffee/10 rounded-2xl flex items-center justify-center shadow-2xs hover:shadow-sm hover:border-coffee/20 transition-all duration-300" 
                title="Instagram"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </motion.a>

              <motion.a 
                whileHover={{ y: -4, scale: 1.05 }}
                href={tiktokUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="w-12 h-12 bg-cream text-stone-700 hover:text-black border border-coffee/10 rounded-2xl flex items-center justify-center shadow-2xs hover:shadow-sm hover:border-coffee/20 transition-all duration-300" 
                title="TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.43-.4-.61-.62-.05 1.91-.02 3.83-.04 5.74-.03 1.94-.38 3.93-1.47 5.54-1.39 2.05-3.87 3.23-6.32 3.07-2.8-.18-5.41-2.12-6.08-4.88-.8-3.32 1.05-6.99 4.31-7.79 1.15-.28 2.38-.21 3.5.17v4.14c-.95-.34-2.03-.35-2.93.13-.97.52-1.57 1.6-1.54 2.7.02 1.39 1.18 2.58 2.57 2.54 1.34-.04 2.44-1.14 2.45-2.48.02-4.13.01-8.26.02-12.39z" />
                </svg>
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Columna Derecha: Mapa de Ubicación */}
        <motion.div 
          variants={fadeInUp}
          className="bg-cream rounded-[32px] border border-coffee/10 p-3 shadow-md hover:shadow-lg transition-shadow duration-300 h-full min-h-[400px] flex flex-col"
        >
          <div className="flex-1 rounded-2xl overflow-hidden shadow-inner border border-coffee/5 relative h-full">
            <iframe 
              src="https://maps.google.com/maps?q=-2.139188,-79.5949891&t=&z=17&ie=UTF8&iwloc=&output=embed"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen={true}
              loading="lazy"
              // @ts-expect-error credentialless is not yet in React's TS definitions but is supported by the browser
              credentialless="true"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa Rose Coffee"
            ></iframe>
          </div>
        </motion.div>
      </motion.div>

      {/* WHATSAPP CALLOUT */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-3xl mx-auto relative z-10"
      >
        <div className="bg-emerald-50/80 backdrop-blur-xs border border-emerald-100 rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs hover:shadow-xs transition-all duration-300">
          <div className="space-y-2 text-left w-full md:w-auto">
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">
              Pedido Rápido
            </span>
            <h3 className="text-xl font-extrabold text-emerald-950 font-sans">
              ¿Deseas realizar un pedido al instante?
            </h3>
            <p className="text-emerald-700 text-xs md:text-sm max-w-xl font-medium leading-relaxed font-sans">
              Escríbenos directamente por WhatsApp para coordinar tus envíos en Milagro o para resolver tus consultas con atención inmediata.
            </p>
          </div>
          <a
            href="https://wa.me/593980372113?text=Hola%20Rose%20Coffee,%20me%20gustar%C3%ADa%20hacer%20un%20pedido."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-transparent select-none whitespace-nowrap"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.978 14.121.954 11.5.954c-5.446 0-9.87 4.372-9.874 9.802-.001 1.762.476 3.486 1.381 5.01L2.016 22.07l6.59-1.78.041-.027zm10.374-7.054c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
            </svg>
            Contactar por WhatsApp
          </a>
        </div>
      </motion.div>

      {/* FORMULARIO DE MENSAJE */}
      <motion.div 
        id="contact_form"
        variants={fadeInUp}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="max-w-3xl mx-auto pt-2 relative z-10"
      >
        {success ? (
          <div className="glass-card border border-coffee/10 p-8 rounded-[32px] text-center space-y-4 shadow-md py-16">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-sans font-extrabold text-2xl text-stone-900">¡Mensaje Enviado!</h3>
            <p className="text-stone-600 text-xs md:text-sm max-w-md mx-auto leading-relaxed font-medium">
              Gracias por escribirnos. Tu mensaje ha sido enviado a la administración de Rose Coffee. Te responderemos al correo proporcionado lo antes posible.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 px-6 py-3 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold shadow-sm active:scale-[0.98] transition-all cursor-pointer border border-transparent select-none"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card rounded-[32px] border border-coffee/10 p-6 md:p-10 space-y-6 shadow-md text-left">
            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-stone-900 font-sans">
                Escríbenos tu Mensaje
              </h3>
              <p className="text-xs text-stone-500 font-medium">¿Tienes dudas o necesitas información? Déjanos tu mensaje en el buzón.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Tu Nombre</label>
                <input
                  id="name"
                  type="text"
                  required
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm bg-stone-50/40 text-stone-850 placeholder-stone-400 focus:bg-white focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200"
                  placeholder="Ej. Ana de Castro"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Tu Correo</label>
                <input
                  id="email"
                  type="email"
                  required
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm bg-stone-50/40 text-stone-850 placeholder-stone-400 focus:bg-white focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200"
                  placeholder="Ej. ana@correo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 font-medium">Asunto</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm bg-stone-50/40 text-stone-850 focus:bg-white focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200"
              >
                <option value="Consulta General">Consulta General</option>
                <option value="Tienda / Pedidos">Pregunta sobre Tienda / Pedidos</option>
                <option value="Mayorista / Proveedores">Consulta Mayorista / Eventos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 font-medium">Mensaje</label>
              <textarea
                id="message"
                required
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm bg-stone-50/40 text-stone-850 placeholder-stone-400 focus:bg-white focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200 resize-none"
                placeholder="Escribe aquí tu consulta, sugerencia o mensaje..."
              />
            </div>

            {error && (
              <div className="bg-red-50 text-accent-red p-3.5 rounded-xl text-xs flex items-center gap-2 border border-red-100 font-medium">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-coffee hover:bg-coffee-dark disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer border border-transparent select-none"
            >
              {loading ? 'Enviando...' : (
                <>
                  Enviar Mensaje
                  <Send size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Contact;
