import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Sun, Cloud, Moon, Zap, Thermometer, Activity, Cpu, Gauge, BarChart3, Sparkles, CloudSun } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../shared/GlassCard';
import { CardSkeleton } from '../shared/SkeletonLoader';
import { useCountUp, useGreeting } from '../../hooks';
import type { EnergyPeriod } from '../../types';

const AI_TIPS = [
  'Your panels are performing 12% above regional average today.',
  'Scheduling maintenance before next week could prevent efficiency loss.',
  'Peak production hours shifted to 11AM-2PM this season.',
  'Inverter INV-035 needs attention — DC voltage anomaly detected.',
  'Today\'s output is on track to exceed yesterday by 8%.',
  'Consider adjusting tilt angle for upcoming winter solstice.',
  'Grid export revenue up 15% this month compared to last.',
  'Panel cleaning recommended — dust accumulation reducing output by ~3%.',
];

const statConfig = [
  { key: 'voltage', label: 'Voltage', unit: 'V', icon: Zap, color: '#F5A623' },
  { key: 'current', label: 'Current', unit: 'A', icon: Activity, color: '#4ECDC4' },
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer, color: '#EF4444' },
  { key: 'power_ac', label: 'Power AC', unit: 'kW', icon: Cpu, color: '#27AE60' },
  { key: 'activeInverters', label: 'Active Inverters', unit: '', icon: Gauge, color: '#3B82F6' },
  { key: 'efficiency', label: 'System Efficiency', unit: '%', icon: BarChart3, color: '#8B5CF6' },
];

interface DashboardPageProps {
  onMenuOpen?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = React.memo(({ onMenuOpen }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { latestReading, readings, inverters, weather } = useData();
  const navigate = useNavigate();
  const greeting = useGreeting();
  const [energyPeriod, setEnergyPeriod] = useState<EnergyPeriod>('day');
  const [tipIndex, setTipIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % AI_TIPS.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const greetingIcon = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return <Sun size={20} style={{ color: '#F5A623' }} />;
    if (hour >= 12 && hour < 17) return <CloudSun size={20} style={{ color: '#F5A623' }} />;
    if (hour >= 17 && hour < 21) return <Cloud size={20} style={{ color: '#FFB347' }} />;
    return <Moon size={20} style={{ color: '#4ECDC4' }} />;
  }, []);

  const activeInverters = useMemo(() => inverters.filter(i => i.status === 'active').length, [inverters]);

  const statValues = useMemo(() => ({
    voltage: latestReading?.voltage ?? 0,
    current: latestReading?.current ?? 0,
    temperature: latestReading?.temperature ?? 0,
    power_ac: latestReading?.power_ac ?? 0,
    activeInverters,
    efficiency: latestReading?.efficiency ?? 0,
  }), [latestReading, activeInverters]);

  const animatedVoltage = useCountUp(statValues.voltage, 600);
  const animatedCurrent = useCountUp(statValues.current, 600);
  const animatedTemp = useCountUp(statValues.temperature, 600);
  const animatedPower = useCountUp(statValues.power_ac, 600);
  const animatedEff = useCountUp(statValues.efficiency, 600);

  const animatedStats = useMemo(() => ({
    voltage: animatedVoltage,
    current: animatedCurrent,
    temperature: animatedTemp,
    power_ac: animatedPower,
    activeInverters: statValues.activeInverters,
    efficiency: animatedEff,
  }), [animatedVoltage, animatedCurrent, animatedTemp, animatedPower, statValues.activeInverters, animatedEff]);

  const energyData = useMemo(() => {
    const base = latestReading?.power_ac ?? 8;
    switch (energyPeriod) {
      case 'day':
        return Array.from({ length: 24 }, (_, i) => ({
          name: `${i}:00`,
          value: Math.max(0, base * Math.sin((i - 6) * Math.PI / 12) * (0.8 + Math.random() * 0.4)),
        }));
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({
          name: d,
          value: base * 6 * (0.7 + Math.random() * 0.6),
        }));
      case 'month':
        return ['W1', 'W2', 'W3', 'W4'].map(d => ({
          name: d,
          value: base * 42 * (0.8 + Math.random() * 0.4),
        }));
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(d => ({
          name: d,
          value: base * 180 * (0.6 + Math.random() * 0.8),
        }));
      case 'billing':
        return Array.from({ length: 12 }, (_, i) => ({
          name: `M${i + 1}`,
          value: base * 180 * (0.6 + Math.random() * 0.8) * (i + 1) / 12,
        }));
    }
  }, [energyPeriod, latestReading]);

  const sparklines = useMemo(() => {
    const last10 = readings.slice(-10);
    return {
      voltage: last10.map(r => r.voltage),
      current: last10.map(r => r.current),
      temperature: last10.map(r => r.temperature),
      power_ac: last10.map(r => r.power_ac),
      efficiency: last10.map(r => r.efficiency),
    };
  }, [readings]);

  const periodTabs: EnergyPeriod[] = ['day', 'week', 'month', 'year', 'billing'];

