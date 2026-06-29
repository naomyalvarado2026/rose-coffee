/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { useConfirmStore } from '../../store/useConfirmStore';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp } from '../../utils/animations';
import AdminHeader from '../../components/admin/AdminHeader';
import { Plus, Package, ClipboardList } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import ProductFormPanel, { type DbProduct } from '../../components/admin/store/ProductForm';
import ProductsTable from '../../components/admin/store/ProductsTable';
import OrdersTable from '../../components/admin/store/OrdersTable';
import OrderDetailModal from '../../components/admin/store/OrderDetailModal';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getPlainDescription = (desc: string | null) => {
  if (!desc) return '';
  if (desc.trim().startsWith('[')) {
    try {
      const blocks = JSON.parse(desc);
      if (Array.isArray(blocks)) {
        return blocks.map((b: any) => b.text || b.title || '').filter(Boolean).join(' ').replace(/<[^>]*>/g, '');
      }
    } catch { /* fallback */ }
  }
  return desc.replace(/<[^>]*>/g, '');
};

// ── Component ────────────────────────────────────────────────────────────────
const StoreManager = () => {
  const confirm = useConfirmStore((state) => state.confirm);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Products
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts((data || []) as DbProduct[]);
    } catch (err: any) {
      toast.error('Error al cargar productos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items (*, products (*), product_variants (*))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (err: any) {
      toast.error('Error al cargar pedidos: ' + err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { if (activeTab === 'orders') fetchOrders(); }, [activeTab]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleOpenEdit = async (product: DbProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Ocultar producto',
      message: '¿Estás seguro de ocultar este producto de la tienda pública?',
      confirmText: 'Ocultar',
      cancelText: 'Cancelar',
      variant: 'warning',
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.from('products').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      toast.success('Producto ocultado con éxito.');
      fetchProducts();
    } catch (err: any) {
      toast.error('No se pudo ocultar el producto: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('products').update({ deleted_at: null }).eq('id', id);
      if (error) throw error;
      toast.success('Producto restaurado con éxito.');
      fetchProducts();
    } catch (err: any) {
      toast.error('No se pudo restaurar el producto: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleHardDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Eliminar producto definitivamente',
      message: '¿Estás completamente seguro? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar Definitivamente',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await supabase.from('product_digital_assets').delete().eq('product_id', id);
      await supabase.from('product_variants').delete().eq('product_id', id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        if (error.code === '23503') throw new Error('Este producto ya tiene pedidos asociados y no puede eliminarse. Por favor, solo ocúltalo.');
        throw error;
      }
      toast.success('Producto eliminado permanentemente.');
      fetchProducts();
    } catch (err: any) {
      toast.error('No se pudo eliminar el producto: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      toast.success(`Pedido actualizado a: ${newStatus}`);
      fetchOrders();
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      toast.error('Error al actualizar el estado: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveTransfer = async (order: Order) => {
    const hasPhysical = order.order_items?.some((item: any) => item.products?.type === 'physical');
    if (hasPhysical) {
      const changeStatus = await confirm({
        title: 'Productos físicos detectados',
        message: '¿Quieres marcarlo directamente como "Listo para Retirar"?',
        confirmText: 'Sí, cambiar',
        cancelText: 'No, mantener Pagado',
        variant: 'info',
      });
      if (changeStatus) { await handleUpdateOrderStatus(order.id, 'ready_for_pickup'); return; }
    }
    await handleUpdateOrderStatus(order.id, 'paid');
  };

  const handleSeedProducts = async () => {
    setActionLoading(true);
    const demos = [
      { name: 'Café de Especialidad Bourbon Rosado', description: 'Variedad exótica. Notas a fresa y flores blancas.', price: 18.50, image_url: '/rose-coffee/products/cafe_bourbon.webp', cover_image_url: '/rose-coffee/products/cafe_bourbon.webp', stock: 30, category: 'Café', type: 'physical' },
      { name: 'Cheesecake Artesanal de Frutos Rojos', description: 'Base crujiente y mermelada casera.', price: 4.50, image_url: '/rose-coffee/products/cheesecake_frutos.webp', cover_image_url: '/rose-coffee/products/cheesecake_frutos.webp', stock: 15, category: 'Panadería', type: 'physical' },
    ];
    try {
      for (const prod of demos) {
        const { error } = await supabase.from('products').insert([prod]);
        if (error) throw error;
      }
      toast.success('Productos de prueba añadidos.');
      fetchProducts();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const pendingTransferCount = orders.filter(o => o.status === 'pending_payment' && o.payment_method === 'transfer').length;

  return (
    <motion.div initial="initial" animate="animate" variants={fadeInUp} className="space-y-6 max-w-6xl">
      <AdminHeader
        title="Gestor de la Tienda"
        description="Administra los productos, recursos digitales y realiza el despacho de pedidos."
        action={
          !showForm && activeTab === 'products' && (
            <div className="flex gap-2">
              <button
                onClick={handleOpenCreate}
                className="bg-primary hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-all cursor-pointer animate-fade-in"
              >
                <Plus size={16} />
                Nuevo Producto
              </button>
            </div>
          )
        }
      />

      {/* Tabs */}
      {!showForm && (
        <div className="flex border-b border-gray-250 dark:border-stone-700">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'products' ? 'border-primary text-primary dark:text-white font-bold' : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-primary dark:hover:text-blue-400'
            }`}
          >
            <Package size={16} />
            Productos / Recursos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'orders' ? 'border-primary text-primary dark:text-white font-bold' : 'border-transparent text-gray-500 dark:text-stone-400 hover:text-primary dark:hover:text-blue-400'
            }`}
          >
            <ClipboardList size={16} />
            Pedidos y Despacho
            {pendingTransferCount > 0 && (
              <span className="bg-amber-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {pendingTransferCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {showForm ? (
          <ProductFormPanel
            key="form"
            editingProduct={editingProduct}
            onSave={() => { setShowForm(false); fetchProducts(); }}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div key="tabs">
            {activeTab === 'products' ? (
              <ProductsTable
                products={products}
                loading={loading}
                actionLoading={actionLoading}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onHardDelete={handleHardDelete}
                onSeedProducts={handleSeedProducts}
                getPlainDescription={getPlainDescription}
              />
            ) : (
              <OrdersTable
                orders={orders}
                loading={ordersLoading}
                onSelect={setSelectedOrder}
              />
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            actionLoading={actionLoading}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleUpdateOrderStatus}
            onApproveTransfer={handleApproveTransfer}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoreManager;
