import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Zap, Bell, BarChart3, MapPin } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

const tabs = [
  { path: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { path: '/inverters', icon: Zap, label: 'Inverters' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/site', icon: MapPin, label: 'Site' },
];

export const BottomNav: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors, isDark } = useTheme();
  const { unreadAlertCount } = useData();

  const activeTab = useMemo(() => tabs.findIndex(t => location.pathname.startsWith(t.path)), [location.pathname]);

  return (
    <motion.nav
      className="fixed bottom-3 left-3 right-3 z-50 flex items-center justify-around py-2 px-2 rounded-[28px]"
      style={{
        background: isDark ? 'rgba(27, 42, 59, 0.85)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.4)'
          : '0 10px 40px rgba(0,0,0,0.08)',
      }}
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {tabs.map((tab, i) => {
        const isActive = i === activeTab;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="relative flex flex-col items-center gap-0.5 py-1.5 px-4 min-w-[56px]"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute -top-0.5 inset-x-1 h-[42px] rounded-2xl"
                style={{ background: `${colors.accent}18` }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-0.5">
              <div className="relative">
                <Icon
                  size={20}
                  style={{ color: isActive ? colors.accent : colors.textMuted }}
                  fill={isActive ? colors.accent : 'none'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {tab.label === 'Alerts' && unreadAlertCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                    style={{ background: '#EF4444' }}
                  >
                    {unreadAlertCount}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? colors.accent : colors.textMuted }}
              >
                {tab.label}
              </span>
            </div>
          </button>
        );
      })}
    </motion.nav>
  );
});

BottomNav.displayName = 'BottomNav';
