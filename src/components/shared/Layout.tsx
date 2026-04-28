import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid, Zap, Bell, BarChart3, MapPin, User, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { BottomNav } from './BottomNav';

const drawerLinks = [
  { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { path: '/inverters', icon: Zap, label: 'Inverters' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/site', icon: MapPin, label: 'Site Conditions' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const { logout, user } = useAuth();

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const handleNav = useCallback((path: string) => {
    navigate(path);
    closeDrawer();
  }, [navigate, closeDrawer]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
    closeDrawer();
  }, [logout, navigate, closeDrawer]);

  return (
    <div className="min-h-screen pb-20 transition-colors duration-800" style={{ background: colors.background, color: colors.text }}>
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />
            <motion.div
              className="fixed top-0 left-0 bottom-0 z-50 w-72 p-6 flex flex-col"
              style={{
                background: colors.cardBgAlpha,
                backdropFilter: 'blur(24px)',
                borderRight: `1px solid ${colors.border}`,
              }}
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold" style={{ color: colors.accent }}>SolarSense</span>
                <button onClick={closeDrawer}><X size={24} style={{ color: colors.text }} /></button>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                {drawerLinks.map(link => {
                  const Icon = link.icon;
                  const active = location.pathname === link.path;
                  return (
                    <button
                      key={link.path}
                      onClick={() => handleNav(link.path)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
                      style={{
                        background: active ? `${colors.accent}22` : 'transparent',
                        color: active ? colors.accent : colors.text,
                      }}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{link.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="border-t pt-4" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-3 mb-4 px-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: colors.accent }}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{user?.name || 'User'}</div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>{user?.email || ''}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left"
                  style={{ color: '#EF4444' }}
                >
                  <LogOut size={20} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {typeof children === 'object' && children !== null && 'props' in children
          ? React.cloneElement(children as React.ReactElement, { onMenuOpen: () => setDrawerOpen(true) })
          : children
        }
      </motion.main>

      <BottomNav />
    </div>
  );
});

Layout.displayName = 'Layout';
