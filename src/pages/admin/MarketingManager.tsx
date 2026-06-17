import { useState } from 'react';
import { Tag, Sparkles, Plus, Calendar } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';

const MOCK_COUPONS = [
  { id: 1, code: 'BIENVENIDAROSE', discount: '15%', type: 'Porcentaje', active: true, usage: '24 / Ilimitado', expires: '2026-12-31' },
  { id: 2, code: 'COFFEELOVER', discount: '$5.00', type: 'Fijo', active: true, usage: '89 / 200', expires: '2026-08-15' },
  { id: 3, code: 'MASAMADREPET', discount: '10%', type: 'Porcentaje', active: false, usage: '50 / 50', expires: '2026-05-01' }
];

export default function MarketingManager() {
  const [coupons] = useState(MOCK_COUPONS);
  const [pointRatio, setPointRatio] = useState(10); // $10 = 10 points

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader 
        title="Marketing & Rose Club" 
        description="Gestiona promociones de venta, cupones de descuento y el programa de lealtad de pétalos."
        action={
          <button className="flex items-center gap-1.5 px-4 py-2 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-transparent">
            <Plus size={14} />
            Crear Cupón
          </button>
        }
      />

      {/* Grid: Loyalty configurations & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Loyalty Program config card */}
        <div className="bg-white border border-coffee/10 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm border-b border-stone-50 pb-2">
            <Sparkles size={16} className="text-gold" />
            Configuración del Rose Club
          </div>
          <p className="text-stone-500 text-xs leading-relaxed font-medium">
            Define la regla de conversión para otorgar pétalos (puntos) a tus clientes al realizar compras.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Valor por Punto ($ USD)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-700">$10.00 USD</span>
                <span className="text-stone-400 font-medium text-xs">=</span>
                <input 
                  type="number" 
                  value={pointRatio} 
                  onChange={(e) => setPointRatio(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800 bg-stone-50/50 focus:bg-white focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none"
                />
                <span className="text-xs font-bold text-gold">Pétalos</span>
              </div>
            </div>

            <button className="w-full mt-4 py-2 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold shadow-3xs active:scale-[0.98] transition-all cursor-pointer border border-transparent">
              Guardar Regla de Club
            </button>
          </div>
        </div>

        {/* Coupon status overview */}
        <div className="lg:col-span-2 bg-white border border-coffee/10 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                <Tag size={16} className="text-gold" />
                Cupones de Descuento
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Código</th>
                    <th className="pb-3 font-semibold">Descuento</th>
                    <th className="pb-3 font-semibold">Tipo</th>
                    <th className="pb-3 font-semibold">Usos</th>
                    <th className="pb-3 font-semibold">Expiración</th>
                    <th className="pb-3 font-semibold text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-stone-850">{coupon.code}</td>
                      <td className="py-3.5 text-stone-800 font-bold">{coupon.discount}</td>
                      <td className="py-3.5 text-stone-500 font-medium">{coupon.type}</td>
                      <td className="py-3.5 text-stone-400 font-mono font-medium">{coupon.usage}</td>
                      <td className="py-3.5 text-stone-400 font-medium flex items-center gap-1">
                        <Calendar size={12} />
                        {coupon.expires}
                      </td>
                      <td className="py-3.5 text-right">
                        {coupon.active ? (
                          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold uppercase tracking-wider">Activo</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-400 rounded text-[9px] font-bold uppercase tracking-wider">Inactivo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
