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
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Sidebar Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/10">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-extrabold text-white text-lg leading-tight">Kidzy Store</h2>
          <p className="text-xs text-slate-500 font-medium">Admin Dashboard</p>
        </div>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
              <div
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20'
                    : 'hover:bg-slate-800/60 hover:text-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-850 rounded-2xl p-4 flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center font-bold text-primary-400 text-lg">
            {user.username ? user.username[0].toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-white text-sm truncate">{user.username}</p>
            <p className="text-xs text-slate-500 font-semibold truncate">Full Access</p>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 h-screen sticky top-0 shrink-0 border-r border-slate-800 shadow-xl z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-black text-lg">Kidzy</h1>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
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
              animate={{ opacity: 0.5 }}
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
              className="relative w-72 h-full shadow-2xl z-10"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-slate-950 p-6 md:p-10 text-slate-100">
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
