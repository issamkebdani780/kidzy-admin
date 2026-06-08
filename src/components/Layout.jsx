import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Mail,
  LogOut,
  Menu,
  X,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { logout } from '../services/api';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  // Extract user info
  const userString = localStorage.getItem('kidzy_admin_user');
  const user = userString ? JSON.parse(userString) : { username: 'Admin' };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Orders', path: '/orders', icon: ShoppingBag },
    { name: 'Messages', path: '/messages', icon: Mail },
  ];

  const handleLogoutClick = () => {
    logout();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-650 border-r border-slate-200/80">
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200/80">
        <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-base leading-tight">Kidzy Store</h2>
          <p className="text-[11px] text-slate-400 font-medium">Admin Panel</p>
        </div>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
              <div
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-200/80">
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-base">
            {user.username ? user.username[0].toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-slate-900 text-sm truncate">{user.username}</p>
            <p className="text-[11px] text-slate-400 font-semibold truncate">Full Access</p>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50/50 text-red-600 hover:text-red-700 font-semibold text-sm transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 h-screen sticky top-0 shrink-0 border-r border-slate-200/80 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/80 text-slate-900 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-base">Kidzy</h1>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-start">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black"
            ></motion.div>
            
            {/* Sidebar drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 h-full shadow-xl z-10"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-slate-50 p-6 md:p-10 text-slate-800">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
