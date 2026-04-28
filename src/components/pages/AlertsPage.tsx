import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wrench, ThermometerSun, Activity, X, Check, Bell } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../shared/GlassCard';
import type { Alert, AlertFilter } from '../../types';

const filterConfig: { key: AlertFilter; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'dc_fault', label: 'DC Fault', icon: <AlertTriangle size={16} />, color: '#EF4444' },
  { key: 'low_efficiency', label: 'Low Efficiency', icon: <Activity size={16} />, color: '#F5A623' },
  { key: 'maintenance', label: 'Maintenance', icon: <Wrench size={16} />, color: '#3B82F6' },
  { key: 'overheating', label: 'Overheating', icon: <ThermometerSun size={16} />, color: '#F97316' },
];

const severityColors: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F5A623',
  info: '#3B82F6',
};

const typeIcons: Record<string, React.ReactNode> = {
  dc_fault: <AlertTriangle size={18} />,
  low_efficiency: <Activity size={18} />,
  maintenance: <Wrench size={18} />,
  overheating: <ThermometerSun size={18} />,
};

export const AlertsPage: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { alerts, resolveAlert, dismissAlert, markAlertRead } = useData();
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [selected, setSelected] = useState<Alert | null>(null);
  const [toasts, setToasts] = useState<Alert[]>([]);

  const counts = useMemo(() => ({
    all: alerts.filter(a => !a.resolved).length,
    dc_fault: alerts.filter(a => a.type === 'dc_fault' && !a.resolved).length,
    low_efficiency: alerts.filter(a => a.type === 'low_efficiency' && !a.resolved).length,
    maintenance: alerts.filter(a => a.type === 'maintenance' && !a.resolved).length,
    overheating: alerts.filter(a => a.type === 'overheating' && !a.resolved).length,
  }), [alerts]);

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts.filter(a => !a.resolved);
    return alerts.filter(a => a.type === filter && !a.resolved);
  }, [alerts, filter]);

  useEffect(() => {
    const recent = alerts.filter(a => !a.resolved && Date.now() - a.timestamp < 10000);
    if (recent.length > 0) {
      setToasts(prev => [...prev, ...recent]);
      const timer = setTimeout(() => setToasts(prev => prev.slice(recent.length)), 5000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  const handleFilterChange = useCallback((f: AlertFilter) => setFilter(f), []);
  const closeSheet = useCallback(() => setSelected(null), []);

  const timeAgo = useCallback((ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold" style={{ color: colors.text }}>Alerts</h2>

      <div className="grid grid-cols-2 gap-2">
        {filterConfig.map(f => (
          <button
            key={f.key}
            onClick={() => handleFilterChange(f.key)}
            className="flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: filter === f.key ? `${f.color}22` : colors.cardBgAlpha,
              color: filter === f.key ? f.color : colors.textMuted,
              border: `1px solid ${filter === f.key ? `${f.color}44` : colors.border}`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <span style={{ color: f.color }}>{f.icon}</span>
            <span className="flex-1 text-left">{f.label}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `${f.color}22`, color: f.color }}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="flex flex-col items-center py-12">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bell size={48} style={{ color: colors.accent }} />
          </motion.div>
          <p className="mt-4 font-medium" style={{ color: colors.text }}>All systems running smoothly</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                style={{ background: severityColors[alert.severity] }}
              />
              <GlassCard
                padding="p-4 pl-4"
                onClick={() => { setSelected(alert); markAlertRead(alert.id); }}
                hover
              >
                <div className="flex items-start gap-3 ml-2">
                  <div className="mt-0.5" style={{ color: severityColors[alert.severity] }}>
                    {typeIcons[alert.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm" style={{ color: colors.text }}>{alert.title}</h4>
                      <span className="text-[10px] whitespace-nowrap ml-2" style={{ color: colors.textMuted }}>{timeAgo(alert.timestamp)}</span>
                    </div>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: colors.textMuted }}>{alert.message}</p>
                    <div className="flex gap-2 mt-3">
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); resolveAlert(alert.id); }}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold"
                        style={{ background: '#27AE6022', color: '#27AE60', border: '1px solid #27AE6044' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Check size={12} /> Resolved
                      </motion.button>
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold"
                        style={{ background: '#EF444422', color: '#EF4444', border: '1px solid #EF444444' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X size={12} /> Dismiss
                      </motion.button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6"
              style={{
                background: colors.cardBgAlpha,
                backdropFilter: 'blur(24px)',
                border: `1px solid ${colors.border}`,
                boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div style={{ color: severityColors[selected.severity] }}>{typeIcons[selected.type]}</div>
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>{selected.title}</h3>
                </div>
                <button onClick={closeSheet}><X size={24} style={{ color: colors.text }} /></button>
              </div>
              <div className="mb-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize" style={{ background: `${severityColors[selected.severity]}22`, color: severityColors[selected.severity] }}>
                  {selected.severity}
                </span>
              </div>
              <p className="text-sm mb-4" style={{ color: colors.textMuted }}>{selected.message}</p>
              <p className="text-xs mb-4" style={{ color: colors.textMuted }}>Time: {new Date(selected.timestamp).toLocaleString()}</p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => { resolveAlert(selected.id); closeSheet(); }}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ background: '#27AE60' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Mark Resolved
                </motion.button>
                <motion.button
                  onClick={() => { dismissAlert(selected.id); closeSheet(); }}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: '#EF444422', color: '#EF4444', border: '1px solid #EF444444' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Dismiss
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed top-4 left-4 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast, i) => (
            <motion.div
              key={`${toast.id}-${i}`}
              className="flex items-center gap-3 p-3 rounded-xl pointer-events-auto"
              style={{
                background: colors.cardBgAlpha,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${severityColors[toast.severity]}44`,
                boxShadow: `0 4px 16px ${colors.shadow}`,
              }}
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
            >
              <div style={{ color: severityColors[toast.severity] }}>{typeIcons[toast.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs" style={{ color: colors.text }}>{toast.title}</p>
              </div>
              <button
                onClick={() => { setSelected(toast); markAlertRead(toast.id); }}
                className="px-3 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: `${colors.accent}22`, color: colors.accent }}
              >
                View
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

AlertsPage.displayName = 'AlertsPage';
