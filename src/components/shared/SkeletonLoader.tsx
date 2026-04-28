import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = React.memo(({ width = 'w-full', height = 'h-4', rounded = 'rounded-lg', className = '' }) => {
  const { colors } = useTheme();

  return (
    <div
      className={`${width} ${height} ${rounded} ${className} shimmer`}
      style={{
        background: `linear-gradient(90deg, ${colors.cardBg} 25%, ${colors.border} 50%, ${colors.cardBg} 75%)`,
        backgroundSize: '200% 100%',
      }}
    />
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

export const CardSkeleton: React.FC = React.memo(() => (
  <div className="p-5 rounded-[20px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
    <SkeletonLoader width="w-1/3" height="h-3" className="mb-3" />
    <SkeletonLoader width="w-2/3" height="h-6" className="mb-2" />
    <SkeletonLoader width="w-1/2" height="h-3" />
  </div>
));

CardSkeleton.displayName = 'CardSkeleton';
