import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Sun, Cloud, Moon, Zap, Thermometer, Activity, Cpu, Gauge, BarChart3, Sparkles, CloudSun, MapPin, Home } from 'lucide-react';
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

  const w = weather!;

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
    if (hour >= 5 && hour < 12) return <Sun size={18} style={{ color: '#F5A623' }} />;
    if (hour >= 12 && hour < 17) return <CloudSun size={18} style={{ color: '#F5A623' }} />;
    if (hour >= 17 && hour < 21) return <Cloud size={18} style={{ color: '#FFB347' }} />;
    return <Moon size={18} style={{ color: '#4ECDC4' }} />;
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
    <div className="p-4 space-y-5 pb-24">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button onClick={onMenuOpen} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'}` }}>
          <Menu size={18} style={{ color: colors.text }} />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            {greetingIcon}
            <span className="text-sm font-semibold" style={{ color: colors.textMuted }}>{greeting}</span>
          </div>
          <span className="text-lg font-bold" style={{ color: colors.text }}>{user?.name?.split(' ')[0] || 'User'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'}` }}>
            <Moon size={16} style={{ color: colors.textMuted }} />
          </button>
          <button onClick={() => navigate('/alerts')} className="relative w-10 h-10 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)'}` }}>
            <Bell size={16} style={{ color: colors.text }} />
          </button>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: `linear-gradient(135deg, ${colors.accent}, #FF8C00)` }}>
            {user?.name?.charAt(0) || 'U'}
          </button>
        </div>
      </div>

      {/* HERO POWER FLOW CARD - Illustrated Solar System Diagram */}
      <GlassCard className="relative overflow-hidden" padding="p-0">
        <div className="relative" style={{ minHeight: 300 }}>
          {/* Soft landscape gradient background */}
          <div className="absolute inset-0 rounded-[24px] overflow-hidden">
            <div className="absolute inset-0" style={{
              background: isDark
                ? 'linear-gradient(180deg, #0D1B2A 0%, #1B2A3B 40%, #1a3a2a 70%, #0D1B2A 100%)'
                : 'linear-gradient(180deg, #87CEEB 0%, #B8E4F0 25%, #E8F5E9 55%, #C8E6C9 75%, #A5D6A7 100%)',
            }} />
            {/* Sun glow */}
            <motion.div
              className="absolute"
              style={{ top: 8, left: 12, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,50,0.6) 0%, rgba(255,165,0,0.2) 50%, transparent 70%)' }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Clouds */}
            <motion.div
              className="absolute animate-cloud-drift"
              style={{ top: 20, right: 60, opacity: 0.5 }}
            >
              <Cloud size={28} style={{ color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.7)' }} />
            </motion.div>
            <motion.div
              className="absolute"
              style={{ top: 35, right: 20, opacity: 0.3 }}
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Cloud size={20} style={{ color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)' }} />
            </motion.div>
            {/* Ground line */}
            <div className="absolute bottom-0 left-0 right-0 h-16" style={{
              background: isDark
                ? 'linear-gradient(180deg, transparent, rgba(13,27,42,0.8))'
                : 'linear-gradient(180deg, transparent, rgba(139,195,74,0.3))',
            }} />
          </div>

          {/* Floating metric bubbles */}
          <div className="absolute top-3 left-3 z-20">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-[10px] font-semibold" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              <Sun size={10} className="text-yellow-300" />
              <span>Solar Input</span>
              <span className="font-mono font-bold">{latestReading?.irradiance?.toFixed(0) ?? '--'} W/m²</span>
            </div>
          </div>
          <div className="absolute top-3 right-3 z-20">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-[10px] font-semibold" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              <MapPin size={10} className="text-amber-300" />
              <span>{w.temperature.toFixed(0)}°C {w.condition}</span>
            </div>
          </div>
          <div className="absolute bottom-20 left-3 z-20">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-[10px] font-semibold" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              <Home size={10} className="text-blue-300" />
              <span>Home Usage</span>
              <span className="font-mono font-bold">{(latestReading?.power_ac ?? 0 * 0.7).toFixed(1)} kW</span>
            </div>
          </div>
          <div className="absolute bottom-20 right-3 z-20">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl text-[10px] font-semibold" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              <Activity size={10} style={{ color: colors.secondary }} />
              <span>Grid Export</span>
              <span className="font-mono font-bold">{(latestReading?.power_ac ?? 0 * 0.3).toFixed(1)} kW</span>
            </div>
          </div>

          {/* ILLUSTRATED SOLAR SYSTEM DIAGRAM */}
          <div className="relative z-10 flex flex-col items-center justify-center pt-10 pb-4 px-2">
            {/* SVG Energy Flow Diagram */}
            <svg viewBox="0 0 340 140" className="w-full max-w-[340px]" style={{ overflow: 'visible' }}>
              {/* Sun with rotating rays */}
              <g transform="translate(30, 30)">
                <motion.g animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '20px 20px' }}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                    <line key={angle}
                      x1={20 + Math.cos(angle * Math.PI / 180) * 14}
                      y1={20 + Math.sin(angle * Math.PI / 180) * 14}
                      x2={20 + Math.cos(angle * Math.PI / 180) * 22}
                      y2={20 + Math.sin(angle * Math.PI / 180) * 22}
                      stroke="#FFD700" strokeWidth="2" strokeLinecap="round"
                    />
                  ))}
                </motion.g>
                <circle cx="20" cy="20" r="12" fill="#FFD700" />
                <circle cx="20" cy="20" r="12" fill="none" stroke="#FFA500" strokeWidth="1" />
                <text x="20" y="52" textAnchor="middle" fill="white" fontSize="7" fontWeight="600">Sun</text>
                <text x="20" y="62" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="6" fontFamily="monospace">{latestReading?.irradiance?.toFixed(0) ?? '--'} W/m²</text>
              </g>

              {/* Energy flow line: Sun → Panels */}
              <motion.line x1="55" y1="50" x2="100" y2="50"
                stroke={colors.accent} strokeWidth="2" strokeDasharray="6 4"
                animate={{ strokeDashoffset: [0, -10] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
              <text x="78" y="44" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5">Solar</text>

              {/* Solar Panels on roof */}
              <g transform="translate(100, 15)">
                <rect x="0" y="8" width="40" height="5" rx="1" fill="none" stroke={colors.accent} strokeWidth="1.5" opacity="0.8" />
                <rect x="0" y="15" width="40" height="5" rx="1" fill="none" stroke={colors.accent} strokeWidth="1.5" opacity="0.8" />
                <rect x="0" y="22" width="40" height="5" rx="1" fill="none" stroke={colors.accent} strokeWidth="1.5" opacity="0.8" />
                {/* Panel grid lines */}
                <line x1="13" y1="8" x2="13" y2="27" stroke={colors.accent} strokeWidth="0.5" opacity="0.4" />
                <line x1="27" y1="8" x2="27" y2="27" stroke={colors.accent} strokeWidth="0.5" opacity="0.4" />
                {/* Shimmer effect */}
                <motion.rect x="0" y="8" width="40" height="19" rx="1" fill={colors.accent} opacity="0.08"
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <text x="20" y="42" textAnchor="middle" fill="white" fontSize="7" fontWeight="600">Panels</text>
                <text x="20" y="52" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="6" fontFamily="monospace">{latestReading?.power_ac?.toFixed(1) ?? '--'} kW</text>
              </g>

              {/* Energy flow: Panels → Inverter */}
              <motion.line x1="142" y1="35" x2="165" y2="55"
                stroke={colors.accent} strokeWidth="2" strokeDasharray="6 4"
                animate={{ strokeDashoffset: [0, -10] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
              <text x="155" y="40" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5">DC</text>

              {/* Inverter node */}
              <g transform="translate(160, 40)">
                <rect x="0" y="0" width="24" height="24" rx="6" fill="rgba(255,255,255,0.12)" stroke={colors.accent} strokeWidth="1.5" />
                <text x="12" y="14" textAnchor="middle" fill={colors.accent} fontSize="8" fontWeight="bold">AC</text>
                <text x="12" y="38" textAnchor="middle" fill="white" fontSize="7" fontWeight="600">Inverter</text>
                <text x="12" y="48" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="6" fontFamily="monospace">{latestReading?.efficiency?.toFixed(0) ?? '--'}%</text>
              </g>

              {/* Energy flow: Inverter → House */}
              <motion.line x1="186" y1="52" x2="220" y2="52"
                stroke="#27AE60" strokeWidth="2" strokeDasharray="6 4"
                animate={{ strokeDashoffset: [0, -10] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
              <text x="203" y="46" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5">AC</text>

              {/* House - center focal point */}
              <g transform="translate(220, 20)">
                <motion.g animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  {/* House shape */}
                  <polygon points="20,0 0,18 40,18" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
                  <rect x="4" y="18" width="32" height="22" rx="2" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="1" opacity="0.5" />
                  {/* Door */}
                  <rect x="15" y="26" width="10" height="14" rx="1" fill="rgba(255,200,50,0.2)" stroke={colors.accent} strokeWidth="0.8" />
                  {/* Amber glow ring */}
                  <circle cx="20" cy="20" r="28" fill="none" stroke={colors.accent} strokeWidth="1.5" opacity="0.3" />
                </motion.g>
                <text x="20" y="52" textAnchor="middle" fill="white" fontSize="7" fontWeight="600">Home</text>
                <text x="20" y="62" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="6" fontFamily="monospace">{(latestReading?.power_ac ?? 0 * 0.7).toFixed(1)} kW</text>
              </g>

              {/* Energy flow: House → Grid */}
              <motion.line x1="262" y1="45" x2="295" y2="35"
                stroke={colors.secondary} strokeWidth="2" strokeDasharray="6 4"
                animate={{ strokeDashoffset: [0, -10] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
              <text x="280" y="28" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5">Export</text>

              {/* Grid / Utility pole */}
              <g transform="translate(295, 10)">
                <line x1="10" y1="0" x2="10" y2="35" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                <line x1="2" y1="8" x2="18" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                <line x1="4" y1="16" x2="16" y2="16" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                <text x="10" y="48" textAnchor="middle" fill="white" fontSize="7" fontWeight="600">Grid</text>
                <text x="10" y="58" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="6" fontFamily="monospace">{(latestReading?.power_ac ?? 0 * 0.3).toFixed(1)} kW</text>
              </g>

              {/* Battery node (optional) */}
              <g transform="translate(220, 85)">
                <motion.rect x="0" y="0" width="20" height="12" rx="3" fill="rgba(255,255,255,0.08)" stroke={colors.secondary} strokeWidth="1" opacity="0.6" />
                <rect x="20" y="3" width="3" height="6" rx="1" fill={colors.secondary} opacity="0.4" />
                <motion.rect x="2" y="2" width="10" height="8" rx="2" fill={colors.secondary} opacity="0.2"
                  animate={{ width: [6, 10, 6] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <text x="10" y="24" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5">Battery 78%</text>
              </g>

              {/* Infographic labels along connections */}
              <text x="78" y="60" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="5" fontStyle="italic">Solar Generation</text>
              <text x="203" y="60" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="5" fontStyle="italic">Home Consumption</text>
              <text x="280" y="48" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="5" fontStyle="italic">Grid Export</text>
            </svg>

            {/* Central power reading overlay */}
            <div className="text-center -mt-2">
              <motion.p
                className="text-[28px] font-bold text-white font-mono leading-tight"
                key={latestReading?.power_ac?.toFixed(2)}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
              >
                {animatedPower.toFixed(2)} kW
              </motion.p>
              <p className="text-white/60 text-xs">Solar Power Now</p>
            </div>
          </div>

          {/* Production Today bar */}
          <div className="relative z-10 flex items-center justify-between px-4 pb-3">
            <div>
              <p className="text-white/60 text-[10px] font-medium">Production Today</p>
              <p className="text-white text-base font-bold">10.1 kWh</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(39,174,96,0.2)', border: '1px solid rgba(39,174,96,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] font-semibold text-green-300">Updated now</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* STATS GRID */}
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
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${stat.color}15` }}>
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
                        <Area type="monotone" dataKey="value" stroke={stat.color} fill={`${stat.color}20`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* ENERGY PRODUCED */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg" style={{ color: colors.text }}>Energy Produced</h3>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(39,174,96,0.12)', border: '1px solid rgba(39,174,96,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-semibold text-green-600">Updated now</span>
          </div>
        </div>
        <div className="flex gap-1.5 mb-4 p-1 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
          {periodTabs.map(p => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: energyPeriod === p ? colors.accent : 'transparent',
                color: energyPeriod === p ? '#fff' : colors.textMuted,
                boxShadow: energyPeriod === p ? '0 2px 8px rgba(245,166,35,0.3)' : 'none',
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
                  <stop offset="0%" stopColor={colors.accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1B2A3B' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: '16px',
                  color: colors.text,
                  fontSize: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
              />
              <Area type="monotone" dataKey="value" stroke={colors.accent} fill="url(#energyGrad)" strokeWidth={2.5} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-3 mt-4">
          {[
            { label: 'This Month', value: '312 kWh' },
            { label: 'This Year', value: '3,840 kWh' },
            { label: 'Lifetime', value: '12,450 kWh' },
          ].map(chip => (
            <div key={chip.label} className="flex-1 text-center p-3 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
              <p className="text-[10px] font-medium" style={{ color: colors.textMuted }}>{chip.label}</p>
              <p className="font-bold text-sm" style={{ color: colors.accent }}>{chip.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* AI INSIGHT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard className="flex items-start gap-3" style={{ background: `${colors.accent}10`, border: `1px solid ${colors.accent}25` } as React.CSSProperties}>
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
