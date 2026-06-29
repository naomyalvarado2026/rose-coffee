import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/common/ScrollToTop';
import ConfirmDialog from './components/common/ConfirmDialog';
import { PageTransition } from './components/animations/MotionWrappers';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
const Home = React.lazy(() => import('./pages/public/Home'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Store = React.lazy(() => import('./pages/public/Store'));
const Cart = React.lazy(() => import('./pages/public/Cart'));
const About = React.lazy(() => import('./pages/public/About'));
const Contact = React.lazy(() => import('./pages/public/Contact'));
const MyPurchases = React.lazy(() => import('./pages/public/MyPurchases'));
const ARShowcase = React.lazy(() => import('./pages/public/ARShowcase'));
const ARMenuScanner = React.lazy(() => import('./pages/public/ARMenuScanner'));
const ARShowroom = React.lazy(() => import('./pages/public/ARShowroom'));
const ProductDetail = React.lazy(() => import('./pages/public/ProductDetail'));
const BlogList = React.lazy(() => import('./pages/public/BlogList'));
const BlogDetail = React.lazy(() => import('./pages/public/BlogDetail'));
const MiniGames = React.lazy(() => import('./pages/public/MiniGames'));
const MemoryCafe = React.lazy(() => import('./pages/public/games/MemoryCafe'));
const CoffeeClicker = React.lazy(() => import('./pages/public/games/CoffeeClicker'));
const GatitoRunner = React.lazy(() => import('./pages/public/games/GatitoRunner'));
const LatteArtPuzzle = React.lazy(() => import('./pages/public/games/LatteArtPuzzle'));
const CoffeeInvaders = React.lazy(() => import('./pages/public/games/CoffeeInvaders'));
const Evolution2048 = React.lazy(() => import('./pages/public/games/Evolution2048'));
const WordleGame = React.lazy(() => import('./pages/public/games/WordleGame'));
const FlappyTaza = React.lazy(() => import('./pages/public/games/FlappyTaza'));
const FastBarista = React.lazy(() => import('./pages/public/games/FastBarista'));
const LuckyWheel = React.lazy(() => import('./pages/public/games/LuckyWheel'));
const CatchIngredients = React.lazy(() => import('./pages/public/games/CatchIngredients'));
const BricksBreaker = React.lazy(() => import('./pages/public/games/BricksBreaker'));
import { GameWalletProvider } from './contexts/GameWalletContext';

const DashboardHome = React.lazy(() => import('./pages/admin/DashboardHome'));
const StoreManager = React.lazy(() => import('./pages/admin/StoreManager'));
const LogosManager = React.lazy(() => import('./pages/admin/LogosManager'));
const UsersManager = React.lazy(() => import('./pages/admin/UsersManager'));
const PageEditor = React.lazy(() => import('./pages/admin/PageEditor'));
const BlogManager = React.lazy(() => import('./pages/admin/BlogManager'));
const AdminARManager = React.lazy(() => import('./pages/admin/AdminARManager'));
const ARShowroomManager = React.lazy(() => import('./pages/admin/ARShowroomManager'));
const OrdersManager = React.lazy(() => import('./pages/admin/OrdersManager'));
const CustomersManager = React.lazy(() => import('./pages/admin/CustomersManager'));
const InventoryManager = React.lazy(() => import('./pages/admin/InventoryManager'));
const MarketingManager = React.lazy(() => import('./pages/admin/MarketingManager'));
const ProductionManager = React.lazy(() => import('./pages/admin/ProductionManager'));
const AnalyticsManager = React.lazy(() => import('./pages/admin/AnalyticsManager'));
const SettingsManager = React.lazy(() => import('./pages/admin/SettingsManager'));
import ProtectedRoute from './components/common/ProtectedRoute';
const ProjectPresentation = React.lazy(() => import('./pages/admin/ProjectPresentation'));
import CustomCursor from './components/common/CustomCursor';


function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    useAuthStore.getState().initializeAuth();
    // Simular carga inicial para mostrar la animación
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isAppLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-[#faf2e7] flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: [0.97, 1.03, 0.97] }}
              transition={{
                opacity: { duration: 0.5, ease: "easeOut" },
                scale: { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
              }}
              className="w-64 h-64 flex items-center justify-center opacity-90 drop-shadow-lg"
            >
              <img 
                src={`${import.meta.env.BASE_URL}logo.svg`}
                alt="Rose Coffee Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-6 font-sans text-3xl text-coffee dark:text-gold font-extrabold tracking-[0.2em] uppercase"
            >
              Rose Coffee
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomCursor />
      <Toaster richColors position="top-right" />
      <ConfirmDialog />
      <GameWalletProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL}>
          <ScrollToTop />
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-stone-50 dark:bg-stone-900">
              <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
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
            <Route path="/juegos" element={<PageTransition><MiniGames /></PageTransition>} />
            <Route path="/juegos/gatito-runner" element={<PageTransition><GatitoRunner /></PageTransition>} />
            <Route path="/juegos/latte-art-puzzle" element={<PageTransition><LatteArtPuzzle /></PageTransition>} />
            <Route path="/juegos/coffee-invaders" element={<PageTransition><CoffeeInvaders /></PageTransition>} />
            <Route path="/juegos/memory-cafe" element={<PageTransition><MemoryCafe /></PageTransition>} />
            <Route path="/juegos/coffee-clicker" element={<PageTransition><CoffeeClicker /></PageTransition>} />
            <Route path="/juegos/clicker" element={<PageTransition><CoffeeClicker /></PageTransition>} />
            <Route path="/juegos/evolution-2048" element={<PageTransition><Evolution2048 /></PageTransition>} />
            <Route path="/juegos/palabra-del-dia" element={<PageTransition><WordleGame /></PageTransition>} />
            <Route path="/juegos/flappy-taza" element={<PageTransition><FlappyTaza /></PageTransition>} />
            <Route path="/juegos/barista-veloz" element={<PageTransition><FastBarista /></PageTransition>} />
            <Route path="/juegos/ruleta" element={<PageTransition><LuckyWheel /></PageTransition>} />
            <Route path="/juegos/atrapa-ingredientes" element={<PageTransition><CatchIngredients /></PageTransition>} />
            <Route path="/juegos/bricks-breaker" element={<PageTransition><BricksBreaker /></PageTransition>} />

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
        </Suspense>
      </BrowserRouter>
      </GameWalletProvider>
    </>
  );
}

export default App;
