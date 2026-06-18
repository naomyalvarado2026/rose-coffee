import { useState, useEffect } from 'react';
import { Package, ShieldAlert, ArrowUpDown, Plus, RefreshCw, Layers, X, Save, Edit } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface UnifiedInventoryItem {
  id: string | number;
  name: string;
  category: string;
  stock: number;
  stock_min: number;
  unit: string;
  price: number;
  type: 'product' | 'insumo';
}

const DEFAULT_MOCK: UnifiedInventoryItem[] = [
  { id: 'mock-1', name: 'Café Blend Rose (250g)', category: 'Café', stock: 42, stock_min: 10, unit: 'unidades', price: 9.50, type: 'product' },
  { id: 'mock-2', name: 'Café Origen Zaruma (500g)', category: 'Café', stock: 8, stock_min: 15, unit: 'unidades', price: 17.00, type: 'product' },
  { id: 'mock-3', name: 'Pan de Masa Madre Clásico', category: 'Panadería', stock: 15, stock_min: 10, unit: 'unidades', price: 4.50, type: 'product' },
  { id: 'mock-4', name: 'Croissant Almendras', category: 'Panadería', stock: 3, stock_min: 8, unit: 'unidades', price: 2.75, type: 'product' },
  { id: 'mock-5', name: 'Harina de Fuerza Orgánica', category: 'Insumos', stock: 120, stock_min: 50, unit: 'kg', price: 1.80, type: 'insumo' }
];

