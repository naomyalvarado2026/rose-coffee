import { Outlet } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import Navigation from '../components/common/Navigation';
import Footer from '../components/common/Footer';
import StickyNav from '../components/public/StickyNav';
import MobileBottomNav from '../components/common/MobileBottomNav';
import WhatsAppFAB from '../components/common/WhatsAppFAB';
import Preloader from '../components/public/Preloader';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-base text-gray-800 font-sans pb-16 md:pb-0">
      <Preloader />
      <TopBar />
      <Navigation />
      <main className="flex-grow">
        <Outlet />
      </main>
      <StickyNav />
      <WhatsAppFAB />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};
export default PublicLayout;
