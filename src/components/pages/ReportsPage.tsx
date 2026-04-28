import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../shared/GlassCard';
import type { ReportPeriod } from '../../types';

const AI_SUMMARIES: Record<ReportPeriod, string> = {
  day: 'Today\'s production peaked at 9.2 kW between 11:00-13:00. Overall efficiency remained above 90% with minor dips during cloud cover at 14:30. Grid export contributed 2.1 kWh to revenue.',
  week: 'Weekly output totaled 68.4 kWh, a 5% increase over last week. Thursday recorded the highest daily production. Inverter INV-035 showed intermittent faults requiring attention.',
  month: 'Monthly production reached 312 kWh, exceeding the forecast by 8%. The system maintained 91.2% average efficiency. Two maintenance events were completed successfully.',
};

export const ReportsPage: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { latestReading, inverters } = useData();
  const [period, setPeriod] = useState<ReportPeriod>('day');

  const periodTabs: ReportPeriod[] = ['day', 'week', 'month'];

  const powerData = useMemo(() => {
    const base = latestReading?.power_ac ?? 8;
    switch (period) {
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
        return Array.from({ length: 30 }, (_, i) => ({
          name: `${i + 1}`,
          value: base * 6 * (0.7 + Math.random() * 0.6),
        }));
    }
  }, [period, latestReading]);

  const topInverters = useMemo(() => {
    return [...inverters].sort((a, b) => b.power_output - a.power_output).slice(0, 10).map(i => ({
      name: i.id,
      power: i.power_output,
    }));
  }, [inverters]);

  const handlePeriodChange = useCallback((p: ReportPeriod) => setPeriod(p), []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold" style={{ color: colors.text }}>Reports</h2>

      <div className="flex gap-2">
        {periodTabs.map(p => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className="px-5 py-1.5 rounded-full text-sm font-medium capitalize transition-colors"
            style={{
              background: period === p ? colors.accent : colors.cardBgAlpha,
              color: period === p ? '#fff' : colors.textMuted,
              border: `1px solid ${period === p ? colors.accent : colors.border}`,
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <GlassCard>
        <h3 className="font-bold mb-3" style={{ color: colors.text }}>Power Production Trend</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={powerData}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '12px', color: colors.text, fontSize: '12px' }} />
              <Line type="monotone" dataKey="value" stroke={colors.accent} strokeWidth={2.5} dot={false} animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-bold mb-3" style={{ color: colors.text }}>Top 10 Inverter Comparison</h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topInverters}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: colors.textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: '12px', color: colors.text, fontSize: '12px' }} />
              <Bar dataKey="power" fill={colors.accent} radius={[6, 6, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard style={{ background: `${colors.accent}15`, border: `1px solid ${colors.accent}33` } as React.CSSProperties}>
        <div className="flex items-start gap-3">
          <Sparkles size={20} style={{ color: colors.accent }} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-sm" style={{ color: colors.accent }}>AI Summary: </span>
            <span className="text-sm" style={{ color: colors.text }}>{AI_SUMMARIES[period]}</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-bold mb-3" style={{ color: colors.text }}>Download Reports</h3>
        <div className="space-y-3">
          {[
            { label: 'Daily PDF', icon: <FileText size={18} />, desc: 'Today\'s detailed report' },
            { label: 'Weekly CSV', icon: <Download size={18} />, desc: 'Raw data export' },
            { label: 'Monthly PDF', icon: <FileText size={18} />, desc: 'Monthly summary' },
          ].map(btn => (
            <motion.button
              key={btn.label}
              className="w-full flex items-center gap-3 p-4 rounded-xl text-left"
              style={{ background: `${colors.accent}11`, border: `1px solid ${colors.border}` }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${colors.accent}22`, color: colors.accent }}>
                {btn.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: colors.text }}>{btn.label}</p>
                <p className="text-xs" style={{ color: colors.textMuted }}>{btn.desc}</p>
              </div>
              <Download size={16} style={{ color: colors.textMuted }} />
            </motion.button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
});

ReportsPage.displayName = 'ReportsPage';
