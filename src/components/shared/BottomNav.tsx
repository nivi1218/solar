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
  const { colors } = useTheme();
  const { unreadAlertCount } = useData();

  const activeTab = useMemo(() => tabs.findIndex(t => location.pathname.startsWith(t.path)), [location.pathname]);

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
      style={{
        background: colors.cardBgAlpha,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid ${colors.border}`,
        boxShadow: `0 -4px 24px ${colors.shadow}`,
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
            className="relative flex flex-col items-center gap-0.5 py-1 px-3"
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-1 inset-x-1 h-8 rounded-full"
                style={{ background: `${colors.accent}22` }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative">
              <Icon
                size={20}
                style={{ color: isActive ? colors.accent : colors.textMuted }}
                fill={isActive ? colors.accent : 'none'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {tab.label === 'Alerts' && unreadAlertCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                  style={{ background: '#EF4444' }}
                >
                  {unreadAlertCount}
                </span>
              )}
            </div>
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? colors.accent : colors.textMuted }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
});

BottomNav.displayName = 'BottomNav';
