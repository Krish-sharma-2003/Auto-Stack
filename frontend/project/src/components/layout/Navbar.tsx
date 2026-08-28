import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, CheckCircle, AlertCircle, Info, AlertTriangle, LogOut } from 'lucide-react';
import { notifications } from '@/data/mockData';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

interface NavbarProps {
  collapsed: boolean;
  user: User;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

export function Navbar({ collapsed, user }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = notifications.filter(n => !n.read).length;
  const fullName = user.user_metadata.full_name || user.user_metadata.name || user.email || 'StockFlow user';
  const avatarUrl = user.user_metadata.avatar_url || user.user_metadata.picture;
  const initials = fullName.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
  };

  return (
    <motion.nav
      initial={false}
      animate={{ marginLeft: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40"
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search... (Ctrl+F)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                    <span className="text-xs text-slate-500">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => {
                      const Icon = iconMap[notification.type];
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer',
                            !notification.read && 'bg-blue-50/50'
                          )}
                        >
                          <div className="flex gap-3">
                            <Icon className={cn('w-5 h-5 mt-0.5', colorMap[notification.type])} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">{notification.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {notification.timestamp.toLocaleString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Authenticated user */}
        <div className="relative pl-4 border-l border-slate-200">
          <button type="button" onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 rounded-lg text-left hover:bg-slate-50 p-1">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">{initials}</div>
            )}
            <div className="hidden sm:block max-w-44">
              <p className="text-sm font-medium text-slate-800 truncate">{fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </button>
          <AnimatePresence>
            {showUserMenu && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50">
                <button type="button" onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
