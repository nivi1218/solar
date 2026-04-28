import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { SolarReading, Inverter, Alert, WeatherData } from '../types';

interface DataContextType {
  readings: SolarReading[];
  latestReading: SolarReading | null;
  inverters: Inverter[];
  alerts: Alert[];
  unreadAlertCount: number;
  weather: WeatherData | null;
  markAlertRead: (id: string) => void;
  resolveAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  refreshWeather: () => void;
}

const DataContext = createContext<DataContextType>({
  readings: [],
  latestReading: null,
  inverters: [],
  alerts: [],
  unreadAlertCount: 0,
  weather: null,
  markAlertRead: () => {},
  resolveAlert: () => {},
  dismissAlert: () => {},
  refreshWeather: () => {},
});

function generateInverters(): Inverter[] {
  const statuses: Inverter['status'][] = ['active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'warning', 'warning', 'fault'];
  return statuses.map((status, i) => ({
    id: `INV-${String(i + 1).padStart(3, '0')}`,
    name: `Inverter ${i + 1}`,
    status,
    efficiency: status === 'fault' ? 45 + Math.random() * 15 : status === 'warning' ? 70 + Math.random() * 10 : 88 + Math.random() * 10,
    power_output: status === 'fault' ? 0.5 + Math.random() * 0.5 : status === 'warning' ? 3 + Math.random() * 2 : 4.5 + Math.random() * 3,
    fault_code: status === 'fault' ? 'DC_OVERVOLTAGE' : status === 'warning' ? 'LOW_EFF' : '',
  }));
}

function generateAlerts(): Alert[] {
  return [
    { id: 'a1', type: 'dc_fault', title: 'DC Voltage Overrange', message: 'Inverter INV-035 reported DC voltage exceeding 600V threshold. Immediate inspection recommended.', severity: 'critical', timestamp: Date.now() - 300000, resolved: false },
    { id: 'a2', type: 'low_efficiency', title: 'Low Efficiency Warning', message: 'Inverter INV-033 operating below 75% efficiency for 2+ hours. Check panel cleanliness.', severity: 'warning', timestamp: Date.now() - 900000, resolved: false },
    { id: 'a3', type: 'low_efficiency', title: 'Efficiency Drop Detected', message: 'Inverter INV-034 showing gradual efficiency decline over past week.', severity: 'warning', timestamp: Date.now() - 1800000, resolved: false },
    { id: 'a4', type: 'maintenance', title: 'Scheduled Maintenance Due', message: 'Inverter INV-012 is due for quarterly maintenance inspection.', severity: 'info', timestamp: Date.now() - 3600000, resolved: false },
    { id: 'a5', type: 'overheating', title: 'High Temperature Alert', message: 'Inverter INV-028 temperature exceeding 65C. Check ventilation and cooling fans.', severity: 'critical', timestamp: Date.now() - 600000, resolved: false },
    { id: 'a6', type: 'maintenance', title: 'Firmware Update Available', message: 'New firmware v3.2.1 available for 5 inverters. Includes performance improvements.', severity: 'info', timestamp: Date.now() - 7200000, resolved: false },
    { id: 'a7', type: 'overheating', title: 'Panel Temperature High', message: 'Panel surface temperature on Row C exceeding 55C. Consider adjusting tilt angle.', severity: 'warning', timestamp: Date.now() - 1200000, resolved: false },
    { id: 'a8', type: 'dc_fault', title: 'Ground Fault Detected', message: 'Minor ground fault on INV-035 DC circuit. Isolate and inspect wiring.', severity: 'critical', timestamp: Date.now() - 150000, resolved: false },
  ];
}

function generateReading(base: SolarReading): SolarReading {
  const vary = (val: number, pct: number) => val * (1 + (Math.random() - 0.5) * 2 * pct);
  return {
    timestamp: Date.now(),
    voltage: vary(base.voltage, 0.05),
    current: vary(base.current, 0.05),
    power_ac: vary(base.power_ac, 0.05),
    temperature: vary(base.temperature, 0.03),
    efficiency: Math.min(99, Math.max(70, vary(base.efficiency, 0.03))),
    irradiance: vary(base.irradiance, 0.05),
  };
}

const BASE_READING: SolarReading = {
  timestamp: Date.now(),
  voltage: 380,
  current: 24.5,
  power_ac: 8.92,
  temperature: 42,
  efficiency: 92.4,
  irradiance: 850,
};

const MOCK_WEATHER: WeatherData = {
  city: 'San Diego',
  country: 'US',
  temperature: 28,
  humidity: 45,
  windSpeed: 12,
  condition: 'Clear',
  icon: '01d',
  irradiance: 850,
  panelTemp: 42,
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const [readings, setReadings] = useState<SolarReading[]>(() => {
    const initial: SolarReading[] = [];
    for (let i = 23; i >= 0; i--) {
      initial.push({
        ...generateReading(BASE_READING),
        timestamp: Date.now() - i * 3600000,
      });
    }
    return initial;
  });

  const [inverters] = useState<Inverter[]>(generateInverters);
  const [alerts, setAlerts] = useState<Alert[]>(generateAlerts);
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set());
  const [weather, setWeather] = useState<WeatherData>(MOCK_WEATHER);

  useEffect(() => {
    const interval = setInterval(() => {
      setReadings(prev => {
        const latest = prev[prev.length - 1] || BASE_READING;
        const newReading = generateReading(latest);
        return [...prev.slice(-50), newReading];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        humidity: Math.max(20, Math.min(80, prev.humidity + (Math.random() - 0.5) * 2)),
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 1),
        irradiance: Math.max(0, prev.irradiance + (Math.random() - 0.5) * 20),
        panelTemp: prev.panelTemp + (Math.random() - 0.5) * 0.3,
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAlertRead = useCallback((id: string) => {
    setReadAlerts(prev => new Set(prev).add(id));
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const refreshWeather = useCallback(() => {
    setWeather(prev => ({ ...prev, temperature: 25 + Math.random() * 10 }));
  }, []);

  const latestReading = useMemo(() => readings[readings.length - 1] || null, [readings]);

  const unreadAlertCount = useMemo(() => alerts.filter(a => !a.resolved && !readAlerts.has(a.id)).length, [alerts, readAlerts]);

  const value = useMemo(() => ({
    readings, latestReading, inverters, alerts, unreadAlertCount, weather,
    markAlertRead, resolveAlert, dismissAlert, refreshWeather,
  }), [readings, latestReading, inverters, alerts, unreadAlertCount, weather, markAlertRead, resolveAlert, dismissAlert, refreshWeather]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
});

DataProvider.displayName = 'DataProvider';

export const useData = () => useContext(DataContext);
