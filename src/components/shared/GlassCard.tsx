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
  const { colors } = useTheme();

  return (
    <motion.div
      className={`${padding} rounded-[20px] ${className}`}
      style={{
        background: colors.cardBgAlpha,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${colors.border}`,
        boxShadow: `0 8px 32px ${colors.shadow}`,
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
