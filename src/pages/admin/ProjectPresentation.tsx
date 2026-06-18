import { motion } from 'framer-motion';
import { 
  Cpu, 
  Layers, 
  Database, 
  Presentation, 
  Coffee, 
  Heart, 
  Home, 
  ShoppingBag, 
  BookOpen, 
  Mail, 
  ShoppingCart, 
  Package, 
  ClipboardList, 
  Users, 
  ChefHat, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  Globe,
  Palette,
  Lock,
  Code,
  LineChart,
  Settings
} from 'lucide-react';
import logoRose from '../../assets/logo rose coffee/1 rose coffee.svg';

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function ProjectPresentation() {
  // Common Framer Motion scroll options
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { type: 'spring' as const, stiffness: 80, damping: 15 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
    viewport: { once: true, margin: '-80px' }
  };



  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      y: -6, 
      scale: 1.02,
      boxShadow: '0 10px 30px -10px rgba(107, 58, 14, 0.15)',
      transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
    }
  };

  const cardVariantsDark = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      y: -6, 
      scale: 1.02,
      boxShadow: '0 10px 35px -10px rgba(0, 0, 0, 0.4)',
      transition: { type: 'spring' as const, stiffness: 300, damping: 20 }
    }
  };

  return (
    <div className="relative min-h-screen font-sans bg-[#faf2e7] overflow-x-hidden selection:bg-gold/30">
      
      {/* ---------------- SECTION 1: HERO / INTRODUCCIÓN ---------------- */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center px-4 md:px-8 py-16 bg-primary text-[#faf2e7] overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35vw] h-[35vw] bg-coffee/20 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Animated grid lines pattern in background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-8 z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 18 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-inner"
          >
            <Presentation size={15} className="text-gold animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gold">Presentación del Proyecto</span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-tight"
          >
            Rose Coffee <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-250 to-gold">
              El Futuro de la Panadería
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-stone-300 text-lg sm:text-xl font-medium max-w-2xl mx-auto"
          >
            Un proyecto <span className="text-white font-bold">Phygital</span> y <span className="text-white font-bold">Transmedia</span> desarrollado por <span className="text-gold font-bold">Naomy Estefanía Alvarado Parrales</span>.
          </motion.p>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
          >
            Una fusión de la tradición de la masa madre y el café de especialidad con computación espacial e interfaces web modernas, nacido en Milagro, Ecuador.
          </motion.p>
          
          {/* Animated decorative orbs */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 60 }}
            className="relative flex items-center justify-center pt-8"
          >
            <div className="relative w-28 h-28 rounded-full border border-gold/30 flex items-center justify-center animate-spin [animation-duration:20s]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gold shadow-md" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-coffee shadow-md" />
            </div>
            
            <div className="absolute w-20 h-20 rounded-full border border-dashed border-white/10 flex items-center justify-center animate-spin [animation-duration:12s] [animation-direction:reverse]">
              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            <div className="absolute flex flex-col items-center animate-float">
              <img src={logoRose} alt="Rose Coffee Logo" className="h-16 w-auto" />
              <div className="w-6 h-1.5 bg-gold/30 rounded-full blur-[3px] mt-1 animate-pulse" />
            </div>
          </motion.div>
        </div>
        
        {/* Scroll down indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-60">
          <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">Deslizar para Explorar</span>
          <div className="w-1.5 h-6 rounded-full bg-white/10 relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 16, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-full h-2 rounded-full bg-gold"
            />
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 2: IDENTIDAD GRÁFICA ---------------- */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-8 py-20 bg-[#faf2e7] text-primary overflow-hidden">
        {/* Subtle dynamic backdrop glow */}
        <div className="absolute top-1/3 right-1/4 w-[30vw] h-[30vw] bg-coffee/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10">
          
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coffee/5 text-coffee text-[9px] font-bold uppercase tracking-widest">
              <Heart size={10} className="fill-coffee" />
              <span>Personalidad de Marca</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Identidad Gráfica y Visual
            </h2>
            <div className="h-1 w-20 bg-coffee/30 rounded-full mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
            
            {/* Logo description */}
            <motion.div 
              {...fadeInUp} 
              className="lg:col-span-7 space-y-6 bg-white/50 border border-stone-200/50 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <img src={logoRose} alt="Logo" className="h-12 w-auto animate-float" />
                <div>
                  <h3 className="font-black text-lg text-primary leading-tight">El Concepto del Isotipo</h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-gold">Café y Gatitos</span>
                </div>
              </div>
              
              <p className="text-stone-700 text-sm leading-relaxed">
                El imagotipo de <strong className="text-coffee">Rose Coffee</strong> representa la unión entre la alta panadería y el respeto por los animales. El protagonista es un gato sosteniendo una hogaza de pan, transmitiendo cercanía, calidez y un proceso 100% hecho a mano.
              </p>

              <div className="border-t border-stone-200/60 pt-4 space-y-3">
                <h4 className="font-extrabold text-xs text-primary uppercase tracking-widest">Puntos Clave del Diseño:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    Tipografía Sans-Serif Limpia
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    Trazos orgánicos y fluidos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    Contraste Premium
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    Modularidad adaptable
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Colors grid */}
            <motion.div 
              {...staggerContainer} 
              className="lg:col-span-5 grid grid-cols-2 gap-4"
            >
              {[
                { hex: '#021a54', name: 'Azul Institucional', text: 'text-[#faf2e7]', bg: 'bg-[#021a54]', desc: 'Profundidad, elegancia y seriedad técnica.' },
                { hex: '#faf2e7', name: 'Crema Base', text: 'text-[#021a54]', bg: 'bg-[#faf2e7] border border-stone-300', desc: 'Calidez, suavidad y fondo orgánico de masa.' },
                { hex: '#6b3a0e', name: 'Café Acento', text: 'text-[#faf2e7]', bg: 'bg-[#6b3a0e]', desc: 'El tono del grano horneado y la infusión.' },
                { hex: '#c8922a', name: 'Oro Detalle', text: 'text-[#021a54]', bg: 'bg-[#c8922a]', desc: 'Exclusividad y destellos de calidad.' }
              ].map((color, idx) => (
                <motion.div 
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white border border-stone-200/50 p-3 rounded-2xl shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className={`h-16 w-full rounded-xl ${color.bg} flex items-center justify-center`}>
                    <span className={`text-[10px] font-black tracking-wider uppercase ${color.text}`}>{color.hex}</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-primary leading-tight">{color.name}</h4>
                    <p className="text-[9px] text-stone-500 mt-1 leading-snug">{color.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>
      </section>

      {/* ---------------- SECTION 3: DISEÑO WEB Y CLIENTE ---------------- */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-8 py-20 bg-primary text-[#faf2e7] overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 w-[35vw] h-[35vw] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10">
          
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-gold text-[9px] font-bold uppercase tracking-widest border border-white/10">
              <Cpu size={10} className="text-gold" />
              <span>Cliente Final (B2C)</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Ecosistema Digital Público
            </h2>
            <div className="h-1 w-20 bg-gold/50 rounded-full mx-auto" />
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
          >
            {[
              { 
                icon: Home, 
                title: 'Inicio (Landing Page)', 
                desc: 'Una experiencia de aterrizaje inmersiva con animaciones de física de fluidos en Framer Motion, con granos de café, croissants y destellos flotando de forma ambientada.',
                route: '/' 
              },
              { 
                icon: ShoppingBag, 
                title: 'Tienda Online', 
                desc: 'Catálogo de especialidad dinámico con filtros de categoría rápidos, búsqueda instantánea por texto y un flujo premium de detalles del producto.',
                route: '/tienda' 
              },
              { 
                icon: BookOpen, 
                title: 'Nosotros / Historia', 
                desc: 'Sección corporativa transmedia que cuenta el origen de Rose Coffee, su amor hacia la masa fermentada y su visión hacia la computación espacial.',
                route: '/nosotros' 
              },
              { 
                icon: Mail, 
                title: 'Contacto Interactiva', 
                desc: 'Formularios elegantes con inputs flotantes y respuestas interactivas mediante toasters para asegurar una comunicación de cliente fluida.',
                route: '/contacto' 
              },
              { 
                icon: ShoppingCart, 
                title: 'Carrito de Compras', 
                desc: 'Carrito flotante persistente a nivel global con almacenamiento en LocalStorage, permitiendo agregar, restar y estimar costes de envío en tiempo real.',
                route: '/cart' 
              },
              { 
                icon: Layers, 
                title: 'Showroom 3D AR', 
                desc: 'Gallería completa con model-viewer y soporte WebXR para colocar tazas, panes y pasteles directamente en el entorno real del usuario.',
                route: '/ar' 
              }
            ].map((card, idx) => (
              <motion.div 
                key={idx}
                variants={cardVariantsDark}
                whileHover="hover"
                className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-3xl flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                    <card.icon size={20} />
                  </div>
                  <h3 className="font-extrabold text-base text-white">{card.title}</h3>
                  <p className="text-stone-300 text-xs leading-relaxed">{card.desc}</p>
                </div>
                
                <a 
                  href={card.route} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gold hover:text-white transition-colors cursor-pointer self-start"
                >
                  <span>Ver página</span>
                  <ExternalLink size={10} />
                </a>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ---------------- SECTION 4: PANEL ADMIN ---------------- */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-8 py-20 bg-[#faf2e7] text-primary overflow-hidden">
        {/* Subtle background art */}
        <div className="absolute top-1/4 left-1/3 w-[25vw] h-[25vw] bg-gold/5 rounded-full blur-[110px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10">
          
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coffee/5 text-coffee text-[9px] font-bold uppercase tracking-widest">
              <ShieldCheck size={10} />
              <span>Back-Office de Negocios</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-primary">
              Módulos y Herramientas del Panel Admin
            </h2>
            <div className="h-1 w-20 bg-coffee/30 rounded-full mx-auto" />
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
          >
            {[
              { 
                icon: Package, 
                title: '1. Gestión de Inventario', 
                desc: 'Permite registrar, actualizar y eliminar existencias. Clasifica ítems entre Insumos/Materias Primas (PostgreSQL) y Productos Físicos de la tienda con control estricto de unidades y alertas de stock bajo.',
                detail: 'CRUD de Existencias e Insumos'
              },
              { 
                icon: ClipboardList, 
                title: '2. Tablero de Pedidos (Kanban)', 
                desc: 'Consola para organizar las órdenes de compra. Flujo visual interactivo para arrastrar y cambiar estados de pedidos (Pendiente, Preparando, Enviado, Completado) con actualización inmediata en base de datos.',
                detail: 'Logística de Órdenes en Tiempo Real'
              },
              { 
                icon: Users, 
                title: '3. Clientes (Rose Club)', 
                desc: 'Módulo de CRM para ver los perfiles de los usuarios, historial completo de transacciones, puntos acumulados de fidelidad y control de membresía de beneficios.',
                detail: 'Administración de Clientes & Puntos'
              },
              { 
                icon: ChefHat, 
                title: '4. Producción Artesanal', 
                desc: 'Supervisión de lotes de horneado y control de masas de fermentación natural. Permite asegurar la consistencia y calidad de los panes de masa madre y pastelería.',
                detail: 'Control Técnico de Panificación'
              },
              { 
                icon: FileText, 
                title: '5. Editor de Contenido (Web)', 
                desc: 'Permite gestionar de forma visual y modular el contenido dinámico de la app pública. Edición de textos del home, banners promocionales y cards informativas sin tocar código.',
                detail: 'Constructor Modular por Bloques'
              },
              { 
                icon: Palette, 
                title: '6. Gestor de Logos SVG', 
                desc: 'Visualización catalogada de las 28 variaciones del logotipo de Rose Coffee. Incorpora un Editor SVG interactivo que permite modificar colores y degradados para descargas directas en tiempo real.',
                detail: 'Editor de Logotipos Predefinidos'
              },
              { 
                icon: Layers, 
                title: '7. Gestor AR 3D', 
                desc: 'Consola para subir archivos GLB, enlazar texturas y configurar la escala física, rotaciones iniciales y descripciones del Showroom de Realidad Aumentada.',
                detail: 'Administración de Modelos WebXR'
              },
              { 
                icon: LineChart, 
                title: '8. Analítica de Ventas', 
                desc: 'Muestra gráficos históricos de conversión, ingresos totales, balance de pedidos recibidos versus ventas reales y listado de insumos críticos con stock bajo mínimos.',
                detail: 'Métricas y KPIs Ejecutivos'
              },
              { 
                icon: Settings, 
                title: '9. Configuración del Sistema', 
                desc: 'Ajustes globales de la tienda, pasarelas de pago admitidas, costes base de envío a provincias y variables operativas del backend de Supabase.',
                detail: 'Parámetros del Sistema'
              }
            ].map((module, idx) => (
              <motion.div 
                key={idx}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-sm flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-coffee/5 border border-coffee/15 flex items-center justify-center text-coffee">
                    <module.icon size={20} />
                  </div>
                  <h3 className="font-extrabold text-base text-primary">{module.title}</h3>
                  <p className="text-stone-600 text-xs leading-relaxed">{module.desc}</p>
                </div>
                
                <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gold">{module.detail}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ---------------- SECTION 5: DIAGRAMA DE FLUJO Y COMUNICACIÓN (NUEVA) ---------------- */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-8 py-20 bg-primary text-[#faf2e7] overflow-hidden">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 right-1/4 w-[35vw] h-[35vw] bg-gold/5 rounded-full blur-[130px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10">
          
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-gold text-[9px] font-bold uppercase tracking-widest border border-white/10">
              <Code size={10} />
              <span>Flujo de Datos e Integraciones</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Arquitectura de Comunicaciones
            </h2>
            <div className="h-1 w-20 bg-gold/50 rounded-full mx-auto" />
            <p className="text-xs text-stone-350 max-w-xl mx-auto">
              Visualización interactiva de cómo fluye el código, los datos y la autenticación entre las distintas plataformas conectadas a Rose Coffee.
            </p>
          </motion.div>

          {/* Animated Communications Flow Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
            
            {/* Left Column: Interactive Cards for integrations */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-7 space-y-4"
            >
              {[
                {
                  title: 'Antigravity (IA de Desarrollo)',
                  desc: 'Orquestador inteligente. Escribe código modular, resuelve errores de compilación estricta y automatiza despliegues git.',
                  flow: 'Localhost ➔ GitHub Remote',
                  icon: Cpu,
                  border: 'border-cyan-500/30 bg-cyan-950/10'
                },
                {
                  title: 'GitHub (Versionamiento & CI/CD)',
                  desc: 'Repositorio remoto que hospeda el código fuente y automatiza la compilación del bundle Vite para publicarlo en GitHub Pages.',
                  flow: 'GitHub Actions ➔ GitHub Pages (Público)',
                  icon: GithubIcon,
                  border: 'border-slate-500/30 bg-slate-900/20'
                },
                {
                  title: 'Supabase (Base de Datos & Auth RLS)',
                  desc: 'Motor PostgreSQL relacional en la nube. Gestiona las tablas de inventario, pedidos y usuarios bajo directivas estrictas de Row Level Security.',
                  flow: 'PostgreSQL Rest API ➔ Frontend Cliente',
                  icon: Database,
                  border: 'border-emerald-500/30 bg-emerald-950/10'
                },
                {
                  title: 'Cloudinary (Optimización de Imagenes)',
                  desc: 'Servidor multimedia que recorta, escala y optimiza imágenes pesadas del catálogo de panes y pastelería en milisegundos mediante CDN.',
                  flow: 'Cloudinary CDN ➔ Client Browser',
                  icon: Globe,
                  border: 'border-amber-500/30 bg-amber-950/10'
                },
                {
                  title: 'Google OAuth API (SSO Autenticación)',
                  desc: 'Servicio federado de Google que valida la firma digital de Naomy para autorizar su ingreso seguro al panel administrador.',
                  flow: 'OAuth Credentials ➔ useAuthStore Zustand',
                  icon: Lock,
                  border: 'border-purple-500/30 bg-purple-950/10'
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  variants={cardVariantsDark}
                  whileHover="hover"
                  className={`p-4 rounded-2xl border backdrop-blur-md flex gap-4 items-start ${item.border}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gold shrink-0 mt-0.5">
                    <item.icon size={16} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-white">{item.title}</h4>
                    <p className="text-stone-300 text-xs leading-relaxed">{item.desc}</p>
                    <div className="flex items-center gap-1.5 pt-1 text-[9px] font-black uppercase text-gold">
                      <span>Flujo:</span>
                      <span className="text-white">{item.flow}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Right Column: Visual Flow Diagram Animation */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-5 bg-slate-950/50 border border-white/10 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl backdrop-blur-md"
            >
              {/* Pulsing glow background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-gold text-center">Simulador de Transacciones</h4>
                
                {/* Visual grid connecting nodes with animation */}
                <div className="relative h-80 rounded-2xl border border-white/5 bg-slate-950/80 p-4 flex flex-col justify-between items-center z-10">
                  
                  {/* Top Node: Antigravity */}
                  <div className="flex flex-col items-center">
                    <div className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                      <Cpu size={10} />
                      <span>Antigravity AI</span>
                    </div>
                  </div>

                  {/* Mid Row: GitHub and Google Auth */}
                  <div className="w-full flex justify-between px-2">
                    <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Lock size={10} />
                      <span>Google OAuth</span>
                    </div>

                    <div className="px-3 py-1 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-350 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <GithubIcon size={10} />
                      <span>GitHub</span>
                    </div>
                  </div>

                  {/* Center Node: Client Browser (Vite Page) */}
                  <div className="relative flex flex-col items-center">
                    {/* Pulsing indicator */}
                    <div className="absolute -inset-1 rounded-xl bg-gold/25 blur-[4px] animate-pulse" />
                    <div className="relative px-4 py-1.5 rounded-xl bg-slate-900 border-2 border-gold text-gold text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-0.5">
                      <span>Navegador Web</span>
                      <span className="text-[8px] text-stone-400 lowercase font-medium">rose-coffee/admin</span>
                    </div>
                  </div>

                  {/* Mid Row 2: Supabase and Cloudinary */}
                  <div className="w-full flex justify-between px-2">
                    <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Database size={10} />
                      <span>Supabase</span>
                    </div>

                    <div className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Globe size={10} />
                      <span>Cloudinary</span>
                    </div>
                  </div>

                  {/* Connecting Flow Particles */}
                  {/* Particle Antigravity to GitHub */}
                  <motion.div 
                    animate={{ y: [0, 45], x: [0, 90], opacity: [0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                    className="absolute top-8 left-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-md"
                  />

                  {/* Particle GitHub to Browser */}
                  <motion.div 
                    animate={{ y: [50, 125], x: [100, 0], opacity: [0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear', delay: 1 }}
                    className="absolute top-8 right-8 w-1.5 h-1.5 rounded-full bg-white shadow-md"
                  />

                  {/* Particle Browser to Supabase */}
                  <motion.div 
                    animate={{ y: [130, 220], x: [0, -90], opacity: [0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-gold shadow-md"
                  />

                  {/* Particle Cloudinary to Browser */}
                  <motion.div 
                    animate={{ y: [220, 140], x: [90, 0], opacity: [0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear', delay: 0.5 }}
                    className="absolute top-1/2 right-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-md"
                  />

                  {/* Particle Google OAuth to Browser */}
                  <motion.div 
                    animate={{ y: [50, 125], x: [-100, 0], opacity: [0, 1, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear', delay: 1.5 }}
                    className="absolute top-8 left-8 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-md"
                  />

                </div>
              </div>

              <div className="border-t border-white/5 pt-4 text-center mt-4">
                <p className="text-[10px] text-stone-400">
                  La comunicación segura por HTTPS y políticas CORS previene fugas de información y accesos no autorizados.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ---------------- SECTION 6: SHOWROOM AR 3D ---------------- */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-8 py-20 bg-primary text-[#faf2e7] overflow-hidden">
        {/* Glowing orbs */}
        <div className="absolute top-1/4 right-1/4 w-[35vw] h-[35vw] bg-coffee/20 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10">
          
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-gold text-[9px] font-bold uppercase tracking-widest border border-white/10">
              <Layers size={10} />
              <span>Computación Espacial</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white animate-float">
              Realidad Aumentada sin Fricción
            </h2>
            <div className="h-1 w-20 bg-gold/50 rounded-full mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
            
            {/* Technical explanations of model-viewer */}
            <motion.div {...fadeInUp} className="lg:col-span-6 space-y-6">
              <h3 className="text-xl font-bold text-white">Visualización 3D Realista en el Navegador</h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Mediante el estándar de <strong className="text-gold">WebXR Device API</strong> y el componente de Google <strong className="text-white">&lt;model-viewer&gt;</strong>, permitimos a los clientes ver los productos de panadería y café proyectados en escala real sobre su mesa de comedor o encimera de cocina.
              </p>

              <div className="space-y-4">
                {[
                  { title: 'Escala Métrica Fija', desc: 'Configurando `ar-scale="fixed"` aseguramos que un croissant de 12cm se muestre con sus proporciones exactas en el espacio físico del usuario.' },
                  { title: 'Hit-Testing de Superficie', desc: 'Detección automática de superficies planas (`ar-placement="floor"`) permitiendo un anclaje realista en mesas y encimeras.' },
                  { title: 'Texturas de Video Dinámicas', desc: 'Soporte para inyección de videos con transparencia (canal alfa WebM) sobre geometrías 3D para añadir efectos especiales o animaciones.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-gold text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white leading-tight">{item.title}</h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Model-viewer mock-up visual stack */}
            <motion.div 
              {...fadeInUp} 
              className="lg:col-span-6 bg-slate-950/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative"
            >
              {/* Overlay HUD indicators to look like AR view */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                <span className="text-[8px] font-black uppercase tracking-widest text-green-400">WebXR Activo</span>
              </div>
              <div className="absolute top-4 right-4 text-[9px] font-bold text-stone-400">
                Escala: 1.0x (12cm)
              </div>

              {/* Central wireframe box placeholder representing 3D geometry */}
              <div className="h-64 border-2 border-dashed border-gold/30 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden bg-slate-950/60 mt-4">
                {/* 3D mesh lines representation */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,146,42,0.1),transparent)]" />
                <div className="absolute w-36 h-36 border border-gold/20 rounded-full animate-spin [animation-duration:15s]" />
                <div className="absolute w-44 h-24 border border-dashed border-gold/15 rounded-full rotate-45 animate-spin [animation-duration:10s]" />
                
                <Coffee size={40} className="text-gold animate-float relative z-10" />
                <span className="text-[10px] font-extrabold text-stone-300 mt-4 tracking-widest uppercase relative z-10">Malla 3D: Taza Café</span>
                
                {/* Scanning reticle */}
                <div className="absolute w-full h-0.5 bg-gold/50 shadow-lg shadow-gold/50 top-1/2 left-0 -translate-y-1/2 animate-pulse" />
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 text-center">
                <p className="text-[10px] text-stone-400">
                  Totalmente multiplataforma. Sin descargas, compatible con Android (QuickLook/ARCore) e iOS (Safari/ARKit).
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ---------------- SECTION 7: ARQUITECTURA TÉCNICA (BENTO BOX) ---------------- */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-8 py-20 bg-[#faf2e7] text-primary overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/3 right-1/4 w-[30vw] h-[30vw] bg-coffee/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10">
          
          <motion.div {...fadeInUp} className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coffee/5 text-coffee text-[9px] font-bold uppercase tracking-widest">
              <Database size={10} />
              <span>Infraestructura e Ingeniería</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-primary">
              Stack Tecnológico & Arquitectura
            </h2>
            <div className="h-1 w-20 bg-coffee/30 rounded-full mx-auto" />
          </motion.div>

          {/* Bento Box Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
            
            {/* Bento Block 1: Frontend (Large, spans 2 cols, 2 rows) */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="md:col-span-2 md:row-span-2 bg-white border border-stone-200/60 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[9px] font-bold uppercase tracking-wider">
                  Interfaz de Cliente
                </div>
                <h3 className="text-2xl font-black text-primary leading-tight">Front-End Moderno</h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  Construido con <strong className="text-primary">React 19</strong> y empaquetado con la velocidad extrema de <strong className="text-primary">Vite</strong>. La interfaz visual utiliza <strong className="text-primary">Tailwind CSS v4</strong> con un enfoque CSS-first de tokens nativos, complementado con las animaciones premium y dinámicas de <strong className="text-primary">Framer Motion</strong>.
                </p>
                <p className="text-stone-600 text-xs leading-relaxed">
                  La gestión de estado se centraliza utilizando <strong className="text-primary">Zustand</strong>, permitiendo modularidad extrema en el flujo del e-commerce y el carrito de compras sin sobrecargas de rendimiento.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {['React 19', 'Vite', 'Tailwind 4', 'Framer Motion', 'Zustand'].map((tech) => (
                  <span key={tech} className="bg-stone-100 text-stone-700 text-[10px] font-bold px-3 py-1 rounded-lg border border-stone-200">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Bento Block 2: Backend (Spans 1 col) */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                  Base de Datos & Auth
                </div>
                <h3 className="text-lg font-bold text-primary leading-tight">Backend Serverless</h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  Potenciado por <strong className="text-primary">Supabase</strong> bajo PostgreSQL. Cuenta con login federado (Google OAuth) y políticas de seguridad estrictas a nivel de filas (<strong className="text-primary">RLS</strong>).
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['PostgreSQL', 'OAuth', 'RLS', 'Supabase'].map((tech) => (
                  <span key={tech} className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Bento Block 3: Storage (Spans 1 col) */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                  Assets & Modelos
                </div>
                <h3 className="text-lg font-bold text-primary leading-tight">Almacenamiento</h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  Optimización de imágenes con <strong className="text-primary">Cloudinary</strong> y resguardo de modelos 3D (`.glb`) en Supabase Storage o repositorios GitHub para CDN.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Cloudinary', 'CDN', 'GLB Files'].map((tech) => (
                  <span key={tech} className="bg-amber-50 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-md border border-amber-100">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Bento Block 4: Computación Espacial / AR (Large, spans 2 cols) */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="md:col-span-2 bg-white border border-stone-200/60 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[9px] font-bold uppercase tracking-wider">
                  Tecnologías Inmersivas
                </div>
                <h3 className="text-xl font-bold text-primary leading-tight">Computación Espacial Web</h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  Rose Coffee implementa el estándar del consorcio W3C para **WebXR**. Además de la colocación de modelos 3D, incluye integración experimental con **MindAR** para el escaneo de imágenes físicas de menús y detonación de modelos 3D directamente sobre impresos del local.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['WebXR API', 'ARCore', 'ARKit', 'MindAR', 'model-viewer'].map((tech) => (
                  <span key={tech} className="bg-purple-50 text-purple-800 text-[9px] font-bold px-2.5 py-0.5 rounded-md border border-purple-100">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

          </div>

        </div>
      </section>

    </div>
  );
}
