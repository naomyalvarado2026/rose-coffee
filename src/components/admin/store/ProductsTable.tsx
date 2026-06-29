import { motion } from 'framer-motion';
import { Loader2, Package, Edit2, Trash2, Eye, EyeOff, Download, AlertCircle } from 'lucide-react';

interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  stock_min?: number | null;
  category: string;
  deleted_at?: string | null;
  type?: 'physical' | 'digital';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  features?: any;
  cover_image_url?: string | null;
  ar_model_url?: string | null;
  ar_poster_url?: string | null;
  created_at: string;
}

interface ProductsTableProps {
  products: DbProduct[];
  loading: boolean;
  actionLoading: boolean;
  onEdit: (product: DbProduct) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onHardDelete: (id: string) => void;
  onSeedProducts: () => void;
  getPlainDescription: (desc: string | null) => string;
}

export default function ProductsTable({
  products,
  loading,
  actionLoading,
  onEdit,
  onDelete,
  onRestore,
  onHardDelete,
  onSeedProducts,
  getPlainDescription,
}: ProductsTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white dark:bg-stone-800 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-xs">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-stone-800 rounded-2xl border border-dashed border-gray-200 dark:border-stone-700 shadow-xs">
        <Package className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-lg font-sans font-bold text-gray-700">No hay productos en catálogo</h3>
        <p className="text-gray-400 text-sm mt-1 font-medium">Comienza agregando un nuevo material de estudio o recurso.</p>
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.stock <= (p.stock_min ?? 5));

  return (
    <motion.div 
      key="list-products"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Alerta de Stock Bajo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 flex gap-3 items-start animate-fade-in">
          <AlertCircle className="text-amber-700 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-sans font-bold text-amber-800 dark:text-amber-500 text-sm">Alerta de Stock Mínimo o Crítico ({lowStockProducts.length})</h4>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5 font-medium">
              Los siguientes productos tienen existencias en o por debajo de su límite mínimo:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStockProducts.map(p => (
                <span key={p.id} className="inline-flex items-center gap-1 bg-white dark:bg-stone-800 border border-amber-250 dark:border-amber-700/50 rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-500 shadow-3xs">
                  {p.name}: <span className="font-bold">{p.stock === 0 ? '🔴 Agotado' : `🟡 ${p.stock} u. (mín. ${p.stock_min ?? 5})`}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-gray-150 dark:border-stone-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-stone-900/50 text-gray-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-150 dark:border-stone-700">
                <th className="py-4 px-6">Detalle</th>
                <th className="py-4 px-6">Categoría</th>
                <th className="py-4 px-6">Tipo</th>
                <th className="py-4 px-6">Precio Base</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-stone-700/50 text-sm text-gray-750 dark:text-stone-300">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-stone-700/30 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-4">
                    <img
                      src={product.cover_image_url || product.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-100 dark:border-stone-700 flex-shrink-0"
                    />
                    <div>
                      <span className="font-bold text-gray-800 dark:text-stone-200 block">{product.name}</span>
                      <span className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                        {getPlainDescription(product.description)}
                      </span>
                    </div>
                    {product.deleted_at && (
                      <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md">OCULTO</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-500 dark:text-stone-400 font-medium">{product.category}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      product.type === 'digital' 
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-700/50' 
                        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50'
                    }`}>
                      {product.type === 'digital' ? <Download size={10} /> : <Package size={10} />}
                      {product.type === 'digital' ? 'Digital' : 'Físico'}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-primary dark:text-white">${Number(product.price).toFixed(2)}</td>
                  <td className="py-4 px-6 font-medium">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      product.stock === 0 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                        : product.stock <= (product.stock_min ?? 5) 
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' 
                          : 'text-gray-700 dark:text-stone-400'
                    }`}>
                      {product.stock} u.
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(product)}
                        disabled={actionLoading}
                        className="p-1.5 text-gray-400 hover:text-primary dark:hover:text-blue-400 hover:bg-primary/5 dark:hover:bg-stone-700/50 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={15} />
                      </button>
                      {product.deleted_at ? (
                        <>
                          <button
                            onClick={() => onRestore(product.id)}
                            disabled={actionLoading}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-stone-700/50 rounded-lg transition-colors cursor-pointer"
                            title="Restaurar"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => onHardDelete(product.id)}
                            disabled={actionLoading}
                            className="p-1.5 text-gray-400 hover:text-accent-red dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-stone-700/50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar definitivamente"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onDelete(product.id)}
                          disabled={actionLoading}
                          className="p-1.5 text-gray-400 hover:text-accent-red dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-stone-700/50 rounded-lg transition-colors cursor-pointer"
                          title="Ocultar"
                        >
                          <EyeOff size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seed button */}
      <div className="text-center">
        <button
          onClick={onSeedProducts}
          disabled={actionLoading}
          className="text-[11px] text-gray-400 hover:text-primary font-medium transition-colors cursor-pointer"
        >
          + Agregar productos de prueba
        </button>
      </div>
    </motion.div>
  );
}
