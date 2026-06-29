import { useState, useEffect } from 'react';
import { ChefHat, Wheat, Sparkles, RefreshCw, Flame, Clock, ChevronRight, ChevronLeft, Archive, Plus, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'sonner';

interface Batch {
  id: string | number;
  name: string;
  stage: 'amasado' | 'fermentacion' | 'horneado' | 'listo';
  timeElapsed: string;
  quantity: number;
  flour: string;
}

const DEFAULT_BATCHES: Batch[] = [
  { id: 1, name: 'Lote Pan Sourdough Rústico #104', stage: 'fermentacion', timeElapsed: '18h / 24h', quantity: 24, flour: 'Integral + Fuerza' },
  { id: 2, name: 'Lote Baguettes Masa Madre #105', stage: 'amasado', timeElapsed: '15m', quantity: 15, flour: 'Fuerza Orgánica' },
  { id: 3, name: 'Lote Croissants Artesanales #106', stage: 'horneado', timeElapsed: '8m / 20m', quantity: 30, flour: 'Fuerza premium' },
  { id: 4, name: 'Lote Pan Sourdough Espelta #103', stage: 'listo', timeElapsed: 'Completo', quantity: 12, flour: 'Espelta Orgánica' }
];

export default function ProductionManager() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form state for new batch
  const [name, setName] = useState('');
  const [flour, setFlour] = useState('Fuerza Orgánica');
  const [quantity, setQuantity] = useState(12);
  const [stage, setStage] = useState<'amasado' | 'fermentacion' | 'horneado' | 'listo'>('amasado');
  const [timeElapsed, setTimeElapsed] = useState('0m');

  // Load from localStorage
  useEffect(() => {
    const cached = localStorage.getItem('rose_coffee_batches');
    if (cached) {
      try {
        setBatches(JSON.parse(cached));
      } catch (e) {
        setBatches(DEFAULT_BATCHES);
      }
    } else {
      setBatches(DEFAULT_BATCHES);
      localStorage.setItem('rose_coffee_batches', JSON.stringify(DEFAULT_BATCHES));
    }
  }, []);

  const saveBatches = (newBatches: Batch[]) => {
    setBatches(newBatches);
    localStorage.setItem('rose_coffee_batches', JSON.stringify(newBatches));
  };

  const handleRefresh = () => {
    // Reload from cache, or simulate syncing
    const cached = localStorage.getItem('rose_coffee_batches');
    if (cached) {
      setBatches(JSON.parse(cached));
    }
    toast.success('Tablero de producción actualizado.');
  };

  const handleNextStage = (id: string | number) => {
    const nextMap: Record<string, 'amasado' | 'fermentacion' | 'horneado' | 'listo'> = {
      amasado: 'fermentacion',
      fermentacion: 'horneado',
      horneado: 'listo',
      listo: 'listo'
    };

    const timeMap: Record<string, string> = {
      amasado: '18h / 24h',
      fermentacion: '20m',
      horneado: 'Completo',
      listo: 'Completo'
    };

    const updated = batches.map(b => {
      if (b.id === id) {
        const next = nextMap[b.stage];
        return {
          ...b,
          stage: next,
          timeElapsed: timeMap[b.stage] || b.timeElapsed
        };
      }
      return b;
    });

    saveBatches(updated);
    toast.success('El lote avanzó a la siguiente etapa de producción.');
  };

  const handlePrevStage = (id: string | number) => {
    const prevMap: Record<string, 'amasado' | 'fermentacion' | 'horneado' | 'listo'> = {
      amasado: 'amasado',
      fermentacion: 'amasado',
      horneado: 'fermentacion',
      listo: 'horneado'
    };

    const timeMap: Record<string, string> = {
      fermentacion: '15m',
      horneado: '18h / 24h',
      listo: '10m / 20m',
      amasado: '0m'
    };

    const updated = batches.map(b => {
      if (b.id === id) {
        const prev = prevMap[b.stage];
        return {
          ...b,
          stage: prev,
          timeElapsed: timeMap[b.stage] || b.timeElapsed
        };
      }
      return b;
    });

    saveBatches(updated);
    toast.success('El lote retrocedió a la etapa anterior.');
  };

  const handleDeleteBatch = (id: string | number, name: string) => {
    if (confirm(`¿Deseas archivar/quitar el "${name}" de la vitrina?`)) {
      const updated = batches.filter(b => b.id !== id);
      saveBatches(updated);
      toast.success('Lote archivado con éxito.');
    }
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre del lote es obligatorio.');
      return;
    }

    const newBatch: Batch = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
      name: name.trim(),
      stage,
      timeElapsed: timeElapsed || (stage === 'amasado' ? '10m' : stage === 'fermentacion' ? '0h / 24h' : stage === 'horneado' ? '15m' : 'Completo'),
      quantity,
      flour: flour.trim()
    };

    saveBatches([newBatch, ...batches]);
    toast.success('Nuevo lote de producción agregado.');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader 
        title="Tablero de Producción" 
        description="Rastrea lotes de panadería lenta de masa madre y procesos de horneado en tiempo real."
        action={
          <div className="flex gap-2">
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-4 py-2 bg-cream text-stone-700 border border-coffee/10 hover:border-coffee/20 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer"
            >
              <RefreshCw size={14} />
              Actualizar Tablero
            </button>
            <button 
              onClick={() => {
                setName(`Lote Pan Sourdough #${Date.now().toString().slice(-3)}`);
                setFlour('Fuerza Orgánica');
                setQuantity(24);
                setStage('amasado');
                setTimeElapsed('15m');
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-coffee hover:bg-coffee-dark text-white border border-transparent rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus size={14} />
              Nuevo Lote
            </button>
          </div>
        }
      />

      {/* Production pipeline visual layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
        
        {/* Stage 1: Amasado */}
        <div className="bg-stone-50 border border-stone-200 dark:border-stone-700/60 rounded-3xl p-4 flex flex-col gap-3 min-h-[400px]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-750 border-b border-stone-200 dark:border-stone-700 pb-2 mb-1">
            <Wheat size={14} className="text-amber-600" />
            Amasado
          </div>
          <div className="space-y-2.5 flex-grow">
            {batches.filter(b => b.stage === 'amasado').length === 0 ? (
              <p className="text-[10px] text-stone-400 italic text-center py-6">Sin lotes en amasado</p>
            ) : (
              batches.filter(b => b.stage === 'amasado').map(b => (
                <div key={b.id} className="bg-white dark:bg-stone-800 border border-coffee/5 p-4 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow">
                  <h5 className="font-sans font-bold text-stone-850 text-xs">{b.name}</h5>
                  <p className="text-[10px] text-stone-400 mt-1 font-medium">Harina: {b.flour}</p>
                  
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-50 text-[10px] text-stone-500 font-bold font-mono">
                    <span>Cant: {b.quantity}</span>
                    <span className="flex items-center gap-0.5 text-amber-600">
                      <Clock size={11} /> {b.timeElapsed}
                    </span>
                  </div>

                  <div className="flex justify-end gap-1.5 mt-3 pt-2 border-t border-stone-50">
                    <button
                      onClick={() => handleNextStage(b.id)}
                      className="p-1 text-coffee dark:text-gold hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Mover a Fermentación"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stage 2: Fermentación (24h) */}
        <div className="bg-stone-50 border border-stone-200 dark:border-stone-700/60 rounded-3xl p-4 flex flex-col gap-3 min-h-[400px]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-750 border-b border-stone-200 dark:border-stone-700 pb-2 mb-1">
            <Sparkles size={14} className="text-gold" />
            Fermentación (24h)
          </div>
          <div className="space-y-2.5 flex-grow">
            {batches.filter(b => b.stage === 'fermentacion').length === 0 ? (
              <p className="text-[10px] text-stone-400 italic text-center py-6">Sin lotes en fermentación</p>
            ) : (
              batches.filter(b => b.stage === 'fermentacion').map(b => (
                <div key={b.id} className="bg-white dark:bg-stone-800 border border-coffee/5 p-4 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow">
                  <h5 className="font-sans font-bold text-stone-850 text-xs">{b.name}</h5>
                  <p className="text-[10px] text-stone-400 mt-1 font-medium">Harina: {b.flour}</p>
                  
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-50 text-[10px] text-stone-500 font-bold font-mono">
                    <span>Cant: {b.quantity}</span>
                    <span className="flex items-center gap-0.5 text-gold">
                      <Clock size={11} /> {b.timeElapsed}
                    </span>
                  </div>

                  <div className="flex justify-between mt-3 pt-2 border-t border-stone-50">
                    <button
                      onClick={() => handlePrevStage(b.id)}
                      className="p-1 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Volver a Amasado"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => handleNextStage(b.id)}
                      className="p-1 text-coffee dark:text-gold hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Mover a Horneado"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stage 3: Horneado */}
        <div className="bg-stone-50 border border-stone-200 dark:border-stone-700/60 rounded-3xl p-4 flex flex-col gap-3 min-h-[400px]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-750 border-b border-stone-200 dark:border-stone-700 pb-2 mb-1">
            <Flame size={14} className="text-red-500" />
            Horneado
          </div>
          <div className="space-y-2.5 flex-grow">
            {batches.filter(b => b.stage === 'horneado').length === 0 ? (
              <p className="text-[10px] text-stone-400 italic text-center py-6">Sin lotes en horneado</p>
            ) : (
              batches.filter(b => b.stage === 'horneado').map(b => (
                <div key={b.id} className="bg-white dark:bg-stone-800 border border-coffee/5 p-4 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow">
                  <h5 className="font-sans font-bold text-stone-850 text-xs">{b.name}</h5>
                  <p className="text-[10px] text-stone-400 mt-1 font-medium">Harina: {b.flour}</p>
                  
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-50 text-[10px] text-stone-500 font-bold font-mono">
                    <span>Cant: {b.quantity}</span>
                    <span className="flex items-center gap-0.5 text-red-550 animate-pulse">
                      <Flame size={11} /> {b.timeElapsed}
                    </span>
                  </div>

                  <div className="flex justify-between mt-3 pt-2 border-t border-stone-50">
                    <button
                      onClick={() => handlePrevStage(b.id)}
                      className="p-1 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Volver a Fermentación"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => handleNextStage(b.id)}
                      className="p-1 text-coffee dark:text-gold hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Mover a Vitrina"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stage 4: Listo / Vitrina */}
        <div className="bg-stone-50 border border-stone-200 dark:border-stone-700/60 rounded-3xl p-4 flex flex-col gap-3 min-h-[400px]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-750 border-b border-stone-200 dark:border-stone-700 pb-2 mb-1">
            <ChefHat size={14} className="text-emerald-600" />
            Listo para Vitrina
          </div>
          <div className="space-y-2.5 flex-grow">
            {batches.filter(b => b.stage === 'listo').length === 0 ? (
              <p className="text-[10px] text-stone-400 italic text-center py-6">Sin lotes listos</p>
            ) : (
              batches.filter(b => b.stage === 'listo').map(b => (
                <div key={b.id} className="bg-white dark:bg-stone-800 border border-coffee/5 p-4 rounded-2xl shadow-3xs hover:shadow-2xs transition-shadow">
                  <h5 className="font-sans font-bold text-stone-850 text-xs">{b.name}</h5>
                  <p className="text-[10px] text-stone-400 mt-1 font-medium">Harina: {b.flour}</p>
                  
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-stone-50 text-[10px] text-stone-500 font-bold font-mono">
                    <span>Cant: {b.quantity}</span>
                    <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[8px] font-bold">LISTO</span>
                  </div>

                  <div className="flex justify-between mt-3 pt-2 border-t border-stone-50">
                    <button
                      onClick={() => handlePrevStage(b.id)}
                      className="p-1 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Volver a Horneado"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(b.id, b.name)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      title="Archivar lote"
                    >
                      <Archive size={12} />
                      Archivar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal: Nuevo Lote */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-stone-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-stone-800 border border-coffee/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative text-left"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-200 flex items-center gap-1.5 mb-1">
                <ChefHat size={16} className="text-gold" />
                Agregar Nuevo Lote de Producción
              </h3>
              <p className="text-[10px] text-stone-400 font-medium mb-4 border-b border-stone-50 pb-2">
                Ingresa los datos para registrar e iniciar el flujo de panificación.
              </p>

              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                    Identificador / Nombre del Lote *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-850 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                    placeholder="E.g. Lote Sourdough Rústico #107"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                    Tipo de Harina / Mezcla *
                  </label>
                  <input
                    type="text"
                    required
                    value={flour}
                    onChange={(e) => setFlour(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                    placeholder="E.g. Integral + Espelta Orgánica"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Cantidad (Unidades)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono font-bold text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Etapa Inicial
                    </label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-xl text-xs bg-white dark:bg-stone-800 text-stone-850 font-bold focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee cursor-pointer"
                    >
                      <option value="amasado">Amasado</option>
                      <option value="fermentacion">Fermentación</option>
                      <option value="horneado">Horneado</option>
                      <option value="listo">Listo para Vitrina</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                    Tiempo Transcurrido Inicial (Texto)
                  </label>
                  <input
                    type="text"
                    value={timeElapsed}
                    onChange={(e) => setTimeElapsed(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                    placeholder={stage === 'amasado' ? '15m' : stage === 'fermentacion' ? '0h / 24h' : '0m / 20m'}
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-650 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Save size={14} />
                    Iniciar Lote
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
