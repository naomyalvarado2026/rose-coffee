import { useState } from 'react';
import { Settings, Save, Shield, Phone, Clock, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';

export default function SettingsManager() {
  const [phone, setPhone] = useState('+593980372113');
  const [hours, setHours] = useState('Lunes a Sábado: 08:00 AM - 08:00 PM');
  const [whatsappOrders, setWhatsappOrders] = useState(true);

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

          <div className="space-y-4">
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
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-850 bg-stone-50/40 focus:bg-white focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="business_hours" className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Horario de Atención
              </label>
              <div className="relative">
                <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="business_hours"
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-xs font-medium text-stone-850 bg-stone-50/40 focus:bg-white focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-150 rounded-2xl">
              <div className="space-y-0.5 text-left">
                <span className="text-xs font-bold text-stone-800 block">Pedidos directos por WhatsApp</span>
                <span className="text-[10px] text-stone-400 font-medium">Habilita el envío rápido de carritos a la línea telefónica.</span>
              </div>
              <button 
                onClick={() => setWhatsappOrders(!whatsappOrders)}
                className={`w-11 h-6 rounded-full relative transition-colors duration-250 cursor-pointer ${whatsappOrders ? 'bg-emerald-505 bg-coffee' : 'bg-stone-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-250 ${whatsappOrders ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <button className="flex items-center justify-center gap-1.5 w-full py-3 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border border-transparent">
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
              className="flex items-center justify-center gap-1 w-full py-2.5 bg-primary hover:bg-blue-905 text-white rounded-xl text-xs font-bold shadow-3xs hover:shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
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
              <div className="flex justify-between items-center text-xs font-bold text-stone-800">
                <span>Transferencia Bancaria</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ACTIVO</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-stone-850">
                <span>Pago con Tarjeta (Stripe)</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ACTIVO</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
