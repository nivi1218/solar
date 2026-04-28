export interface SolarReading {
  timestamp: number;
  voltage: number;
  current: number;
  power_ac: number;
  temperature: number;
  efficiency: number;
  irradiance: number;
}

export interface Inverter {
  id: string;
  status: 'active' | 'fault' | 'warning';
  efficiency: number;
  power_output: number;
  fault_code: string;
  name: string;
}

export interface Alert {
  id: string;
  type: 'dc_fault' | 'low_efficiency' | 'maintenance' | 'overheating';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: number;
  resolved: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  preferences: {
    pushNotifications: boolean;
    darkModeOverride: boolean;
    autoTheme: boolean;
    emailReports: boolean;
  };
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  irradiance: number;
  panelTemp: number;
}

export interface ThemeColors {
  background: string;
  cardBg: string;
  cardBgAlpha: string;
  accent: string;
  secondary: string;
  text: string;
  textMuted: string;
  border: string;
  shadow: string;
}

export type EnergyPeriod = 'day' | 'week' | 'month' | 'year' | 'billing';
export type ReportPeriod = 'day' | 'week' | 'month';
export type InverterFilter = 'all' | 'active' | 'fault' | 'warning';
export type AlertFilter = 'all' | 'dc_fault' | 'low_efficiency' | 'maintenance' | 'overheating';