  const handlePeriodChange = useCallback((p: EnergyPeriod) => setEnergyPeriod(p), []);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <CardSkeleton /><CardSkeleton /><CardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between py-2">
        <button onClick={onMenuOpen} className="p-2 rounded-xl" style={{ background: colors.cardBgAlpha }}>
          <Menu size={22} style={{ color: colors.text }} />
        </button>
        <div className="flex items-center gap-2">
          {greetingIcon}
          <span className="font-semibold text-sm">{greeting}, {user?.name?.split(' ')[0] || 'User'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium" style={{ background: colors.cardBgAlpha, border: `1px solid ${colors.border}` }}>
            <Thermometer size={14} style={{ color: colors.accent }} />
            <span>{weather?.temperature?.toFixed(0) ?? '--'}°</span>
          </div>
          <button onClick={() => navigate('/alerts')} className="relative p-2 rounded-xl" style={{ background: colors.cardBgAlpha }}>
            <Bell size={20} style={{ color: colors.text }} />
          </button>
          <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: colors.accent }}>
            {user?.name?.charAt(0) || 'U'}
          </button>
        </div>
      </header>

      <GlassCard className="relative overflow-hidden" padding="p-0">
        <div className="relative h-[280px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${isDark ? 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800' : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'})`,
            }}
          />
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 h-full flex flex-col justify-between p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm">Production Today</p>
                <p className="text-white text-xl font-bold">10.1 kWh</p>
              </div>
              <div className="flex items-center gap-1 text-white/80 text-sm">
                <Sun size={16} />
                <span>{weather?.temperature?.toFixed(0) ?? '--'}°C</span>
              </div>
            </div>

            <div className="flex items-center justify-around py-4">
              {[
                { icon: <Sun size={24} className="text-yellow-400" />, label: 'Sun', value: `${latestReading?.irradiance?.toFixed(0) ?? '--'} W/m²` },
                { icon: <Zap size={24} style={{ color: colors.accent }} />, label: 'Panels', value: `${latestReading?.power_ac?.toFixed(1) ?? '--'} kW` },
                { icon: <span className="text-2xl">🏠</span>, label: 'House', value: `${(latestReading?.power_ac ?? 0 * 0.7).toFixed(1)} kW` },
                { icon: <Activity size={24} style={{ color: colors.secondary }} />, label: 'Grid', value: `${(latestReading?.power_ac ?? 0 * 0.3).toFixed(1)} kW` },
              ].map((node, i) => (
                <React.Fragment key={node.label}>
                  <div className="flex flex-col items-center gap-1">
                    <motion.div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                      animate={i === 2 ? { scale: [1, 1.08, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {node.icon}
                    </motion.div>
                    <span className="text-white/70 text-[10px]">{node.label}</span>
                    <span className="text-white text-xs font-mono font-bold">{node.value}</span>
                  </div>
                  {i < 3 && (
                    <svg width="30" height="20" className="overflow-visible">
                      <motion.line
                        x1="0" y1="10" x2="30" y2="10"
                        stroke={colors.accent}
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        animate={{ strokeDashoffset: [0, -8] }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    </svg>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="text-center">
              <motion.p
                className="text-[32px] font-bold text-white font-mono"
                key={latestReading?.power_ac?.toFixed(2)}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
              >
                {animatedPower.toFixed(2)} kW
              </motion.p>
              <p className="text-white/70 text-sm">Solar Power Now</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        {statConfig.map((stat, i) => {
          const Icon = stat.icon;
          const val = animatedStats[stat.key as keyof typeof animatedStats];
          const sparkData = sparklines[stat.key as keyof typeof sparklines];
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard padding="p-4" hover>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${stat.color}22` }}>
                    <Icon size={16} style={{ color: stat.color }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: colors.textMuted }}>{stat.label}</span>
                </div>
                <motion.p
                  className="text-xl font-bold font-mono mb-1"
                  style={{ color: colors.text }}
                  key={`${stat.key}-${val?.toFixed(1)}`}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {typeof val === 'number' ? val.toFixed(stat.key === 'activeInverters' ? 0 : 1) : val}{stat.unit}
                </motion.p>
                {sparkData && sparkData.length > 1 && (
                  <div className="h-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData.map((v, j) => ({ name: j, value: v }))}>
                        <Area type="monotone" dataKey="value" stroke={stat.color} fill={`${stat.color}33`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg" style={{ color: colors.text }}>Energy Produced</h3>
        </div>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {periodTabs.map(p => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className="px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors"
              style={{
                background: energyPeriod === p ? colors.accent : colors.cardBgAlpha,
                color: energyPeriod === p ? '#fff' : colors.textMuted,
                border: `1px solid ${energyPeriod === p ? colors.accent : colors.border}`,
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={energyData}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.accent} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  color: colors.text,
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="value" stroke={colors.accent} fill="url(#energyGrad)" strokeWidth={2} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-3 mt-4">
          {[
            { label: 'This Month', value: '312 kWh' },
            { label: 'This Year', value: '3,840 kWh' },
            { label: 'Lifetime', value: '12,450 kWh' },
          ].map(chip => (
            <div key={chip.label} className="flex-1 text-center p-2 rounded-xl" style={{ background: `${colors.accent}11`, border: `1px solid ${colors.border}` }}>
              <p className="text-xs" style={{ color: colors.textMuted }}>{chip.label}</p>
              <p className="font-bold text-sm" style={{ color: colors.accent }}>{chip.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="flex items-start gap-3" style={{ background: `${colors.accent}15`, border: `1px solid ${colors.accent}33` } as React.CSSProperties}>
            <Sparkles size={20} style={{ color: colors.accent }} className="mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-sm" style={{ color: colors.accent }}>AI Insight: </span>
              <span className="text-sm" style={{ color: colors.text }}>{AI_TIPS[tipIndex]}</span>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

DashboardPage.displayName = 'DashboardPage';
