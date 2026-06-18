import { useState, useEffect } from 'react';
import { Settings, Save, Shield, Phone, Clock, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'sonner';

export default function SettingsManager() {
  const [phone, setPhone] = useState('+593980372113');
  const [whatsappOrders, setWhatsappOrders] = useState(true);
  
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
    const cachedPhone = localStorage.getItem('rose_coffee_business_phone');
    if (cachedPhone) setPhone(cachedPhone);

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
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('rose_coffee_business_phone', phone);
      localStorage.setItem('rose_coffee_whatsapp_orders', String(whatsappOrders));
      localStorage.setItem('rose_coffee_business_hours', JSON.stringify(dailyHours));
      
      // Produce a human-readable text fallback for other UI views
      const formatted = Object.entries(dailyHours)
        .map(([day, val]) => `${day}: ${val.open ? `${val.start} - ${val.end}` : 'Cerrado'}`)
        .join(', ');
      localStorage.setItem('rose_coffee_business_hours_text', formatted);

      toast.success('Configuración guardada exitosamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar la configuración.');
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

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader 
        title="Configuración de Tienda" 
        description="Ajusta los parámetros operativos de Rose Coffee, métodos de pago y cuentas administrativas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Col - Business Profile Form */}
        <div className="lg:col-span-2 bg-white border border-coffee/10 rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
          <div className="space-y-1 border-b border-stone-100 pb-3">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
              <Settings size={16} className="text-gold" />
              Parámetros Operativos
            </h3>
            <p className="text-[10px] text-stone-400 font-medium">Ajustes básicos del establecimiento físico y pedidos rápidos.</p>
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
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-855 bg-stone-50/40 focus:bg-white focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Custom Day-to-Day Schedule Grid */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                Horario de Atención Detallado
              </label>
              <div className="bg-stone-50/50 border border-stone-150 rounded-2xl p-4 space-y-3">
                {Object.keys(dailyHours).map((day) => {
                  const sched = dailyHours[day];
                  return (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-stone-100 last:border-b-0 last:pb-0">
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
                        <span className="text-xs font-bold text-stone-800 w-24">{day}</span>
                      </div>

                      {sched.open ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={sched.start}
                            onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                            className="px-2 py-1.5 border border-stone-200 rounded-lg text-xs font-mono font-bold text-stone-850 bg-white focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                          />
                          <span className="text-[10px] font-bold text-stone-400 uppercase">a</span>
                          <input
                            type="time"
                            value={sched.end}
                            onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                            className="px-2 py-1.5 border border-stone-200 rounded-lg text-xs font-mono font-bold text-stone-850 bg-white focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
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

            <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-150 rounded-2xl">
              <div className="space-y-0.5 text-left">
                <span className="text-xs font-bold text-stone-800 block">Pedidos directos por WhatsApp</span>
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
              className="flex items-center justify-center gap-1.5 w-full py-3 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border border-transparent"
            >
              <Save size={14} />
              Guardar Configuración
            </button>
          </div>
        </div>

        {/* Right Col - Security and user mappings */}
        <div className="space-y-6">
          <div className="bg-white border border-coffee/10 rounded-3xl p-6 shadow-2xs space-y-4 text-left">
            <div className="flex items-center gap-1.5 text-stone-900 font-extrabold text-sm border-b border-stone-50 pb-2">
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

          <div className="bg-white border border-coffee/10 rounded-3xl p-6 shadow-2xs space-y-4 text-left">
            <div className="flex items-center gap-1.5 text-stone-900 font-extrabold text-sm border-b border-stone-50 pb-2">
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
