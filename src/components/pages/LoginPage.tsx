import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
    setLoading(false);
  }, [email, password, login, navigate]);

  const handleDemoLogin = useCallback(async () => {
    setLoading(true);
    const success = await login('user@solar.com', 'demo123');
    if (success) navigate('/dashboard');
    setLoading(false);
  }, [login, navigate]);

  const goToSignup = useCallback(() => navigate('/signup'), [navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200)',
        }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <motion.div
        className="relative z-10 w-full max-w-[420px] mx-4 p-10 rounded-[28px]"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #F5A623, #FF8C00)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Zap size={28} className="text-white" />
          </motion.div>
          <h1 className="text-[28px] font-bold text-white">Welcome Back</h1>
          <p className="text-sm mt-1" style={{ color: '#F5A623' }}>SolarSense</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-amber-400/50 transition-colors"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="text-right">
            <button type="button" className="text-sm" style={{ color: '#F5A623' }}>Forgot Password?</button>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full text-white font-semibold text-lg"
            style={{
              background: 'linear-gradient(135deg, #F5A623, #FF8C00)',
              boxShadow: '0 4px 16px rgba(245,166,35,0.3)',
            }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/40 text-sm">or continue with</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        <button
          className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium flex items-center justify-center gap-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>

        <div
          className="mt-5 p-4 rounded-xl flex items-center gap-3"
          style={{
            background: 'rgba(245,166,35,0.15)',
            border: '1px solid rgba(245,166,35,0.3)',
          }}
        >
          <Zap size={20} style={{ color: '#F5A623' }} />
          <div className="flex-1">
            <div className="text-white text-xs font-medium">Demo: user@solar.com / demo123</div>
          </div>
          <motion.button
            onClick={handleDemoLogin}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #F5A623, #FF8C00)' }}
            whileTap={{ scale: 0.95 }}
          >
            Quick Login
          </motion.button>
        </div>

        <div className="text-center mt-6">
          <button onClick={goToSignup} className="text-white/70 text-sm">
            Don't have an account? <span style={{ color: '#F5A623' }}>Sign Up</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
});

LoginPage.displayName = 'LoginPage';
