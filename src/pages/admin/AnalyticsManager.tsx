import { useState } from 'react';
import { BarChart2, TrendingUp, RefreshCw, ShoppingCart, Users, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminHeader from '../../components/admin/AdminHeader';

const MOCK_ANALYTICS_DATA = [
  { name: 'Lun', Carritos: 12, Compras: 8 },
  { name: 'Mar', Carritos: 19, Compras: 11 },
  { name: 'Mie', Carritos: 15, Compras: 9 },
  { name: 'Jue', Carritos: 22, Compras: 14 },
  { name: 'Vie', Carritos: 30, Compras: 21 },
  { name: 'Sab', Carritos: 45, Compras: 32 },
  { name: 'Dom', Carritos: 28, Compras: 18 }
];

export default function AnalyticsManager() {
  const [data] = useState(MOCK_ANALYTICS_DATA);

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader 
        title="Analítica General" 
        description="Evalúa las tasas de conversión, carritos abandonados e interacción de clientes recurrentes."
        action={
          <button className="flex items-center gap-1.5 px-4 py-2 bg-cream text-stone-700 border border-coffee/10 hover:border-coffee/20 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer">
            <RefreshCw size={14} />
            Recargar Métricas
          </button>
        }
      />

      {/* Analytics stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-coffee/10 rounded-2xl p-5 shadow-2xs">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Tasa de Conversión</span>
              <h4 className="text-2xl font-extrabold text-stone-900 tracking-tight">4.2%</h4>
              <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight size={10} /> +0.8% vs. semana pasada
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center border border-indigo-100">
              <TrendingUp size={16} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-coffee/10 rounded-2xl p-5 shadow-2xs">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Carritos Abandonados</span>
              <h4 className="text-2xl font-extrabold text-stone-900 tracking-tight">35.4%</h4>
              <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight size={10} /> -2.1% reducción de abandono
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <ShoppingCart size={16} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-coffee/10 rounded-2xl p-5 shadow-2xs">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Clientes Recurrentes</span>
              <h4 className="text-2xl font-extrabold text-stone-900 tracking-tight">62.8%</h4>
              <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight size={10} /> +1.5% tasa de retorno
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Users size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Chart */}
      <div className="bg-white border border-coffee/10 rounded-3xl p-6 shadow-2xs">
        <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5 mb-6">
          <BarChart2 size={16} className="text-gold" />
          Conversión: Carritos Creados vs. Compras Pagadas
        </h3>
        
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5ebe0/40" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#78716c', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#78716c', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#1c1917', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                itemStyle={{ color: '#f5ebe0' }}
              />
              <Bar dataKey="Carritos" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Compras" fill="#6b3a0e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
