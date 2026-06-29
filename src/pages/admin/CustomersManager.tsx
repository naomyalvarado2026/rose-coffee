import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { 
  Search, RefreshCw, X
} from 'lucide-react';
import type { Order } from '../../types';
import AdminHeader from '../../components/admin/AdminHeader';

interface CustomerSummary {
  email: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastPurchaseAt: string;
  orders: Order[];
}

export default function CustomersManager() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Group orders by email (since user_id might be null for guest checkouts)
        const groups: Record<string, CustomerSummary> = {};
        
        data.forEach((order: any) => {
          const email = order.customer_email?.toLowerCase() || 'guest@rosecoffee.com';
          const name = order.customer_name || 'Cliente Invitado';
          
          if (!groups[email]) {
            groups[email] = {
              email,
              name,
              orderCount: 0,
              totalSpent: 0,
              lastPurchaseAt: order.created_at,
              orders: []
            };
          }
          
          groups[email].orderCount += 1;
          groups[email].totalSpent += Number(order.total) || 0;
          groups[email].orders.push(order as Order);
          
          // Ensure lastPurchaseAt is the most recent date
          if (new Date(order.created_at) > new Date(groups[email].lastPurchaseAt)) {
            groups[email].lastPurchaseAt = order.created_at;
          }
        });

        setCustomers(Object.values(groups).sort((a, b) => b.totalSpent - a.totalSpent));
      }
    } catch (err: any) {
      console.error('Error loading customers CRM:', err);
      toast.error('Error al cargar clientes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <AdminHeader 
          title="Gestor de Clientes (CRM)" 
          description="Visualiza el comportamiento de compra de tus clientes, total gastado y frecuencia de pedidos."
        />
        
        <button
          type="button"
          onClick={fetchCustomerData}
          className="p-2.5 border border-slate-200 dark:border-stone-700 rounded-xl hover:bg-slate-55 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer bg-white dark:bg-stone-800"
          title="Recargar Clientes"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Buscar por cliente o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-stone-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
      </div>

      {/* CRM Table */}
      {loading && customers.length === 0 ? (
        <div className="flex justify-center items-center py-24">
          <RefreshCw className="animate-spin text-primary mr-2" size={24} />
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Cargando clientes...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-slate-200 dark:border-stone-700 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-stone-700">
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Frecuencia</th>
                  <th className="p-4 text-right">Total Gastado</th>
                  <th className="p-4 text-right">Última Compra</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                      No se encontraron clientes registrados.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    const lastPurchaseDate = new Date(c.lastPurchaseAt).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    });

                    return (
                      <tr key={c.email} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-coffee/10 text-coffee dark:text-gold flex items-center justify-center font-bold text-xs">
                            {c.name[0]}
                          </div>
                          <div>
                            <span className="text-slate-800 dark:text-stone-200 font-bold block">{c.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 font-normal">{c.email}</td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-blue-100">
                            {c.orderCount} {c.orderCount === 1 ? 'Pedido' : 'Pedidos'}
                          </span>
                        </td>
                        <td className="p-4 text-right text-coffee dark:text-gold font-extrabold">
                          ${c.totalSpent.toFixed(2)}
                        </td>
                        <td className="p-4 text-right text-slate-500 font-normal">
                          {lastPurchaseDate}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="text-[10px] font-black uppercase text-primary hover:text-blue-900 px-3 py-1.5 border border-slate-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 hover:bg-slate-50 shadow-xxs transition-colors cursor-pointer"
                          >
                            Historial
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Purchase History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setSelectedCustomer(null)} />
          
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-stone-700 w-full max-w-2xl overflow-hidden relative z-10 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-stone-700 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coffee/10 text-coffee dark:text-gold flex items-center justify-center font-bold text-sm">
                  {selectedCustomer.name[0]}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800 dark:text-stone-200 text-sm leading-tight">{selectedCustomer.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-normal">{selectedCustomer.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex-grow overflow-y-auto space-y-4 text-left">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Historial de Compras</h4>
              
              <div className="space-y-3">
                {selectedCustomer.orders.map((order) => {
                  const oDate = new Date(order.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <div 
                      key={order.id}
                      className="border border-slate-200 dark:border-stone-700 rounded-xl p-4 space-y-2 hover:border-slate-300 transition-colors bg-stone-50/30"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono font-bold text-coffee dark:text-gold">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className="text-slate-400 text-[10px] ml-2 font-normal">{oDate}</span>
                        </div>
                        <span className="font-extrabold text-slate-800 dark:text-stone-200">${Number(order.total).toFixed(2)}</span>
                      </div>

                      {/* Items */}
                      <div className="bg-white dark:bg-stone-800 rounded-lg p-2.5 border border-slate-100 dark:border-stone-700 text-[10px] text-slate-650 font-medium space-y-1">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <span>{item.quantity}x {item.products?.name || 'Producto'}</span>
                            <span className="text-slate-400 font-mono font-bold">${Number(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-1">
                        <span>Método: {order.payment_method}</span>
                        <span className={`px-2 py-0.5 rounded capitalize ${
                          order.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
