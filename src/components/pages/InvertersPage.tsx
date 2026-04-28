import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, X, Download, TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../shared/GlassCard';
import type { Inverter, InverterFilter } from '../../types';

const filterConfig: { key: InverterFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'fault', label: 'Fault' },
  { key: 'warning', label: 'Warning' },
];

const statusColors: Record<string, string> = {
  active: '#27AE60',
  fault: '#EF4444',
  warning: '#F5A623',
};

export const InvertersPage: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { inverters } = useData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InverterFilter>('all');
  const [selected, setSelected] = useState<Inverter | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<'hour' | 'day' | 'week'>('hour');

  const counts = useMemo(() => ({
    all: inverters.length,
    active: inverters.filter(i => i.status === 'active').length,
    fault: inverters.filter(i => i.status === 'fault').length,
    warning: inverters.filter(i => i.status === 'warning').length,
  }), [inverters]);

  const filtered = useMemo(() => {
    return inverters.filter(i => {
      const matchFilter = filter === 'all' || i.status === filter;
      const matchSearch = i.id.toLowerCase().includes(search.toLowerCase()) || i.name.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [inverters, filter, search]);

  const top10 = useMemo(() => {
    return [...inverters].sort((a, b) => b.power_output - a.power_output).slice(0, 10).map(i => ({
      name: i.id,
      power: i.power_output,
    }));
  }, [inverters]);

  const trendData = useMemo(() => {
    const base = selected?.power_output ?? 5;
    const points = trendPeriod === 'hour' ? 24 : trendPeriod === 'day' ? 7 : 4;
    return Array.from({ length: points }, (_, i) => ({
      name: trendPeriod === 'hour' ? `${i}:00` : trendPeriod === 'day' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] : `W${i + 1}`,
      value: base * (0.7 + Math.random() * 0.6),
    }));
  }, [selected, trendPeriod]);

  const handleFilterChange = useCallback((f: InverterFilter) => setFilter(f), []);
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value), []);
  const closeSheet = useCallback(() => setSelected(null), []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold" style={{ color: colors.text }}>Inverters</h2>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
        <input
          type="text"
          placeholder="Search inverters..."
          value={search}
          onChange={handleSearch}
          className="w-full pl-12 pr-4 py-3 rounded-xl outline-none text-sm"
          style={{
            background: colors.cardBgAlpha,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            backdropFilter: 'blur(20px)',
          }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterConfig.map(f => (
          <button
            key={f.key}
            onClick={() => handleFilterChange(f.key)}
            className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              background: filter === f.key ? colors.accent : colors.cardBgAlpha,
              color: filter === f.key ? '#fff' : colors.textMuted,
              border: `1px solid ${filter === f.key ? colors.accent : colors.border}`,
            }}
          >
            {f.label} [{counts[f.key]}]
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((inv, i) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <GlassCard hover onClick={() => setSelected(inv)} padding="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold" style={{ color: colors.text }}>{inv.id}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
                  style={{ background: `${statusColors[inv.status]}22`, color: statusColors[inv.status] }}
                >
                  {inv.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1">
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: `${colors.border}` }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: statusColors[inv.status] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${inv.efficiency}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                <span className="text-xs font-mono" style={{ color: colors.textMuted }}>{inv.efficiency.toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={14} style={{ color: colors.accent }} />
                <span className="text-sm font-bold font-mono" style={{ color: colors.text }}>{inv.power_output.toFixed(1)} kW</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard>
        <h3 className="font-bold mb-3" style={{ color: colors.text }}>Top 10 Inverters</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} width={60} />
              <Tooltip contentStyle={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '12px', color: colors.text, fontSize: '12px' }} />
              <Bar dataKey="power" fill={colors.accent} radius={[0, 6, 6, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

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
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 max-h-[80vh] overflow-y-auto"
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
                <div>
                  <h3 className="text-lg font-bold" style={{ color: colors.text }}>{selected.id}</h3>
                  <span className="text-sm capitalize" style={{ color: statusColors[selected.status] }}>{selected.status}</span>
                </div>
                <button onClick={closeSheet}><X size={24} style={{ color: colors.text }} /></button>
              </div>

              <div className="flex justify-center mb-4">
                <svg width="160" height="90" viewBox="0 0 160 90">
                  <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke={colors.border} strokeWidth="8" strokeLinecap="round" />
                  <motion.path
                    d="M 10 80 A 70 70 0 0 1 150 80"
                    fill="none"
                    stroke={statusColors[selected.status]}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="220"
                    initial={{ strokeDashoffset: 220 }}
                    animate={{ strokeDashoffset: 220 - (220 * selected.efficiency / 100) }}
                    transition={{ duration: 1 }}
                  />
                  <text x="80" y="60" textAnchor="middle" fill={colors.text} fontSize="20" fontWeight="bold" fontFamily="monospace">
                    {selected.efficiency.toFixed(0)}%
                  </text>
                </svg>
              </div>

              <div className="flex gap-2 mb-4">
                {(['hour', 'day', 'week'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setTrendPeriod(p)}
                    className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                    style={{
                      background: trendPeriod === p ? colors.accent : colors.cardBgAlpha,
                      color: trendPeriod === p ? '#fff' : colors.textMuted,
                      border: `1px solid ${trendPeriod === p ? colors.accent : colors.border}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '12px', color: colors.text, fontSize: '12px' }} />
                    <Area type="monotone" dataKey="value" stroke={colors.accent} fill="url(#trendGrad)" strokeWidth={2} animationDuration={800} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex gap-3">
                {[
                  { icon: <Download size={16} />, label: 'Export PDF' },
                  { icon: <Download size={16} />, label: 'Export CSV' },
                  { icon: <TrendingUp size={16} />, label: 'Full Trend' },
                ].map(btn => (
                  <motion.button
                    key={btn.label}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: `${colors.accent}22`, color: colors.accent, border: `1px solid ${colors.accent}44` }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {btn.icon}
                    {btn.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

InvertersPage.displayName = 'InvertersPage';
