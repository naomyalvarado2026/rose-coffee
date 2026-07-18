import { Home, Coffee, Users, Phone, Package, ShoppingBag, Gamepad2, Info } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  isVisible: boolean;
  order: number;
  requiresAuth?: boolean;
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'inicio', label: 'Inicio', path: '/', iconName: 'Home', isVisible: true, order: 1 },
  { id: 'nosotros', label: 'Nosotros', path: '/nosotros', iconName: 'Users', isVisible: true, order: 2 },
  { id: 'menu', label: 'Menú', path: '/menu', iconName: 'Coffee', isVisible: true, order: 3 },
  { id: 'productos', label: 'Productos', path: '/productos', iconName: 'Package', isVisible: true, order: 4 },
  { id: 'servicios', label: 'Servicios', path: '/servicios', iconName: 'Info', isVisible: true, order: 5 },
  { id: 'blog', label: 'Blog', path: '/blog', iconName: 'Coffee', isVisible: false, order: 6 }, // Hidden by default as requested
  { id: 'juegos', label: 'Juegos', path: '/juegos', iconName: 'Gamepad2', isVisible: true, order: 7 },
  { id: 'contacto', label: 'Contacto', path: '/contacto', iconName: 'Phone', isVisible: true, order: 8 }
];

export const getIconByName = (name: string) => {
  switch (name) {
    case 'Home': return Home;
    case 'Users': return Users;
    case 'Coffee': return Coffee;
    case 'Package': return Package;
    case 'ShoppingBag': return ShoppingBag;
    case 'Gamepad2': return Gamepad2;
    case 'Info': return Info;
    case 'Phone': return Phone;
    default: return Coffee;
  }
};
