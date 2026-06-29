import { motion } from 'framer-motion';
import { Loader2, ClipboardList, Eye, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import type { Order } from '../../../types';

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onSelect: (order: Order) => void;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending_payment':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={12} />
          Esperando Pago
        </span>
      );
    case 'paid':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-250">
          <CheckCircle2 size={12} />
          Pagado
        </span>
      );
    case 'ready_for_pickup':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-250">
          <Truck size={12} />
          Listo para Retirar
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:border-stone-700">
          <CheckCircle2 size={12} />
          Entregado
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <AlertCircle size={12} />
          Cancelado
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-150 text-gray-700">
          {status}
        </span>
      );
  }
}

export default function OrdersTable({ orders, loading, onSelect }: OrdersTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white dark:bg-stone-800 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-xs">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-stone-800 rounded-2xl border border-dashed border-gray-250 shadow-xs">
        <ClipboardList className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-lg font-sans font-bold text-gray-700 dark:text-stone-300">Sin pedidos registrados</h3>
        <p className="text-gray-400 text-sm mt-1 font-medium">Las compras de los clientes se reflejarán aquí de forma automática.</p>
      </div>
    );
  }

  return (
    <motion.div
      key="list-orders"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-stone-900 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-150 dark:border-stone-700">
                <th className="py-4 px-6">Código de Pedido</th>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Método Pago</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-stone-700 text-sm text-gray-750 dark:text-stone-300">
              {orders.map((order) => {
                const isPendingTransfer = order.status === 'pending_payment' && order.payment_method === 'transfer';
                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50/50 dark:hover:bg-stone-700/30 transition-colors ${isPendingTransfer ? 'bg-amber-50/15' : ''}`}
                  >
                    <td className="py-4 px-6 font-mono font-bold text-gray-800 dark:text-stone-200">
                      #{order.id.slice(0, 8).toUpperCase()}
                      {isPendingTransfer && (
                        <span className="ml-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          Por Verificar
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-bold text-gray-800 dark:text-stone-200 block">{order.customer_name}</span>
                        <span className="text-xs text-gray-400 block">{order.customer_email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium">
                      <span className="capitalize">{order.payment_method === 'transfer' ? 'Transferencia' : 'Tarjeta'}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-primary">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs font-semibold">
                      {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onSelect(order)}
                        className="inline-flex items-center gap-1 text-primary hover:text-gold text-xs font-bold transition-all cursor-pointer"
                      >
                        <Eye size={14} />
                        Gestionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
