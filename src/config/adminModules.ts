import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  Package,
  Users,
  Percent,
  ChefHat,
  FileText,
  Layers,
  LineChart,
  Settings
} from 'lucide-react';

export interface AdminModule {
  id: string;      // Permission key used in Database (e.g. 'dashboard', 'products', 'pages', etc.)
  label: string;   // Display name for the Permissions Matrix / RBAC GUI
  name: string;    // Display name for the Sidebar item
  path: string;    // Router path (e.g. '/admin/productos')
  icon: React.ComponentType<{ size?: number }>; // Lucide Icon component
}

export const ADMIN_MODULES: AdminModule[] = [
  {
    id: 'dashboard',
    label: 'Resumen (Dashboard)',
    name: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard
  },
  {
    id: 'products',
    label: 'Pedidos',
    name: 'Pedidos',
    path: '/admin/pedidos',
    icon: ClipboardList
  },
  {
    id: 'products',
    label: 'Productos',
    name: 'Productos',
    path: '/admin/productos',
    icon: Store
  },
  {
    id: 'products',
    label: 'Inventario',
    name: 'Inventario',
    path: '/admin/inventario',
    icon: Package
  },
  {
    id: 'products',
    label: 'Clientes',
    name: 'Clientes',
    path: '/admin/clientes',
    icon: Users
  },
  {
    id: 'pages',
    label: 'Marketing & Rose Club',
    name: 'Marketing & Club',
    path: '/admin/marketing',
    icon: Percent
  },
  {
    id: 'products',
    label: 'Producción',
    name: 'Producción',
    path: '/admin/produccion',
    icon: ChefHat
  },
  {
    id: 'pages',
    label: 'Editor Web',
    name: 'Editor Web',
    path: '/admin/paginas',
    icon: FileText
  },
  {
    id: 'ar_manager',
    label: 'Gestor AR 3D',
    name: 'Gestor AR 3D',
    path: '/admin/ar',
    icon: Layers
  },
  {
    id: 'analytics',
    label: 'Analítica',
    name: 'Analítica',
    path: '/admin/analitica',
    icon: LineChart
  },
  {
    id: 'settings',
    label: 'Configuración',
    name: 'Configuración',
    path: '/admin/configuracion',
    icon: Settings
  }
];

