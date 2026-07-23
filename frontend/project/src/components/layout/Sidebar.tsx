import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileText,
  ShoppingCart,
  CreditCard,
  Receipt,
  Truck,
  BookOpen,
  Package,
  AlertTriangle,
  FileBarChart,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  BadgePercent,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { section: 'MAIN', items: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Upload Invoice', icon: Upload, path: '/upload', badge: 'AI', highlight: true },
  ]},
  { section: 'TRANSACTIONS', items: [
    { name: 'Sales Invoice', icon: FileText, path: '/sales' },
    { name: 'Purchase Entry', icon: ShoppingCart, path: '/purchase' },
    { name: 'Payment Voucher', icon: CreditCard, path: '/payment' },
    { name: 'Receipt Voucher', icon: Receipt, path: '/receipt' },
    { name: 'Challan', icon: Truck, path: '/challan' },
  ]},
  { section: 'ACCOUNTS', items: [
    { name: 'Ledger', icon: BookOpen, path: '/ledger' },
    { name: 'Account Groups', icon: BadgePercent, path: '/account-groups' },
    { name: 'Outstanding', icon: FileBarChart, path: '/outstanding' },
  ]},
  { section: 'INVENTORY', items: [
    { name: 'Stock Items', icon: Package, path: '/stock' },
    { name: 'Stock Movement', icon: Truck, path: '/stock-movement' },
    { name: 'Low Stock Alerts', icon: AlertTriangle, path: '/low-stock' },
  ]},
  { section: 'REPORTS', items: [
    { name: 'GST Reports', icon: FileBarChart, path: '/gst-reports' },
    { name: 'Sales Report', icon: FileText, path: '/sales-report' },
    { name: 'Purchase Report', icon: ShoppingCart, path: '/purchase-report' },
    { name: 'Stock Report', icon: Package, path: '/stock-report' },
  ]},
  { section: 'SETTINGS', items: [
    { name: 'Company Profile', icon: Building2, path: '/company' },
    { name: 'User Management', icon: Users, path: '/users' },
  ]},
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar text-white flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2"
            >
              <Package className="w-8 h-8 text-blue-400" />
              <span className="font-semibold text-lg">StockFlow</span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && <Package className="w-8 h-8 text-blue-400 mx-auto" />}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-4">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {section.section}
                </motion.div>
              )}
            </AnimatePresence>
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className="relative block"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <motion.div
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors relative',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : item.highlight
                        ? 'text-blue-400 hover:bg-white/5'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                    whileHover={{ x: collapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-sm font-medium whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {item.badge && !collapsed && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </motion.div>

                  {/* Collapsed tooltip */}
                  {collapsed && hoveredItem === item.name && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-slate-800 px-3 py-1.5 rounded-md text-sm whitespace-nowrap z-50 shadow-lg"
                    >
                      {item.name}
                      {item.badge && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Button */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
