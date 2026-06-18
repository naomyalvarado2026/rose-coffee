import { useState, useEffect } from 'react';
import { Tag, Sparkles, Plus, Calendar, Edit2, Trash2, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminHeader from '../../components/admin/AdminHeader';
import { toast } from 'sonner';

interface Coupon {
  id: string | number;
  code: string;
  discount: string;
  type: 'Porcentaje' | 'Fijo';
  active: boolean;
  usage: string;
  expires: string;
}

const DEFAULT_COUPONS: Coupon[] = [
  { id: 1, code: 'BIENVENIDAROSE', discount: '15%', type: 'Porcentaje', active: true, usage: '24 / Ilimitado', expires: '2026-12-31' },
  { id: 2, code: 'COFFEELOVER', discount: '$5.00', type: 'Fijo', active: true, usage: '89 / 200', expires: '2026-08-15' },
  { id: 3, code: 'MASAMADREPET', discount: '10%', type: 'Porcentaje', active: false, usage: '50 / 50', expires: '2026-05-01' }
];

export default function MarketingManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pointRatio, setPointRatio] = useState(10); // $10 = 10 points
  
  // Modals & form state
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  // Form fields
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [type, setType] = useState<'Porcentaje' | 'Fijo'>('Porcentaje');
  const [expires, setExpires] = useState('');
  const [active, setActive] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const cachedCoupons = localStorage.getItem('rose_coffee_coupons');
    if (cachedCoupons) {
      try {
        setCoupons(JSON.parse(cachedCoupons));
      } catch (e) {
        setCoupons(DEFAULT_COUPONS);
      }
    } else {
      setCoupons(DEFAULT_COUPONS);
      localStorage.setItem('rose_coffee_coupons', JSON.stringify(DEFAULT_COUPONS));
    }

    const cachedRatio = localStorage.getItem('rose_coffee_point_ratio');
    if (cachedRatio) {
      setPointRatio(Number(cachedRatio));
    }
  }, []);

  const saveCouponsToStorage = (newCoupons: Coupon[]) => {
    setCoupons(newCoupons);
    localStorage.setItem('rose_coffee_coupons', JSON.stringify(newCoupons));
  };

  const handleSaveRatio = () => {
    localStorage.setItem('rose_coffee_point_ratio', String(pointRatio));
    toast.success('Regla del Rose Club guardada con éxito.');
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscount('');
    setType('Porcentaje');
    setExpires(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 30 days default
    setActive(true);
    setShowModal(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscount(coupon.discount);
    setType(coupon.type);
    setExpires(coupon.expires);
    setActive(coupon.active);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discount || !expires) {
      toast.error('Por favor complete todos los campos obligatorios.');
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    
    // Check if code already exists (except when editing self)
    const exists = coupons.some(c => c.code === cleanCode && (!editingCoupon || c.id !== editingCoupon.id));
    if (exists) {
      toast.error('Ya existe un cupón con este código.');
      return;
    }

    let formattedDiscount = discount.trim();
    if (type === 'Porcentaje' && !formattedDiscount.endsWith('%')) {
      formattedDiscount += '%';
    } else if (type === 'Fijo' && !formattedDiscount.startsWith('$')) {
      formattedDiscount = '$' + formattedDiscount;
    }

    if (editingCoupon) {
      // Edit mode
      const updated = coupons.map(c => 
        c.id === editingCoupon.id 
          ? { ...c, code: cleanCode, discount: formattedDiscount, type, expires, active }
          : c
      );
      saveCouponsToStorage(updated);
      toast.success('Cupón modificado con éxito.');
    } else {
      // Create mode
      const newCoupon: Coupon = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
        code: cleanCode,
        discount: formattedDiscount,
        type,
        active,
        usage: '0 / Ilimitado',
        expires
      };
      saveCouponsToStorage([newCoupon, ...coupons]);
      toast.success('Cupón creado con éxito.');
    }

    setShowModal(false);
  };

  const handleDelete = (id: string | number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cupón?')) {
      const updated = coupons.filter(c => c.id !== id);
      saveCouponsToStorage(updated);
      toast.success('Cupón eliminado.');
    }
  };

  const toggleStatus = (coupon: Coupon) => {
    const updated = coupons.map(c => 
      c.id === coupon.id ? { ...c, active: !c.active } : c
    );
    saveCouponsToStorage(updated);
    toast.success(`Cupón ${coupon.code} ${!coupon.active ? 'activado' : 'desactivado'}.`);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader 
        title="Marketing & Rose Club" 
        description="Gestiona promociones de venta, cupones de descuento y el programa de lealtad de pétalos."
        action={
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-transparent"
          >
            <Plus size={14} />
            Crear Cupón
          </button>
        }
      />

      {/* Grid: Loyalty configurations & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Loyalty Program config card */}
        <div className="bg-white border border-coffee/10 rounded-3xl p-6 shadow-2xs space-y-4 h-fit">
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

            <button 
              onClick={handleSaveRatio}
              className="w-full mt-4 py-2 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold shadow-3xs active:scale-[0.98] transition-all cursor-pointer border border-transparent"
            >
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
                    <th className="pb-3 font-semibold">Estado</th>
                    <th className="pb-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400 italic">
                        No hay cupones registrados. Haz clic en "Crear Cupón" para comenzar.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-stone-850">{coupon.code}</td>
                        <td className="py-3.5 text-stone-800 font-bold">{coupon.discount}</td>
                        <td className="py-3.5 text-stone-500 font-medium">{coupon.type}</td>
                        <td className="py-3.5 text-stone-400 font-mono font-medium">{coupon.usage}</td>
                        <td className="py-3.5 text-stone-400 font-medium">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {coupon.expires}
                          </div>
                        </td>
                        <td className="py-3.5">
                          <button
                            onClick={() => toggleStatus(coupon)}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer ${
                              coupon.active 
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                            }`}
                            title="Haz clic para cambiar estado"
                          >
                            {coupon.active ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="py-3.5 text-right flex justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="p-1 text-stone-500 hover:text-coffee hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar cupón"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-1 text-stone-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar cupón"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Crear / Editar Cupón */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-stone-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-coffee/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative text-left"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5 mb-1">
                <Tag size={16} className="text-gold" />
                {editingCoupon ? 'Editar Cupón de Descuento' : 'Crear Nuevo Cupón'}
              </h3>
              <p className="text-[10px] text-stone-400 font-medium mb-4 border-b border-stone-50 pb-2">
                {editingCoupon ? 'Actualiza los parámetros del cupón existente.' : 'Genera un nuevo código promocional para tus clientes.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                    Código del Cupón *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-850 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                    placeholder="E.g. DESCUENTOPRO"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Tipo de Descuento
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee cursor-pointer"
                    >
                      <option value="Porcentaje">Porcentaje (%)</option>
                      <option value="Fijo">Fijo ($ USD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Descuento *
                    </label>
                    <input
                      type="text"
                      required
                      value={discount.replace(/[\$%]/g, '')}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-850 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                      placeholder={type === 'Porcentaje' ? '15' : '5.00'}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                    Fecha de Expiración *
                  </label>
                  <input
                    type="date"
                    required
                    value={expires}
                    onChange={(e) => setExpires(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-150 rounded-2xl">
                  <span className="text-xs font-bold text-stone-800">Cupón Activo</span>
                  <button 
                    type="button"
                    onClick={() => setActive(!active)}
                    className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer ${active ? 'bg-coffee' : 'bg-stone-300'}`}
                  >
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all duration-200 ${active ? 'left-4.75' : 'left-0.75'}`} />
                  </button>
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
                    Guardar
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
