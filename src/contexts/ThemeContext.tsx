import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ThemeColors } from '../types';

const lightTheme: ThemeColors = {
  background: '#FAFAF7',
  cardBg: 'rgba(255, 255, 255, 0.7)',
  cardBgAlpha: 'rgba(255, 255, 255, 0.7)',
  accent: '#F5A623',
  secondary: '#27AE60',
  text: '#1A1A2E',
  textMuted: '#6B7280',
  border: 'rgba(255, 255, 255, 0.2)',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

const darkTheme: ThemeColors = {
  background: '#0D1B2A',
  cardBg: 'rgba(27, 42, 59, 0.85)',
  cardBgAlpha: 'rgba(27, 42, 59, 0.85)',
  accent: '#FFB347',
  secondary: '#4ECDC4',
  text: '#E8EDF2',
  textMuted: '#8899AA',
  border: 'rgba(255, 255, 255, 0.12)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightTheme,
  toggle: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const getIsDarkByTime = useCallback(() => {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18;
  }, []);

  const [isDark, setIsDark] = useState(getIsDarkByTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDark(getIsDarkByTime());
    }, 60000);
    return () => clearInterval(interval);
  }, [getIsDarkByTime]);

  const toggle = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const colors = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', colors.background);
    document.documentElement.style.setProperty('--text', colors.text);
    document.documentElement.style.setProperty('--accent', colors.accent);
    document.documentElement.style.setProperty('--secondary', colors.secondary);
    document.documentElement.style.setProperty('--card-bg', colors.cardBg);
    document.documentElement.style.setProperty('--text-muted', colors.textMuted);
    document.documentElement.style.setProperty('--border', colors.border);
  }, [colors]);

  const value = useMemo(() => ({ isDark, colors, toggle }), [isDark, colors, toggle]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
});

ThemeProvider.displayName = 'ThemeProvider';

export const useTheme = () => useContext(ThemeContext);