export default function InventoryManager() {
  const [items, setItems] = useState<UnifiedInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | number>('');
  const [adjustmentType, setAdjustmentType] = useState<'Ingreso' | 'Egreso' | 'Ajuste Directo'>('Ingreso');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  // Fetch Inventory from Supabase
  const fetchInventory = async (showToast = false) => {
    if (showToast) setSyncing(true);
    setLoading(true);
    try {
      // 1. Fetch physical products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, category, stock, stock_min, price')
        .eq('type', 'physical')
        .is('deleted_at', null);

      if (productsError) throw productsError;

      // 2. Fetch inventory items and categories
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, name, category_id, price, quantity, description');

      if (itemsError) throw itemsError;

      const { data: catsData } = await supabase
        .from('inventory_categories')
        .select('id, name');

      const categoryMap = new Map((catsData || []).map(c => [c.id, c.name]));

      // 3. Map into unified list
      const mappedProducts: UnifiedInventoryItem[] = (productsData || []).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Café',
        stock: p.stock ?? 0,
        stock_min: p.stock_min ?? 5,
        unit: 'unidades',
        price: Number(p.price) || 0,
        type: 'product'
      }));

      const mappedInsumos: UnifiedInventoryItem[] = (itemsData || []).map(i => ({
        id: i.id,
        name: i.name,
        category: categoryMap.get(i.category_id) || 'Insumos',
        stock: i.quantity ?? 0,
        stock_min: 10, // Default minimum for ingredients
        unit: i.name.toLowerCase().includes('harina') || i.name.toLowerCase().includes('café') ? 'kg' : 'unidades',
        price: Number(i.price) || 0,
        type: 'insumo'
      }));

      const combined = [...mappedProducts, ...mappedInsumos];
      setItems(combined);
      localStorage.setItem('rose_coffee_inventory', JSON.stringify(combined));
      
      if (showToast) {
        toast.success('Inventario sincronizado con Supabase.');
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      toast.error('Error al sincronizar con la base de datos. Usando caché local.');
      
      const cached = localStorage.getItem('rose_coffee_inventory');
      if (cached) {
        setItems(JSON.parse(cached));
      } else {
        setItems(DEFAULT_MOCK);
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantity <= 0) {
      toast.error('Por favor complete todos los datos del ajuste.');
      return;
    }

    const targetItem = items.find(i => i.id === selectedItemId);
    if (!targetItem) return;

    setSavingAdjustment(true);
    try {
      let currentStock = targetItem.stock;
      let newStock = currentStock;

      if (adjustmentType === 'Ingreso') {
        newStock += quantity;
      } else if (adjustmentType === 'Egreso') {
        newStock = Math.max(0, currentStock - quantity);
      } else {
        newStock = quantity;
      }

      if (targetItem.type === 'product') {
        const { error } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', targetItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('inventory_items')
          .update({ quantity: newStock })
          .eq('id', targetItem.id);

        if (error) throw error;
      }

      toast.success(`Ajuste de inventario aplicado con éxito a "${targetItem.name}".`);
      setShowModal(false);
      setQuantity(0);
      setReason('');
      setSelectedItemId('');
      
      // Reload inventory
      fetchInventory();
    } catch (err: any) {
      console.error('Error saving adjustment:', err);
      toast.error('Error al guardar el ajuste en Supabase. Se aplicará localmente.');
      
      // Fallback local update
      const updated = items.map(item => {
        if (item.id === targetItem.id) {
          let currentStock = item.stock;
          let newStock = currentStock;

          if (adjustmentType === 'Ingreso') newStock += quantity;
          else if (adjustmentType === 'Egreso') newStock = Math.max(0, currentStock - quantity);
          else newStock = quantity;

          return { ...item, stock: newStock };
        }
        return item;
      });
      setItems(updated);
      localStorage.setItem('rose_coffee_inventory', JSON.stringify(updated));
      setShowModal(false);
    } finally {
      setSavingAdjustment(false);
    }
  };

  // Calculations for KPI Cards
  const totalItems = items.length;
  const criticalStockCount = items.filter(item => item.stock <= item.stock_min).length;
  const estimatedValue = items.reduce((sum, item) => sum + (item.stock * item.price), 0);

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader 
        title="Gestión de Inventario" 
        description="Supervisa y actualiza los niveles de materias primas y productos listos para la venta."
        action={
          <div className="flex gap-2">
            <button 
              disabled={syncing}
              onClick={() => fetchInventory(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-cream text-stone-700 border border-coffee/10 hover:border-coffee/20 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <button 
              onClick={() => {
                setSelectedItemId(items[0]?.id || '');
                setAdjustmentType('Ingreso');
                setQuantity(0);
                setReason('');
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-transparent"
            >
              <Plus size={14} />
              Añadir Ajuste
            </button>
          </div>
        }
      />

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-coffee/10 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Items</p>
              <h4 className="text-xl font-extrabold text-stone-900 mt-0.5">{totalItems} Existencias</h4>
            </div>
          </div>
        </div>

        <div className="bg-white border border-coffee/10 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-650 flex items-center justify-center border border-red-100">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Stock Crítico</p>
              <h4 className="text-xl font-extrabold text-red-600 mt-0.5">{criticalStockCount} Items Bajos</h4>
            </div>
          </div>
        </div>

        <div className="bg-white border border-coffee/10 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Valor Estimado</p>
              <h4 className="text-xl font-extrabold text-stone-900 mt-0.5">${estimatedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table card */}
      <div className="bg-white border border-coffee/10 rounded-3xl p-6 shadow-2xs overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
            <ArrowUpDown size={14} className="text-gold" />
            Niveles de Existencias
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading && items.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw size={24} className="animate-spin text-coffee mx-auto mb-2" />
              <p className="text-xs text-stone-400 font-bold uppercase">Cargando inventario...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Producto/Insumo</th>
                  <th className="pb-3 font-semibold">Categoría</th>
                  <th className="pb-3 font-semibold">Tipo</th>
                  <th className="pb-3 font-semibold">Stock Actual</th>
                  <th className="pb-3 font-semibold">Mínimo Requerido</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 font-semibold text-right">Precio Ref.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {items.map((item) => {
                  const isCritical = item.stock <= item.stock_min;
                  const isOut = item.stock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 font-bold text-stone-850 flex items-center gap-1.5">
                        {item.name}
                      </td>
                      <td className="py-4 text-stone-500 font-medium">{item.category}</td>
                      <td className="py-4">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          item.type === 'product' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'
                        }`}>
                          {item.type === 'product' ? 'Producto' : 'Insumo'}
                        </span>
                      </td>
                      <td className="py-4 font-mono font-bold text-stone-800">{item.stock} {item.unit}</td>
                      <td className="py-4 font-mono text-stone-400">{item.stock_min} {item.unit}</td>
                      <td className="py-4">
                        {isOut ? (
                          <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold uppercase tracking-wider">Agotado</span>
                        ) : isCritical ? (
                          <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold uppercase tracking-wider">Stock Bajo</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold uppercase tracking-wider">Disponible</span>
                        )}
                      </td>
                      <td className="py-4 text-right font-mono font-bold text-stone-800">${item.price.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Añadir Ajuste */}
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
                <Edit size={16} className="text-gold" />
                Registrar Ajuste de Inventario
              </h3>
              <p className="text-[10px] text-stone-400 font-medium mb-4 border-b border-stone-50 pb-2">
                Aumenta, disminuye o corrige el stock de productos e insumos de la tienda.
              </p>

              <form onSubmit={handleSaveAdjustment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                    Seleccionar Producto / Insumo *
                  </label>
                  <select
                    required
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-850 font-bold focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee cursor-pointer"
                  >
                    <option value="" disabled>Selecciona un elemento...</option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        [{i.type === 'product' ? 'Prod' : 'Insu'}] {i.name} (Stock: {i.stock} {i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Tipo de Ajuste
                    </label>
                    <select
                      value={adjustmentType}
                      onChange={(e) => setAdjustmentType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-850 font-bold focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee cursor-pointer"
                    >
                      <option value="Ingreso">Ingreso (+)</option>
                      <option value="Egreso">Egreso (-)</option>
                      <option value="Ajuste Directo">Ajuste Directo (=)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                    Motivo / Descripción del Ajuste *
                  </label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                    placeholder="E.g. Compra de inventario mensual, merma..."
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
                    disabled={savingAdjustment}
                    className="flex-1 py-2 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {savingAdjustment ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {savingAdjustment ? 'Guardando...' : 'Aplicar Ajuste'}
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
