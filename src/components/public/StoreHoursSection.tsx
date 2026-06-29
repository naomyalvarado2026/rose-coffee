import { motion } from 'framer-motion';
import { Clock, Coffee } from 'lucide-react';
import { SlideUp, StaggerContainer, StaggerItem } from '../animations/MotionWrappers';

interface StoreHoursSectionProps {
  businessSettings?: any;
}

const StoreHoursSection = ({ businessSettings }: StoreHoursSectionProps) => {
  const currentDayIndex = new Date().getDay();
  // Map JS getDay() to our keys (0 = Sunday, 1 = Monday, ...)
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const todayName = dayNames[currentDayIndex];

  // Default fallback if not found in db
  const defaultHours: Record<string, { open: boolean; start: string; end: string }> = {
    Lunes: { open: true, start: '08:00', end: '20:00' },
    Martes: { open: true, start: '08:00', end: '20:00' },
    Miércoles: { open: true, start: '08:00', end: '20:00' },
    Jueves: { open: true, start: '08:00', end: '20:00' },
    Viernes: { open: true, start: '08:00', end: '20:00' },
    Sábado: { open: true, start: '08:00', end: '20:00' },
    Domingo: { open: false, start: '09:00', end: '18:00' }
  };

  const hours = businessSettings?.daily_hours || defaultHours;
  
  // Format the time slightly better if needed, e.g., 08:00 -> 8:00 AM
  const formatTime = (time24: string) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hours = parseInt(h, 10);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${m} ${suffix}`;
  };

  const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <section id="location" className="max-w-7xl mx-auto px-6 py-12 relative">
      <SlideUp className="text-center max-w-2xl mx-auto space-y-3 mb-10">
        <span className="inline-block text-[10px] font-bold text-coffee dark:text-gold uppercase tracking-widest border border-coffee/25 bg-coffee/5 px-4 py-1.5 rounded-full">
          Nuestra Casa
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-gold">
          Te Esperamos en Rose Coffee
        </h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
          Ven a disfrutar del aroma a café recién tostado y el sonido crujiente del pan artesanal.
        </p>
      </SlideUp>

      <div className="grid grid-cols-1 max-w-2xl mx-auto gap-8 lg:gap-12 items-center">
        {/* Left Side: Store Visuals & Address (Oculto a petición)
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[36px] overflow-hidden bg-primary p-8 md:p-12 text-white shadow-2xl min-h-[400px] flex flex-col justify-end border border-white/10 group"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80" 
              alt="Interior de cafetería" 
              className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#021a54] via-[#021a54]/80 to-transparent" />
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-gold/20 blur-[80px] rounded-full pointer-events-none" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="w-14 h-14 bg-white dark:bg-stone-800/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
              <MapPin size={24} className="text-gold animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold font-sans">Nuestra Ubicación</h3>
              <address className="not-italic text-sm text-white/80 font-medium leading-relaxed max-w-sm">
                {businessSettings?.address || (
                  <>
                    E25 y Av. 17 de Septiembre<br />
                    Milagro, Ecuador
                  </>
                )}
              </address>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a 
                href={`https://wa.me/${(businessSettings?.phone || '+593980372113').replace(/[^0-9]/g, '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-450 text-white rounded-xl text-xs font-bold transition-all duration-300 ease-in-out shadow-md hover:shadow-lg cursor-pointer"
              >
                Escribir a WhatsApp
                <ArrowRight size={14} />
              </a>
              <a 
                href="https://maps.google.com/?q=E25+y+Av.+17+de+Septiembre,+Milagro,+Ecuador"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-stone-800/10 hover:bg-white dark:bg-stone-800/20 backdrop-blur-md text-white border border-white/20 rounded-xl text-xs font-bold transition-all duration-300 ease-in-out cursor-pointer"
              >
                Ver en Mapa
              </a>
            </div>
          </div>
        </motion.div>
        */}

        {/* Right Side: Animated Hours List */}
        <div className="relative">
          {/* Decorative elements behind the card */}
          <div className="absolute -right-10 top-10 w-48 h-48 bg-coffee/5 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="bg-cream dark:bg-stone-800 border border-coffee/10 dark:border-stone-700 rounded-[36px] p-6 md:p-10 shadow-2xs relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-coffee/10 rounded-xl flex items-center justify-center text-coffee dark:text-gold">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-bold text-primary dark:text-gold">Horario de Atención</h3>
            </div>

            <StaggerContainer className="space-y-3">
              {dayOrder.map((day) => {
                const dayData = hours[day];
                if (!dayData) return null;
                
                const isToday = day === todayName;

                return (
                  <StaggerItem key={day}>
                    <motion.div 
                      whileHover={{ x: 6, backgroundColor: isToday ? 'var(--tw-colors-coffee-50)' : 'rgba(255,255,255,0.8)' }}
                      className={`flex justify-between items-center p-3.5 md:p-4 rounded-2xl transition-all duration-300 border ${
                        isToday 
                          ? 'bg-coffee/5 border-coffee/30 shadow-xs' 
                          : 'bg-white/50 border-transparent hover:border-coffee/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isToday && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        )}
                        <span className={`font-sans text-sm md:text-base ${isToday ? 'font-bold text-primary dark:text-gold' : 'font-semibold text-stone-600 dark:text-stone-300'}`}>
                          {day}
                          {isToday && <span className="ml-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Hoy</span>}
                        </span>
                      </div>
                      
                      <div className={`text-xs md:text-sm font-medium ${isToday ? 'text-coffee dark:text-gold font-bold' : 'text-stone-500 dark:text-stone-400'}`}>
                        {dayData.open ? (
                          <span>{formatTime(dayData.start)} - {formatTime(dayData.end)}</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-700 px-2.5 py-1 rounded-md text-stone-400 dark:text-stone-300">
                            Cerrado
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
            
            {/* Bottom mini-banner */}
            <div className="mt-8 p-4 bg-gold/10 border border-gold/20 rounded-2xl flex items-start gap-3">
              <Coffee size={18} className="text-gold shrink-0 mt-0.5" />
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                En días festivos nuestro horario puede variar. Te sugerimos revisar nuestras redes sociales para anuncios especiales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreHoursSection;
