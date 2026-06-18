import { useState, useEffect } from 'react';
import { Package, ShieldAlert, ArrowUpDown, Plus, RefreshCw, Layers, X, Save, Edit, Trash2 } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface UnifiedInventoryItem {
  id: string;
  name: string;
  category: string;
  category_id?: string;
  stock: number;
  stock_min: number;
  unit: string;
  price: number;
  type: 'product' | 'insumo';
  description?: string;
}

const DEFAULT_MOCK: UnifiedInventoryItem[] = [
  { id: 'mock-1', name: 'Café Blend Rose (250g)', category: 'Café', stock: 42, stock_min: 10, unit: 'unidades', price: 9.50, type: 'product', description: 'Café tostado de especialidad.' },
  { id: 'mock-2', name: 'Café Origen Zaruma (500g)', category: 'Café', stock: 8, stock_min: 15, unit: 'unidades', price: 17.00, type: 'product', description: 'Café origen único Zaruma.' },
  { id: 'mock-3', name: 'Pan de Masa Madre Clásico', category: 'Panadería', stock: 15, stock_min: 10, unit: 'unidades', price: 4.50, type: 'product', description: 'Pan artesano fermentado por 24 horas.' },
  { id: 'mock-4', name: 'Croissant Almendras', category: 'Panadería', stock: 3, stock_min: 8, unit: 'unidades', price: 2.75, type: 'product', description: 'Croissant de almendras crujiente.' },
  { id: 'mock-5', name: 'Harina de Fuerza Orgánica', category: 'Insumos', stock: 120, stock_min: 50, unit: 'kg', price: 1.80, type: 'insumo', description: 'Harina orgánica para panadería.' }
];

const PRODUCT_CATEGORIES = ['Café', 'Panadería', 'Bebidas', 'Accesorios', 'Materia Prima', 'Otros'];

