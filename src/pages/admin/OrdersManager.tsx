import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { 
  RefreshCw, ChevronLeft, ChevronRight, XCircle, Search, Clock, Save
} from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import AdminHeader from '../../components/admin/AdminHeader';

const COLUMNS: { id: OrderStatus; label: string; color: string; bg: string }[] = [
  { id: 'pending_payment', label: 'Pago Pendiente', color: 'text-amber-700 dark:text-amber-500 border-amber-250 dark:border-amber-700/50', bg: 'bg-amber-50/40 dark:bg-amber-900/10' },
  { id: 'paid', label: 'Pagado', color: 'text-blue-700 dark:text-white border-blue-200 dark:border-blue-700/50', bg: 'bg-blue-50/40 dark:bg-blue-900/10' },
  { id: 'ready_for_pickup', label: 'Listo para Retiro', color: 'text-emerald-700 dark:text-emerald-500 border-emerald-200 dark:border-emerald-700/50', bg: 'bg-emerald-50/40 dark:bg-emerald-900/10' },
  { id: 'completed', label: 'Entregado', color: 'text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-700/50', bg: 'bg-stone-50/40 dark:bg-stone-800/40' }
];

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setOrders(data as Order[]);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      toast.error('Error al cargar pedidos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Pedido movido a ${newStatus}`);
    } catch (err: any) {
      console.error('Error updating order status:', err);
      toast.error('Error al actualizar estado: ' + err.message);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o));
      toast.success('Pedido cancelado.');
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      toast.error('Error al cancelar pedido: ' + err.message);
    }
  };

  const startEditingNotes = (order: Order) => {
    setEditingNotesId(order.id);
    setTempNotes(order.notes || '');
  };

  const handleSaveNotes = async (orderId: string) => {
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ notes: tempNotes })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, notes: tempNotes } : o));
      setEditingNotesId(null);
      toast.success('Notas actualizadas.');
    } catch (err: any) {
      console.error('Error saving notes:', err);
      toast.error('Error al guardar notas: ' + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Filter orders matching search
  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <AdminHeader 
          title="Gestión de Pedidos" 
          description="Monitorea y actualiza el estado de las compras en tiempo real mediante un flujo de trabajo Kanban."
        />
        
        <button
          type="button"
          onClick={fetchOrders}
          className="p-2.5 border border-slate-200 dark:border-stone-700 rounded-xl hover:bg-slate-100 dark:hover:bg-stone-700 text-slate-500 hover:text-slate-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors cursor-pointer bg-white dark:bg-stone-800"
          title="Recargar Pedidos"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Buscar por cliente, email o ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white dark:bg-stone-900 dark:text-white"
        />
        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
      </div>

      {/* Kanban Board Grid */}
      {loading && orders.length === 0 ? (
        <div className="flex justify-center items-center py-24">
          <Clock className="animate-spin text-primary mr-2" size={24} />
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Cargando pedidos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {COLUMNS.map((col) => {
            const colOrders = filteredOrders.filter(o => o.status === col.id);
            return (
              <div key={col.id} className={`rounded-2xl border border-slate-200 dark:border-stone-700/50 p-4 ${col.bg} flex flex-col min-h-[60vh]`}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-stone-700/60">
                  <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="bg-white dark:bg-stone-800 px-2 py-0.5 rounded-full text-[10px] font-black border border-slate-200 dark:border-stone-700/80 text-stone-500 shadow-xxs">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-4 flex-grow overflow-y-auto max-h-[65vh] pr-1">
                  {colOrders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-[10px] italic border border-dashed border-slate-200 dark:border-stone-700/85 rounded-xl bg-white dark:bg-stone-800/40">
                      Sin pedidos en este estado.
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const dateText = new Date(order.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      });

                      return (
                        <div 
                          key={order.id}
                          className="bg-white dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl p-4 shadow-xxs hover:shadow-xs transition-shadow space-y-3 relative text-left"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-stone-200 truncate max-w-[130px]">{order.customer_name}</h4>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <span className="text-[10px] font-extrabold text-coffee dark:text-gold-dark dark:text-gold tracking-tight">
                              ${Number(order.total).toFixed(2)}
                            </span>
                          </div>

                          {/* List items ordered */}
                          <div className="bg-stone-50 dark:bg-stone-900/50 rounded-lg p-2 text-[10px] text-slate-600 dark:text-stone-300 font-medium space-y-1">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="flex justify-between gap-1">
                                <span className="truncate max-w-[120px]">{item.quantity}x {item.products?.name || 'Producto'}</span>
                                <span className="text-slate-400 dark:text-stone-500 font-mono font-bold">${Number(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="text-[9px] text-slate-450 dark:text-stone-400 flex items-center gap-1 font-semibold">
                            <Clock size={10} />
                            <span>{dateText}</span>
                            <span className="bg-slate-100 dark:bg-stone-700 text-slate-500 dark:text-stone-300 px-1.5 py-0.5 rounded capitalize font-bold ml-auto">{order.payment_method}</span>
                          </div>

                          {/* Vouchar Link if transfer */}
                          {order.payment_voucher_url && (
                            <a 
                              href={order.payment_voucher_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[9px] text-primary hover:underline font-bold block bg-blue-50/60 dark:bg-blue-900/30 p-1.5 rounded border border-blue-100/50 dark:border-blue-800/50 text-center"
                            >
                              📂 Ver Comprobante de Pago
                            </a>
                          )}

                          {/* Notes Block */}
                          <div className="text-[10px] border-t border-slate-100 dark:border-stone-700 pt-2 space-y-1.5">
                            {editingNotesId === order.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={tempNotes}
                                  onChange={(e) => setTempNotes(e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-200 dark:border-stone-700 rounded text-[10px] focus:outline-none bg-transparent"
                                  placeholder="Agregar notas..."
                                />
                                <button
                                  disabled={savingNotes}
                                  onClick={() => handleSaveNotes(order.id)}
                                  className="p-1 bg-emerald-500 text-white rounded cursor-pointer"
                                  title="Guardar notas"
                                >
                                  <Save size={10} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-start gap-1 justify-between group">
                                <p className="text-slate-500 dark:text-stone-400 italic max-w-[140px] truncate">
                                  {order.notes ? `📝 ${order.notes}` : 'Sin notas de gestión.'}
                                </p>
                                <button
                                  onClick={() => startEditingNotes(order)}
                                  className="text-[9px] text-primary hover:underline cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                >
                                  Editar
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons for status change */}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-stone-700 gap-1.5">
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Cancelar pedido"
                            >
                              <XCircle size={12} />
                            </button>

                            <div className="flex items-center gap-1 ml-auto">
                              {col.id !== 'pending_payment' && (
                                <button
                                  onClick={() => {
                                    const prevIdx = COLUMNS.findIndex(c => c.id === col.id) - 1;
                                    handleUpdateStatus(order.id, COLUMNS[prevIdx].id);
                                  }}
                                  className="p-1.5 border border-slate-200 dark:border-stone-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                                  title="Mover al estado anterior"
                                >
                                  <ChevronLeft size={12} />
                                </button>
                              )}

                              {col.id !== 'completed' && (
                                <button
                                  onClick={() => {
                                    const nextIdx = COLUMNS.findIndex(c => c.id === col.id) + 1;
                                    handleUpdateStatus(order.id, COLUMNS[nextIdx].id);
                                  }}
                                  className="p-1.5 bg-primary hover:bg-blue-900 text-white rounded-lg transition-all cursor-pointer shadow-2xs"
                                  title="Mover al siguiente estado"
                                >
                                  <ChevronRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
