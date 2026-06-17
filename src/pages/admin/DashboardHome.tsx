import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import { 
  Store, DollarSign, ArrowUpRight, ArrowDownRight, Layers, Clock, ShoppingCart, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Bar, ComposedChart
} from 'recharts';
import { ChartSkeleton } from '../../components/common/Skeletons';

// Custom tooltip for Cruce Ventas vs Pedidos
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary text-stone-100 border border-white/10 px-3.5 py-2.5 rounded-xl shadow-xl text-xs font-semibold font-sans text-left">
        <p className="font-bold text-gold mb-1.5">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 mt-0.5 justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color || '#c8922a' }}></div>
              <span className="text-stone-300 capitalize">{item.name}:</span>
            </div>
            <span className="font-mono font-bold text-white ml-4">
              {item.name === 'Ventas' ? `$${item.value.toFixed(2)}` : `${item.value} Pedidos`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardHome() {
  const { user, firstName } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('month');
  
  const [stats, setStats] = useState({
    customersCount: 0,
    newCustomersCount: 0,
    productsCount: 0,
    ordersCount: 0,
    pendingOrdersCount: 0,
    totalSales: 0,
    todaySales: 0,
    yesterdaySales: 0,
    pctChangeToday: 0,
    monthSales: 0,
    ticketAverage: 0,
    lowStockCount: 0,
    topProduct: 'Ninguno'
  });

  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update chart data whenever timeFilter or rawOrders change
  useEffect(() => {
    if (rawOrders.length > 0) {
      setSalesData(computeSalesData(rawOrders, timeFilter));
    }
  }, [timeFilter, rawOrders]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [profilesRes, newCustomersRes, productsRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('products').select('*'),
        supabase.from('orders').select('*, order_items(*, products(*))'),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      setRawOrders(orders);
      setRawProducts(products);

      const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed');
      const totalSales = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      // Today sales
      const todayStr = new Date().toDateString();
      const todaySales = paidOrders
        .filter(o => new Date(o.created_at).toDateString() === todayStr)
        .reduce((sum, o) => sum + (o.total || 0), 0);

      // Yesterday sales
      const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      const yesterdaySales = paidOrders
        .filter(o => new Date(o.created_at).toDateString() === yesterdayStr)
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const pctChangeToday = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;

      // Current month sales
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthSales = paidOrders
        .filter(o => {
          const d = new Date(o.created_at);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, o) => sum + (o.total || 0), 0);

      // Ticket average
      const ticketAverage = paidOrders.length > 0 ? (totalSales / paidOrders.length) : 0;

      // Pedidos pendientes
      const pendingOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;

      // Low stock count
      const lowStockCount = products.filter(p => (p.stock ?? 0) <= (p.stock_min ?? 5)).length;

      // Top product
      const productSalesMap: Record<string, number> = {};
      paidOrders.forEach(o => {
        o.order_items?.forEach((item: any) => {
          const pName = item.products?.name || 'Otro';
          productSalesMap[pName] = (productSalesMap[pName] || 0) + (item.quantity || 0);
        });
      });
      
      let topProduct = 'Ninguno';
      let maxQty = 0;
      Object.entries(productSalesMap).forEach(([name, qty]) => {
        if (qty > maxQty) {
          maxQty = qty;
          topProduct = name;
        }
      });

      setStats({
        customersCount: profilesRes.count || 0,
        newCustomersCount: newCustomersRes.count || 0,
        productsCount: products.length,
        ordersCount: orders.length,
        pendingOrdersCount,
        totalSales,
        todaySales,
        yesterdaySales,
        pctChangeToday,
        monthSales,
        ticketAverage,
        lowStockCount,
        topProduct
      });

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const computeSalesData = (ordersList: any[], filter: 'today' | 'week' | 'month' | 'year') => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const paidOrders = ordersList.filter(o => o.status === 'paid' || o.status === 'completed');

    if (filter === 'today') {
      const hourlySales: Record<string, { Ventas: number; Pedidos: number }> = {};
      const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
      hours.forEach(h => { hourlySales[h] = { Ventas: 0, Pedidos: 0 }; });

      const todayStr = new Date().toDateString();
      paidOrders.filter(o => new Date(o.created_at).toDateString() === todayStr).forEach(o => {
        const date = new Date(o.created_at);
        const hour = date.getHours();
        let slot = '20:00';
        if (hour < 10) slot = '08:00';
        else if (hour < 12) slot = '10:00';
        else if (hour < 14) slot = '12:00';
        else if (hour < 16) slot = '14:00';
        else if (hour < 18) slot = '16:00';
        else if (hour < 20) slot = '18:00';
        
        hourlySales[slot].Ventas += o.total || 0;
        hourlySales[slot].Pedidos += 1;
      });

      return Object.entries(hourlySales).map(([name, data]) => ({
        name,
        Ventas: Number(data.Ventas.toFixed(2)),
        Pedidos: data.Pedidos
      }));
    }

    if (filter === 'week') {
      const weeklySales: Record<string, { Ventas: number; Pedidos: number }> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        weeklySales[weekdays[d.getDay()]] = { Ventas: 0, Pedidos: 0 };
      }

      paidOrders.forEach(o => {
        const date = new Date(o.created_at);
        const dayName = weekdays[date.getDay()];
        if (weeklySales[dayName] !== undefined) {
          const diffTime = Math.abs(today.getTime() - date.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) {
            weeklySales[dayName].Ventas += o.total || 0;
            weeklySales[dayName].Pedidos += 1;
          }
        }
      });

      return Object.entries(weeklySales).map(([name, data]) => ({
        name,
        Ventas: Number(data.Ventas.toFixed(2)),
        Pedidos: data.Pedidos
      }));
    }

    if (filter === 'month') {
      const monthlySales: Record<string, { Ventas: number; Pedidos: number }> = {};
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        monthlySales[months[d.getMonth()]] = { Ventas: 0, Pedidos: 0 };
      }

      paidOrders.forEach(o => {
        const date = new Date(o.created_at);
        const mName = months[date.getMonth()];
        if (monthlySales[mName] !== undefined) {
          monthlySales[mName].Ventas += o.total || 0;
          monthlySales[mName].Pedidos += 1;
        }
      });

      return Object.entries(monthlySales).map(([name, data]) => ({
        name,
        Ventas: Number(data.Ventas.toFixed(2)),
        Pedidos: data.Pedidos
      }));
    }

    if (filter === 'year') {
      const annualSales: Record<string, { Ventas: number; Pedidos: number }> = {};
      const today = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        annualSales[months[d.getMonth()]] = { Ventas: 0, Pedidos: 0 };
      }

      paidOrders.forEach(o => {
        const date = new Date(o.created_at);
        const mName = months[date.getMonth()];
        if (annualSales[mName] !== undefined) {
          annualSales[mName].Ventas += o.total || 0;
          annualSales[mName].Pedidos += 1;
        }
      });

      return Object.entries(annualSales).map(([name, data]) => ({
        name,
        Ventas: Number(data.Ventas.toFixed(2)),
        Pedidos: data.Pedidos
      }));
    }

    return [];
  };

  const getTimelineEvents = (ordersList: any[], productsList: any[]) => {
    const events: any[] = [];
    const sortedOrders = [...ordersList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    sortedOrders.slice(0, 4).forEach(o => {
      const time = new Date(o.created_at).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date(o.created_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
      events.push({
        id: `order-${o.id}`,
        type: 'order',
        title: `Pedido #${o.id.substring(0, 4).toUpperCase()} Recibido`,
        description: `Cliente: ${o.customer_name} por $${o.total.toFixed(2)} (${o.payment_method === 'card' ? 'Online' : 'Transferencia'})`,
        time: `${dateStr}, ${time}`,
        timestamp: new Date(o.created_at).getTime()
      });
    });

    productsList.filter(p => (p.stock ?? 0) <= (p.stock_min ?? 5)).slice(0, 2).forEach(p => {
      events.push({
        id: `stock-${p.id}`,
        type: 'stock',
        title: `Alerta: Stock Bajo`,
        description: `El insumo "${p.name}" cuenta con apenas ${p.stock} unidades en vitrina.`,
        time: `Crítico`,
        timestamp: Date.now() - 1000
      });
    });

    events.sort((a, b) => b.timestamp - a.timestamp);

    if (events.length === 0) {
      events.push(
        { id: 'mock-1', type: 'order', title: 'Pedido #A02B Recibido', description: 'Cliente: Ana de Castro. Total: $24.50', time: 'Hoy, 15:20', timestamp: Date.now() },
        { id: 'mock-2', type: 'stock', title: 'Alerta: Stock Bajo', description: 'El producto "Croissant de Almendras" tiene 3 unidades.', time: 'Hoy, 12:30', timestamp: Date.now() - 3600000 },
        { id: 'mock-3', type: 'order', title: 'Pedido #B19F Completado', description: 'Cliente: Carlos Mendoza. Total: $12.00', time: 'Ayer, 18:15', timestamp: Date.now() - 86400000 }
      );
    }

    return events.slice(0, 6);
  };

  const displayName = firstName ? `${firstName}` : user?.email?.split('@')[0] || 'Administrador';
  const timelineEvents = getTimelineEvents(rawOrders, rawProducts);

  return (
    <div className="space-y-6 text-left animate-fadeIn font-sans">
      
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-br from-[#021a54] via-[#021a54]/95 to-primary/80 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center border border-white/5">
        <div className="absolute right-0 bottom-0 opacity-5 flex items-center justify-center pointer-events-none -mr-8 -mb-8 select-none">
          <Layers size={240} />
        </div>
        <div className="relative z-10 space-y-2.5">
          <span className="inline-flex bg-gold/20 text-gold border border-gold/30 px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider leading-none select-none">
            Consola de Operaciones Rose Coffee
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            ¡Bienvenido de vuelta, {displayName}!
          </h1>
          <p className="text-stone-300 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
            Aquí tienes el resumen ejecutivo en tiempo real de tu tienda. Supervisa ingresos diarios, estados de pedidos pendientes y niveles de insumos.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Ventas Hoy */}
        <div className="bg-white rounded-2xl border border-coffee/10 p-5 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <DollarSign size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Ventas de Hoy</span>
            {loading ? (
              <div className="h-5 w-16 bg-stone-100 animate-pulse rounded mt-1"></div>
            ) : (
              <div className="truncate">
                <span className="text-xl font-extrabold text-stone-900 tracking-tight">${stats.todaySales.toFixed(2)}</span>
                <span className={`text-[9px] font-bold flex items-center gap-0.5 mt-0.5 ${stats.pctChangeToday >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.pctChangeToday >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {stats.pctChangeToday.toFixed(1)}% vs. ayer
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pedidos Pendientes */}
        <div className="bg-white rounded-2xl border border-coffee/10 p-5 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50/80 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <ShoppingCart size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pendientes</span>
            {loading ? (
              <div className="h-5 w-16 bg-stone-100 animate-pulse rounded mt-1"></div>
            ) : (
              <div>
                <span className="text-xl font-extrabold text-stone-900 tracking-tight">{stats.pendingOrdersCount}</span>
                <span className="text-[9px] text-gray-400 block font-semibold mt-0.5">Pedidos activos</span>
              </div>
            )}
          </div>
        </div>

        {/* Clientes Nuevos */}
        <div className="bg-white rounded-2xl border border-coffee/10 p-5 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-650 border border-purple-100 flex items-center justify-center shrink-0">
            <UserPlus size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Clientes Nuevos</span>
            {loading ? (
              <div className="h-5 w-16 bg-stone-100 animate-pulse rounded mt-1"></div>
            ) : (
              <div>
                <span className="text-xl font-extrabold text-stone-900 tracking-tight">+{stats.newCustomersCount}</span>
                <span className="text-[9px] text-gray-400 block font-semibold mt-0.5">Últimos 7 días</span>
              </div>
            )}
          </div>
        </div>

        {/* Alertas de Stock */}
        <div className="bg-white rounded-2xl border border-coffee/10 p-5 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
            stats.lowStockCount > 0 ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 'bg-stone-50 text-stone-500 border-stone-200/50'
          }`}>
            <Store size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Stock Crítico</span>
            {loading ? (
              <div className="h-5 w-16 bg-stone-100 animate-pulse rounded mt-1"></div>
            ) : (
              <div>
                <span className={`text-xl font-extrabold tracking-tight ${stats.lowStockCount > 0 ? 'text-amber-600' : 'text-stone-900'}`}>{stats.lowStockCount}</span>
                <span className="text-[9px] text-gray-400 block font-semibold mt-0.5 truncate" title={`Top: ${stats.topProduct}`}>
                  Bajo el mínimo
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Content Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales vs Orders composed chart (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white border border-coffee/10 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="font-sans font-extrabold text-sm text-stone-950 flex items-center gap-1.5">
              <Layers size={15} className="text-gold" />
              Cruce: Ventas ($) vs. Pedidos Recibidos
            </h3>
            
            {/* Filter tabs */}
            <div className="flex bg-stone-100 border border-stone-200/50 p-1 rounded-xl gap-1 text-[10px] font-bold select-none self-start sm:self-auto">
              {(['today', 'week', 'month', 'year'] as const).map(filterKey => (
                <button
                  key={filterKey}
                  onClick={() => setTimeFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-lg capitalize cursor-pointer transition-all ${
                    timeFilter === filterKey 
                      ? 'bg-white text-stone-900 shadow-2xs font-extrabold' 
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {filterKey === 'today' ? 'Hoy' : filterKey === 'week' ? 'Semana' : filterKey === 'month' ? 'Mes' : 'Año'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 mt-2">
            {loading ? (
              <ChartSkeleton />
            ) : salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={salesData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSalesComposed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6b3a0e" stopOpacity={0.35}/>
                      <stop offset="100%" stopColor="#6b3a0e" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#faf2e7" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#78716c', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#78716c', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#78716c', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="Ventas" 
                    stroke="#6b3a0e" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorSalesComposed)" 
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="Pedidos" 
                    fill="#021a54" 
                    fillOpacity={0.8}
                    radius={[3, 3, 0, 0]} 
                    barSize={16}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400 font-medium">Sin registros para el filtro seleccionado</div>
            )}
          </div>
        </div>

        {/* Timeline activity Feed (Right 1 col) */}
        <div className="bg-white border border-coffee/10 rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-sans font-extrabold text-stone-950 text-sm border-b border-stone-100 pb-3 flex items-center gap-2">
              <Clock size={15} className="text-gold" />
              Actividad Reciente
            </h3>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar-dark pr-1">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-3 items-start">
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-200 mt-1"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-stone-200 rounded w-2/3"></div>
                        <div className="h-2 bg-stone-100 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                timelineEvents.map((evt, idx) => {
                  const isStockAlert = evt.type === 'stock';

                  return (
                    <div key={evt.id || idx} className="flex gap-3 items-start relative text-left">
                      {/* Left timeline circle dot indicator */}
                      <div className="relative mt-1">
                        <span className={`w-2.5 h-2.5 rounded-full block border-2 bg-white ${
                          isStockAlert ? 'border-amber-500 shadow-[0_0_8px_rgba(217,119,6,0.4)]' : 'border-primary'
                        }`} />
                        {idx < timelineEvents.length - 1 && (
                          <span className="w-0.5 bg-stone-100 absolute top-2.5 left-1 -bottom-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <p className={`text-[11px] font-bold truncate ${isStockAlert ? 'text-amber-700' : 'text-stone-850'}`}>
                            {evt.title}
                          </p>
                          <span className="text-[9px] text-stone-400 shrink-0 font-mono font-medium">{evt.time}</span>
                        </div>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed font-medium">
                          {evt.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100">
            <Link 
              to="/admin/pedidos"
              className="text-[10px] font-bold text-coffee hover:text-coffee-dark hover:underline flex items-center justify-center gap-1 uppercase tracking-wider"
            >
              Ver todos los pedidos
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

