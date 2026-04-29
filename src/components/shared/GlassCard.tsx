import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = React.memo(({ children, className = '', onClick, hover = false, padding = 'p-5', style }) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      className={`${padding} rounded-[24px] ${className}`}
      style={{
        background: isDark ? 'rgba(27, 42, 59, 0.75)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
        boxShadow: isDark
          ? '0 8px 32px rgba(0,0,0,0.3)'
          : '0 10px 30px rgba(0,0,0,0.06)',
        ...style,
      }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
});

GlassCard.displayName = 'GlassCard';
