import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import CommandMenu from '../components/admin/CommandMenu';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-base dark:bg-stone-950 text-gray-800 dark:text-stone-200 transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Sidebar overlay for mobile when open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-64 overflow-x-hidden overflow-y-auto">
        {/* Top Header/Navbar */}
        <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandMenu />
    </div>
  );
};

export default AdminLayout;

