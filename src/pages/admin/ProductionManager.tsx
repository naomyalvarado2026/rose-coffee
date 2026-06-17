import { useState } from 'react';
import { ChefHat, Wheat, Sparkles, RefreshCw, Flame, Clock } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';

const MOCK_BATCHES = [
  { id: 1, name: 'Lote Pan Sourdough Rústico #104', stage: 'fermentacion', timeElapsed: '18h / 24h', quantity: 24, flour: 'Integral + Fuerza' },
  { id: 2, name: 'Lote Baguettes Masa Madre #105', stage: 'amasado', timeElapsed: '15m', quantity: 15, flour: 'Fuerza Orgánica' },
  { id: 3, name: 'Lote Croissants Artesanales #106', stage: 'horneado', timeElapsed: '8m / 20m', quantity: 30, flour: 'Fuerza premium' },
  { id: 4, name: 'Lote Pan Sourdough Espelta #103', stage: 'listo', timeElapsed: 'Completo', quantity: 12, flour: 'Espelta Orgánica' }
];

export default function ProductionManager() {
  const [batches] = useState(MOCK_BATCHES);

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader 
        title="Tablero de Producción" 
        description="Rastrea lotes de panadería lenta de masa madre y procesos de horneado en tiempo real."
        action={
          <button className="flex items-center gap-1.5 px-4 py-2 bg-cream text-stone-700 border border-coffee/10 hover:border-coffee/20 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer">
            <RefreshCw size={14} />
            Actualizar Tablero
          </button>
        }
      />

      {/* Production pipeline visual layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
        
        {/* Stage 1: Amasado */}
        <div className="bg-stone-50 border border-stone-200/60 rounded-3xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 border-b border-stone-200 pb-2 mb-1">
            <Wheat size={14} className="text-amber-600" />
            Amasado
          </div>
          <div className="space-y-2.5">
            {batches.filter(b => b.stage === 'amasado').map(b => (
              <div key={b.id} className="bg-white border border-coffee/5 p-4 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow">
                <h5 className="font-sans font-bold text-stone-850 text-xs">{b.name}</h5>
                <p className="text-[10px] text-stone-400 mt-1 font-medium">Harina: {b.flour}</p>
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-50 text-[10px] text-stone-500 font-bold font-mono">
                  <span>Cant: {b.quantity}</span>
                  <span className="flex items-center gap-0.5 text-amber-600">
                    <Clock size={11} /> {b.timeElapsed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 2: Fermentación (24h) */}
        <div className="bg-stone-50 border border-stone-200/60 rounded-3xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 border-b border-stone-200 pb-2 mb-1">
            <Sparkles size={14} className="text-gold" />
            Fermentación (24h)
          </div>
          <div className="space-y-2.5">
            {batches.filter(b => b.stage === 'fermentacion').map(b => (
              <div key={b.id} className="bg-white border border-coffee/5 p-4 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow">
                <h5 className="font-sans font-bold text-stone-850 text-xs">{b.name}</h5>
                <p className="text-[10px] text-stone-400 mt-1 font-medium">Harina: {b.flour}</p>
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-50 text-[10px] text-stone-500 font-bold font-mono">
                  <span>Cant: {b.quantity}</span>
                  <span className="flex items-center gap-0.5 text-gold">
                    <Clock size={11} /> {b.timeElapsed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 3: Horneado */}
        <div className="bg-stone-50 border border-stone-200/60 rounded-3xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 border-b border-stone-200 pb-2 mb-1">
            <Flame size={14} className="text-red-500" />
            Horneado
          </div>
          <div className="space-y-2.5">
            {batches.filter(b => b.stage === 'horneado').map(b => (
              <div key={b.id} className="bg-white border border-coffee/5 p-4 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow">
                <h5 className="font-sans font-bold text-stone-850 text-xs">{b.name}</h5>
                <p className="text-[10px] text-stone-400 mt-1 font-medium">Harina: {b.flour}</p>
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-50 text-[10px] text-stone-500 font-bold font-mono">
                  <span>Cant: {b.quantity}</span>
                  <span className="flex items-center gap-0.5 text-red-550 animate-pulse">
                    <Flame size={11} /> {b.timeElapsed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 4: Listo / Vitrina */}
        <div className="bg-stone-50 border border-stone-200/60 rounded-3xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 border-b border-stone-200 pb-2 mb-1">
            <ChefHat size={14} className="text-emerald-600" />
            Listo para Vitrina
          </div>
          <div className="space-y-2.5">
            {batches.filter(b => b.stage === 'listo').map(b => (
              <div key={b.id} className="bg-white border border-coffee/5 p-4 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow">
                <h5 className="font-sans font-bold text-stone-850 text-xs">{b.name}</h5>
                <p className="text-[10px] text-stone-400 mt-1 font-medium">Harina: {b.flour}</p>
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-50 text-[10px] text-stone-500 font-bold font-mono">
                  <span>Cant: {b.quantity}</span>
                  <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[8px] font-bold">LISTO</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
