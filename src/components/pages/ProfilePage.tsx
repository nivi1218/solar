import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Bell, Moon, Sun, Mail, LogOut, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../shared/GlassCard';

export const ProfilePage: React.FC = React.memo(() => {
  const { colors, isDark, toggle } = useTheme();
  const { user, updateUser, logout } = useAuth();
  const { inverters, alerts } = useData();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [pushNotif, setPushNotif] = useState(user?.preferences.pushNotifications ?? true);
  const [darkOverride, setDarkOverride] = useState(user?.preferences.darkModeOverride ?? false);
  const [autoTheme, setAutoTheme] = useState(user?.preferences.autoTheme ?? true);
  const [emailReports, setEmailReports] = useState(user?.preferences.emailReports ?? true);
  const [showLogoutWarn, setShowLogoutWarn] = useState(false);

  const handleSave = useCallback(() => {
    updateUser({
      name,
      phone,
      location,
      preferences: {
        pushNotifications: pushNotif,
        darkModeOverride: darkOverride,
        autoTheme,
        emailReports,
      },
    });
  }, [name, phone, location, pushNotif, darkOverride, autoTheme, emailReports, updateUser]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const stats = [
    { label: 'Total Plants', value: '1' },
    { label: 'Total Inverters', value: String(inverters.length) },
    { label: 'Alerts Today', value: String(alerts.filter(a => !a.resolved).length) },
  ];

  return (
    <div className="p-4 space-y-5 pb-24">
      <h2 className="text-xl font-bold" style={{ color: colors.text }}>Profile</h2>

      <GlassCard className="text-center" padding="p-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
          style={{ background: colors.accent }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <h3 className="text-lg font-bold" style={{ color: colors.text }}>{user?.name || 'User'}</h3>
        <p className="text-sm" style={{ color: colors.textMuted }}>{user?.email || ''}</p>
      </GlassCard>

      <div className="flex gap-3">
        {stats.map(s => (
          <div key={s.label} className="flex-1 text-center p-3 rounded-xl" style={{ background: colors.cardBgAlpha, border: `1px solid ${colors.border}` }}>
            <p className="text-xl font-bold font-mono" style={{ color: colors.accent }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: colors.textMuted }}>{s.label}</p>
          </div>
        ))}
      </div>

      <GlassCard>
        <h3 className="font-bold mb-4" style={{ color: colors.text }}>Edit Profile</h3>
        <div className="space-y-3">
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: `${colors.cardBg}44`, border: `1px solid ${colors.border}`, color: colors.text }}
            />
          </div>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: `${colors.cardBg}44`, border: `1px solid ${colors.border}`, color: colors.text }}
            />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: `${colors.cardBg}44`, border: `1px solid ${colors.border}`, color: colors.text }}
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-bold mb-4" style={{ color: colors.text }}>Settings</h3>
        <div className="space-y-4">
          {[
            { label: 'Push Notifications', icon: <Bell size={18} />, value: pushNotif, setter: setPushNotif },
            { label: 'Dark Mode Override', icon: isDark ? <Moon size={18} /> : <Sun size={18} />, value: darkOverride, setter: (v: boolean) => { setDarkOverride(v); if (v) toggle(); } },
            { label: 'Auto Theme', icon: <Sun size={18} />, value: autoTheme, setter: setAutoTheme },
            { label: 'Email Reports', icon: <Mail size={18} />, value: emailReports, setter: setEmailReports },
          ].map(toggle_item => (
            <div key={toggle_item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span style={{ color: colors.textMuted }}>{toggle_item.icon}</span>
                <span className="text-sm font-medium" style={{ color: colors.text }}>{toggle_item.label}</span>
              </div>
              <button
                onClick={() => toggle_item.setter(!toggle_item.value)}
                className="w-12 h-7 rounded-full relative transition-colors"
                style={{ background: toggle_item.value ? colors.accent : colors.border }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white absolute top-1"
                  animate={{ left: toggle_item.value ? 26 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      <motion.button
        onClick={handleSave}
        className="w-full py-3.5 rounded-full text-white font-semibold text-base"
        style={{
          background: 'linear-gradient(135deg, #F5A623, #FF8C00)',
          boxShadow: '0 4px 16px rgba(245,166,35,0.3)',
        }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="flex items-center justify-center gap-2"><Save size={18} /> Save Changes</span>
      </motion.button>

      <div>
        {!showLogoutWarn ? (
          <motion.button
            onClick={() => setShowLogoutWarn(true)}
            className="w-full py-3 rounded-xl font-semibold text-sm"
            style={{ background: '#EF444422', color: '#EF4444', border: '1px solid #EF444444' }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="flex items-center justify-center gap-2"><LogOut size={18} /> Sign Out</span>
          </motion.button>
        ) : (
          <GlassCard style={{ background: '#EF444415', border: '1px solid #EF444444' } as React.CSSProperties}>
            <p className="text-sm mb-3" style={{ color: '#EF4444' }}>Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <motion.button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-xl font-semibold text-sm text-white"
                style={{ background: '#EF4444' }}
                whileTap={{ scale: 0.97 }}
              >
                Sign Out
              </motion.button>
              <motion.button
                onClick={() => setShowLogoutWarn(false)}
                className="flex-1 py-2 rounded-xl font-semibold text-sm"
                style={{ background: colors.cardBgAlpha, color: colors.text, border: `1px solid ${colors.border}` }}
                whileTap={{ scale: 0.97 }}
              >
                Cancel
              </motion.button>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
});

ProfilePage.displayName = 'ProfilePage';
