import { useState } from 'react';
import { Package, ShieldAlert, ArrowUpDown, Plus, RefreshCw, Layers } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';

const MOCK_INVENTORY = [
  { id: 1, name: 'Café Blend Rose (250g)', category: 'Café', stock: 42, stock_min: 10, unit: 'unidades', price: 9.50 },
  { id: 2, name: 'Café Origen Zaruma (500g)', category: 'Café', stock: 8, stock_min: 15, unit: 'unidades', price: 17.00 },
  { id: 3, name: 'Pan de Masa Madre Clásico', category: 'Panadería', stock: 15, stock_min: 10, unit: 'unidades', price: 4.50 },
  { id: 4, name: 'Croissant Almendras', category: 'Panadería', stock: 3, stock_min: 8, unit: 'unidades', price: 2.75 },
  { id: 5, name: 'Harina de Fuerza Orgánica', category: 'Insumos', stock: 120, stock_min: 50, unit: 'kg', price: 1.80 }
];

export default function InventoryManager() {
  const [items] = useState(MOCK_INVENTORY);

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <AdminHeader 
        title="Gestión de Inventario" 
        description="Supervisa y actualiza los niveles de materias primas y productos listos para la venta."
        action={
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-cream text-stone-700 border border-coffee/10 hover:border-coffee/20 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer">
              <RefreshCw size={14} />
              Sincronizar
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-coffee hover:bg-coffee-dark text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-transparent">
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
              <h4 className="text-xl font-extrabold text-stone-900 mt-0.5">5 Insumos</h4>
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
              <h4 className="text-xl font-extrabold text-red-600 mt-0.5">2 Productos</h4>
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
              <h4 className="text-xl font-extrabold text-stone-900 mt-0.5">$973.40</h4>
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
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider">
                <th className="pb-3 font-semibold">Producto/Insumo</th>
                <th className="pb-3 font-semibold">Categoría</th>
                <th className="pb-3 font-semibold">Stock Actual</th>
                <th className="pb-3 font-semibold">Mínimo Requerido</th>
                <th className="pb-3 font-semibold">Estado</th>
                <th className="pb-3 font-semibold text-right">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {items.map((item) => {
                const isCritical = item.stock <= item.stock_min;
                const isOut = item.stock === 0;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 font-bold text-stone-850">{item.name}</td>
                    <td className="py-4 text-stone-500 font-medium">{item.category}</td>
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
        </div>
      </div>
    </div>
  );
}
