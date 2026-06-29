import { useState, useEffect } from 'react';
import { Settings, Save, Shield, Phone, CreditCard, Loader2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'sonner';
import { supabase } from '../../config/supabase';

export default function SettingsManager() {
  const [phone, setPhone] = useState('+593980372113');
  const [address, setAddress] = useState('E25 y Av. 17 de Septiembre, Milagro, Ecuador.');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com');
  const [tiktokUrl, setTiktokUrl] = useState('https://tiktok.com');
  const [whatsappOrders, setWhatsappOrders] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Day to day schedule state
  const [dailyHours, setDailyHours] = useState<Record<string, { open: boolean; start: string; end: string }>>({
    Lunes: { open: true, start: '08:00', end: '20:00' },
    Martes: { open: true, start: '08:00', end: '20:00' },
    Miércoles: { open: true, start: '08:00', end: '20:00' },
    Jueves: { open: true, start: '08:00', end: '20:00' },
    Viernes: { open: true, start: '08:00', end: '20:00' },
    Sábado: { open: true, start: '08:00', end: '20:00' },
    Domingo: { open: false, start: '09:00', end: '18:00' }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoadingSettings(true);
      try {
        // Fast local recovery on first render
        const cachedPhone = localStorage.getItem('rose_coffee_business_phone');
        if (cachedPhone) setPhone(cachedPhone);

        const cachedAddress = localStorage.getItem('rose_coffee_business_address');
        if (cachedAddress) setAddress(cachedAddress);

        const cachedInstagram = localStorage.getItem('rose_coffee_instagram_url');
        if (cachedInstagram) setInstagramUrl(cachedInstagram);

        const cachedTiktok = localStorage.getItem('rose_coffee_tiktok_url');
        if (cachedTiktok) setTiktokUrl(cachedTiktok);

        const cachedWhatsapp = localStorage.getItem('rose_coffee_whatsapp_orders');
        if (cachedWhatsapp) setWhatsappOrders(cachedWhatsapp === 'true');

        const cachedHours = localStorage.getItem('rose_coffee_business_hours');
        if (cachedHours) {
          try {
            const parsed = JSON.parse(cachedHours);
            if (parsed && typeof parsed === 'object' && parsed.Lunes) {
              setDailyHours(parsed);
            }
          } catch (e) {
            console.warn('Could not parse daily hours cache:', e);
          }
        }

        // Deep Supabase synchronization
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
          if (cfg.address) {
            setAddress(cfg.address);
            localStorage.setItem('rose_coffee_business_address', cfg.address);
          }
          if (cfg.instagram_url) {
            setInstagramUrl(cfg.instagram_url);
            localStorage.setItem('rose_coffee_instagram_url', cfg.instagram_url);
          }
          if (cfg.tiktok_url) {
            setTiktokUrl(cfg.tiktok_url);
            localStorage.setItem('rose_coffee_tiktok_url', cfg.tiktok_url);
          }
          if (cfg.whatsapp_orders !== undefined) {
            setWhatsappOrders(cfg.whatsapp_orders);
            localStorage.setItem('rose_coffee_whatsapp_orders', String(cfg.whatsapp_orders));
          }
          if (cfg.daily_hours) {
            setDailyHours(cfg.daily_hours);
            localStorage.setItem('rose_coffee_business_hours', JSON.stringify(cfg.daily_hours));
          }
        }
      } catch (err) {
        console.error('Error fetching settings from database:', err);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('rose_coffee_business_phone', phone);
      localStorage.setItem('rose_coffee_business_address', address);
      localStorage.setItem('rose_coffee_instagram_url', instagramUrl);
      localStorage.setItem('rose_coffee_tiktok_url', tiktokUrl);
      localStorage.setItem('rose_coffee_whatsapp_orders', String(whatsappOrders));
      localStorage.setItem('rose_coffee_business_hours', JSON.stringify(dailyHours));
      
      // Produce a human-readable text fallback for other UI views
      const formatted = Object.entries(dailyHours)
        .map(([day, val]) => `${day}: ${val.open ? `${val.start} - ${val.end}` : 'Cerrado'}`)
        .join(', ');
      localStorage.setItem('rose_coffee_business_hours_text', formatted);

      // Save to Supabase page_contents
      const { error } = await supabase
        .from('page_contents')
        .upsert({
          id: 'business_settings',
          page: 'settings',
          section: 'general',
          title: 'Configuración General',
          subtitle: 'Parámetros y Redes',
          content_blocks: [{
            phone,
            address,
            instagram_url: instagramUrl,
            tiktok_url: tiktokUrl,
            whatsapp_orders: whatsappOrders,
            daily_hours: dailyHours
          }],
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Configuración guardada exitosamente.');
    } catch (err: any) {
      console.error(err);
      toast.error('Error al guardar la configuración: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setDailyHours(prev => ({
      ...prev,
      [day]: { ...prev[day], open: !prev[day].open }
    }));
  };

  const handleTimeChange = (day: string, type: 'start' | 'end', value: string) => {
    setDailyHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [type]: value }
    }));
  };

  if (loadingSettings) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="animate-spin text-coffee dark:text-gold" size={30} />
        <span className="text-[10px] font-bold text-stone-550 uppercase tracking-widest">Cargando configuración operativa...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader 
        title="Configuración de Tienda" 
        description="Ajusta los parámetros operativos de Rose Coffee, redes sociales, métodos de pago y cuentas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Col - Business Profile Form */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-800 border border-coffee/10 rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
          <div className="space-y-1 border-b border-stone-100 dark:border-stone-700 pb-3">
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-200 flex items-center gap-1.5">
              <Settings size={16} className="text-gold" />
              Parámetros Operativos
            </h3>
            <p className="text-[10px] text-stone-400 font-medium">Ajustes básicos del establecimiento físico, redes sociales y pedidos rápidos.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="business_phone" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Teléfono de WhatsApp de Pedidos
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="business_phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono font-bold text-stone-850 bg-stone-50/40 focus:bg-white dark:bg-stone-800 focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="business_address" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Dirección Física de la Cafetería
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="business_address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-850 bg-stone-50/40 focus:bg-white dark:bg-stone-800 focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200"
                  placeholder="Ej. E25 y Av. 17 de Septiembre, Milagro, Ecuador."
                />
              </div>
            </div>

            {/* Social Media Links Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="instagram_url" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                  Instagram URL
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                  <input
                    id="instagram_url"
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 bg-stone-50/40 focus:bg-white dark:bg-stone-800 focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tiktok_url" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                  TikTok URL
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.43-.4-.61-.62-.05 1.91-.02 3.83-.04 5.74-.03 1.94-.38 3.93-1.47 5.54-1.39 2.05-3.87 3.23-6.32 3.07-2.8-.18-5.41-2.12-6.08-4.88-.8-3.32 1.05-6.99 4.31-7.79 1.15-.28 2.38-.21 3.5.17v4.14c-.95-.34-2.03-.35-2.93.13-.97.52-1.57 1.6-1.54 2.7.02 1.39 1.18 2.58 2.57 2.54 1.34-.04 2.44-1.14 2.45-2.48.02-4.13.01-8.26.02-12.39z" />
                    </svg>
                  </div>
                  <input
                    id="tiktok_url"
                    type="url"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 bg-stone-50/40 focus:bg-white dark:bg-stone-800 focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Custom Day-to-Day Schedule Grid */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                Horario de Atención Detallado
              </label>
              <div className="bg-stone-50/50 border border-stone-150 dark:border-stone-700 rounded-2xl p-4 space-y-3">
                {Object.keys(dailyHours).map((day) => {
                  const sched = dailyHours[day];
                  return (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-stone-100 dark:border-stone-700 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${
                            sched.open ? 'bg-coffee' : 'bg-stone-300'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all duration-200 ${
                            sched.open ? 'left-4.75' : 'left-0.75'
                          }`} />
                        </button>
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 w-24">{day}</span>
                      </div>

                      {sched.open ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={sched.start}
                            onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                            className="px-2 py-1.5 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono font-bold text-stone-850 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                          />
                          <span className="text-[10px] font-bold text-stone-400 uppercase">a</span>
                          <input
                            type="time"
                            value={sched.end}
                            onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                            className="px-2 py-1.5 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-mono font-bold text-stone-850 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                          />
                        </div>
                      ) : (
                        <span className="text-[9px] font-extrabold text-stone-400 bg-stone-200/50 px-2 py-1 rounded-md uppercase tracking-wider">
                          Cerrado
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-150 dark:border-stone-700 rounded-2xl">
              <div className="space-y-0.5 text-left">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">Pedidos directos por WhatsApp</span>
                <span className="text-[10px] text-stone-400 font-medium">Habilita el envío rápido de carritos a la línea telefónica.</span>
              </div>
              <button 
                onClick={() => setWhatsappOrders(!whatsappOrders)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${whatsappOrders ? 'bg-coffee' : 'bg-stone-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${whatsappOrders ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 w-full py-3 bg-coffee hover:bg-coffee-dark disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border border-transparent"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>

        {/* Right Col - Security and user mappings */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-800 border border-coffee/10 rounded-3xl p-6 shadow-2xs space-y-4 text-left">
            <div className="flex items-center gap-1.5 text-stone-900 dark:text-stone-200 font-extrabold text-sm border-b border-stone-50 pb-2">
              <Shield size={16} className="text-gold" />
              Seguridad y Roles
            </div>
            <p className="text-stone-500 text-xs leading-relaxed font-medium">
              Evoluciona y asigna permisos específicos por rol para tus empleados (Gerente, Ventas, Cocina y Contenido).
            </p>
            <Link
              to="/admin/usuarios"
              className="flex items-center justify-center gap-1 w-full py-2.5 bg-coffee hover:bg-coffee-dark text-white border border-transparent rounded-xl text-xs font-bold shadow-3xs hover:shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
            >
              Gestionar Permisos & Usuarios
            </Link>
          </div>

          <div className="bg-white dark:bg-stone-800 border border-coffee/10 rounded-3xl p-6 shadow-2xs space-y-4 text-left">
            <div className="flex items-center gap-1.5 text-stone-900 dark:text-stone-200 font-extrabold text-sm border-b border-stone-50 pb-2">
              <CreditCard size={16} className="text-gold" />
              Métodos de Pago Activos
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-stone-850">
                <span>Transferencia Bancaria</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 animate-fadeIn">ACTIVO</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-stone-850">
                <span>Pago con Tarjeta (Stripe)</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 animate-fadeIn">ACTIVO</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
