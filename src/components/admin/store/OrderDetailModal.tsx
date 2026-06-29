/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle2, Truck, Loader2, Clock, AlertCircle } from 'lucide-react';
import type { Order, OrderStatus } from '../../../types';

interface OrderDetailModalProps {
  order: Order;
  actionLoading: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onApproveTransfer: (order: Order) => void;
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

export default function OrderDetailModal({ order, actionLoading, onClose, onStatusChange, onApproveTransfer }: OrderDetailModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-stone-800 rounded-2xl border border-gray-100 dark:border-stone-700 shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-stone-900 border-b border-gray-150 dark:border-stone-700 flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-sans font-bold text-gray-800 dark:text-stone-200 text-lg">
                Pedido #{order.id.slice(0, 8).toUpperCase()}
              </h3>
              <span className="text-xs text-gray-400 font-medium font-mono">{order.id}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-stone-200 rounded-lg p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-grow">
            {/* Estado y Total */}
            <div className="flex justify-between items-center bg-slate-50/50 dark:bg-stone-900/50 p-3.5 rounded-xl border border-gray-150 dark:border-stone-700">
              <div>
                <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Estado Actual</span>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider text-right">Total Pedido</span>
                <span className="text-xl font-extrabold text-primary block mt-0.5">${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50/30 dark:bg-stone-900/30 p-4 rounded-xl border border-gray-100 dark:border-stone-700">
                <h4 className="font-bold text-sm text-gray-800 dark:text-stone-200 mb-2">Datos de Facturación</h4>
                <p className="text-xs text-gray-650 dark:text-stone-400">Nombre: <span className="font-semibold text-gray-800 dark:text-stone-200">{order.customer_name}</span></p>
                <p className="text-xs text-gray-650 dark:text-stone-400 mt-1">Email: <span className="font-semibold text-gray-800 dark:text-stone-200">{order.customer_email}</span></p>
              </div>
              <div className="bg-slate-50/30 dark:bg-stone-900/30 p-4 rounded-xl border border-gray-100 dark:border-stone-700">
                <h4 className="font-bold text-sm text-gray-800 dark:text-stone-200 mb-2">Método de Pago</h4>
                <p className="text-xs text-gray-650 dark:text-stone-400">Tipo: <span className="font-semibold text-gray-800 dark:text-stone-200 capitalize">{order.payment_method === 'transfer' ? 'Transferencia Bancaria' : 'Tarjeta de Crédito'}</span></p>
                {order.payment_method === 'transfer' && (
                  <p className="text-xs text-amber-700 mt-1 font-semibold">Requiere revisión manual de comprobante.</p>
                )}
              </div>
            </div>

            {/* Comprobante */}
            {order.payment_method === 'transfer' && order.payment_voucher_url && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-gray-800 dark:text-stone-200 flex items-center justify-between">
                  <span>Comprobante de Transferencia Subido:</span>
                  <a
                    href={order.payment_voucher_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-gold text-xs font-semibold"
                  >
                    <Download size={12} />
                    Ver a tamaño completo
                  </a>
                </h4>
                <div className="w-full max-h-56 rounded-xl overflow-hidden border border-gray-200 dark:border-stone-700 bg-slate-50 shadow-2xs relative group flex justify-center items-center">
                  <img
                    src={order.payment_voucher_url}
                    alt="Comprobante de Pago"
                    className="w-auto h-auto max-h-56 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Artículos */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-gray-800 dark:text-stone-200">Artículos Comprados:</h4>
              <div className="divide-y divide-gray-100 dark:divide-stone-700 border border-gray-150 dark:border-stone-700 rounded-xl overflow-hidden">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="p-3 bg-white dark:bg-stone-800 hover:bg-slate-50 dark:hover:bg-stone-700/50 flex items-center justify-between gap-4 text-xs font-medium text-gray-700 dark:text-stone-300">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.products?.cover_image_url || item.products?.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                        alt={item.products?.name}
                        className="w-10 h-10 rounded object-cover border border-gray-150 dark:border-stone-700 shadow-3xs"
                      />
                      <div>
                        <span className="font-bold text-gray-800 dark:text-stone-200 block">{item.products?.name}</span>
                        <div className="flex gap-2 items-center mt-0.5 text-[10px] text-gray-400">
                          <span className="capitalize">{item.products?.type === 'digital' ? 'Digital' : 'Físico'}</span>
                          {item.product_variants && (
                            <span>
                              - Variante: {item.product_variants.color_name ? `${item.product_variants.color_name} ` : ''}{item.product_variants.size ? `[Talla ${item.product_variants.size}]` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-gray-800 dark:text-stone-200">{item.quantity} x ${Number(item.price).toFixed(2)}</span>
                      <span className="block text-gray-450 text-[10px]">${(item.quantity * Number(item.price)).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Acciones */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-stone-900 border-t border-gray-150 dark:border-stone-700 flex flex-wrap gap-2 shrink-0">
            {actionLoading && <Loader2 className="animate-spin text-primary my-auto" size={16} />}
            {order.status === 'pending_payment' && order.payment_method === 'transfer' && (
              <button
                onClick={() => onApproveTransfer(order)}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCircle2 size={14} />
                Aprobar Pago
              </button>
            )}
            {order.status === 'paid' && (
              <button
                onClick={() => onStatusChange(order.id, 'ready_for_pickup')}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Truck size={14} />
                Listo para Retirar
              </button>
            )}
            {['paid', 'ready_for_pickup'].includes(order.status) && (
              <button
                onClick={() => onStatusChange(order.id, 'completed')}
                disabled={actionLoading}
                className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCircle2 size={14} />
                Entregar / Completar
              </button>
            )}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <button
                onClick={() => onStatusChange(order.id, 'cancelled')}
                disabled={actionLoading}
                className="border border-red-250 text-red-750 hover:bg-red-50 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors ml-auto"
              >
                Cancelar Pedido
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
