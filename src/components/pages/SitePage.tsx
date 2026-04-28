import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Wind, Thermometer, Sun, RefreshCw, MapPin, Navigation } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { GlassCard } from '../shared/GlassCard';

const weatherIcons: Record<string, string> = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '🌨️',
  Mist: '🌫️',
};

export const SitePage: React.FC = React.memo(() => {
  const { colors } = useTheme();
  const { weather, refreshWeather, gpsLocation, gpsError } = useData();
  const [spinning, setSpinning] = useState(false);

  const w = weather!;

  const handleRefresh = useCallback(() => {
    setSpinning(true);
    refreshWeather();
    setTimeout(() => setSpinning(false), 1000);
  }, [refreshWeather]);

  const metrics = useMemo(() => [
    { key: 'humidity', label: 'Humidity', value: w.humidity.toFixed(0), unit: '%', icon: Droplets, color: '#3B82F6', data: Array.from({ length: 8 }, () => 40 + Math.random() * 20) },
    { key: 'wind', label: 'Wind Speed', value: w.windSpeed.toFixed(1), unit: 'km/h', icon: Wind, color: '#4ECDC4', data: Array.from({ length: 8 }, () => 8 + Math.random() * 10) },
    { key: 'panelTemp', label: 'Panel Temp', value: w.panelTemp.toFixed(1), unit: '°C', icon: Thermometer, color: '#EF4444', data: Array.from({ length: 8 }, () => 35 + Math.random() * 15) },
    { key: 'irradiance', label: 'Irradiance', value: w.irradiance.toFixed(0), unit: 'W/m²', icon: Sun, color: '#F5A623', data: Array.from({ length: 8 }, () => 700 + Math.random() * 300) },
  ], [w]);

  const mapUrl = useMemo(() => {
    if (gpsLocation) {
      const { lat, lon } = gpsLocation;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
    }
    return null;
  }, [gpsLocation]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: colors.text }}>Site Conditions</h2>
        <motion.button
          onClick={handleRefresh}
          className="p-2 rounded-xl"
          style={{ background: colors.cardBgAlpha, border: `1px solid ${colors.border}` }}
          animate={{ rotate: spinning ? 360 : 0 }}
          transition={{ duration: 1, ease: 'linear' }}
        >
          <RefreshCw size={18} style={{ color: colors.accent }} />
        </motion.button>
      </div>

      <GlassCard className="text-center" padding="p-6">
        <div className="text-5xl mb-2">{weatherIcons[w.condition] || '🌤️'}</div>
        <p className="text-3xl font-bold font-mono" style={{ color: colors.text }}>{w.temperature.toFixed(1)}°C</p>
        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>{w.condition}</p>
        <div className="flex items-center justify-center gap-1 mt-2 text-sm" style={{ color: colors.accent }}>
          <MapPin size={14} />
          <span>{w.city}, {w.country}</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: gpsError ? '#EF444422' : '#27AE6022', color: gpsError ? '#EF4444' : '#27AE60', border: `1px solid ${gpsError ? '#EF444444' : '#27AE6044'}` }}>
            <Navigation size={10} />
            <span>{gpsError ? 'Mock Location' : 'Using Current Device Location'}</span>
          </div>
        </div>
      </GlassCard>

      {mapUrl && (
        <GlassCard padding="p-0" className="overflow-hidden">
          <div className="p-3 pb-0">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} style={{ color: colors.accent }} />
              <span className="text-xs font-medium" style={{ color: colors.text }}>Plant Location</span>
              <span className="text-[10px] ml-auto" style={{ color: colors.textMuted }}>
                {gpsLocation?.lat.toFixed(4)}°, {gpsLocation?.lon.toFixed(4)}°
              </span>
            </div>
          </div>
          <div className="h-32 overflow-hidden rounded-b-[20px]">
            <iframe
              title="Location Map"
              src={mapUrl}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard padding="p-4" hover>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${m.color}22` }}>
                    <Icon size={16} style={{ color: m.color }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: colors.textMuted }}>{m.label}</span>
                </div>
                <p className="text-xl font-bold font-mono" style={{ color: colors.text }}>
                  {m.value}<span className="text-xs font-normal ml-1" style={{ color: colors.textMuted }}>{m.unit}</span>
                </p>
                <div className="h-8 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={m.data.map((v, j) => ({ name: j, value: v }))}>
                      <Area type="monotone" dataKey="value" stroke={m.color} fill={`${m.color}33`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

SitePage.displayName = 'SitePage';
