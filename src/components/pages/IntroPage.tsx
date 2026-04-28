import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 5,
  duration: 3 + Math.random() * 4,
  size: 2 + Math.random() * 4,
}));

export const IntroPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleGetStarted = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2A] via-[#1B2A3B] to-[#F5A623] animate-gradient-shift" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-400/60 animate-float-up"
            style={{
              left: `${p.left}%`,
              bottom: '-10px',
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.div
          className="relative mb-8"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120" className="animate-spin-slow">
            <defs>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                <stop offset="70%" stopColor="#F5A623" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="60" cy="60" r="50" fill="url(#sunGlow)" />
            <circle cx="60" cy="60" r="28" fill="#FFD700" />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = 60 + Math.cos(angle) * 32;
              const y1 = 60 + Math.sin(angle) * 32;
              const x2 = 60 + Math.cos(angle) * 46;
              const y2 = 60 + Math.sin(angle) * 46;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />;
            })}
          </svg>
          <div className="absolute inset-0 rounded-full animate-pulse-glow" />
        </motion.div>

        <motion.h1
          className="text-5xl font-bold text-white mb-3"
          style={{ textShadow: '0 0 30px rgba(245,166,35,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          SolarSense
        </motion.h1>

        <motion.p
          className="text-lg text-white/70 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Smart Solar. Real Insights.
        </motion.p>

        <motion.button
          onClick={handleGetStarted}
          className="px-10 py-4 rounded-full text-lg font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #F5A623, #FF8C00)',
            boxShadow: '0 4px 24px rgba(245,166,35,0.4)',
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 8px 40px rgba(245,166,35,0.6)' }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Get Started &rarr;
        </motion.button>

        <motion.div
          className="flex gap-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i < 5 - countdown ? '#F5A623' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
});

IntroPage.displayName = 'IntroPage';
