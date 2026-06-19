import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'sonner';
import ScrollToTop from './components/common/ScrollToTop';
import ConfirmDialog from './components/common/ConfirmDialog';
import { PageTransition } from './components/animations/MotionWrappers';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Store from './pages/public/Store';
import Cart from './pages/public/Cart';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import MyPurchases from './pages/public/MyPurchases';
import ARShowcase from './pages/public/ARShowcase';
import ARMenuScanner from './pages/public/ARMenuScanner';
import ARShowroom from './pages/public/ARShowroom';
import ProductDetail from './pages/public/ProductDetail';
import BlogList from './pages/public/BlogList';
import BlogDetail from './pages/public/BlogDetail';

import DashboardHome from './pages/admin/DashboardHome';
import StoreManager from './pages/admin/StoreManager';
import LogosManager from './pages/admin/LogosManager';
import UsersManager from './pages/admin/UsersManager';
import PageEditor from './pages/admin/PageEditor';
import BlogManager from './pages/admin/BlogManager';
import AdminARManager from './pages/admin/AdminARManager';
import ARShowroomManager from './pages/admin/ARShowroomManager';
import OrdersManager from './pages/admin/OrdersManager';
import CustomersManager from './pages/admin/CustomersManager';
import InventoryManager from './pages/admin/InventoryManager';
import MarketingManager from './pages/admin/MarketingManager';
import ProductionManager from './pages/admin/ProductionManager';
import AnalyticsManager from './pages/admin/AnalyticsManager';
import SettingsManager from './pages/admin/SettingsManager';
import ProtectedRoute from './components/common/ProtectedRoute';
import ProjectPresentation from './pages/admin/ProjectPresentation';
import CustomCursor from './components/common/CustomCursor';


function App() {
  useEffect(() => {
    useAuthStore.getState().initializeAuth();
  }, []);



  return (
    <>
      <CustomCursor />
      <Toaster richColors position="top-right" />
      <ConfirmDialog />
      <BrowserRouter basename={import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/tienda" element={<PageTransition><Store /></PageTransition>} />
            <Route path="/producto/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/nosotros" element={<PageTransition><About /></PageTransition>} />
            <Route path="/contacto" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/blog" element={<PageTransition><BlogList /></PageTransition>} />
            <Route path="/blog/:slug" element={<PageTransition><BlogDetail /></PageTransition>} />
            <Route path="/mis-compras" element={<PageTransition><MyPurchases /></PageTransition>} />
            <Route path="/ar" element={<PageTransition><ARShowcase /></PageTransition>} />
            <Route path="/ar/menu" element={<PageTransition><ARMenuScanner /></PageTransition>} />
            <Route path="/ar/showroom" element={<PageTransition><ARShowroom /></PageTransition>} />
          </Route>

          {/* Protected Routes: Dashboard */}
          <Route element={<ProtectedRoute module="dashboard" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<PageTransition><DashboardHome /></PageTransition>} />
              <Route path="/admin/presentacion" element={<PageTransition><ProjectPresentation /></PageTransition>} />
            </Route>
          </Route>

          {/* Protected Routes: Pages Editor */}
          <Route element={<ProtectedRoute module="pages" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/paginas" element={<PageTransition><PageEditor /></PageTransition>} />
              <Route path="/admin/marketing" element={<PageTransition><MarketingManager /></PageTransition>} />
              <Route path="/admin/blogs" element={<PageTransition><BlogManager /></PageTransition>} />
            </Route>
          </Route>

          {/* Protected Routes: Products */}
          <Route element={<ProtectedRoute module="products" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/productos" element={<PageTransition><StoreManager /></PageTransition>} />
              <Route path="/admin/pedidos" element={<PageTransition><OrdersManager /></PageTransition>} />
              <Route path="/admin/clientes" element={<PageTransition><CustomersManager /></PageTransition>} />
              <Route path="/admin/inventario" element={<PageTransition><InventoryManager /></PageTransition>} />
              <Route path="/admin/produccion" element={<PageTransition><ProductionManager /></PageTransition>} />
            </Route>
          </Route>

          {/* Protected Routes: AR Manager */}
          <Route element={<ProtectedRoute module="ar_manager" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/ar" element={<PageTransition><AdminARManager /></PageTransition>} />
              <Route path="/admin/ar-showroom" element={<PageTransition><ARShowroomManager /></PageTransition>} />
            </Route>
          </Route>

          {/* Protected Routes: Logos */}
          <Route element={<ProtectedRoute module="logos" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/logos" element={<PageTransition><LogosManager /></PageTransition>} />
            </Route>
          </Route>

          {/* Protected Routes: User Management */}
          <Route element={<ProtectedRoute module="users" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/usuarios" element={<PageTransition><UsersManager /></PageTransition>} />
            </Route>
          </Route>

          {/* Protected Routes: Analytics */}
          <Route element={<ProtectedRoute module="analytics" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/analitica" element={<PageTransition><AnalyticsManager /></PageTransition>} />
            </Route>
          </Route>

          {/* Protected Routes: Settings */}
          <Route element={<ProtectedRoute module="settings" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/configuracion" element={<PageTransition><SettingsManager /></PageTransition>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