export default function InventoryManager() {
  const [items, setItems] = useState<UnifiedInventoryItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Adjustment Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'Ingreso' | 'Egreso' | 'Ajuste Directo'>('Ingreso');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  // Create/Edit Item Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UnifiedInventoryItem | null>(null);
  const [itemType, setItemType] = useState<'product' | 'insumo'>('insumo');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemStock, setItemStock] = useState<number>(0);
  const [itemStockMin, setItemStockMin] = useState<number>(5);
  const [itemUnit, setItemUnit] = useState('unidades');
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemDescription, setItemDescription] = useState('');
  const [savingItem, setSavingItem] = useState(false);

  // Delete Confirmation State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<UnifiedInventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Inventory from Supabase
  const fetchInventory = async (showToast = false) => {
    if (showToast) setSyncing(true);
    setLoading(true);
    try {
      // 1. Fetch physical products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, category, stock, stock_min, price, description')
        .eq('type', 'physical')
        .is('deleted_at', null);

      if (productsError) throw productsError;

      // 2. Fetch inventory items and categories
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, name, category_id, price, quantity, stock_min, unit, description');

      if (itemsError) throw itemsError;

      const { data: catsData, error: catsError } = await supabase
        .from('inventory_categories')
        .select('id, name');

      if (catsError) throw catsError;

      if (catsData) {
        setCategories(catsData);
      }

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
        type: 'product',
        description: p.description || ''
      }));

      const mappedInsumos: UnifiedInventoryItem[] = (itemsData || []).map(i => ({
        id: i.id,
        name: i.name,
        category: categoryMap.get(i.category_id) || 'Insumos',
        category_id: i.category_id,
        stock: i.quantity ?? 0,
        stock_min: i.stock_min ?? 5,
        unit: i.unit || 'unidades',
        price: Number(i.price) || 0,
        type: 'insumo',
        description: i.description || ''
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

  // Modal Open Handlers
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setItemType('insumo');
    setItemName('');
    setItemCategory(categories[0]?.id || '');
    setItemStock(0);
    setItemStockMin(5);
    setItemUnit('unidades');
    setItemPrice(0);
    setItemDescription('');
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item: UnifiedInventoryItem) => {
    setEditingItem(item);
    setItemType(item.type);
    setItemName(item.name);
    setItemCategory(item.type === 'insumo' ? item.category_id || '' : item.category);
    setItemStock(item.stock);
    setItemStockMin(item.stock_min);
    setItemUnit(item.unit);
    setItemPrice(item.price);
    setItemDescription(item.description || '');
    setShowItemModal(true);
  };

  const handleTypeChange = (type: 'product' | 'insumo') => {
    setItemType(type);
    if (type === 'insumo') {
      setItemCategory(categories[0]?.id || '');
      setItemUnit('unidades');
    } else {
      setItemCategory('Café');
      setItemUnit('unidades');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) {
      toast.error('Por favor introduce el nombre del item.');
      return;
    }

    setSavingItem(true);
    try {
      if (itemType === 'insumo') {
        const payload = {
          name: itemName,
          category_id: itemCategory || null,
          quantity: itemStock,
          stock_min: itemStockMin,
          unit: itemUnit,
          price: itemPrice,
          description: itemDescription
        };

        if (editingItem) {
          const { error } = await supabase
            .from('inventory_items')
            .update(payload)
            .eq('id', editingItem.id);

          if (error) throw error;
          toast.success(`Insumo "${itemName}" actualizado con éxito.`);
        } else {
          const { error } = await supabase
            .from('inventory_items')
            .insert(payload);

          if (error) throw error;
          toast.success(`Insumo "${itemName}" añadido con éxito.`);
        }
      } else {
        // Product
        const payload = {
          name: itemName,
          category: itemCategory,
          stock: itemStock,
          stock_min: itemStockMin,
          price: itemPrice,
          description: itemDescription,
          type: 'physical'
        };

        if (editingItem) {
          const { error } = await supabase
            .from('products')
            .update(payload)
            .eq('id', editingItem.id);

          if (error) throw error;
          toast.success(`Producto "${itemName}" actualizado con éxito.`);
        } else {
          const { error } = await supabase
            .from('products')
            .insert(payload);

          if (error) throw error;
          toast.success(`Producto "${itemName}" añadido con éxito.`);
        }
      }

      setShowItemModal(false);
      fetchInventory();
    } catch (err: any) {
      console.error('Error saving item:', err);
      toast.error('Error al guardar el item: ' + err.message);
    } finally {
      setSavingItem(false);
    }
  };

  const handleOpenDeleteModal = (item: UnifiedInventoryItem) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      if (deletingItem.type === 'product') {
        const { error } = await supabase
          .from('products')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', deletingItem.id);

        if (error) throw error;
        toast.success(`Producto "${deletingItem.name}" ocultado del catálogo.`);
      } else {
        const { error } = await supabase
          .from('inventory_items')
          .delete()
          .eq('id', deletingItem.id);

        if (error) throw error;
        toast.success(`Insumo "${deletingItem.name}" eliminado permanentemente.`);
      }

      setShowDeleteModal(false);
      setDeletingItem(null);
      fetchInventory();
    } catch (err: any) {
      console.error('Error deleting item:', err);
      toast.error('Error al eliminar el item: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

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
      
      fetchInventory();
    } catch (err: any) {
      console.error('Error saving adjustment:', err);
      toast.error('Error al guardar el ajuste en Supabase.');
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cream text-stone-700 border border-coffee/10 hover:border-coffee/20 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <button 
              onClick={() => {
                if (items.length > 0) {
                  setSelectedItemId(items[0]?.id);
                }
                setAdjustmentType('Ingreso');
                setQuantity(0);
                setReason('');
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cream text-stone-700 border border-coffee/10 hover:border-coffee/20 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer"
            >
              <ArrowUpDown size={14} className="text-coffee" />
              Ajustar Stock
            </button>
            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-transparent"
            >
              <Plus size={14} />
              Nuevo Item
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
                  <th className="pb-3 font-semibold text-center w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {items.map((item) => {
                  const isCritical = item.stock <= item.stock_min;
                  const isOut = item.stock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 font-bold text-stone-850 flex flex-col">
                        <span>{item.name}</span>
                        {item.description && (
                          <span className="text-[10px] text-stone-400 font-normal mt-0.5 line-clamp-1">{item.description}</span>
                        )}
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
                      <td className="py-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 rounded-lg text-stone-400 hover:text-coffee hover:bg-stone-100 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(item)}
                            className="p-1 rounded-lg text-stone-400 hover:text-red-650 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Ajuste Rápido de Stock */}
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
                <ArrowUpDown size={16} className="text-gold" />
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

      {/* Modal: Crear / Editar Item */}
      <AnimatePresence>
        {showItemModal && (
          <div className="fixed inset-0 bg-stone-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-coffee/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative text-left"
            >
              <button
                onClick={() => setShowItemModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5 mb-1">
                {editingItem ? <Edit size={16} className="text-gold" /> : <Plus size={16} className="text-gold" />}
                {editingItem ? 'Editar Existencia' : 'Añadir Nueva Existencia'}
              </h3>
              <p className="text-[10px] text-stone-400 font-medium mb-4 border-b border-stone-50 pb-2">
                Agrega o modifica los insumos de materia prima o productos físicos en tu sistema.
              </p>

              <form onSubmit={handleSaveItem} className="space-y-4">
                {/* Type selection */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                    Tipo de Existencia
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={!!editingItem}
                      onClick={() => handleTypeChange('insumo')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        itemType === 'insumo'
                          ? 'bg-blue-50/70 border-blue-200 text-blue-800'
                          : 'bg-stone-50 border-stone-100 text-stone-450 hover:bg-stone-100'
                      } ${editingItem ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      Insumo / Materia Prima
                    </button>
                    <button
                      type="button"
                      disabled={!!editingItem}
                      onClick={() => handleTypeChange('product')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                        itemType === 'product'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-800'
                          : 'bg-stone-50 border-stone-100 text-stone-450 hover:bg-stone-100'
                      } ${editingItem ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      Producto de Cafetería
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder={itemType === 'insumo' ? 'E.g. Leche Entera, Café Verde' : 'E.g. Capuccino Fresa, Muffin'}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                  />
                </div>

                {/* Category & Unit (Conditional) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Categoría *
                    </label>
                    {itemType === 'insumo' ? (
                      <select
                        required
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-850 font-bold focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee cursor-pointer"
                      >
                        <option value="" disabled>Selecciona...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        required
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white text-stone-850 font-bold focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee cursor-pointer"
                      >
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Unidad de Medida
                    </label>
                    <input
                      type="text"
                      required
                      disabled={itemType === 'product'}
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      placeholder="E.g. unidades, kg, litros"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee disabled:bg-stone-50 disabled:text-stone-400 disabled:border-stone-150"
                    />
                  </div>
                </div>

                {/* Stock values & Price */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Stock Actual
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={itemStock}
                      onChange={(e) => setItemStock(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={itemStockMin}
                      onChange={(e) => setItemStockMin(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                      Precio Ref. ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min={0}
                      value={itemPrice}
                      onChange={(e) => setItemPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="Detalles sobre el uso, proveedor o características del item..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-850 focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:border-coffee resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2.5 pt-2 border-t border-stone-50">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
                    className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-650 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingItem}
                    className="flex-1 py-2 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {savingItem ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {savingItem ? 'Guardando...' : 'Guardar Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirmación de Eliminación */}
      <AnimatePresence>
        {showDeleteModal && deletingItem && (
          <div className="fixed inset-0 bg-stone-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-coffee/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative text-left"
            >
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5 mb-2">
                <Trash2 size={16} className="text-red-650" />
                ¿Eliminar existencia?
              </h3>
              
              <div className="text-xs text-stone-600 mb-5 space-y-2">
                <p>
                  Estás a punto de eliminar <strong>"{deletingItem.name}"</strong> de tu inventario.
                </p>
                {deletingItem.type === 'product' ? (
                  <p className="bg-amber-50 border border-amber-100 text-amber-800 p-2.5 rounded-xl text-[10px] leading-relaxed">
                    <strong>Nota:</strong> Como este es un producto de tienda, esta acción lo ocultará del catálogo para que no sea visible al público (soft-delete).
                  </p>
                ) : (
                  <p className="bg-red-50 border border-red-100 text-red-750 p-2.5 rounded-xl text-[10px] leading-relaxed">
                    <strong>Advertencia:</strong> Este insumo de materia prima será eliminado permanentemente del sistema de inventario.
                  </p>
                )}
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingItem(null);
                  }}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-650 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteItem}
                  disabled={deleting}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {deleting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  {deleting ? 'Eliminando...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

